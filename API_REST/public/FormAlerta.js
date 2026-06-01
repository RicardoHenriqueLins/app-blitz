// ===============================
// ALTERNAR ENTRE PRÓPRIO / TERCEIRO
// ===============================
function alternarTipo() {

    const tipo = document.querySelector('input[name="tipo_colaborador"]:checked')?.value;

    if (tipo === "proprio") {

        document.getElementById("sec_proprio").style.display = "block";
        document.getElementById("sec_terceiro").style.display = "none";

        // limpa empresa
        const empresa = document.querySelector('input[name="empresa"]');
        if (empresa) empresa.value = "";

    } else {

        document.getElementById("sec_proprio").style.display = "none";
        document.getElementById("sec_terceiro").style.display = "block";

    }
}


// ===============================
// ENVIO DO FORMULÁRIO
// ===============================
const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData(form);

    const tipoColaborador = document.querySelector('input[name="tipo_colaborador"]:checked')?.value;

    // ===============================
    // VALIDAÇÕES
    // ===============================
    if (!formData.get("nome")) {
        alert("Preencha o nome.");
        return;
    }

    if (!formData.get("descricao")) {
        alert("Preencha a descrição da ocorrência.");
        return;
    }

    if (!tipoColaborador) {
        alert("Selecione o tipo de colaborador.");
        return;
    }

    if (tipoColaborador === "terceiro" && !formData.get("empresa")) {
        alert("Informe a empresa do terceiro.");
        return;
    }

    if (!formData.get("tipo_relato")) {
        alert("Selecione o tipo de relato.");
        return;
    }

    if (!formData.get("data")) {
        alert("Informe a data da ocorrência.");
        return;
    }

    // ===============================
    // AJUSTE DE HORÁRIO
    // ===============================
    let horario = formData.get("horario");

    if (horario && horario.length === 5) {
        horario = horario + ":00";
    }

    // ===============================
    // DATA REGISTRO (FORMATO MYSQL CORRETO)
    // ===============================
    const dataRegistro = new Date()
        .toLocaleString('sv-SE') // formato YYYY-MM-DD HH:mm:ss
        .replace('T', ' ');

    // ===============================
    // MONTAGEM DOS DADOS
    // ===============================
    const dados = {

        nome: formData.get("nome"),
        re: formData.get("re"),
        area_emitente: formData.get("area_emitente"),
        turno: formData.get("turno"),

        Data_ocorrencia: formData.get("data"),
        horario: horario || null,

        tipo_colaborador: tipoColaborador,

        empresa: tipoColaborador === "terceiro"
            ? formData.get("empresa")
            : null,

        area_ocorrencia: tipoColaborador === "proprio"
            ? formData.get("area_ocorrencia")
            : formData.get("area_ocorrencia_terceiro"),

        local: formData.get("local"),
        descricao: formData.get("descricao"),
        acoes: formData.get("acoes"),
        tipo_relato: formData.get("tipo_relato"),

        // ✅ CORRIGIDO
        data_registro: dataRegistro
    };

    // DEBUG
    console.log("DADOS ENVIADOS:", dados);

    // ===============================
    // ENVIO PARA API
    // ===============================
    try {

        const response = await fetch("/alerta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {

            alert("Alerta enviado com sucesso!");
            form.reset();

            // volta padrão
            document.getElementById("sec_proprio").style.display = "block";
            document.getElementById("sec_terceiro").style.display = "none";

        } else {

            let erro;

            try {
                erro = await response.json();
            } catch {
                erro = { mensagem: "Erro sem retorno do servidor" };
            }

            console.error("ERRO BACKEND:", erro);
            alert("Erro ao salvar alerta. Veja o console.");

        }

    } catch (error) {

        console.error("ERRO CONEXÃO:", error);
        alert("Erro na conexão com o servidor.");

    }

});


// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    alternarTipo();
});

