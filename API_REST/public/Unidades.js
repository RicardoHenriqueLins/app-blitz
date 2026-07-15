// =============================================
// GESTÃO DE UNIDADES — Engrenagem + Modal + API
// =============================================

const UFS_BRASIL = [
    "AC","AL","AM","AP","BA","CE","DF","ES","GO",
    "MA","MG","MS","MT","PA","PB","PE","PI","PR",
    "RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

function capitalizar(str) {
    return str.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
}

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // 1. ENGRENAGEM AO LADO DO SELECT DE UNIDADE
    // =========================================

    document.querySelectorAll('select[name="unidade"]').forEach(select => {

        const wrapper = document.createElement("div");
        wrapper.className = "unidade-select-wrapper";
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-config-inline";
        btn.setAttribute("aria-label", "Gerenciar unidades");
        btn.title = "Gerenciar unidades";
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
        btn.addEventListener("click", abrirModal);
        wrapper.appendChild(btn);
    });

    // =========================================
    // 2. MONTAR O MODAL NO DOM
    // =========================================

    const optionsUf = UFS_BRASIL.map(uf => `<option value="${uf}">${uf}</option>`).join("");

    const modal = document.createElement("div");
    modal.id = "modalUnidades";
    modal.className = "modal-overlay";
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <h2>Cadastro de Unidades</h2>
                <button class="modal-close" id="fecharModal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="unidade-form-add">
                    <div class="unidade-form-row">
                        <div class="campo-nome">
                            <input type="text" id="inputNomeUnidade"
                                   placeholder="Nome da unidade" maxlength="100"
                                   style="text-transform:uppercase">
                        </div>
                    </div>
                    <div class="unidade-form-row">
                        <div class="campo-cidade">
                            <input type="text" id="inputCidadeUnidade"
                                   placeholder="Cidade" maxlength="100">
                        </div>
                        <div class="campo-uf">
                            <select id="selectUfUnidade">
                                <option value="">UF</option>
                                ${optionsUf}
                            </select>
                        </div>
                    </div>
                    <button class="btn-adicionar" id="btnAdicionarUnidade">
                        Adicionar unidade
                    </button>
                </div>
                <div class="modal-status" id="modalStatus"></div>
                <ul class="unidade-lista" id="listaUnidades">
                    <li class="unidade-vazio">Carregando…</li>
                </ul>
            </div>
        </div>`;

    document.body.appendChild(modal);

    // =========================================
    // 3. EVENTOS DO MODAL
    // =========================================

    document.getElementById("fecharModal").addEventListener("click", fecharModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });
    document.getElementById("btnAdicionarUnidade").addEventListener("click", adicionarUnidade);

    document.getElementById("inputNomeUnidade").addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); document.getElementById("inputCidadeUnidade").focus(); }
    });
    document.getElementById("inputCidadeUnidade").addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); document.getElementById("selectUfUnidade").focus(); }
    });
    document.getElementById("selectUfUnidade").addEventListener("keydown", (e) => {
        if (e.key === "Enter") adicionarUnidade();
    });

    // Nome → MAIÚSCULA ao sair do campo
    document.getElementById("inputNomeUnidade").addEventListener("blur", (e) => {
        if (e.target.value.trim()) e.target.value = e.target.value.trim().toUpperCase();
    });

    // Cidade → Primeira Letra ao sair do campo
    document.getElementById("inputCidadeUnidade").addEventListener("blur", (e) => {
        if (e.target.value.trim()) e.target.value = capitalizar(e.target.value.trim());
    });

    // =========================================
    // 4. POPULAR SELECTS
    // =========================================
    carregarUnidadesSelect();
});

// =============================================
// MODAL — ABRIR / FECHAR
// =============================================
function abrirModal() {
    document.getElementById("modalUnidades").classList.add("aberto");
    carregarListaModal();
    document.getElementById("inputNomeUnidade").focus();
}

function fecharModal() {
    document.getElementById("modalUnidades").classList.remove("aberto");
    limparStatus();
}

function mostrarStatus(msg, tipo) {
    const el = document.getElementById("modalStatus");
    el.textContent = msg;
    el.className = "modal-status " + tipo;
    if (tipo === "ok") setTimeout(() => limparStatus(), 3000);
}

function limparStatus() {
    const el = document.getElementById("modalStatus");
    if (el) { el.textContent = ""; el.className = "modal-status"; }
}

// =============================================
// CRUD — LISTAR
// =============================================
async function carregarListaModal() {
    const lista = document.getElementById("listaUnidades");
    lista.innerHTML = '<li class="unidade-vazio">Carregando…</li>';
    try {
        const res = await fetch("/unidade");
        const dados = await res.json();
        if (!dados.length) { lista.innerHTML = '<li class="unidade-vazio">Nenhuma unidade cadastrada.</li>'; return; }
        lista.innerHTML = "";
        dados.forEach(u => {
            const li = document.createElement("li");
            li.className = "unidade-item";
            li.dataset.id = u.id;
            li.innerHTML = `
                <div class="unidade-info">
                    <span class="nome">${esc(u.nome)}</span>
                    <span class="local">${esc(u.cidade)} — ${esc(u.uf)}</span>
                </div>
                <div class="acoes">
                    <button title="Editar" class="btn-editar">✏️</button>
                    <button title="Remover" class="btn-remover">🗑️</button>
                </div>`;
            li.querySelector(".btn-editar").addEventListener("click", () => editarUnidade(u));
            li.querySelector(".btn-remover").addEventListener("click", () => removerUnidade(u.id, u.nome));
            lista.appendChild(li);
        });
    } catch (err) {
        console.error("Erro ao listar unidades:", err);
        lista.innerHTML = '<li class="unidade-vazio">Erro ao carregar.</li>';
    }
}

// =============================================
// CRUD — ADICIONAR
// =============================================
async function adicionarUnidade() {
    const nome   = document.getElementById("inputNomeUnidade").value.trim().toUpperCase();
    const cidade = capitalizar(document.getElementById("inputCidadeUnidade").value.trim());
    const uf     = document.getElementById("selectUfUnidade").value;

    if (!nome) { mostrarStatus("Informe o nome da unidade.", "erro"); document.getElementById("inputNomeUnidade").focus(); return; }
    if (!cidade) { mostrarStatus("Informe a cidade.", "erro"); document.getElementById("inputCidadeUnidade").focus(); return; }
    if (!uf) { mostrarStatus("Selecione a UF.", "erro"); document.getElementById("selectUfUnidade").focus(); return; }

    try {
        const res = await fetch("/unidade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, cidade, uf })
        });
        if (res.status === 409) { mostrarStatus("Unidade já cadastrada.", "erro"); return; }
        if (!res.ok) { const erro = await res.json().catch(() => ({})); mostrarStatus(erro.erro || "Erro ao adicionar.", "erro"); return; }

        document.getElementById("inputNomeUnidade").value = "";
        document.getElementById("inputCidadeUnidade").value = "";
        document.getElementById("selectUfUnidade").value = "";
        mostrarStatus("Unidade adicionada!", "ok");
        carregarListaModal();
        carregarUnidadesSelect();
    } catch (err) {
        console.error("Erro de conexão:", err);
        mostrarStatus("Erro na conexão com o servidor.", "erro");
    }
}

// =============================================
// CRUD — EDITAR
// =============================================
async function editarUnidade(u) {
    const novoNome = prompt("Nome da unidade:", u.nome);
    if (novoNome === null) return;
    const novaCidade = prompt("Cidade:", u.cidade);
    if (novaCidade === null) return;
    const novaUf = prompt("UF (sigla):", u.uf);
    if (novaUf === null) return;

    if (!novoNome.trim() || !novaCidade.trim() || novaUf.trim().length !== 2) {
        mostrarStatus("Preencha todos os campos corretamente.", "erro"); return;
    }

    try {
        const res = await fetch(`/unidade/${u.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome:   novoNome.trim().toUpperCase(),
                cidade: capitalizar(novaCidade.trim()),
                uf:     novaUf.trim().toUpperCase()
            })
        });
        if (res.status === 409) { mostrarStatus("Já existe unidade com esse nome.", "erro"); return; }
        if (!res.ok) { const erro = await res.json().catch(() => ({})); mostrarStatus(erro.erro || "Erro ao atualizar.", "erro"); return; }

        mostrarStatus("Unidade atualizada!", "ok");
        carregarListaModal();
        carregarUnidadesSelect();
    } catch (err) {
        console.error(err);
        mostrarStatus("Erro ao atualizar.", "erro");
    }
}

// =============================================
// CRUD — REMOVER
// =============================================
async function removerUnidade(id, nome) {
    if (!confirm(`Desativar a unidade "${nome}"?`)) return;
    try {
        const res = await fetch(`/unidade/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        mostrarStatus("Unidade removida!", "ok");
        carregarListaModal();
        carregarUnidadesSelect();
    } catch (err) {
        console.error(err);
        mostrarStatus("Erro ao remover.", "erro");
    }
}

// =============================================
// POPULAR <select name="unidade">
// =============================================
async function carregarUnidadesSelect() {
    try {
        const res = await fetch("/unidade");
        const dados = await res.json();
        document.querySelectorAll('select[name="unidade"]').forEach(select => {
            const valorAtual = select.value;
            select.innerHTML = '<option value="">Selecione a unidade</option>';
            dados.forEach(u => {
                const opt = document.createElement("option");
                opt.value = u.nome;
                opt.textContent = `${u.nome} — ${u.cidade}/${u.uf}`;
                select.appendChild(opt);
            });
            if (valorAtual) select.value = valorAtual;
        });
    } catch (err) {
        console.error("Erro ao popular selects de unidade:", err);
    }
}

// =============================================
// UTILITÁRIO
// =============================================
function esc(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
}