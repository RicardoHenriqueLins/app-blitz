// =============================================
// CADASTRO AUXILIAR — JS
// Modal para Local Específico e Área de Ocorrência
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
        selectNames: ['area_ocorrencia', 'area_ocorrencia_terceiro']
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

// ── Abrir modal (chamado pelo onclick do HTML) ──
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

// ── Popular selects do tipo ──
async function popularSelectsAux(tipo) {
    const cfg = AUX_CONFIGS[tipo];
    const apiUrl = '/cadastro-aux/' + tipo;

    try {
        const res = await fetch(apiUrl);
        const dados = await res.json();

        // Pega todos os selects que precisam ser populados
        const names = cfg.selectNames || [cfg.selectName];
        names.forEach(name => {
            document.querySelectorAll('select[name="' + name + '"]').forEach(select => {
                const valorAtual = select.value;
                const placeholder = tipo === 'local' ? 'Selecione o local' : 'Selecione a área';
                select.innerHTML = '<option value="">' + placeholder + '</option>';
                dados.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item.nome;
                    opt.textContent = item.nome;
                    select.appendChild(opt);
                });
                if (valorAtual) select.value = valorAtual;
            });
        });
    } catch (err) {
        console.error('Erro ao popular selects:', err);
    }
}

// ── Init: popular selects na carga da página ──
document.addEventListener('DOMContentLoaded', () => {
    // Popula local se existir select na página
    if (document.querySelector('select[name="local_especifico"]')) {
        popularSelectsAux('local');
    }
    // Popula area se existir select na página
    if (document.querySelector('select[name="area_ocorrencia"]') || document.querySelector('select[name="area_ocorrencia_terceiro"]')) {
        popularSelectsAux('area');
    }
});