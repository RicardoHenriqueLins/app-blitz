// =============================================
// CADASTRO DE GESTORES — JS
// =============================================
'use strict';

let editandoGestorId = null;

// ── Status ──
const mostrarStatus = (msg, tipo) => {
    const el = document.getElementById('status-msg');
    el.textContent = msg;
    el.className = 'status-msg ' + tipo;
    if (tipo === 'ok') {
        setTimeout(() => { el.style.display = 'none'; }, 3000);
    }
};

// ── Carregar unidades no select ──
const carregarUnidades = async () => {
    try {
        const res = await fetch('/unidade');
        const unidades = await res.json();
        const select = document.getElementById('inp-unidade');
        select.innerHTML = '<option value="">Todas (recebe de qualquer unidade)</option>';
        unidades.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.nome;
            opt.textContent = u.nome + ' — ' + u.cidade + '/' + u.uf;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Erro ao carregar unidades:', err);
    }
};

// ── Carregar lista de gestores ──
const carregarGestores = async () => {
    const tbody = document.getElementById('gestores-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="empty-msg">Carregando...</td></tr>';

    try {
        const res = await fetch('/gestor');
        const gestores = await res.json();

        if (!gestores.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-msg">Nenhum gestor cadastrado.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        gestores.forEach(g => {
            const tr = document.createElement('tr');

            tr.innerHTML =
                '<td style="font-weight:500">' + esc(g.nome) + '</td>' +
                '<td>' + esc(g.email) + '</td>' +
                '<td>' + esc(g.area || 'Todas') + '</td>' +
                '<td>' + esc(g.unidade || 'Todas') + '</td>' +
                '<td></td>';

            // Botão editar
            const btnEdit = document.createElement('button');
            btnEdit.className = 'btn-edit';
            btnEdit.textContent = '✏️ Editar';
            btnEdit.addEventListener('click', () => {
                editarGestor(g.id, g.nome, g.email, g.area || '', g.unidade || '');
            });

            // Botão excluir
            const btnDel = document.createElement('button');
            btnDel.className = 'btn-del';
            btnDel.textContent = '🗑️ Excluir';
            btnDel.addEventListener('click', () => {
                excluirGestor(g.id, g.nome);
            });

            const tdAcoes = tr.querySelector('td:last-child');
            tdAcoes.appendChild(btnEdit);
            tdAcoes.appendChild(btnDel);

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Erro ao carregar gestores:', err);
        tbody.innerHTML = '<tr><td colspan="5" class="empty-msg">Erro ao carregar.</td></tr>';
    }
};

// ── Salvar (criar ou atualizar) ──
const salvarGestor = async () => {
    const nome = document.getElementById('inp-nome').value.trim();
    const email = document.getElementById('inp-email').value.trim();
    const area = document.getElementById('inp-area').value.trim();
    const unidade = document.getElementById('inp-unidade').value;

    if (!nome) { mostrarStatus('Informe o nome.', 'erro'); return; }
    if (!email) { mostrarStatus('Informe o email.', 'erro'); return; }

    try {
        const url = editandoGestorId ? '/gestor/' + editandoGestorId : '/gestor';
        const method = editandoGestorId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, area, unidade })
        });

        if (!res.ok) {
            const erro = await res.json().catch(() => ({}));
            mostrarStatus(erro.erro || 'Erro ao salvar.', 'erro');
            return;
        }

        mostrarStatus(editandoGestorId ? 'Gestor atualizado!' : 'Gestor adicionado!', 'ok');
        limparForm();
        carregarGestores();
    } catch (err) {
        mostrarStatus('Erro na conexão com o servidor.', 'erro');
    }
};

// ── Editar ──
const editarGestor = (id, nome, email, area, unidade) => {
    editandoGestorId = id;
    document.getElementById('inp-nome').value = nome;
    document.getElementById('inp-email').value = email;
    document.getElementById('inp-area').value = area;
    document.getElementById('inp-unidade').value = unidade;
    document.getElementById('btn-salvar').textContent = 'Salvar Alterações';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ── Excluir ──
const excluirGestor = async (id, nome) => {
    if (!confirm('Desativar o gestor "' + nome + '"?')) return;

    try {
        const res = await fetch('/gestor/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        mostrarStatus('Gestor removido!', 'ok');
        carregarGestores();
    } catch (err) {
        mostrarStatus('Erro ao remover.', 'erro');
    }
};

// ── Limpar formulário ──
const limparForm = () => {
    editandoGestorId = null;
    document.getElementById('inp-nome').value = '';
    document.getElementById('inp-email').value = '';
    document.getElementById('inp-area').value = '';
    document.getElementById('inp-unidade').value = '';
    document.getElementById('btn-salvar').textContent = 'Adicionar Gestor';
};

// ── Escapar HTML ──
const esc = (str) => {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
};

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    carregarUnidades();
    carregarGestores();

    document.getElementById('btn-salvar').addEventListener('click', salvarGestor);
});