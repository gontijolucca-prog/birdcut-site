/* ============================================================
   RAFEL MODEL v2 — interações fieis ao modelo (2026-08-23)
   ============================================================ */
(function () {
  'use strict';

  /* ===== 1. FAIXA PRETA: frases a alternar (suave) ===== */
  const sliderEl = document.getElementById('announceSlider');
  if (sliderEl) {
    const frases = Array.from(sliderEl.querySelectorAll('.frase'));
    const dotsWrap = document.getElementById('fraseDots');
    let fi = 0, timer;
    frases.forEach((_, i) => {
      const d = document.createElement('button');
      d.setAttribute('aria-label', 'Mensagem ' + (i + 1));
      if (i === 0) d.classList.add('is-on');
      d.addEventListener('click', () => go(i));
      dotsWrap.appendChild(d);
    });
    const dots = dotsWrap.children;
    function go(i) {
      frases[fi].classList.remove('is-on');
      dots[fi].classList.remove('is-on');
      fi = (i + frases.length) % frases.length;
      frases[fi].classList.add('is-on');
      dots[fi].classList.add('is-on');
      reset();
    }
    function next() { go(fi + 1); }
    function reset() { clearInterval(timer); timer = setInterval(next, 3600); }
    frases[0]?.classList.add('is-on');
    reset();
  }

  /* ===== 2. ESCOLHER COR: muda a foto do pente ===== */
  const previewImg = document.getElementById('previewImg');
  const swatches = document.querySelectorAll('.swatch');
  swatches.forEach((s) => {
    s.addEventListener('click', () => {
      swatches.forEach((x) => x.classList.remove('is-active'));
      s.classList.add('is-active');
      if (!previewImg) return;
      if (s.classList.contains('swatch--amarelo')) {
        previewImg.style.filter = 'sepia(.55) saturate(2.6) hue-rotate(-10deg)';
      } else {
        previewImg.style.filter = '';
      }
    });
  });

  /* ===== 3. QUANTIDADE ===== */
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', () => {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
    });
    qtyPlus.addEventListener('click', () => {
      qtyInput.value = Math.min(99, (parseInt(qtyInput.value, 10) || 1) + 1);
    });
  }

  /* ===== 4. HEADER shadow ===== */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }
})();