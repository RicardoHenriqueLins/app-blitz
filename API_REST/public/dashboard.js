/* ============================================================
   DASHBOARD SEGURANÇA — M. DIAS BRANCO
   dashboard.js  (conectado ao banco via /acidente)
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────
const UNIDADES = ['432 - Salvador', 'GMA - Aratu', 'GMA - Almoxarifado', 'GMA - 31F'];
const MESES    = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const TURNOS   = ['ADM','1º Turno','2º Turno','3º Turno','12x36'];

const SECTION_TITLES = {
  acidentes:   'Dias sem Acidente',
  indicadores: 'Indicadores',
  pareto:      'Gráfico de Pareto',
  aderencia:   'Aderência de Líderes',
};

// ─────────────────────────────────────────────────────────────
// ESTADO GLOBAL
// ─────────────────────────────────────────────────────────────
let allAlertas = [];
let allBlitz   = [];
const charts   = {};

// Dados de dias sem acidente (vêm do banco via GET /acidente)
let accData = {};

// Dados de aderência (substitua por GET /lider quando a rota existir)
const LIDERES = [
  { nome: 'Carlos Souza',   cargo: 'Supervisor', unidade: '432 - Salvador',    meta: 5, abertos: 5 },
  { nome: 'Fernanda Lima',  cargo: 'Líder',      unidade: 'GMA - Aratu',       meta: 5, abertos: 4 },
  { nome: 'Marcos Silva',   cargo: 'Supervisor', unidade: 'GMA - Aratu',       meta: 5, abertos: 5 },
  { nome: 'Ana Paula Reis', cargo: 'Líder',      unidade: 'GMA - Almoxarifado',meta: 5, abertos: 2 },
  { nome: 'Ricardo Nunes',  cargo: 'Supervisor', unidade: 'GMA - 31F',         meta: 5, abertos: 5 },
  { nome: 'Juliana Torres', cargo: 'Líder',      unidade: '432 - Salvador',    meta: 5, abertos: 3 },
  { nome: 'Bruno Costa',    cargo: 'Líder',      unidade: 'GMA - Aratu',       meta: 5, abertos: 5 },
  { nome: 'Patrícia Melo',  cargo: 'Supervisor', unidade: 'GMA - Almoxarifado',meta: 5, abertos: 4 },
];

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

async function loadAll() {
  document.getElementById('last-updated').textContent = 'Atualizando...';
  try {
    const [alertas, blitz, acidentes] = await Promise.all([
      fetchJSON('/alerta'),
      fetchJSON('/blitiz'),
      fetchJSON('/acidente'),
    ]);
    allAlertas = Array.isArray(alertas) ? alertas : [];
    allBlitz   = Array.isArray(blitz)   ? blitz   : [];

    // Monta accData a partir do banco
    accData = {};
    (Array.isArray(acidentes) ? acidentes : []).forEach(a => {
      accData[a.unidade] = {
        date:   (a.data_acidente || '').slice(0, 10),
        record: a.recorde_dias || 0,
      };
    });

    const now = new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('last-updated').textContent = `Atualizado às ${now}`;

    renderAcidentes();
    renderIndicadores();
    renderPareto();
    renderAderencia();
  } catch (err) {
    document.getElementById('last-updated').textContent = 'Erro ao carregar';
    showError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    console.error('API error:', err);
  }
}

function showError(msg) {
  const existing = document.getElementById('global-error');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.id        = 'global-error';
  div.className = 'error-box';
  div.style.cssText = 'position:fixed;top:68px;left:50%;transform:translateX(-50%);z-index:100;max-width:500px;width:90%';
  div.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${msg}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 7000);
}

// ─────────────────────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────────────────────
function showSection(s) {
  document.querySelectorAll('.content').forEach(el => el.classList.remove('active'));
  document.getElementById('sec-' + s).classList.add('active');

  const keys = ['acidentes', 'indicadores', 'pareto', 'aderencia'];
  document.querySelectorAll('.nav-item').forEach((el, i) => {
    el.classList.toggle('active', keys[i] === s);
  });
  document.querySelectorAll('.mobile-nav-item').forEach((el, i) => {
    el.classList.toggle('active', keys[i] === s);
  });

  document.getElementById('topbar-title').textContent = SECTION_TITLES[s];
}

// ─────────────────────────────────────────────────────────────
// DIAS SEM ACIDENTE
// ─────────────────────────────────────────────────────────────
function diasDesde(dateStr) {
  if (!dateStr) return 0;
  return Math.max(0, Math.floor((new Date() - new Date(dateStr)) / 86400000));
}

function classeCard(dias) {
  if (dias < 7)  return 'vermelho';
  if (dias < 30) return 'amarelo';
  return 'verde';
}

function renderAcidentes() {
  let total = 0, melhorDias = 0, melhor = '', atencao = 0, critico = 0;

  UNIDADES.forEach(u => {
    const d    = accData[u] || { date: '', record: 0 };
    const dias = diasDesde(d.date);
    total += dias;
    if (dias > melhorDias) { melhorDias = dias; melhor = u; }
    if (dias < 30) atencao++;
    if (dias < 7)  critico++;
  });

  const media = Math.round(total / UNIDADES.length);

  document.getElementById('kpi-acidentes').innerHTML = `
    <div class="kpi-card accent">
      <div class="k-label">Média geral</div>
      <div class="k-val">${media}</div>
      <div class="k-sub">dias sem acidente</div>
    </div>
    <div class="kpi-card ok">
      <div class="k-label">Melhor unidade</div>
      <div class="k-val" style="font-size:18px">${melhor.split(' - ')[0]}</div>
      <div class="k-sub">${melhorDias} dias</div>
    </div>
    <div class="kpi-card warn">
      <div class="k-label">Atenção</div>
      <div class="k-val">${atencao}</div>
      <div class="k-sub">unidades &lt; 30 dias</div>
    </div>
    <div class="kpi-card danger">
      <div class="k-label">Crítico</div>
      <div class="k-val">${critico}</div>
      <div class="k-sub">unidades &lt; 7 dias</div>
    </div>
  `;

  const grid = document.getElementById('units-grid');
  grid.innerHTML = '';

  UNIDADES.forEach(u => {
    const d         = accData[u] || { date: '', record: 0 };
    const dias      = diasDesde(d.date);
    const cls       = classeCard(dias);
    const pct       = d.record > 0 ? Math.min(100, Math.round(dias / d.record * 100)) : 0;
    const dateLabel = d.date
      ? new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR')
      : '—';

    const div       = document.createElement('div');
    div.className   = `unit-card ${cls}`;
    div.innerHTML   = `
      <button class="edit-btn" onclick="abrirModal('${u}')" title="Editar data">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <div class="uc-name">${u}</div>
      <div class="uc-days">${dias}</div>
      <div class="uc-label">dias sem acidente</div>
      ${d.record > 0
        ? `<div class="uc-record">Recorde: ${d.record}d (${pct}%)</div>`
        : `<div class="uc-record">Sem recorde</div>`
      }
      <div class="uc-date">Último: ${dateLabel}</div>
    `;
    grid.appendChild(div);
  });
}

// ── Modal ──
let editUnit = '';

function abrirModal(u) {
  editUnit = u;
  const d = accData[u] || { date: '', record: 0 };
  document.getElementById('modal-title').textContent = 'Editar — ' + u;
  document.getElementById('modal-date').value         = d.date   || '';
  document.getElementById('modal-record').value       = d.record || '';
  document.getElementById('modal-bg').classList.add('open');
}

function fecharModal() {
  document.getElementById('modal-bg').classList.remove('open');
}

async function salvarModal() {
  const date   = document.getElementById('modal-date').value;
  const record = parseInt(document.getElementById('modal-record').value) || 0;
  if (!date) { fecharModal(); return; }

  try {
    const res = await fetch('/acidente/' + encodeURIComponent(editUnit), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data_acidente: date, recorde_dias: record }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    // Atualiza localmente e re-renderiza
    accData[editUnit] = { date, record };
    renderAcidentes();
  } catch (err) {
    showError('Não foi possível salvar a data no servidor.');
    console.error('Erro ao salvar acidente:', err);
  }
  fecharModal();
}

// ─────────────────────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────────────────────
function filterAlertas() {
  const u = document.getElementById('fil-unidade').value;
  const t = document.getElementById('fil-turno').value;
  const m = parseInt(document.getElementById('fil-mes').value);
  return allAlertas.filter(r => {
    if (u !== 'todas' && r.unidade !== u) return false;
    if (t !== 'todos' && r.turno   !== t) return false;
    if (m > 0) {
      const mes = new Date(r.data_registro || r.Data_ocorrencia || '').getMonth() + 1;
      if (mes !== m) return false;
    }
    return true;
  });
}

function filterBlitz() {
  const u = document.getElementById('fil-unidade').value;
  const t = document.getElementById('fil-turno').value;
  const m = parseInt(document.getElementById('fil-mes').value);
  return allBlitz.filter(r => {
    if (u !== 'todas' && r.unidade !== u) return false;
    if (t !== 'todos' && r.turno   !== t) return false;
    if (m > 0) {
      const mes = new Date(r.data_registro || '').getMonth() + 1;
      if (mes !== m) return false;
    }
    return true;
  });
}

function countBy(arr, key) {
  const map = {};
  arr.forEach(r => {
    const v = r[key] || 'N/A';
    map[v] = (map[v] || 0) + 1;
  });
  return map;
}

// ─────────────────────────────────────────────────────────────
// INDICADORES
// ─────────────────────────────────────────────────────────────
function renderIndicadores() {
  const fa = filterAlertas();
  const fb = filterBlitz();

  const atos   = fa.filter(r => (r.tipo_relato || '').toLowerCase() === 'ato').length;
  const cond   = fa.filter(r => (r.tipo_relato || '').toLowerCase() === 'condicao').length;
  const elogio = fa.filter(r => (r.tipo_relato || '').toLowerCase() === 'elogio').length;

  document.getElementById('kpi-indicadores').innerHTML = `
    <div class="kpi-card ok">
      <div class="k-label">Total alertas</div>
      <div class="k-val">${fa.length}</div>
      <div class="k-sub">no período</div>
    </div>
    <div class="kpi-card ok">
      <div class="k-label">Total blitz</div>
      <div class="k-val">${fb.length}</div>
      <div class="k-sub">no período</div>
    </div>
    <div class="kpi-card danger">
      <div class="k-label">Atos inseguros</div>
      <div class="k-val">${atos}</div>
      <div class="k-sub">tipo ATO</div>
    </div>
    <div class="kpi-card warn">
      <div class="k-label">Condições</div>
      <div class="k-val">${cond}</div>
      <div class="k-sub">tipo Condição</div>
    </div>
    <div class="kpi-card">
      <div class="k-label">Elogios</div>
      <div class="k-val">${elogio}</div>
      <div class="k-sub">abordagens positivas</div>
    </div>
  `;

  const auByU = countBy(fa, 'unidade');
  const buByU = countBy(fb, 'unidade');
  const auByT = countBy(fa, 'turno');
  const buByT = countBy(fb, 'turno');
  const shortU = u => u.split(' - ').pop();

  makeBar('ch-alerta-unidade', UNIDADES.map(shortU), UNIDADES.map(u => auByU[u] || 0), '#1b5e20');
  makeBar('ch-alerta-turno',   TURNOS,               TURNOS.map(t   => auByT[t] || 0), '#1565c0');
  makeBar('ch-blitz-unidade',  UNIDADES.map(shortU), UNIDADES.map(u => buByU[u] || 0), '#6a1b9a');
  makeBar('ch-blitz-turno',    TURNOS,               TURNOS.map(t   => buByT[t] || 0), '#00695c');

  // Evolução mensal — ignora filtro de mês para mostrar a série completa
  const uFilt = document.getElementById('fil-unidade').value;
  const tFilt = document.getElementById('fil-turno').value;

  const faAll = allAlertas.filter(r =>
    (uFilt === 'todas' || r.unidade === uFilt) &&
    (tFilt === 'todos' || r.turno   === tFilt)
  );
  const fbAll = allBlitz.filter(r =>
    (uFilt === 'todas' || r.unidade === uFilt) &&
    (tFilt === 'todos' || r.turno   === tFilt)
  );

  const alertasMes = Array(12).fill(0);
  const blitzMes   = Array(12).fill(0);

  faAll.forEach(r => {
    const m = new Date(r.data_registro || r.Data_ocorrencia || '').getMonth();
    if (m >= 0) alertasMes[m]++;
  });
  fbAll.forEach(r => {
    const m = new Date(r.data_registro || '').getMonth();
    if (m >= 0) blitzMes[m]++;
  });

  destroyChart('ch-mensal');
  const ctx = document.getElementById('ch-mensal');
  if (ctx) {
    charts['ch-mensal'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: MESES,
        datasets: [
          {
            label: 'Alertas',
            data: alertasMes,
            borderColor: '#1b5e20',
            backgroundColor: '#1b5e2022',
            fill: true,
            tension: .4,
            pointRadius: 4,
            pointBackgroundColor: '#1b5e20',
          },
          {
            label: 'Blitz',
            data: blitzMes,
            borderColor: '#1565c0',
            backgroundColor: '#1565c022',
            fill: true,
            tension: .4,
            pointRadius: 4,
            pointBackgroundColor: '#1565c0',
            borderDash: [5, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────
// PARETO
// ─────────────────────────────────────────────────────────────
function renderPareto() {
  const tipo = document.getElementById('fil-pareto-tipo').value;
  const counts = {};

  if (tipo === 'alerta') {
    allAlertas.forEach(r => {
      const key = r.tipo_relato || r.descricao || 'Outros';
      counts[key] = (counts[key] || 0) + 1;
    });
  } else {
    allBlitz.forEach(r => {
      let items = [];
      try { items = JSON.parse(r.checklist || '[]'); } catch (e) { items = []; }
      if (!Array.isArray(items) || items.length === 0) {
        const key = r.setor || 'Sem checklist';
        counts[key] = (counts[key] || 0) + 1;
      } else {
        items.forEach(item => { counts[item] = (counts[item] || 0) + 1; });
      }
    });
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);

  if (sorted.length === 0) {
    document.getElementById('pareto-ranking').innerHTML =
      '<div class="empty">Nenhum dado disponível para o período.</div>';
    destroyChart('ch-pareto');
    return;
  }

  const labels  = sorted.map(([k]) => k.length > 24 ? k.slice(0, 24) + '…' : k);
  const qtds    = sorted.map(([, v]) => v);
  const total   = qtds.reduce((a, b) => a + b, 0);
  let acum      = 0;
  const acumPct = qtds.map(q => { acum += q; return Math.round(acum / total * 100); });

  destroyChart('ch-pareto');
  const ctx = document.getElementById('ch-pareto');
  if (ctx) {
    charts['ch-pareto'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Ocorrências',
            data: qtds,
            backgroundColor: '#1b5e20cc',
            borderColor: '#1b5e20',
            borderWidth: 1,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: '% Acumulado',
            data: acumPct,
            borderColor: '#e65100',
            pointRadius: 4,
            fill: false,
            tension: .3,
            yAxisID: 'y2',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x:  { ticks: { font: { size: 11 }, maxRotation: 35 } },
          y:  { beginAtZero: true, position: 'left' },
          y2: {
            beginAtZero: true,
            max: 100,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { callback: v => v + '%' },
          },
        },
      },
    });
  }

  document.getElementById('pareto-ranking').innerHTML = sorted.map(([name, count], i) => `
    <div class="pareto-row">
      <span class="pareto-rank">${i + 1}</span>
      <span class="pareto-name" title="${name}">${name}</span>
      <div class="pareto-bar-wrap">
        <div class="pareto-bar-fill" style="width:${Math.round(count / qtds[0] * 100)}%"></div>
      </div>
      <span class="pareto-count">${count}</span>
      <span class="pareto-pct">${acumPct[i]}%</span>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────────────────────
// ADERÊNCIA
// ─────────────────────────────────────────────────────────────
function renderAderencia() {
  const uFilt = document.getElementById('fil-adh-unidade').value;
  const lista = LIDERES.filter(l => uFilt === 'todas' || l.unidade === uFilt);

  // Cruza com alertas do banco quando disponível
  if (allAlertas.length > 0) {
    lista.forEach(l => {
      const count = allAlertas.filter(r =>
        (r.nome || '').toLowerCase().includes(l.nome.split(' ')[0].toLowerCase()) ||
        r.unidade === l.unidade
      ).length;
      if (count > 0) l.abertos = Math.min(l.meta, count);
    });
  }

  const geralPct = lista.length > 0
    ? Math.round(lista.reduce((a, l) => a + l.abertos / l.meta, 0) / lista.length * 100)
    : 0;
  const acima  = lista.filter(l => Math.round(l.abertos / l.meta * 100) >= 80).length;
  const abaixo = lista.length - acima;

  document.getElementById('kpi-aderencia').innerHTML = `
    <div class="kpi-card ${geralPct >= 80 ? 'ok' : geralPct >= 50 ? 'warn' : 'danger'}">
      <div class="k-label">Aderência geral</div>
      <div class="k-val">${geralPct}%</div>
      <div class="k-sub">média das unidades</div>
    </div>
    <div class="kpi-card ok">
      <div class="k-label">Meta</div>
      <div class="k-val">80%</div>
      <div class="k-sub">mínimo esperado</div>
    </div>
    <div class="kpi-card ok">
      <div class="k-label">Acima da meta</div>
      <div class="k-val">${acima}</div>
      <div class="k-sub">colaboradores</div>
    </div>
    <div class="kpi-card danger">
      <div class="k-label">Abaixo da meta</div>
      <div class="k-val">${abaixo}</div>
      <div class="k-sub">colaboradores</div>
    </div>
  `;

  document.getElementById('adh-tbody').innerHTML = lista.map(l => {
    const pct         = Math.round(l.abertos / l.meta * 100);
    const cor         = pct >= 80 ? '#1b5e20' : pct >= 50 ? '#e65100' : '#c62828';
    const statusClass = pct >= 80 ? 'status-ok' : pct >= 50 ? 'status-warn' : 'status-danger';
    const statusText  = pct >= 80 ? 'OK' : pct >= 50 ? 'Atenção' : 'Crítico';
    return `<tr>
      <td style="font-weight:500">${l.nome}</td>
      <td style="font-size:12px;color:var(--text2)">${l.cargo}</td>
      <td style="font-size:12px;color:var(--text3)">${l.unidade}</td>
      <td style="text-align:center;font-family:var(--mono);font-weight:500">${l.abertos}/${l.meta}</td>
      <td style="text-align:center;font-size:12px;color:var(--text3)">80%</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="adh-bar-wrap">
            <div class="adh-bar-fill" style="width:${Math.min(pct, 100)}%;background:${cor}"></div>
          </div>
          <span style="font-size:12px;font-weight:600;color:${cor};font-family:var(--mono)">${pct}%</span>
        </div>
      </td>
      <td><span class="status-pill ${statusClass}">${statusText}</span></td>
    </tr>`;
  }).join('');
}

// ─────────────────────────────────────────────────────────────
// HELPERS DE CHART
// ─────────────────────────────────────────────────────────────
function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function makeBar(id, labels, data, color) {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: color + 'cc',
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { size: 11 } } },
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Fecha modal ao clicar fora
  document.getElementById('modal-bg').addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharModal();
  });

  loadAll();
});