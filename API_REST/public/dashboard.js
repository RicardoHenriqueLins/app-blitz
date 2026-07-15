'use strict';

/* ── Estado global ── */
let UNIDADES = [];
let TURNOS = [];
let allAlertas = [];
let allBlitz = [];
let allOcorrencias = [];
let accData = {};
let editUnit = '';
const charts = {};

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const SECTION_TITLES = {
    acidentes: 'Dias sem Acidente',
    indicadores: 'Indicadores',
    pareto: 'Gráfico de Pareto',
    aderencia: 'Aderência de Líderes',
    'piramide-seg': 'Pirâmide de Segurança'
};

const FRASES = [
    'Segurança é um valor diário',
    'Cuidar de pessoas é o que nos move',
    'Atitude segura resulta em vidas',
    'Nosso foco é zero acidentes',
    'Prevenção salva vidas',
    'Juntos somos mais seguros',
    'Cada dia conta',
    'Proteger é nossa missão'
];

/* ── Plugin rótulos de dados ── */
const datalabelPlugin = {
    id: 'datalabelPlugin',
    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach(function(ds, i) {
            let meta = chart.getDatasetMeta(i);
            if (meta.hidden) return;
            meta.data.forEach(function(el, idx) {
                let v = ds.data[idx];
                if (!v) return;
                ctx.save();
                ctx.fillStyle = '#333';
                ctx.font = 'bold 11px DM Sans, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(v, el.x, el.y - 6);
                ctx.restore();
            });
        });
    }
};
Chart.register(datalabelPlugin);

/* ── Utilitários ── */
function getWeekOfMonth(d) {
    return Math.ceil(new Date(d).getDate() / 7);
}

function getWeeksInMonth(y, m) {
    return Math.ceil(new Date(y, m, 0).getDate() / 7);
}

function diasDesde(s) {
    if (!s) return 0;
    return Math.max(0, Math.floor((new Date() - new Date(s)) / 86400000));
}

function classeCard(d) {
    if (d === 0) return 'vermelho';
    return 'verde';
}
function countBy(arr, key) {
    let m = {};
    arr.forEach(function(r) {
        let v = r[key] || 'N/A';
        m[v] = (m[v] || 0) + 1;
    });
    return m;
}

function extractTurnos() {
    let set = new Set();
    allAlertas.forEach(function(r) { if (r.turno) set.add(r.turno); });
    allBlitz.forEach(function(r) { if (r.turno) set.add(r.turno); });
    let ordem = ['ADM','1º Turno','2º Turno','3º Turno','T1','T2','T3','12x36 Manhã','12x36 Noite','12X36 Manhã','12X36 Noite'];
    TURNOS = Array.from(set).sort(function(a, b) {
        let ia = ordem.indexOf(a);
        let ib = ordem.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });
}

async function fetchJSON(url) {
    let res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

function destroyChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }
}

function showError(msg) {
    let e = document.getElementById('global-error');
    if (e) e.remove();
    let d = document.createElement('div');
    d.id = 'global-error';
    d.className = 'error-box';
    d.style.cssText = 'position:fixed;top:68px;left:50%;transform:translateX(-50%);z-index:100;max-width:500px;width:90%';
    d.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ' + msg;
    document.body.appendChild(d);
    setTimeout(function() { d.remove(); }, 7000);
}

/* ── Selects ── */
function populateSelects() {
    ['fil-unidade','fil-adh-unidade','fil-pir-unidade'].forEach(function(id) {
        let el = document.getElementById(id);
        if (!el) return;
        let v = el.value;
        el.innerHTML = '<option value="todas">Todas</option>';
        UNIDADES.forEach(function(u) {
            el.innerHTML += '<option value="' + u + '">' + u + '</option>';
        });
        if (v) el.value = v;
    });
    let ft = document.getElementById('fil-turno');
    if (ft) {
        let v = ft.value;
        ft.innerHTML = '<option value="todos">Todos</option>';
        TURNOS.forEach(function(t) {
            ft.innerHTML += '<option value="' + t + '">' + t + '</option>';
        });
        if (v) ft.value = v;
    }
}

/* ── Navegação ── */
function showSection(s) {
    document.querySelectorAll('.content').forEach(function(el) {
        el.classList.remove('active');
    });
    document.getElementById('sec-' + s).classList.add('active');

    let keys = ['acidentes','indicadores','pareto','aderencia','piramide-seg'];
    document.querySelectorAll('.sidebar .nav-group:first-of-type .nav-item').forEach(function(el, i) {
        if (i < keys.length) el.classList.toggle('active', keys[i] === s);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(function(el, i) {
        if (i < keys.length) el.classList.toggle('active', keys[i] === s);
    });
    document.getElementById('topbar-title').textContent = SECTION_TITLES[s] || s;
}

/* ══════════════════════════════════════════
   LOAD ALL
   ══════════════════════════════════════════ */
async function loadAll() {
    document.getElementById('last-updated').textContent = 'Atualizando...';
    try {
        let results = await Promise.all([
            fetchJSON('/unidade'),
            fetchJSON('/alerta'),
            fetchJSON('/blitiz'),
            fetchJSON('/acidente'),
            fetchJSON('/ocorrencia')
        ]);

        let unidades  = results[0];
        let alertas   = results[1];
        let blitz     = results[2];
        let acidentes = results[3];
        let ocorrencias = results[4];

        UNIDADES = (Array.isArray(unidades) ? unidades : []).map(function(u) { return u.nome; });
        allAlertas = Array.isArray(alertas) ? alertas : [];
        allBlitz = Array.isArray(blitz) ? blitz : [];
        allOcorrencias = Array.isArray(ocorrencias) ? ocorrencias : [];
        extractTurnos();
        populateSelects();

        // Recordes da tabela acidente
        let recordes = {};
        (Array.isArray(acidentes) ? acidentes : []).forEach(function(a) {
            recordes[a.unidade] = a.recorde_dias || 0;
        });

        // Monta accData 100% baseado em CAF
        accData = {};
        UNIDADES.forEach(function(u) {
            accData[u] = { date: '', record: recordes[u] || 0, colaborador: '' };
        });

        allOcorrencias.forEach(function(oc) {
            if (oc.tipo !== 'caf' || !oc.data_ocorrencia || !oc.unidade) return;
            let dataOc = (oc.data_ocorrencia || '').slice(0, 10);
            if (!dataOc) return;
            if (!accData[oc.unidade]) {
                accData[oc.unidade] = { date: '', record: recordes[oc.unidade] || 0, colaborador: '' };
            }
            if (!accData[oc.unidade].date || dataOc > accData[oc.unidade].date) {
                accData[oc.unidade].date = dataOc;
                accData[oc.unidade].colaborador = oc.nome_colaborador || '';
            }
        });

        let now = new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('last-updated').textContent = 'Atualizado às ' + now;

        renderAcidentes();
        renderIndicadores();
        renderPareto();
        renderAderencia();
        if (typeof renderPiramide === 'function') renderPiramide();

    } catch (err) {
        document.getElementById('last-updated').textContent = 'Erro ao carregar';
        showError('Não foi possível conectar ao servidor.');
        console.error(err);
    }
}

/* ══════════════════════════════════════════
   DIAS SEM ACIDENTE
   ══════════════════════════════════════════ */
function renderAcidentes() {
    let total = 0, melhorDias = 0, melhor = '', atencao = 0, critico = 0;

    UNIDADES.forEach(function(u) {
        let d = accData[u] || { date: '', record: 0 };
        if (!d.date) return;
        let dias = diasDesde(d.date);
        total += dias;
        if (dias > melhorDias) { melhorDias = dias; melhor = u; }
        if (dias < 30) atencao++;
        if (dias < 7) critico++;
    });

    let unidadesComDados = UNIDADES.filter(function(u) { return accData[u] && accData[u].date; });
    let media = unidadesComDados.length > 0 ? Math.round(total / unidadesComDados.length) : 0;

    document.getElementById('kpi-acidentes').innerHTML =
        '<div class="kpi-card accent"><div class="k-label">Média geral</div><div class="k-val">' + media + '</div><div class="k-sub">dias sem acidente</div></div>' +
        '<div class="kpi-card ok"><div class="k-label">Melhor unidade</div><div class="k-val" style="font-size:18px">' + ((melhor.split(' - ')[0]) || '—') + '</div><div class="k-sub">' + melhorDias + ' dias</div></div>' +
        '<div class="kpi-card warn"><div class="k-label">Atenção</div><div class="k-val">' + atencao + '</div><div class="k-sub">unidades &lt; 30 dias</div></div>' +
        '<div class="kpi-card danger"><div class="k-label">Crítico</div><div class="k-val">' + critico + '</div><div class="k-sub">unidades &lt; 7 dias</div></div>';

    let grid = document.getElementById('units-grid');
    let html = '';

    UNIDADES.forEach(function(u, i) {
        let d = accData[u] || { date: '', record: 0, colaborador: '' };
        let temCaf = !!d.date;
        let dias = temCaf ? diasDesde(d.date) : null;
        let cls = temCaf ? classeCard(dias) : 'verde';
        let pct = (d.record > 0 && dias !== null) ? Math.min(100, Math.round(dias / d.record * 100)) : 0;
        let dateLabel = d.date ? new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
        let frase = FRASES[i % FRASES.length];
        let isLeader = melhorDias > 0 && u === melhor;

        html += '<div class="acc-unit ' + cls + (isLeader ? ' leader' : '') + '">' +
            '<div class="acc-unit-name">' + u + '</div>' +
            '<div class="acc-unit-days">' + (temCaf ? dias : '✓') + '</div>' +
            '<div class="acc-unit-phrase">' + (temCaf ? frase : 'Nenhum CAF registrado') + '</div>' +
            (d.record > 0 ? '<div class="acc-unit-record">Recorde: ' + d.record + 'd ' + (pct > 0 ? '(' + pct + '%)' : '') + '</div>' : '') +
            '<div class="acc-unit-date">' + (temCaf ? 'Último CAF: ' + dateLabel : 'Sem histórico de CAF') + '</div>' +
            (d.colaborador ? '<div class="acc-unit-caf">' + d.colaborador + '</div>' : '') +
            '</div>';
    });

    grid.innerHTML =
        '<div class="acc-banner">' +
        '<div class="acc-banner-header"><div class="acc-banner-heading"><h2>Dias sem acidentes na Regional</h2>' +
        '<p class="acc-banner-sub">Calculado automaticamente pela última ocorrência CAF</p></div></div>' +
        '<div class="acc-units-row">' + html + '</div>' +
        '<div class="acc-banner-footer"><div class="acc-msg">Segurança não é sorte — é escolha, atitude e compromisso de todos!</div>' +
        '<div class="acc-submsg">Proteja a vida, valorize hoje e garanta o amanhã.</div></div></div>';
}

/* ── Modal ── */
function abrirModal(u) {
    editUnit = u;
    let d = accData[u] || { date: '', record: 0 };
    document.getElementById('modal-title').textContent = 'Editar recorde — ' + u;
    document.getElementById('modal-date').value = d.date || '';
    document.getElementById('modal-date').disabled = true;
    document.getElementById('modal-record').value = d.record || '';
    document.getElementById('modal-bg').classList.add('open');
}

function fecharModal() {
    document.getElementById('modal-bg').classList.remove('open');
    document.getElementById('modal-date').disabled = false;
}

async function salletModal() {
    let record = parseInt(document.getElementById('modal-record').value) || 0;
    let date = (accData[editUnit] && accData[editUnit].date) || document.getElementById('modal-date').value;
    if (!date) { fecharModal(); return; }
    try {
        let res = await fetch('/acidente/' + encodeURIComponent(editUnit), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data_acidente: date, recorde_dias: record })
        });
        if (!res.ok) throw new Error();
        if (accData[editUnit]) accData[editUnit].record = record;
        renderAcidentes();
    } catch (err) {
        showError('Erro ao sallet.');
    }
    fecharModal();
}

/* ══════════════════════════════════════════
   FILTROS
   ══════════════════════════════════════════ */
function filterAlertas() {
    let u = document.getElementById('fil-unidade').value;
    let t = document.getElementById('fil-turno').value;
    let m = parseInt(document.getElementById('fil-mes').value);
    return allAlertas.filter(function(r) {
        if (u !== 'todas' && r.unidade !== u) return false;
        if (t !== 'todos' && r.turno !== t) return false;
        if (m > 0) {
            let mes = new Date(r.data_registro || r.Data_ocorrencia || '').getMonth() + 1;
            if (mes !== m) return false;
        }
        return true;
    });
}

function filterBlitz() {
    let u = document.getElementById('fil-unidade').value;
    let t = document.getElementById('fil-turno').value;
    let m = parseInt(document.getElementById('fil-mes').value);
    return allBlitz.filter(function(r) {
        if (u !== 'todas' && r.unidade !== u) return false;
        if (t !== 'todos' && r.turno !== t) return false;
        if (m > 0) {
            let mes = new Date(r.data_registro || '').getMonth() + 1;
            if (mes !== m) return false;
        }
        return true;
    });
}

/* ══════════════════════════════════════════
   INDICADORES
   ══════════════════════════════════════════ */
function renderIndicadores() {
    let fa = filterAlertas();
    let fb = filterBlitz();
    let vis = document.getElementById('fil-visualizar') ? document.getElementById('fil-visualizar').value : 'todos';

    let atos = fa.filter(function(r) { return (r.tipo_relato || '').toLowerCase() === 'ato'; }).length;
    let cond = fa.filter(function(r) { return (r.tipo_relato || '').toLowerCase() === 'condicao'; }).length;
    let elogio = fa.filter(function(r) { return (r.tipo_relato || '').toLowerCase() === 'elogio'; }).length;

    document.getElementById('kpi-indicadores').innerHTML =
        '<div class="kpi-card ok"><div class="k-label">Total alertas</div><div class="k-val">' + fa.length + '</div><div class="k-sub">no período</div></div>' +
        '<div class="kpi-card ok"><div class="k-label">Total blitz</div><div class="k-val">' + fb.length + '</div><div class="k-sub">no período</div></div>' +
        '<div class="kpi-card danger"><div class="k-label">Atos inseguros</div><div class="k-val">' + atos + '</div><div class="k-sub">tipo ATO</div></div>' +
        '<div class="kpi-card warn"><div class="k-label">Condições</div><div class="k-val">' + cond + '</div><div class="k-sub">tipo Condição</div></div>' +
        '<div class="kpi-card"><div class="k-label">Elogios</div><div class="k-val">' + elogio + '</div><div class="k-sub">abordagens positivas</div></div>';

    let auByU = countBy(fa, 'unidade');
    let buByU = countBy(fb, 'unidade');
    let auByT = countBy(fa, 'turno');
    let buByT = countBy(fb, 'turno');
    let shortU = function(u) { return u.split(' - ').pop(); };

    function hideChart(id, cond) {
        let el = document.getElementById(id);
        if (el) {
            let card = el.closest('.chart-card');
            if (card) card.style.display = cond ? 'none' : '';
        }
    }

    hideChart('ch-alerta-unidade', vis === 'blitz');
    hideChart('ch-alerta-turno', vis === 'blitz');
    hideChart('ch-blitz-unidade', vis === 'alerta');
    hideChart('ch-blitz-turno', vis === 'alerta');
    hideChart('ch-alerta-area', vis === 'blitz');

    if (vis !== 'blitz') {
        makeBar('ch-alerta-unidade', UNIDADES.map(shortU), UNIDADES.map(function(u) { return auByU[u] || 0; }), '#1b5e20');
        makeBar('ch-alerta-turno', TURNOS, TURNOS.map(function(t) { return auByT[t] || 0; }), '#1565c0');

        let auByArea = countBy(fa, 'area_emitente');
        let areas = Object.keys(auByArea).filter(function(a) { return a !== 'N/A'; }).sort(function(a, b) { return auByArea[b] - auByArea[a]; });
        makeBar('ch-alerta-area', areas, areas.map(function(a) { return auByArea[a] || 0; }), '#bf360c');
    }

    if (vis !== 'alerta') {
        makeBar('ch-blitz-unidade', UNIDADES.map(shortU), UNIDADES.map(function(u) { return buByU[u] || 0; }), '#6a1b9a');
        makeBar('ch-blitz-turno', TURNOS, TURNOS.map(function(t) { return buByT[t] || 0; }), '#00695c');
    }

    // Mensal
    let uF = document.getElementById('fil-unidade').value;
    let tF = document.getElementById('fil-turno').value;
    let faA = allAlertas.filter(function(r) { return (uF === 'todas' || r.unidade === uF) && (tF === 'todos' || r.turno === tF); });
    let fbA = allBlitz.filter(function(r) { return (uF === 'todas' || r.unidade === uF) && (tF === 'todos' || r.turno === tF); });

    let aM = Array(12).fill(0);
    let bM = Array(12).fill(0);
    faA.forEach(function(r) { let m = new Date(r.data_registro || r.Data_ocorrencia || '').getMonth(); if (m >= 0) aM[m]++; });
    fbA.forEach(function(r) { let m = new Date(r.data_registro || '').getMonth(); if (m >= 0) bM[m]++; });

    destroyChart('ch-mensal');
    let ctx = document.getElementById('ch-mensal');
    if (ctx) {
        charts['ch-mensal'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: MESES,
                datasets: [
                    { label: 'Alertas', data: aM, borderColor: '#1b5e20', backgroundColor: '#1b5e2022', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#1b5e20' },
                    { label: 'Blitz', data: bM, borderColor: '#1565c0', backgroundColor: '#1565c022', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#1565c0', borderDash: [5, 3] }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 22 } },
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    renderSemanal(faA, fbA);
}

/* ── Semanal ── */
function renderSemanal(faA, fbA) {
    let semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5'];
    let aS = Array(5).fill(0);
    let bS = Array(5).fill(0);

    faA.forEach(function(r) {
        let d = r.data_registro || r.Data_ocorrencia;
        if (d) { let w = getWeekOfMonth(d); if (w >= 1 && w <= 5) aS[w - 1]++; }
    });
    fbA.forEach(function(r) {
        if (r.data_registro) { let w = getWeekOfMonth(r.data_registro); if (w >= 1 && w <= 5) bS[w - 1]++; }
    });

    destroyChart('ch-semanal');
    let ctx = document.getElementById('ch-semanal');
    if (!ctx) return;

    charts['ch-semanal'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: semanas,
            datasets: [
                { label: 'Alertas', data: aS, backgroundColor: '#1b5e20cc', borderColor: '#1b5e20', borderWidth: 1, borderRadius: 4 },
                { label: 'Blitz', data: bS, backgroundColor: '#1565c0cc', borderColor: '#1565c0', borderWidth: 1, borderRadius: 4 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 22 } },
            plugins: { legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

/* ══════════════════════════════════════════
   PARETO
   ══════════════════════════════════════════ */
function renderPareto() {
    let tipo = document.getElementById('fil-pareto-tipo').value;
    let counts = {};

    if (tipo === 'alerta') {
        allAlertas.forEach(function(r) { let k = r.tipo_relato || r.descricao || 'Outros'; counts[k] = (counts[k] || 0) + 1; });
    } else if (tipo === 'area') {
        allAlertas.forEach(function(r) { let k = r.area_emitente || 'Sem área'; counts[k] = (counts[k] || 0) + 1; });
    } else {
        allBlitz.forEach(function(r) {
            let items = [];
            try { items = JSON.parse(r.checklist || '[]'); } catch (e) { items = []; }
            if (!Array.isArray(items) || !items.length) {
                let k = r.setor || 'Sem checklist';
                counts[k] = (counts[k] || 0) + 1;
            } else {
                items.forEach(function(it) { counts[it] = (counts[it] || 0) + 1; });
            }
        });
    }

    let sorted = Object.entries(counts).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 12);
    if (!sorted.length) {
        document.getElementById('pareto-ranking').innerHTML = '<div class="empty">Nenhum dado disponível.</div>';
        destroyChart('ch-pareto');
        return;
    }

    let labels = sorted.map(function(s) { return s[0].length > 28 ? s[0].slice(0, 28) + '…' : s[0]; });
    let qtds = sorted.map(function(s) { return s[1]; });
    let total = qtds.reduce(function(a, b) { return a + b; }, 0);
    let acum = 0;
    let acumPct = qtds.map(function(q) { acum += q; return Math.round(acum / total * 100); });

    destroyChart('ch-pareto');
    let ctx = document.getElementById('ch-pareto');
    if (ctx) {
        charts['ch-pareto'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { type: 'bar', label: 'Ocorrências', data: qtds, backgroundColor: '#1b5e20cc', borderColor: '#1b5e20', borderWidth: 1, yAxisID: 'y' },
                    { type: 'line', label: '% Acumulado', data: acumPct, borderColor: '#e65100', pointRadius: 4, fill: false, tension: 0.3, yAxisID: 'y2', borderWidth: 2 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 22 } },
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { font: { size: 11 }, maxRotation: 35 } },
                    y: { beginAtZero: true, position: 'left' },
                    y2: { beginAtZero: true, max: 100, position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: function(v) { return v + '%'; } } }
                }
            }
        });
    }

    document.getElementById('pareto-ranking').innerHTML = sorted.map(function(s, i) {
        let name = s[0], count = s[1];
        return '<div class="pareto-row"><span class="pareto-rank">' + (i + 1) + '</span><span class="pareto-name" title="' + name + '">' + name + '</span>' +
            '<div class="pareto-bar-wrap"><div class="pareto-bar-fill" style="width:' + Math.round(count / qtds[0] * 100) + '%"></div></div>' +
            '<span class="pareto-count">' + count + '</span><span class="pareto-pct">' + acumPct[i] + '%</span></div>';
    }).join('');
}

/* ══════════════════════════════════════════
   ADERÊNCIA
   ══════════════════════════════════════════ */
function renderAderencia() {
    let uFilt = document.getElementById('fil-adh-unidade').value;
    let wFilt = parseInt(document.getElementById('fil-adh-semana').value);
    let mFiltEl = document.getElementById('fil-adh-mes');
    let mFilt = mFiltEl ? parseInt(mFiltEl.value) : 0;
    let now = new Date();
    let mesRef = mFilt > 0 ? mFilt : (now.getMonth() + 1);
    let anoRef = now.getFullYear();
    let meta = getWeeksInMonth(anoRef, mesRef);

    let bf = allBlitz.filter(function(r) {
        return new Date(r.data_registro || '').getMonth() + 1 === mesRef;
    });
    if (uFilt !== 'todas') bf = bf.filter(function(r) { return r.unidade === uFilt; });
    if (wFilt > 0) bf = bf.filter(function(r) { return r.data_registro && getWeekOfMonth(r.data_registro) === wFilt; });

    let pp = {};
    bf.forEach(function(r) {
        let n = (r.nome || 'Sem nome').trim();
        if (!pp[n]) pp[n] = { nome: n, unidade: r.unidade || '—', turno: r.turno || '—', blitz: 0, semanas: new Set() };
        pp[n].blitz++;
        if (r.data_registro) pp[n].semanas.add(getWeekOfMonth(r.data_registro));
    });

    let lista = Object.values(pp).map(function(p) {
        let mf = wFilt > 0 ? 1 : meta;
        let real = wFilt > 0 ? p.blitz : p.semanas.size;
        return Object.assign({}, p, { meta: mf, realizado: real, pct: mf > 0 ? Math.round(real / mf * 100) : 0 });
    }).sort(function(a, b) { return b.pct - a.pct; });

    let gPct = lista.length > 0 ? Math.round(lista.reduce(function(a, l) { return a + Math.min(l.pct, 100); }, 0) / lista.length) : 0;
    let acima = lista.filter(function(l) { return l.pct >= 80; }).length;
    let mesNome = MESES[mesRef - 1];
    let semLabel = wFilt > 0 ? ' · Semana ' + wFilt : '';

    document.getElementById('kpi-aderencia').innerHTML =
        '<div class="kpi-card ' + (gPct >= 80 ? 'ok' : gPct >= 50 ? 'warn' : 'danger') + '"><div class="k-label">Aderência geral</div><div class="k-val">' + gPct + '%</div><div class="k-sub">' + mesNome + semLabel + '</div></div>' +
        '<div class="kpi-card accent"><div class="k-label">Meta do mês</div><div class="k-val">' + meta + '</div><div class="k-sub">blitz (' + meta + ' semanas)</div></div>' +
        '<div class="kpi-card ok"><div class="k-label">Acima da meta</div><div class="k-val">' + acima + '</div><div class="k-sub">colaboradores ≥ 80%</div></div>' +
        '<div class="kpi-card danger"><div class="k-label">Abaixo da meta</div><div class="k-val">' + (lista.length - acima) + '</div><div class="k-sub">colaboradores &lt; 80%</div></div>';

    if (!lista.length) {
        document.getElementById('adh-tbody').innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:#999">Nenhuma blitz registrada para ' + mesNome + semLabel + '.</td></tr>';
        return;
    }

    document.getElementById('adh-tbody').innerHTML = lista.map(function(l) {
        let cor = l.pct >= 80 ? '#1b5e20' : l.pct >= 50 ? '#e65100' : '#c62828';
        let sc = l.pct >= 80 ? 'status-ok' : l.pct >= 50 ? 'status-warn' : 'status-danger';
        let st = l.pct >= 80 ? 'OK' : l.pct >= 50 ? 'Atenção' : 'Crítico';
        return '<tr><td style="font-weight:500">' + l.nome + '</td>' +
            '<td style="font-size:12px;color:let(--text2)">' + l.turno + '</td>' +
            '<td style="font-size:12px;color:let(--text3)">' + l.unidade + '</td>' +
            '<td style="text-align:center;font-family:let(--mono);font-weight:500">' + l.realizado + '/' + l.meta + '</td>' +
            '<td style="text-align:center;font-size:12px;color:let(--text3)">80%</td>' +
            '<td><div style="display:flex;align-items:center;gap:8px"><div class="adh-bar-wrap"><div class="adh-bar-fill" style="width:' + Math.min(l.pct, 100) + '%;background:' + cor + '"></div></div>' +
            '<span style="font-size:12px;font-weight:600;color:' + cor + ';font-family:let(--mono)">' + l.pct + '%</span></div></td>' +
            '<td><span class="status-pill ' + sc + '">' + st + '</span></td></tr>';
    }).join('');
}

/* ══════════════════════════════════════════
   MAKE BAR (com padding)
   ══════════════════════════════════════════ */
function makeBar(id, labels, data, color) {
    destroyChart(id);
    let ctx = document.getElementById(id);
    if (!ctx) return;

    charts[id] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: color + 'cc',
                borderColor: color,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 22 } },
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { font: { size: 11 } } },
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    let modalBg = document.getElementById('modal-bg');
    if (modalBg) {
        modalBg.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) fecharModal();
        });
    }
    loadAll();
});