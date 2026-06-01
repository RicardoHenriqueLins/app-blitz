(function () {
    "use strict";
 
    /* =========================================================
       CONFIGURAÇÃO — edite aqui os caminhos das suas fotos
    ========================================================= */
    const INTERVALO_MS = 5000; // troca a cada 5 segundos
 
    const fotos = [
        { src: "foto1.jpeg",  legenda: "Use o Cinto na Empilhadeira" },
        { src: "foto2.jpeg",  legenda: "Use o Cinto na Empilhadeira" },
        { src: "foto3.jpeg",  legenda: "Use o Trava Quedas" },
        { src: "foto4.jpeg",  legenda: "Use o Cinto de Segurança" },
        { src: "foto5.jpg",  legenda: "Ambiente seguro e saudável" },
        // Adicione quantas fotos quiser
    ];
    /* ======================================================= */
 
    // Posições visíveis no carrossel (relativas ao índice central)
    const POSICOES = ["pos-left2", "pos-left1", "pos-center", "pos-right1", "pos-right2"];
 
    let indiceAtual = 0;
    let timer       = null;
    let progressTimer = null;
    let slots        = [];
    let dots         = [];
    let progressBar  = null;
    let progressStart = null;
 
    /* ---------- Criação do HTML do carrossel ---------- */
    function criarCarrossel() {
        // Evita duplicar se já foi criado
        if (document.getElementById("carrossel-section")) return;
 
        const section = document.createElement("section");
        section.id = "carrossel-section";
 
        const titulo = document.createElement("h2");
        titulo.textContent = "Galeria de Segurança";
        section.appendChild(titulo);
 
        // Wrapper das fotos
        const wrapper = document.createElement("div");
        wrapper.className = "carrossel-wrapper";
 
        // Cria um slot por foto
        fotos.forEach((foto, i) => {
            const slot = document.createElement("div");
            slot.className = "carrossel-slot pos-hidden";
            slot.dataset.index = i;
 
            const img = document.createElement("img");
            img.src = foto.src;
            img.alt = foto.legenda || `Foto ${i + 1}`;
            img.loading = "lazy";
 
            const label = document.createElement("span");
            label.className = "carrossel-label";
            label.textContent = foto.legenda || "";
 
            slot.appendChild(img);
            slot.appendChild(label);
 
            // Clique nas laterais navega para aquela foto
            slot.addEventListener("click", function () {
                const idx = parseInt(this.dataset.index, 10);
                if (idx !== indiceAtual) {
                    irPara(idx);
                    reiniciarTimer();
                }
            });
 
            wrapper.appendChild(slot);
            slots.push(slot);
        });
 
        section.appendChild(wrapper);
 
        // Controles (prev · dots · next)
        const controls = document.createElement("div");
        controls.className = "carrossel-controls";
 
        const btnPrev = document.createElement("button");
        btnPrev.className = "carrossel-btn";
        btnPrev.innerHTML = "&#8592;";
        btnPrev.setAttribute("aria-label", "Anterior");
        btnPrev.addEventListener("click", () => { navegar(-1); reiniciarTimer(); });
 
        const dotsWrapper = document.createElement("div");
        dotsWrapper.className = "carrossel-dots";
        fotos.forEach((_, i) => {
            const dot = document.createElement("span");
            dot.className = "carrossel-dot" + (i === 0 ? " active" : "");
            dot.addEventListener("click", () => { irPara(i); reiniciarTimer(); });
            dotsWrapper.appendChild(dot);
            dots.push(dot);
        });
 
        const btnNext = document.createElement("button");
        btnNext.className = "carrossel-btn";
        btnNext.innerHTML = "&#8594;";
        btnNext.setAttribute("aria-label", "Próxima");
        btnNext.addEventListener("click", () => { navegar(1); reiniciarTimer(); });
 
        controls.appendChild(btnPrev);
        controls.appendChild(dotsWrapper);
        controls.appendChild(btnNext);
        section.appendChild(controls);
 
        // Barra de progresso
        const progressWrapper = document.createElement("div");
        progressWrapper.className = "carrossel-progress";
        progressBar = document.createElement("div");
        progressBar.className = "carrossel-progress-bar";
        progressWrapper.appendChild(progressBar);
        section.appendChild(progressWrapper);
 
        // Insere o carrossel no <main> logo após o #banner (se existir),
        // ou no início do <main>.
        const main   = document.querySelector("main");
        const banner = document.getElementById("banner");
        if (main) {
            if (banner && banner.nextSibling) {
                main.insertBefore(section, banner.nextSibling);
            } else if (banner) {
                main.appendChild(section);
            } else {
                main.prepend(section);
            }
        } else {
            document.body.appendChild(section);
        }
    }
 
    /* ---------- Renderização das posições ---------- */
    function renderizar() {
        const total = fotos.length;
 
        slots.forEach((slot, i) => {
            // Distância circular do slot em relação ao centro
            let diff = i - indiceAtual;
            // Normaliza para intervalo [-half, +half]
            while (diff >  Math.floor(total / 2)) diff -= total;
            while (diff < -Math.floor(total / 2)) diff += total;
 
            // Remove todas as classes de posição
            slot.classList.remove(...POSICOES, "pos-hidden");
 
            if      (diff === -2) slot.classList.add("pos-left2");
            else if (diff === -1) slot.classList.add("pos-left1");
            else if (diff ===  0) slot.classList.add("pos-center");
            else if (diff ===  1) slot.classList.add("pos-right1");
            else if (diff ===  2) slot.classList.add("pos-right2");
            else                  slot.classList.add("pos-hidden");
        });
 
        // Atualiza dots
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === indiceAtual);
        });
    }
 
    /* ---------- Navegação ---------- */
    function irPara(idx) {
        indiceAtual = ((idx % fotos.length) + fotos.length) % fotos.length;
        renderizar();
    }
 
    function navegar(direcao) {
        irPara(indiceAtual + direcao);
    }
 
    /* ---------- Timer automático ---------- */
    function iniciarTimer() {
        clearInterval(timer);
        timer = setInterval(() => navegar(1), INTERVALO_MS);
        iniciarProgressBar();
    }
 
    function reiniciarTimer() {
        clearInterval(timer);
        cancelAnimationFrame(progressTimer);
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";
        // Força reflow antes de reanimar
        void progressBar.offsetWidth;
        iniciarTimer();
    }
 
    function iniciarProgressBar() {
        progressBar.style.transition = `width ${INTERVALO_MS}ms linear`;
        progressBar.style.width = "100%";
 
        // Reseta ao fim do intervalo (já reiniciado pelo setInterval)
        progressTimer = setTimeout(() => {
            progressBar.style.transition = "none";
            progressBar.style.width = "0%";
            void progressBar.offsetWidth;
            iniciarProgressBar();
        }, INTERVALO_MS);
    }
 
    /* ---------- Ponto de entrada ---------- */
    function initCarrossel() {
        if (fotos.length === 0) return;
        criarCarrossel();
        renderizar();
        iniciarTimer();
    }
 
    // Executa quando o DOM estiver pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCarrossel);
    } else {
        initCarrossel();
    }
 
    // Expõe globalmente caso queira chamar manualmente
    window.initCarrossel = initCarrossel;
})();