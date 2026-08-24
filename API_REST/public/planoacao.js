'use strict';

const API = ''; // mesma origem
let alertas = [];
let planos = [];
let filtroCores = new Set(); // seleção múltipla dos cards de farol (Power BI style)

// ── Utilitários ──
function msg(texto, ok = true) {
    const el = document.getElementById('alerta-msg');
    el.textContent = texto;
    el.className = 'msg ' + (ok ? 'ok' : 'erro');
    el.style.display = 'block';
    clearTimeout(el._t);
    el._t = setTimeout(() => el.style.display = 'none', 3500);
}

function dataBR(sql) {
    if (!sql) return '—';
    const s = String(sql).slice(0, 10).split('-');
    if (s.length !== 3) return '—';
    return `${s[2]}/${s[1]}/${s[0]}`;
}

function hoje() {
    return new Date().toISOString().slice(0, 10);
}

// ── Calcula o farol de um plano ──
// Cinza=Aberto, Amarelo=Em tratamento, Verde=Concluído, Vermelho=Atrasado (>90% do prazo, não concluído)
function calcularFarol(plano) {
    if (!plano) return { cor: 'sem', label: 'Sem plano' };

    if (plano.status === 'Concluído') {
        return { cor: 'verde', label: 'Concluído' };
    }

    if (plano.data_criacao && plano.quando) {
        const criacao = new Date(String(plano.data_criacao).slice(0, 10));
        const prazo = new Date(String(plano.quando).slice(0, 10));
        const agora = new Date(hoje());

        const totalMs = prazo - criacao;
        const decorridoMs = agora - criacao;

        if (totalMs > 0) {
            const pct = decorridoMs / totalMs;
            if (pct >= 0.9) {
                return { cor: 'vermelho', label: 'Atrasado' };
            }
        } else if (agora > prazo) {
            return { cor: 'vermelho', label: 'Atrasado' };
        }
    }

    if (plano.status === 'Em tratamento') {
        return { cor: 'amarelo', label: 'Em tratamento' };
    }

    return { cor: 'cinza', label: 'Aberto' };
}

// ── Retorna o plano mais recente de um alerta ──
function planoDoAlerta(alertaId) {
    const doAlerta = planos.filter(p => String(p.alerta_id) === String(alertaId));
    if (!doAlerta.length) return null;
    return doAlerta.sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0))[0];
}

// ── Carrega dados ──
async function carregar() {
    try {
        const [rAl, rPl] = await Promise.all([
            fetch(API + '/alerta'),
            fetch(API + '/plano-acao')
        ]);
        alertas = await rAl.json();
        planos = await rPl.json();
        if (!Array.isArray(alertas)) alertas = [];
        if (!Array.isArray(planos)) planos = [];
    } catch (e) {
        alertas = [];
        planos = [];
        msg('Erro ao carregar dados.', false);
    }
    render();
}

// ── Alterna seleção de um card de farol (clique = seleciona só ele; Ctrl/Cmd+clique = adiciona à seleção) ──
function toggleFarolCard(cor, event) {
    const multi = event && (event.ctrlKey || event.metaKey);
    if (!multi) {
        if (filtroCores.size === 1 && filtroCores.has(cor)) {
            filtroCores.clear();
        } else {
            filtroCores.clear();
            filtroCores.add(cor);
        }
    } else {
        if (filtroCores.has(cor)) filtroCores.delete(cor);
        else filtroCores.add(cor);
    }
    render();
}

function limparFiltroFarol() {
    filtroCores.clear();
    render();
}

// ── Renderiza resumo do farol + lista ──
function render() {
    const busca = (document.getElementById('busca').value || '').toLowerCase();
    const fStatus = document.getElementById('filtro-status').value;

    const linhas = alertas.map(a => {
        const plano = planoDoAlerta(a.id);
        const farol = calcularFarol(plano);
        return { alerta: a, plano, farol };
    });

    // Filtra por busca + select de status (independente da seleção dos cards)
    let baseLinhas = linhas.filter(l => {
        const a = l.alerta;
        const texto = `${a.descricao || ''} ${a.unidade || ''} ${a.tipo_relato || ''} ${a.area_emitente || ''}`.toLowerCase();
        if (busca && !texto.includes(busca)) return false;
        if (fStatus === 'sem_plano' && l.plano) return false;
        if (fStatus === 'Aberto' && l.farol.label !== 'Aberto') return false;
        if (fStatus === 'Em tratamento' && l.farol.label !== 'Em tratamento') return false;
        if (fStatus === 'Concluído' && l.farol.label !== 'Concluído') return false;
        if (fStatus === 'Atrasado' && l.farol.label !== 'Atrasado') return false;
        return true;
    });

    // Contadores dos cards — refletem busca + select, mas NÃO a seleção dos próprios cards
    // (assim os números não somem quando você clica neles, igual um slicer de Power BI)
    let cont = { sem: 0, cinza: 0, amarelo: 0, verde: 0, vermelho: 0 };
    baseLinhas.forEach(l => {
        cont[l.farol.cor === 'sem' ? 'sem' : l.farol.cor]++;
    });
    const totalBase = baseLinhas.length || 1;

    const cores = [
        { key: 'sem', label: 'Sem plano' },
        { key: 'cinza', label: 'Aberto' },
        { key: 'amarelo', label: 'Em tratamento' },
        { key: 'verde', label: 'Concluído' },
        { key: 'vermelho', label: 'Atrasado' }
    ];

    const temSelecao = filtroCores.size > 0;

    document.getElementById('farol-resumo').innerHTML =
        cores.map(c => {
            const pct = Math.round((cont[c.key] / totalBase) * 100);
            const ativo = filtroCores.has(c.key) ? ' active' : '';
            return `<div class="fcard ${c.key}${ativo}" onclick="toggleFarolCard('${c.key}', event)" title="Clique para filtrar · Ctrl+clique para selecionar vários">
                <div class="fc-num">${cont[c.key]}</div>
                <div class="fc-lbl">${c.label}</div>
                <div class="fc-pct">${pct}%</div>
            </div>`;
        }).join('') +
        (temSelecao ? `<div class="filtro-limpar" onclick="limparFiltroFarol()">✕ Limpar seleção (${filtroCores.size})</div>` : '');

    // Filtra a lista final também pela seleção dos cards
    let filtradas = baseLinhas.filter(l => {
        if (temSelecao && !filtroCores.has(l.farol.cor)) return false;
        return true;
    });

    const cont2 = document.getElementById('lista-alertas');

    if (!filtradas.length) {
        cont2.innerHTML = '<div class="vazio">Nenhum alerta encontrado.</div>';
        return;
    }

    cont2.innerHTML = filtradas.map(l => {
        const a = l.alerta;
        const f = l.farol;
        const p = l.plano;
        const tipo = (a.tipo_relato || '').toLowerCase();
        const tipoLabel = tipo === 'ato' ? 'Ato' : tipo === 'condicao' ? 'Condição' : (a.tipo_relato || '—');

        return `
        <div class="alerta-card">
            <div class="farol-bola ${f.cor}" title="${f.label}"></div>
            <div class="alerta-info">
                <div class="alerta-desc">${a.descricao || 'Sem descrição'}</div>
                <div class="alerta-meta">
                    <span>📍 ${a.unidade || '—'}</span>
                    <span>🏷️ ${tipoLabel}</span>
                    <span>📅 ${dataBR(a.data_ocorrencia)}</span>
                    ${a.area_emitente ? `<span>🏢 ${a.area_emitente}</span>` : ''}
                </div>
                ${p ? `<div class="plano-status ${f.cor}">
                    <strong>${f.label}</strong>
                    ${p.quem ? ` · 👤 ${p.quem}` : ''}
                    ${p.quando ? ` · ⏰ Prazo: ${dataBR(p.quando)}` : ''}
                </div>` : '<div class="plano-status sem">Sem plano de ação</div>'}
            </div>
            <div class="alerta-acoes">
                ${p
                    ? `<button class="btn-editar" onclick="abrirModal(${a.id}, ${p.id})">✏ Plano</button>`
                    : `<button class="btn-criar" onclick="abrirModal(${a.id}, null)">＋ Criar Plano</button>`
                }
            </div>
        </div>`;
    }).join('');
}

// ── Modal ──
function abrirModal(alertaId, planoId) {
    const alerta = alertas.find(a => String(a.id) === String(alertaId));
    document.getElementById('alertaId').value = alertaId;
    document.getElementById('planoId').value = planoId || '';

    document.getElementById('alerta-ref').innerHTML = alerta
        ? `<strong>Alerta:</strong> ${alerta.descricao || '—'} <span class="ref-meta">(${alerta.unidade || '—'})</span>`
        : '';

    if (planoId) {
        const p = planos.find(x => String(x.id) === String(planoId));
        document.getElementById('modal-titulo').textContent = 'Editar Plano de Ação';
        document.getElementById('f-oque').value = p.o_que || '';
        document.getElementById('f-porque').value = p.por_que || '';
        document.getElementById('f-onde').value = p.onde || '';
        document.getElementById('f-quem').value = p.quem || '';
        document.getElementById('f-quando').value = p.quando ? String(p.quando).slice(0,10) : '';
        document.getElementById('f-quanto').value = p.quanto || '';
        document.getElementById('f-como').value = p.como || '';
        document.getElementById('f-status').value = p.status === 'Atrasado' ? 'Em tratamento' : (p.status || 'Aberto');
        document.getElementById('f-inicio').value = p.data_inicio ? String(p.data_inicio).slice(0,10) : '';
        document.getElementById('f-fim').value = p.data_fim ? String(p.data_fim).slice(0,10) : '';
    } else {
        document.getElementById('modal-titulo').textContent = 'Novo Plano de Ação';
        ['f-oque','f-porque','f-onde','f-quem','f-quando','f-quanto','f-como','f-inicio','f-fim'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('f-status').value = 'Aberto';
    }

    document.getElementById('modal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

function onStatusChange() {
    const status = document.getElementById('f-status').value;
    const inicio = document.getElementById('f-inicio');
    const fim = document.getElementById('f-fim');

    if (status === 'Em tratamento' && !inicio.value) {
        inicio.value = hoje();
    }
    if (status === 'Concluído') {
        if (!inicio.value) inicio.value = hoje();
        if (!fim.value) fim.value = hoje();
    }
}

// ── Salvar ──
async function salvarPlano() {
    const planoId = document.getElementById('planoId').value;
    const alertaId = document.getElementById('alertaId').value;

    const oque = document.getElementById('f-oque').value.trim();
    const quem = document.getElementById('f-quem').value.trim();
    const quando = document.getElementById('f-quando').value;

    if (!oque)   { msg('Informe "O quê?" (a ação).', false); return; }
    if (!quem)   { msg('Informe "Quem?" (responsável).', false); return; }
    if (!quando) { msg('Informe "Quando?" (prazo).', false); return; }

    const dados = {
        alerta_id:   alertaId,
        o_que:       oque,
        por_que:     document.getElementById('f-porque').value.trim(),
        onde:        document.getElementById('f-onde').value.trim(),
        quando:      quando,
        quem:        quem,
        como:        document.getElementById('f-como').value.trim(),
        quanto:      document.getElementById('f-quanto').value.trim(),
        status:      document.getElementById('f-status').value,
        data_inicio: document.getElementById('f-inicio').value || null,
        data_fim:    document.getElementById('f-fim').value || null
    };

    try {
        let resp;
        if (planoId) {
            resp = await fetch(API + '/plano-acao/' + planoId, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            resp = await fetch(API + '/plano-acao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        }
        if (!resp.ok) { msg('Erro ao salvar plano.', false); return; }
        fecharModal();
        await carregar();
        msg('Plano salvo com sucesso!');
    } catch {
        msg('Sem conexão com o servidor.', false);
    }
}

// ── Init ──
carregar();
