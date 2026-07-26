// =============================================
// CADASTRO AUXILIAR — JS
// Engrenagem + Modal para Local e Área
// Tabela única: cadastro_aux (tipo diferencia)
// =============================================
'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const gearSVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.04 7.04 0 00-1.63-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54a7.04 7.04 0 00-1.63.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58a7.07 7.07 0 000 1.88L2.86 14.52a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.05.24.26.41.48.41h3.84c.23 0 .43-.17.48-.41l.36-2.54a7.04 7.04 0 001.63-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z"/></svg>';

    const configs = [
        {
            campo: 'local_especifico',
            tipo: 'local',
            titulo: 'Locais Específicos',
            placeholder: 'Nome do local',
            selectPlaceholder: 'Selecione o local'
        },
        {
            campo: 'area_ocorrencia',
            tipo: 'area',
            titulo: 'Áreas de Ocorrência',
            placeholder: 'Nome da área',
            selectPlaceholder: 'Selecione a área'
        }
    ];

    configs.forEach(cfg => {
        let el = document.querySelector('input[name="' + cfg.campo + '"], select[name="' + cfg.campo + '"]');
        if (!el) return;

        // Se for input, converte pra select
        if (el.tagName === 'INPUT') {
            const select = document.createElement('select');
            select.name = cfg.campo;
            select.innerHTML = '<option value="">' + cfg.selectPlaceholder + '</option>';
            el.parentNode.replaceChild(select, el);
            el = select;
        }

        montarEngrenagem(el, cfg);
    });

    function montarEngrenagem(select, cfg) {
        const apiUrl = '/cadastro-aux/' + cfg.tipo;

        // Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'aux-select-wrapper';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);

        // Botão engrenagem
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-config-inline';
        btn.title = 'Gerenciar ' + cfg.titulo;
        btn.innerHTML = gearSVG;
        wrapper.appendChild(btn);

        // Modal
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

        // Referências
        const inputNome = modal.querySelector('[data-input]');
        const btnAdd = modal.querySelector('[data-btn-add]');
        const btnClose = modal.querySelector('[data-close]');
        const statusEl = modal.querySelector('[data-status]');
        const listaEl = modal.querySelector('[data-lista]');

        // Eventos
        btn.addEventListener('click', () => {
            modal.classList.add('aberto');
            carregarLista();
            inputNome.focus();
        });

        btnClose.addEventListener('click', () => modal.classList.remove('aberto'));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('aberto');
        });

        btnAdd.addEventListener('click', adicionar);

        inputNome.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); adicionar(); }
        });

        inputNome.addEventListener('blur', () => {
            if (inputNome.value.trim()) inputNome.value = inputNome.value.trim().toUpperCase();
        });

        // Status
        const mostrarStatus = (msg, tipo) => {
            statusEl.textContent = msg;
            statusEl.className = 'aux-status ' + tipo;
            if (tipo === 'ok') setTimeout(() => {
                statusEl.textContent = '';
                statusEl.className = 'aux-status';
            }, 3000);
        };

        // Escapar HTML
        const esc = (str) => {
            const d = document.createElement('div');
            d.textContent = str;
            return d.innerHTML;
        };

        // Carregar lista
        async function carregarLista() {
            listaEl.innerHTML = '<li class="aux-lista-vazio">Carregando…</li>';
            try {
                const res = await fetch(apiUrl);
                const dados = await res.json();

                if (!dados.length) {
                    listaEl.innerHTML = '<li class="aux-lista-vazio">Nenhum cadastrado.</li>';
                    return;
                }

                listaEl.innerHTML = '';
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
                    btnEditar.title = 'Editar';
                    btnEditar.addEventListener('click', () => editar(item));

                    const btnRemover = document.createElement('button');
                    btnRemover.className = 'btn-aux-del';
                    btnRemover.textContent = '🗑️';
                    btnRemover.title = 'Remover';
                    btnRemover.addEventListener('click', () => remover(item.id, item.nome));

                    divAcoes.appendChild(btnEditar);
                    divAcoes.appendChild(btnRemover);
                    li.appendChild(spanNome);
                    li.appendChild(divAcoes);
                    listaEl.appendChild(li);
                });
            } catch (err) {
                listaEl.innerHTML = '<li class="aux-lista-vazio">Erro ao carregar.</li>';
            }
        }

        // Adicionar
        async function adicionar() {
            const nome = inputNome.value.trim().toUpperCase();
            if (!nome) { mostrarStatus('Informe o nome.', 'erro'); return; }

            try {
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome })
                });

                if (!res.ok) {
                    mostrarStatus('Erro ao adicionar.', 'erro');
                    return;
                }

                inputNome.value = '';
                mostrarStatus('Adicionado!', 'ok');
                carregarLista();
                popularSelect();
            } catch (err) {
                mostrarStatus('Erro na conexão.', 'erro');
            }
        }

        // Editar
        async function editar(item) {
            const novoNome = prompt('Nome:', item.nome);
            if (novoNome === null || !novoNome.trim()) return;

            try {
                const res = await fetch('/cadastro-aux/' + item.id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: novoNome.trim().toUpperCase() })
                });

                if (!res.ok) {
                    mostrarStatus('Erro ao atualizar.', 'erro');
                    return;
                }

                mostrarStatus('Atualizado!', 'ok');
                carregarLista();
                popularSelect();
            } catch (err) {
                mostrarStatus('Erro ao atualizar.', 'erro');
            }
        }

        // Remover
        async function remover(id, nome) {
            if (!confirm('Remover "' + nome + '"?')) return;
            try {
                await fetch('/cadastro-aux/' + id, { method: 'DELETE' });
                mostrarStatus('Removido!', 'ok');
                carregarLista();
                popularSelect();
            } catch (err) {
                mostrarStatus('Erro ao remover.', 'erro');
            }
        }

        // Popular select
        async function popularSelect() {
            try {
                const res = await fetch(apiUrl);
                const dados = await res.json();
                const valorAtual = select.value;
                select.innerHTML = '<option value="">' + cfg.selectPlaceholder + '</option>';
                dados.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item.nome;
                    opt.textContent = item.nome;
                    select.appendChild(opt);
                });
                if (valorAtual) select.value = valorAtual;
            } catch (err) {
                console.error('Erro ao popular select:', err);
            }
        }

        // Carrega na inicialização
        popularSelect();
    }
});