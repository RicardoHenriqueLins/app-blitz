'use strict';

// allOcorrencias já declarada no dashboard.js

const loadOcorrencias = async () => {
    try {
        const res = await fetch('/ocorrencia');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        allOcorrencias = await res.json();
    } catch (err) {
        console.error('Erro ao carregar ocorrências:', err);
        allOcorrencias = [];
    }
};

const filterOcorrencias = () => {
    const uFilt = document.getElementById('fil-pir-unidade')?.value || 'todas';
    const mFilt = parseInt(document.getElementById('fil-pir-mes')?.value || 0);
    const aFilt = document.getElementById('fil-pir-ano')?.value || '';

    return allOcorrencias.filter(r => {
        if (uFilt !== 'todas' && r.unidade !== uFilt) return false;
        if (mFilt > 0) {
            const m = new Date(r.data_ocorrencia || '').getMonth() + 1;
            if (m !== mFilt) return false;
        }
        if (aFilt) {
            const a = new Date(r.data_ocorrencia || '').getFullYear().toString();
            if (a !== aFilt) return false;
        }
        return true;
    });
};

const filterAlertasPir = () => {
    const uFilt = document.getElementById('fil-pir-unidade')?.value || 'todas';
    const mFilt = parseInt(document.getElementById('fil-pir-mes')?.value || 0);
    const aFilt = document.getElementById('fil-pir-ano')?.value || '';
    const alertas = typeof allAlertas !== 'undefined' ? allAlertas : [];

    return alertas.filter(r => {
        if (uFilt !== 'todas' && r.unidade !== uFilt) return false;
        if (mFilt > 0) {
            const m = new Date(r.data_registro || r.Data_ocorrencia || '').getMonth() + 1;
            if (m !== mFilt) return false;
        }
        if (aFilt) {
            const a = new Date(r.data_registro || r.Data_ocorrencia || '').getFullYear().toString();
            if (a !== aFilt) return false;
        }
        return true;
    });
};

const renderPiramide = async () => {
    await loadOcorrencias();
    const ocs = filterOcorrencias();
    const als = filterAlertasPir();

    const fatal = ocs.filter(r => r.tipo === 'fatal').length;
    const caf = ocs.filter(r => r.tipo === 'caf').length;
    const saf = ocs.filter(r => r.tipo === 'saf').length;
    const incid = ocs.filter(r => r.tipo === 'incidente').length;
    const condicao = als.filter(r => (r.tipo_relato || '').toLowerCase() === 'condicao').length;
    const compor = als.filter(r => (r.tipo_relato || '').toLowerCase() === 'ato').length;
    const totalAlertas = condicao + compor;

    // Pirâmide SVG
    const pirSvg = document.getElementById('piramide-svg-container');
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
    const kpiEl = document.getElementById('kpi-piramide');
    if (kpiEl) {
        const totalOc = fatal + caf + saf + incid;
        kpiEl.innerHTML =
            '<div class="kpi-card danger"><div class="k-label">Ocorrências</div><div class="k-val">' + totalOc + '</div><div class="k-sub">fatal + caf + saf + incidente</div></div>' +
            '<div class="kpi-card warn"><div class="k-label">CAF + SAF</div><div class="k-val">' + (caf + saf) + '</div><div class="k-sub">acidentes registrados</div></div>' +
            '<div class="kpi-card ok"><div class="k-label">Alertas SSO</div><div class="k-val">' + totalAlertas + '</div><div class="k-sub">condição + comportamento</div></div>' +
            '<div class="kpi-card accent"><div class="k-label">Total geral</div><div class="k-val">' + (totalOc + totalAlertas) + '</div><div class="k-sub">pirâmide completa</div></div>';
    }

    renderTabelaMensal(ocs, als);
    renderRecentes(ocs);
    populatePirUnidade();
};

const renderTabelaMensal = (ocs, als) => {
    const tbody = document.getElementById('pir-table-body');
    if (!tbody) return;

    const indicadores = [
        { tipo: 'REATIVO', nome: 'FATAL', unid: 'Quant.', melhor: '↓', filtro: r => r.tipo === 'fatal', src: 'oc' },
        { tipo: 'REATIVO', nome: 'CAF', unid: 'Quant.', melhor: '↓', filtro: r => r.tipo === 'caf', src: 'oc' },
        { tipo: 'REATIVO', nome: 'SAF', unid: 'Quant.', melhor: '↓', filtro: r => r.tipo === 'saf', src: 'oc' },
        { tipo: 'REATIVO', nome: 'INCIDENTE', unid: 'Quant.', melhor: '↓', filtro: r => r.tipo === 'incidente', src: 'oc' },
        { tipo: 'PROATIVO', nome: 'ALERTAS CONDIÇÃO', unid: 'Quant.', melhor: '↑', filtro: r => (r.tipo_relato || '').toLowerCase() === 'condicao', src: 'al' },
        { tipo: 'PROATIVO', nome: 'ALERTAS COMPORTAMENTO', unid: 'Quant.', melhor: '↑', filtro: r => (r.tipo_relato || '').toLowerCase() === 'ato', src: 'al' },
        { tipo: 'PROATIVO', nome: 'TOTAL ALERTAS', unid: 'Quant.', melhor: '↑', filtro: r => { const t = (r.tipo_relato || '').toLowerCase(); return t === 'condicao' || t === 'ato'; }, src: 'al' }
    ];

    tbody.innerHTML = indicadores.map(ind => {
        const data = ind.src === 'oc' ? ocs : als;
        const filtered = data.filter(ind.filtro);
        const porMes = [0,0,0,0,0,0,0,0,0,0,0,0];

        filtered.forEach(r => {
            const d = ind.src === 'oc' ? r.data_ocorrencia : (r.data_registro || r.Data_ocorrencia);
            if (!d) return;
            const m = new Date(d).getMonth();
            if (m >= 0 && m < 12) porMes[m]++;
        });

        const tipoClass = ind.tipo === 'REATIVO' ? 'pir-tipo-reativo' : 'pir-tipo-proativo';
        const arrowClass = ind.melhor === '↓' ? 'pir-arrow-down' : 'pir-arrow-up';

        let mesesHtml = '';
        for (let i = 0; i < 12; i++) {
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
};

// ── Formatar data segura ──
const formatarData = (dataStr) => {
    if (!dataStr) return '—';
    try {
        const d = new Date(dataStr + 'T12:00:00');
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('pt-BR');
    } catch {
        return '—';
    }
};

// ── Tipo label com cor ──
const tipoLabel = (tipo) => {
    const cores = {
        fatal: '#b71c1c',
        caf: '#e65100',
        saf: '#f9a825',
        incidente: '#66bb6a'
    };
    const nomes = {
        fatal: 'FATAL',
        caf: 'CAF',
        saf: 'SAF',
        incidente: 'INCIDENTE'
    };
    const cor = cores[tipo] || '#666';
    const nome = nomes[tipo] || tipo.toUpperCase();
    const textColor = tipo === 'saf' ? '#333' : '#fff';
    return '<span class="pir-recente-tipo" style="background:' + cor + ';color:' + textColor + '">' + nome + '</span>';
};

// ── Excluir ocorrência ──
const excluirOcorrencia = async (id) => {
    if (!confirm('Deseja excluir esta ocorrência?')) return;
    try {
        const res = await fetch('/ocorrencia/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao excluir');
        alert('Ocorrência excluída!');
        await renderPiramide();
        // Atualiza dias sem acidente também
        if (typeof loadAll === 'function') loadAll();
    } catch (err) {
        console.error(err);
        alert('Erro ao excluir ocorrência.');
    }
};

// ── Editar ocorrência (redireciona pro formulário) ──
const editarOcorrencia = (id) => {
    // Salva o ID no sessionStorage e abre o formulário
    sessionStorage.setItem('editarOcorrenciaId', id);
    window.location.href = 'FormOcorrencia.html?edit=' + id;
};

// ── Renderizar ocorrências recentes ──
const renderRecentes = (ocs) => {
    const el = document.getElementById('pir-recentes');
    if (!el) return;
    const recentes = ocs.slice(0, 10);

    if (!recentes.length) {
        el.innerHTML = '<div style="text-align:center;padding:24px;color:#999;font-size:13px">Nenhuma ocorrência registrada.</div>';
        return;
    }

    el.innerHTML = recentes.map(r => {
        const data = formatarData(r.data_ocorrencia);
        const hora = r.hora_ocorrencia ? r.hora_ocorrencia.slice(0, 5) : '';
        const desc = (r.descricao || '').substring(0, 200);
        const tipoColab = r.tipo_colaborador === 'terceiro'
            ? 'Terceiro' + (r.empresa_terceiro ? ' — ' + r.empresa_terceiro : '')
            : 'Próprio';
        const socorros = r.primeiros_socorros || '—';
        const atestado = r.atestado_dias > 0 ? r.atestado_dias + ' dia(s)' : 'Não';
        const cat = r.cat_aberta || '—';
        const cid = r.cid || '—';

        return '<div class="pir-recente-item" style="flex-direction:column;gap:10px">' +

            '<div style="display:flex;align-items:center;justify-content:space-between;width:100%">' +
                '<div style="display:flex;align-items:center;gap:10px">' +
                    tipoLabel(r.tipo) +
                    '<div>' +
                        '<div class="pir-recente-nome">' + (r.nome_colaborador || 'Sem nome') + '</div>' +
                        '<div style="font-size:11px;color:#999">' + (r.funcao || '') + ' · ' + tipoColab + '</div>' +
                    '</div>' +
                '</div>' +
                '<div style="display:flex;gap:6px">' +
                    '<button onclick="editarOcorrencia(' + r.id + ')" style="background:none;border:1px solid #d1d5db;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;color:#1b5e20" title="Editar">✏️ Editar</button>' +
                    '<button onclick="excluirOcorrencia(' + r.id + ')" style="background:none;border:1px solid #d1d5db;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;color:#c62828" title="Excluir">🗑️ Excluir</button>' +
                '</div>' +
            '</div>' +

            '<div class="pir-recente-desc" style="-webkit-line-clamp:3">' + desc + '</div>' +

            '<div style="display:flex;flex-wrap:wrap;gap:16px;font-size:11px;color:#666;border-top:1px solid #eee;padding-top:8px">' +
                '<span>📅 ' + data + (hora ? ' às ' + hora : '') + '</span>' +
                '<span>📍 ' + (r.unidade || '—') + (r.local_especifico ? ' · ' + r.local_especifico : '') + '</span>' +
                '<span>🏥 Socorros: ' + socorros + '</span>' +
                '<span>📋 Atestado: ' + atestado + '</span>' +
                '<span>📄 CAT: ' + cat + '</span>' +
                '<span>🏷️ CID: ' + cid + '</span>' +
            '</div>' +

            (r.acoes_imediatas ? '<div style="font-size:11px;color:#4a5e4c;background:#f0f4ef;padding:8px 12px;border-radius:6px"><strong>Ações imediatas:</strong> ' + r.acoes_imediatas + '</div>' : '') +

            '</div>';
    }).join('');
};

const populatePirUnidade = () => {
    const el = document.getElementById('fil-pir-unidade');
    if (!el || el.options.length > 1) return;
    if (typeof UNIDADES !== 'undefined' && UNIDADES.length > 0) {
        UNIDADES.forEach(u => {
            el.innerHTML += '<option value="' + u + '">' + u + '</option>';
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => renderPiramide(), 500);
});