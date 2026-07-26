// =============================================
// CADASTRO AUXILIAR — JS
// Usa classes do unidades.css (já funciona)
// =============================================
'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const GEAR = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.04 7.04 0 00-1.63-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54a7.04 7.04 0 00-1.63.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58a7.07 7.07 0 000 1.88L2.86 14.52a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.05.24.26.41.48.41h3.84c.23 0 .43-.17.48-.41l.36-2.54a7.04 7.04 0 001.63-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z"/></svg>';

    const campos = [
        { name: 'local_especifico', tipo: 'local', titulo: 'Locais Específicos', placeholder: 'Nome do local' },
        { name: 'area_ocorrencia', tipo: 'area', titulo: 'Áreas de Ocorrência', placeholder: 'Nome da área' },
        { name: 'area_ocorrencia_terceiro', tipo: 'area', titulo: 'Áreas de Ocorrência', placeholder: 'Nome da área' }
    ];

    const modais = {};

    campos.forEach(cfg => {
        const el = document.querySelector('input[name="' + cfg.name + '"], select[name="' + cfg.name + '"]');
        if (!el) return;

        let select = el;

        if (el.tagName === 'INPUT') {
            select = document.createElement('select');
            select.name = cfg.name;
            if (el.id) select.id = el.id;
            select.innerHTML = '<option value="">Selecione</option>';
            el.parentNode.replaceChild(select, el);
        }

        // Usa a mesma classe do unidades.js que já funciona
        const wrapper = document.createElement('div');
        wrapper.className = 'unidade-select-wrapper';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-config-inline';
        btn.setAttribute('aria-label', 'Gerenciar ' + cfg.titulo);
        btn.title = 'Gerenciar ' + cfg.titulo;
        btn.innerHTML = GEAR;
        btn.addEventListener('click', () => abrirModal(cfg.tipo));
        wrapper.appendChild(btn);

        mergeSelectComBanco(select, cfg.tipo);
    });

    // ── Merge: adiciona itens do banco que não existem no select ──
    async function mergeSelectComBanco(select, tipo) {
        try {
            const res = await fetch('/cadastro-aux/' + tipo);
            const dados = await res.json();

            const existentes = new Set();
            for (let i = 0; i < select.options.length; i++) {
                existentes.add(select.options[i].textContent.trim().toUpperCase());
            }

            dados.forEach(item => {
                if (!existentes.has(item.nome.toUpperCase())) {
                    const opt = document.createElement('option');
                    opt.value = item.nome;
                    opt.textContent = item.nome;
                    select.appendChild(opt);
                }
            });
        } catch (err) {
            // Silencioso — se não tem a tabela, não faz nada
        }
    }

    function mergeAllSelects(tipo) {
        campos.filter(c => c.tipo === tipo).forEach(cfg => {
            const select = document.querySelector('select[name="' + cfg.name + '"]');
            if (select) mergeSelectComBanco(select, tipo);
        });
    }

    // ══════════════════════════════════════
    // MODAL (usa classes do unidades.css)
    // ══════════════════════════════════════
    function getModal(tipo) {
        if (modais[tipo]) return modais[tipo];

        const cfg = campos.find(c => c.tipo === tipo);

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        overlay.innerHTML =
            '<div class="modal-box">' +
                '<div class="modal-header">' +
                    '<h2>' + cfg.titulo + '</h2>' +
                    '<button class="modal-close" data-close>&times;</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<div class="unidade-form-add">' +
                        '<div class="unidade-form-row">' +
                            '<div class="campo-nome">' +
                                '<input type="text" data-input placeholder="' + cfg.placeholder + '" style="text-transform:uppercase">' +
                            '</div>' +
                        '</div>' +
                        '<button class="btn-adicionar" data-add>Adicionar</button>' +
                    '</div>' +
                    '<div class="modal-status" data-status></div>' +
                    '<ul class="unidade-lista" data-lista><li class="unidade-vazio">Carregando…</li></ul>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        const input = overlay.querySelector('[data-input]');

        overlay.querySelector('[data-close]').addEventListener('click', () => overlay.classList.remove('aberto'));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('aberto'); });
        overlay.querySelector('[data-add]').addEventListener('click', () => adicionar(tipo));
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); adicionar(tipo); } });
        input.addEventListener('blur', () => { if (input.value.trim()) input.value = input.value.trim().toUpperCase(); });

        modais[tipo] = { overlay, input, status: overlay.querySelector('[data-status]'), lista: overlay.querySelector('[data-lista]') };
        return modais[tipo];
    }

    function abrirModal(tipo) {
        const m = getModal(tipo);
        m.overlay.classList.add('aberto');
        carregarLista(tipo);
        m.input.focus();
    }

    function mostrarStatus(tipo, msg, cls) {
        const m = modais[tipo];
        if (!m) return;
        m.status.textContent = msg;
        m.status.className = 'modal-status ' + cls;
        if (cls === 'ok') setTimeout(() => { m.status.textContent = ''; m.status.className = 'modal-status'; }, 3000);
    }

    async function carregarLista(tipo) {
        const m = modais[tipo];
        m.lista.innerHTML = '<li class="unidade-vazio">Carregando…</li>';

        try {
            const res = await fetch('/cadastro-aux/' + tipo);
            const dados = await res.json();

            if (!dados.length) {
                m.lista.innerHTML = '<li class="unidade-vazio">Nenhum cadastrado.</li>';
                return;
            }

            m.lista.innerHTML = '';
            dados.forEach(item => {
                const li = document.createElement('li');
                li.className = 'unidade-item';

                const info = document.createElement('div');
                info.className = 'unidade-info';
                info.innerHTML = '<span class="nome">' + esc(item.nome) + '</span>';

                const acoes = document.createElement('div');
                acoes.className = 'acoes';

                const btnEdit = document.createElement('button');
                btnEdit.className = 'btn-editar';
                btnEdit.textContent = '✏️';
                btnEdit.addEventListener('click', () => editar(tipo, item));

                const btnDel = document.createElement('button');
                btnDel.className = 'btn-remover';
                btnDel.textContent = '🗑️';
                btnDel.addEventListener('click', () => remover(tipo, item.id, item.nome));

                acoes.appendChild(btnEdit);
                acoes.appendChild(btnDel);
                li.appendChild(info);
                li.appendChild(acoes);
                m.lista.appendChild(li);
            });
        } catch (err) {
            m.lista.innerHTML = '<li class="unidade-vazio">Erro ao carregar.</li>';
        }
    }

    async function adicionar(tipo) {
        const m = modais[tipo];
        const nome = m.input.value.trim().toUpperCase();
        if (!nome) { mostrarStatus(tipo, 'Informe o nome.', 'erro'); return; }

        try {
            const res = await fetch('/cadastro-aux/' + tipo, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome })
            });
            if (!res.ok) { mostrarStatus(tipo, 'Erro ao adicionar.', 'erro'); return; }

            m.input.value = '';
            mostrarStatus(tipo, 'Adicionado!', 'ok');
            carregarLista(tipo);
            mergeAllSelects(tipo);
        } catch (err) {
            mostrarStatus(tipo, 'Erro na conexão.', 'erro');
        }
    }

    async function editar(tipo, item) {
        const novoNome = prompt('Nome:', item.nome);
        if (novoNome === null || !novoNome.trim()) return;

        try {
            const res = await fetch('/cadastro-aux/' + item.id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: novoNome.trim().toUpperCase() })
            });
            if (!res.ok) { mostrarStatus(tipo, 'Erro ao atualizar.', 'erro'); return; }

            mostrarStatus(tipo, 'Atualizado!', 'ok');
            carregarLista(tipo);
            mergeAllSelects(tipo);
        } catch (err) {
            mostrarStatus(tipo, 'Erro ao atualizar.', 'erro');
        }
    }

    async function remover(tipo, id, nome) {
        if (!confirm('Remover "' + nome + '"?')) return;
        try {
            await fetch('/cadastro-aux/' + id, { method: 'DELETE' });
            mostrarStatus(tipo, 'Removido!', 'ok');
            carregarLista(tipo);
        } catch (err) {
            mostrarStatus(tipo, 'Erro ao remover.', 'erro');
        }
    }

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }
});