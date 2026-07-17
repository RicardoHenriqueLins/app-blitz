'use strict';

var allOcorrencias = [];

async function loadOcorrencias() {
    try {
        var res = await fetch('/ocorrencia');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        allOcorrencias = await res.json();
    } catch (err) {
        console.error('Erro ao carregar ocorrências:', err);
        allOcorrencias = [];
    }
}

function filterOcorrencias() {
    var uFilt = document.getElementById('fil-pir-unidade') ? document.getElementById('fil-pir-unidade').value : 'todas';
    var mFilt = parseInt(document.getElementById('fil-pir-mes') ? document.getElementById('fil-pir-mes').value : 0);
    var aFilt = document.getElementById('fil-pir-ano') ? document.getElementById('fil-pir-ano').value : '';
    return allOcorrencias.filter(function(r) {
        if (uFilt !== 'todas' && r.unidade !== uFilt) return false;
        if (mFilt > 0) {
            var m = new Date(r.data_ocorrencia || '').getMonth() + 1;
            if (m !== mFilt) return false;
        }
        if (aFilt) {
            var a = new Date(r.data_ocorrencia || '').getFullYear().toString();
            if (a !== aFilt) return false;
        }
        return true;
    });
}

function filterAlertasPir() {
    var uFilt = document.getElementById('fil-pir-unidade') ? document.getElementById('fil-pir-unidade').value : 'todas';
    var mFilt = parseInt(document.getElementById('fil-pir-mes') ? document.getElementById('fil-pir-mes').value : 0);
    var aFilt = document.getElementById('fil-pir-ano') ? document.getElementById('fil-pir-ano').value : '';
    var alertas = typeof allAlertas !== 'undefined' ? allAlertas : [];
    return alertas.filter(function(r) {
        if (uFilt !== 'todas' && r.unidade !== uFilt) return false;
        if (mFilt > 0) {
            var m = new Date(r.data_registro || r.Data_ocorrencia || '').getMonth() + 1;
            if (m !== mFilt) return false;
        }
        if (aFilt) {
            var a = new Date(r.data_registro || r.Data_ocorrencia || '').getFullYear().toString();
            if (a !== aFilt) return false;
        }
        return true;
    });
}

async function renderPiramide() {
    await loadOcorrencias();
    var ocs = filterOcorrencias();
    var als = filterAlertasPir();

    var fatal = ocs.filter(function(r) { return r.tipo === 'fatal'; }).length;
    var caf = ocs.filter(function(r) { return r.tipo === 'caf'; }).length;
    var saf = ocs.filter(function(r) { return r.tipo === 'saf'; }).length;
    var incid = ocs.filter(function(r) { return r.tipo === 'incidente'; }).length;
    var condicao = als.filter(function(r) { return (r.tipo_relato || '').toLowerCase() === 'condicao'; }).length;
    var compor = als.filter(function(r) { return (r.tipo_relato || '').toLowerCase() === 'ato'; }).length;

    // Total alertas = só condição + comportamento (não conta elogios)
    var totalAlertas = condicao + compor;

    // Pirâmide SVG
    var pirSvg = document.getElementById('piramide-svg-container');
    if (pirSvg) {
        pirSvg.innerHTML =
            '<svg viewBox="0 0 320 360" class="piramide-svg">' +
            '<polygon points="160,10 195,70 125,70" fill="#b71c1c"/>' +
            '<text class="pir-count" x="160" y="42" font-size="14">' + fatal + '</text>' +
            '<text class="pir-name" x="160" y="58">Fatal</text>' +
            '<polygon points="125,75 195,75 215,125 105,125" fill="#e65100"/>' +
            '<text class="pir-count" x="160" y="95">' + caf + '</text>' +
            '<text class="pir-name" x="160" y="113">CAF</text>' +
            '<polygon points="105,130 215,130 235,180 85,180" fill="#f9a825"/>' +
            '<text class="pir-count" x="160" y="150" fill="#333">' + saf + '</text>' +
            '<text class="pir-name" x="160" y="168" fill="#555">SAF</text>' +
            '<polygon points="85,185 235,185 255,235 65,235" fill="#66bb6a"/>' +
            '<text class="pir-count" x="160" y="205">' + incid + '</text>' +
            '<text class="pir-name" x="160" y="223">Incidentes</text>' +
            '<polygon points="65,240 255,240 275,290 45,290" fill="#2e7d32"/>' +
            '<text class="pir-count" x="160" y="260">' + condicao + '</text>' +
            '<text class="pir-name" x="160" y="278">Condição</text>' +
            '<polygon points="45,295 275,295 295,345 25,345" fill="#1b5e20"/>' +
            '<text class="pir-count" x="160" y="315">' + compor + '</text>' +
            '<text class="pir-name" x="160" y="333">Comportamento</text>' +
            '</svg>';
    }

    // KPIs
    var kpiEl = document.getElementById('kpi-piramide');
    if (kpiEl) {
        var totalOc = fatal + caf + saf + incid;
        kpiEl.innerHTML =
            '<div class="kpi-card danger"><div class="k-label">Ocorrências</div><div class="k-val">' + totalOc + '</div><div class="k-sub">fatal + caf + saf + incidente</div></div>' +
            '<div class="kpi-card warn"><div class="k-label">CAF + SAF</div><div class="k-val">' + (caf + saf) + '</div><div class="k-sub">acidentes registrados</div></div>' +
            '<div class="kpi-card ok"><div class="k-label">Alertas SSO</div><div class="k-val">' + totalAlertas + '</div><div class="k-sub">condição + comportamento</div></div>' +
            '<div class="kpi-card accent"><div class="k-label">Total geral</div><div class="k-val">' + (totalOc + totalAlertas) + '</div><div class="k-sub">pirâmide completa</div></div>';
    }

    renderTabelaMensal(ocs, als);
    renderRecentes(ocs);
    populatePirUnidade();
}

function renderTabelaMensal(ocs, als) {
    var tbody = document.getElementById('pir-table-body');
    if (!tbody) return;

    var indicadores = [
        { tipo: 'REATIVO', nome: 'FATAL', unid: 'Quant.', melhor: '↓', filtro: function(r) { return r.tipo === 'fatal'; }, src: 'oc' },
        { tipo: 'REATIVO', nome: 'CAF', unid: 'Quant.', melhor: '↓', filtro: function(r) { return r.tipo === 'caf'; }, src: 'oc' },
        { tipo: 'REATIVO', nome: 'SAF', unid: 'Quant.', melhor: '↓', filtro: function(r) { return r.tipo === 'saf'; }, src: 'oc' },
        { tipo: 'REATIVO', nome: 'INCIDENTE', unid: 'Quant.', melhor: '↓', filtro: function(r) { return r.tipo === 'incidente'; }, src: 'oc' },
        { tipo: 'PROATIVO', nome: 'ALERTAS CONDIÇÃO', unid: 'Quant.', melhor: '↑', filtro: function(r) { return (r.tipo_relato || '').toLowerCase() === 'condicao'; }, src: 'al' },
        { tipo: 'PROATIVO', nome: 'ALERTAS COMPORTAMENTO', unid: 'Quant.', melhor: '↑', filtro: function(r) { return (r.tipo_relato || '').toLowerCase() === 'ato'; }, src: 'al' },
        { tipo: 'PROATIVO', nome: 'TOTAL ALERTAS', unid: 'Quant.', melhor: '↑', filtro: function(r) { var t = (r.tipo_relato || '').toLowerCase(); return t === 'condicao' || t === 'ato'; }, src: 'al' }
    ];

    tbody.innerHTML = indicadores.map(function(ind) {
        var data = ind.src === 'oc' ? ocs : als;
        var filtered = data.filter(ind.filtro);
        var porMes = [0,0,0,0,0,0,0,0,0,0,0,0];

        filtered.forEach(function(r) {
            var d = ind.src === 'oc' ? r.data_ocorrencia : (r.data_registro || r.Data_ocorrencia);
            if (!d) return;
            var m = new Date(d).getMonth();
            if (m >= 0 && m < 12) porMes[m]++;
        });

        var tipoClass = ind.tipo === 'REATIVO' ? 'pir-tipo-reativo' : 'pir-tipo-proativo';
        var arrowClass = ind.melhor === '↓' ? 'pir-arrow-down' : 'pir-arrow-up';

        var mesesHtml = '';
        for (var i = 0; i < 12; i++) {
            mesesHtml += '<td>' + (porMes[i] || '') + '</td>';
        }

        return '<tr>' +
            '<td><span class="pir-tipo-tag ' + tipoClass + '">' + ind.tipo + '</span></td>' +
            '<td>' + ind.nome + '</td>' +
            '<td style="text-align:center">' + ind.unid + '</td>' +
            '<td style="text-align:center" class="' + arrowClass + '">' + ind.melhor + '</td>' +
            mesesHtml +
            '</tr>';
    }).join('');
}

function renderRecentes(ocs) {
    var el = document.getElementById('pir-recentes');
    if (!el) return;
    var recentes = ocs.slice(0, 5);

    if (!recentes.length) {
        el.innerHTML = '<div style="text-align:center;padding:24px;color:#999;font-size:13px">Nenhuma ocorrência registrada.</div>';
        return;
    }

    el.innerHTML = recentes.map(function(r) {
        var data = r.data_ocorrencia ? new Date(r.data_ocorrencia + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
        var desc = (r.descricao || '').substring(0, 120);
        return '<div class="pir-recente-item">' +
            '<span class="pir-recente-tipo ' + r.tipo + '">' + r.tipo.toUpperCase() + '</span>' +
            '<div class="pir-recente-info">' +
            '<div class="pir-recente-nome">' + (r.nome_colaborador || 'Sem nome') + '</div>' +
            '<div class="pir-recente-desc">' + desc + '</div>' +
            '<div class="pir-recente-meta">' + data + ' · ' + (r.unidade || '—') + ' · ' + (r.funcao || '') + '</div>' +
            '</div></div>';
    }).join('');
}

function populatePirUnidade() {
    var el = document.getElementById('fil-pir-unidade');
    if (!el || el.options.length > 1) return;
    if (typeof UNIDADES !== 'undefined' && UNIDADES.length > 0) {
        UNIDADES.forEach(function(u) {
            el.innerHTML += '<option value="' + u + '">' + u + '</option>';
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() { renderPiramide(); }, 500);
});