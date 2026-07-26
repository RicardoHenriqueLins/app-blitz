// =============================================
// CADASTRO AUXILIAR — JS
// Modal para Local Específico (input texto) e Área de Ocorrência (select)
// Tabela única: cadastro_aux (tipo diferencia)
// =============================================
'use strict';

// ── Configurações ──
const AUX_CONFIGS = {
    local: {
        titulo: 'Locais Específicos',
        placeholder: 'Nome do local',
        selectPlaceholder: 'Selecione o local',
        selectName: 'local_especifico'
    },
    area: {
        titulo: 'Áreas de Ocorrência',
        placeholder: 'Nome da área',
        selectPlaceholder: 'Selecione a área',
        selectNames: ['area_ocorrencia', 'area_ocorrencia_terceiro', 'area_responsavel']
    }
};

// ── Modal HTML (criado uma vez por tipo) ──
const modaisAux = {};

function criarModalAux(tipo) {
    if (modaisAux[tipo]) return modaisAux[tipo];

    const cfg = AUX_CONFIGS[tipo];
    const modal = document.createElement('div');
    modal.className = 'aux-modal-overlay';
    modal.innerHTML =
        '<div class="aux-modal-box">' +
            '<div class="aux-modal-header">' +
                '<h2>' + cfg.titulo + '</h2>' +
                '<button class="aux-modal-close" data-close>&times;</button>' +
            '</div>' +
            '<div class="aux-modal-body">' +
                '<div class="aux-form-add">' +
                    '<input type="text" data-input placeholder="' + cfg.placeholder + '">' +
                    '<button data-btn-add>Adicionar</button>' +
                '</div>' +
                '<div class="aux-status" data-status></div>' +
                '<ul class="aux-lista" data-lista><li class="aux-lista-vazio">Carregando…</li></ul>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);

    const inputNome = modal.querySelector('[data-input]');
    const btnAdd = modal.querySelector('[data-btn-add]');
    const btnClose = modal.querySelector('[data-close]');
    const statusEl = modal.querySelector('[data-status]');
    const listaEl = modal.querySelector('[data-lista]');
    const apiUrl = '/cadastro-aux/' + tipo;

    // Fechar
    btnClose.addEventListener('click', () => modal.classList.remove('aberto'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('aberto'); });

    // Adicionar
    btnAdd.addEventListener('click', () => adicionarAux(tipo));
    inputNome.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarAux(tipo); } });
    inputNome.addEventListener('blur', () => { if (inputNome.value.trim()) inputNome.value = inputNome.value.trim().toUpperCase(); });

    modaisAux[tipo] = { modal, inputNome, statusEl, listaEl, apiUrl };
    return modaisAux[tipo];
}

// ── Abrir modal (chamado pelo onclick do HTML ou pela engrenagem) ──
function abrirModalAux(tipo) {
    const m = criarModalAux(tipo);
    m.modal.classList.add('aberto');
    carregarListaAux(tipo);
    m.inputNome.focus();
}

// ── Status ──
function mostrarStatusAux(tipo, msg, cls) {
    const m = modaisAux[tipo];
    if (!m) return;
    m.statusEl.textContent = msg;
    m.statusEl.className = 'aux-status ' + cls;
    if (cls === 'ok') setTimeout(() => { m.statusEl.textContent = ''; m.statusEl.className = 'aux-status'; }, 3000);
}

// ── Escapar HTML ──
function escAux(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// ── Carregar lista ──
async function carregarListaAux(tipo) {
    const m = modaisAux[tipo];
    if (!m) return;
    m.listaEl.innerHTML = '<li class="aux-lista-vazio">Carregando…</li>';

    try {
        const res = await fetch(m.apiUrl);
        const dados = await res.json();

        if (!dados.length) {
            m.listaEl.innerHTML = '<li class="aux-lista-vazio">Nenhum cadastrado.</li>';
            return;
        }

        m.listaEl.innerHTML = '';
        dados.forEach(item => {
            const li = document.createElement('li');
            li.className = 'aux-lista-item';

            const spanNome = document.createElement('span');
            spanNome.className = 'aux-lista-nome';
            spanNome.textContent = item.nome;

            const divAcoes = document.createElement('div');
            divAcoes.className = 'aux-lista-acoes';

            const btnEditar = document.createElement('button');
            btnEditar.className = 'btn-aux-edit';
            btnEditar.textContent = '✏️';
            btnEditar.addEventListener('click', () => editarAux(tipo, item));

            const btnRemover = document.createElement('button');
            btnRemover.className = 'btn-aux-del';
            btnRemover.textContent = '🗑️';
            btnRemover.addEventListener('click', () => removerAux(tipo, item.id, item.nome));

            divAcoes.appendChild(btnEditar);
            divAcoes.appendChild(btnRemover);
            li.appendChild(spanNome);
            li.appendChild(divAcoes);
            m.listaEl.appendChild(li);
        });
    } catch (err) {
        m.listaEl.innerHTML = '<li class="aux-lista-vazio">Erro ao carregar.</li>';
    }
}

// ── Adicionar ──
async function adicionarAux(tipo) {
    const m = modaisAux[tipo];
    if (!m) return;
    const nome = m.inputNome.value.trim().toUpperCase();
    if (!nome) { mostrarStatusAux(tipo, 'Informe o nome.', 'erro'); return; }

    try {
        const res = await fetch(m.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });
        if (!res.ok) { mostrarStatusAux(tipo, 'Erro ao adicionar.', 'erro'); return; }

        m.inputNome.value = '';
        mostrarStatusAux(tipo, 'Adicionado!', 'ok');
        carregarListaAux(tipo);
        popularSelectsAux(tipo);
    } catch (err) {
        mostrarStatusAux(tipo, 'Erro na conexão.', 'erro');
    }
}

// ── Editar ──
async function editarAux(tipo, item) {
    const novoNome = prompt('Nome:', item.nome);
    if (novoNome === null || !novoNome.trim()) return;

    try {
        const res = await fetch('/cadastro-aux/' + item.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novoNome.trim().toUpperCase() })
        });
        if (!res.ok) { mostrarStatusAux(tipo, 'Erro ao atualizar.', 'erro'); return; }

        mostrarStatusAux(tipo, 'Atualizado!', 'ok');
        carregarListaAux(tipo);
        popularSelectsAux(tipo);
    } catch (err) {
        mostrarStatusAux(tipo, 'Erro ao atualizar.', 'erro');
    }
}

// ── Remover ──
async function removerAux(tipo, id, nome) {
    if (!confirm('Remover "' + nome + '"?')) return;
    try {
        await fetch('/cadastro-aux/' + id, { method: 'DELETE' });
        mostrarStatusAux(tipo, 'Removido!', 'ok');
        carregarListaAux(tipo);
        popularSelectsAux(tipo);
    } catch (err) {
        mostrarStatusAux(tipo, 'Erro ao remover.', 'erro');
    }
}

// =============================================
// POPULAR <select> E <datalist> (para <input> de texto)
// =============================================
async function popularSelectsAux(tipo) {
    const cfg = AUX_CONFIGS[tipo];
    const apiUrl = '/cadastro-aux/' + tipo;

    try {
        const res = await fetch(apiUrl);
        const dados = await res.json();

        const names = cfg.selectNames || (cfg.selectName ? [cfg.selectName] : []);

        names.forEach(name => {
            // Selects (ex: área de ocorrência)
            document.querySelectorAll('select[name="' + name + '"]').forEach(select => {
                const valorAtual = select.value;
                const placeholder = cfg.selectPlaceholder || 'Selecione';
                select.innerHTML = '<option value="">' + placeholder + '</option>';
                dados.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item.nome;
                    opt.textContent = item.nome;
                    select.appendChild(opt);
                });
                if (valorAtual) select.value = valorAtual;
            });

            // Datalist vinculado a inputs de texto (ex: local específico)
            document.querySelectorAll('input[name="' + name + '"]').forEach(input => {
                const listId = input.getAttribute('list');
                if (!listId) return;
                const datalist = document.getElementById(listId);
                if (!datalist) return;
                datalist.innerHTML = '';
                dados.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item.nome;
                    datalist.appendChild(opt);
                });
            });
        });
    } catch (err) {
        console.error('Erro ao popular selects/datalist:', err);
    }
}

// =============================================
// ENGRENAGEM — cria botão + wrapper ao lado do campo
// (mesmo ícone/padrão usado em unidades.js)
// =============================================
function criarEngrenagemAux(elemento, tipo) {
    // Evita duplicar caso o script rode mais de uma vez
    if (elemento.parentNode.classList && elemento.parentNode.classList.contains('aux-select-wrapper')) return;

    const cfg = AUX_CONFIGS[tipo];
    const wrapper = document.createElement('div');
    wrapper.className = 'aux-select-wrapper';
    elemento.parentNode.insertBefore(wrapper, elemento);
    wrapper.appendChild(elemento);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-config-inline';
    btn.setAttribute('aria-label', 'Gerenciar ' + cfg.titulo.toLowerCase());
    btn.title = 'Gerenciar ' + cfg.titulo.toLowerCase();
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.49.49
            0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.04
            7.04 0 00-1.63-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48
            0 00-.48.41l-.36 2.54a7.04 7.04 0 00-1.63.94l-2.39-.96a.49.49
            0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58a7.07 7.07
            0 000 1.88L2.86 14.52a.49.49 0 00-.12.61l1.92 3.32a.49.49
            0 00.59.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.05.24
            .26.41.48.41h3.84c.23 0 .43-.17.48-.41l.36-2.54a7.04 7.04
            0 001.63-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49
            0 00-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1115.6 12
            3.6 3.6 0 0112 15.6z"/>
        </svg>`;
    btn.addEventListener('click', () => abrirModalAux(tipo));
    wrapper.appendChild(btn);
}

// ── Init: engrenagem + popular na carga da página ──
document.addEventListener('DOMContentLoaded', () => {

    // ── ÁREA DE OCORRÊNCIA (select) — engrenagem só nos forms de Alerta/Ocorrência ──
    document.querySelectorAll('select[name="area_ocorrencia"], select[name="area_ocorrencia_terceiro"]').forEach(select => {
        criarEngrenagemAux(select, 'area');
    });

    // Popula qualquer select de área presente na página (inclui area_responsavel do Cadastro de Gestores)
    if (
        document.querySelector('select[name="area_ocorrencia"]') ||
        document.querySelector('select[name="area_ocorrencia_terceiro"]') ||
        document.querySelector('select[name="area_responsavel"]')
    ) {
        popularSelectsAux('area');
    }
});