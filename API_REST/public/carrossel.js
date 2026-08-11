// =============================================
// CARROSSEL DE FOTOS
// Usa as classes definidas em carrossel.css:
// .carrossel-wrapper, .carrossel-slot (pos-center, pos-left1/2,
// pos-right1/2, pos-hidden), .carrossel-dots/.carrossel-dot,
// #carrosselPrev/#carrosselNext, #carrosselProgressBar
// =============================================
'use strict';

document.addEventListener('DOMContentLoaded', initCarrossel);

function initCarrossel() {
    const wrapper = document.querySelector('.carrossel-wrapper');
    if (!wrapper) return; // não tem carrossel nesta página, não faz nada

    const slots = Array.from(wrapper.querySelectorAll('.carrossel-slot'));
    const dotsContainer = document.getElementById('carrosselDots');
    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.carrossel-dot')) : [];
    const prevBtn = document.getElementById('carrosselPrev');
    const nextBtn = document.getElementById('carrosselNext');
    const progressBar = document.getElementById('carrosselProgressBar');

    if (!slots.length) return;

    const POS_CLASSES = ['pos-left2', 'pos-left1', 'pos-center', 'pos-right1', 'pos-right2'];
    const AUTOPLAY_MS = 4000;
    const total = slots.length;

    // Começa com o slot do meio (index central da marcação) como "centro"
    let current = Math.floor(total / 2);
    let autoplayInterval = null;

    function render() {
        slots.forEach((slot, i) => {
            slot.classList.remove('pos-left2', 'pos-left1', 'pos-center', 'pos-right1', 'pos-right2', 'pos-hidden');

            let offset = i - current;
            // normaliza o offset de forma circular
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            if (offset >= -2 && offset <= 2) {
                slot.classList.add(POS_CLASSES[offset + 2]);
            } else {
                slot.classList.add('pos-hidden');
            }
        });

        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    function goTo(index) {
        current = ((index % total) + total) % total;
        render();
        restartAutoplay();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function animateProgress() {
        if (!progressBar) return;
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        // força o reflow para reiniciar a transição
        void progressBar.offsetWidth;
        progressBar.style.transition = `width ${AUTOPLAY_MS}ms linear`;
        progressBar.style.width = '100%';
    }

    function startAutoplay() {
        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            current = (current + 1) % total;
            render();
            animateProgress();
        }, AUTOPLAY_MS);
        animateProgress();
    }

    function restartAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    // ── Eventos ──
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    slots.forEach((slot, i) => {
        slot.addEventListener('click', () => {
            if (i !== current) goTo(i);
        });
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => goTo(i));
    });

    // Pausa o autoplay quando o mouse está sobre o carrossel
    wrapper.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    wrapper.addEventListener('mouseleave', startAutoplay);

    // ── Início ──
    render();
    startAutoplay();
}