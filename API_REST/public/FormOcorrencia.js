'use strict';

let editandoId = null;

// ── Alternar terceiro ──
const toggleTerceiro = () => {
    const tipo = document.querySelector('input[name="tipo_colaborador"]:checked')?.value;
    document.getElementById('sec_terceiro').style.display = tipo === 'terceiro' ? 'block' : 'none';
    if (tipo === 'proprio') {
        const emp = document.querySelector('input[name="empresa_terceiro"]');
        if (emp) emp.value = '';
    }
};

// ── Carregar ocorrência para edição ──
const carregarParaEdicao = async (id) => {
    try {
        const res = await fetch('/ocorrencia/' + id);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const dados = await res.json();

        // A API retorna um array
        const oc = Array.isArray(dados) ? dados[0] : dados;
        if (!oc) {
            alert('Ocorrência não encontrada.');
            return;
        }

        editandoId = oc.id;

        // Preenche os campos
        const form = document.getElementById('formOcorrencia');

        // Tipo
        const tipoSelect = form.querySelector('[name="tipo"]');
        if (tipoSelect) tipoSelect.value = oc.tipo || '';

        // Unidade — aguarda o select ser populado pelo unidades.js
        setTimeout(() => {
            const unidadeSelect = form.querySelector('[name="unidade"]');
            if (unidadeSelect) unidadeSelect.value = oc.unidade || '';
        }, 800);

        // Empresa/Local
        const empresaLocal = form.querySelector('[name="empresa_local"]');
        if (empresaLocal) empresaLocal.value = oc.empresa_local || '';

        // Data
        const dataOc = form.querySelector('[name="data_ocorrencia"]');
        if (dataOc && oc.data_ocorrencia) {
            dataOc.value = oc.data_ocorrencia.slice(0, 10);
        }

        // Hora
        const horaOc = form.querySelector('[name="hora_ocorrencia"]');
        if (horaOc && oc.hora_ocorrencia) {
            horaOc.value = oc.hora_ocorrencia.slice(0, 5);
        }

        // Nome colaborador
        const nomeColab = form.querySelector('[name="nome_colaborador"]');
        if (nomeColab) nomeColab.value = oc.nome_colaborador || '';

        // Função
        const funcao = form.querySelector('[name="funcao"]');
        if (funcao) funcao.value = oc.funcao || '';

        // Tipo colaborador
        const tipoColabRadio = form.querySelector('input[name="tipo_colaborador"][value="' + (oc.tipo_colaborador || 'proprio') + '"]');
        if (tipoColabRadio) {
            tipoColabRadio.checked = true;
            toggleTerceiro();
        }

        // Empresa terceiro
        const empresaTerceiro = form.querySelector('[name="empresa_terceiro"]');
        if (empresaTerceiro) empresaTerceiro.value = oc.empresa_terceiro || '';

        // Local específico
        const localEsp = form.querySelector('[name="local_especifico"]');
        if (localEsp) localEsp.value = oc.local_especifico || '';

        // Descrição
        const descricao = form.querySelector('[name="descricao"]');
        if (descricao) descricao.value = oc.descricao || '';

        // Ações imediatas
        const acoes = form.querySelector('[name="acoes_imediatas"]');
        if (acoes) acoes.value = oc.acoes_imediatas || '';

        // Primeiros socorros
        const socorrosRadio = form.querySelector('input[name="primeiros_socorros"][value="' + (oc.primeiros_socorros || '') + '"]');
        if (socorrosRadio) socorrosRadio.checked = true;

        // Atestado
        const atestado = form.querySelector('[name="atestado_dias"]');
        if (atestado) atestado.value = oc.atestado_dias || 0;

        // CID
        const cid = form.querySelector('[name="cid"]');
        if (cid) cid.value = oc.cid || '';

        // CAT
        const cat = form.querySelector('[name="cat_aberta"]');
        if (cat) cat.value = oc.cat_aberta || '';

        // Observações
        const obs = form.querySelector('[name="observacoes"]');
        if (obs) obs.value = oc.observacoes || '';

        // Muda o título e o botão
        const h1 = document.querySelector('h1');
        if (h1) h1.textContent = 'Editar Ocorrência — Regional BA';

        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.textContent = 'Salvar Alterações';

    } catch (err) {
        console.error('Erro ao carregar ocorrência:', err);
        alert('Erro ao carregar dados da ocorrência.');
    }
};

// ── Envio do formulário (criar ou atualizar) ──
document.getElementById('formOcorrencia').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const fd = new FormData(form);
    const btn = form.querySelector('button[type="submit"]');

    // Validações
    if (!fd.get('tipo')) { alert('Selecione o tipo de ocorrência.'); return; }
    if (!fd.get('unidade')) { alert('Selecione a unidade.'); return; }
    if (!fd.get('data_ocorrencia')) { alert('Informe a data da ocorrência.'); return; }
    if (!fd.get('nome_colaborador')) { alert('Informe o nome do colaborador.'); return; }
    if (!fd.get('descricao')) { alert('Descreva a ocorrência.'); return; }

    const tipoColab = document.querySelector('input[name="tipo_colaborador"]:checked')?.value;
    if (tipoColab === 'terceiro' && !fd.get('empresa_terceiro')) {
        alert('Informe a empresa terceira.'); return;
    }

    let hora = fd.get('hora_ocorrencia');
    if (hora && hora.length === 5) hora += ':00';

    btn.disabled = true;
    btn.innerText = editandoId ? 'Salvando...' : 'Enviando...';

    const dados = {
        tipo: fd.get('tipo'),
        unidade: fd.get('unidade'),
        empresa_local: fd.get('empresa_local') || null,
        data_ocorrencia: fd.get('data_ocorrencia'),
        hora_ocorrencia: hora || null,
        nome_colaborador: fd.get('nome_colaborador'),
        funcao: fd.get('funcao') || null,
        tipo_colaborador: tipoColab,
        empresa_terceiro: tipoColab === 'terceiro' ? fd.get('empresa_terceiro') : null,
        local_especifico: fd.get('local_especifico') || null,
        descricao: fd.get('descricao'),
        primeiros_socorros: fd.get('primeiros_socorros') || null,
        atestado_dias: parseInt(fd.get('atestado_dias')) || 0,
        cid: fd.get('cid') || null,
        cat_aberta: fd.get('cat_aberta') || null,
        acoes_imediatas: fd.get('acoes_imediatas') || null,
        observacoes: fd.get('observacoes') || null,
        data_registro: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    try {
        const url = editandoId ? '/ocorrencia/' + editandoId : '/ocorrencia';
        const method = editandoId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            if (editandoId) {
                alert('Ocorrência atualizada com sucesso!');
                window.location.href = 'Dashboard.html';
            } else {
                alert('Comunicado de ocorrência enviado com sucesso!');
                form.reset();
                document.getElementById('sec_terceiro').style.display = 'none';
            }
        } else {
            let erro;
            try { erro = await res.json(); } catch { erro = { erro: 'Erro sem retorno' }; }
            console.error('ERRO BACKEND:', erro);
            alert(erro.erro || 'Erro ao salvar. Veja o console.');
        }
    } catch (error) {
        console.error('ERRO CONEXÃO:', error);
        alert('Erro na conexão com o servidor.');
    }

    btn.disabled = false;
    btn.innerText = editandoId ? 'Salvar Alterações' : 'Enviar Comunicado';
});

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    toggleTerceiro();

    // Verifica se é modo edição
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
        carregarParaEdicao(editId);
    }
});