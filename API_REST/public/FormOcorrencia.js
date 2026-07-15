// =============================================
// FORMULÁRIO DE OCORRÊNCIA
// =============================================

function toggleTerceiro() {
    const tipo = document.querySelector('input[name="tipo_colaborador"]:checked')?.value;
    document.getElementById('sec_terceiro').style.display = tipo === 'terceiro' ? 'block' : 'none';
    if (tipo === 'proprio') {
        const emp = document.querySelector('input[name="empresa_terceiro"]');
        if (emp) emp.value = '';
    }
}

document.getElementById('formOcorrencia').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = this;
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

    // Horário
    let hora = fd.get('hora_ocorrencia');
    if (hora && hora.length === 5) hora += ':00';

    btn.disabled = true;
    btn.innerText = 'Enviando...';

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

    console.log('DADOS ENVIADOS:', dados);

    try {
        const res = await fetch('/ocorrencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            alert('Comunicado de ocorrência enviado com sucesso!');
            form.reset();
            document.getElementById('sec_terceiro').style.display = 'none';
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
    btn.innerText = 'Enviar Comunicado';
});

document.addEventListener('DOMContentLoaded', () => {
    toggleTerceiro();
});