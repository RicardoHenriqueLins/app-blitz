// =============================================
// AUTO CAPITALIZAR — Primeira Letra Maiúscula
// Incluir em todas as páginas de formulário:
//   <script src="auto-capitalize.js"></script>
// =============================================

document.addEventListener("DOMContentLoaded", () => {

    function capitalizar(str) {
        return str
            .toLowerCase()
            .replace(/(^|\s)\S/g, letra => letra.toUpperCase());
    }

    // Aplica em todos os inputs de texto e textareas
    document.querySelectorAll('input[type="text"], textarea').forEach(campo => {

        campo.addEventListener("blur", () => {
            const valor = campo.value.trim();
            if (!valor) return;

            // Não capitaliza campos que devem ficar em MAIÚSCULA
            if (campo.style.textTransform === "uppercase") {
                campo.value = valor.toUpperCase();
                return;
            }

            // Não capitaliza campos técnicos (CID, RE, etc)
            const nome = (campo.name || "").toLowerCase();
            if (["cid", "re"].includes(nome)) return;

            campo.value = capitalizar(valor);
        });
    });
});