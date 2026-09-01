/* ============================================================
   RAFEL MODEL v2 — interações fieis ao modelo (2026-08-23)
   ============================================================ */
(function () {
  'use strict';

  /* ===== 1. FAIXA PRETA birdcut.pt fiel: 24px + arrows + 5s ===== */
  (function(){
    const bar = document.getElementById('birdcut-announcement-bar');
    if (!bar) return;
    const messages = bar.querySelectorAll('.bc-message');
    const prevBtn = bar.querySelector('.bc-prev');
    const nextBtn = bar.querySelector('.bc-next');
    if (!messages.length) return;
    let current = 0, timer;
    function showMessage(index){
      messages[current].classList.remove('active');
      current = (index + messages.length) % messages.length;
      messages[current].classList.add('active');
    }
    function nextMessage(){ showMessage(current+1); }
    function prevMessage(){ showMessage(current-1); }
    function startTimer(){ clearInterval(timer); timer = setInterval(nextMessage, 5000); }
    if (nextBtn) nextBtn.addEventListener('click', ()=>{ nextMessage(); startTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', ()=>{ prevMessage(); startTimer(); });
    startTimer();
  })();

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

  /* ===== 4. HEADER shadow + FIXO compensa altura ===== */
  const header = document.getElementById('header');
  const bar = document.getElementById('birdcut-announcement-bar');
  function fixTopOffset(){
    if (!header || !bar) return;
    const barH = bar.offsetHeight || 24;
    const headH = header.offsetHeight || 116;
    const total = barH + headH;
    document.body.style.paddingTop = total + 'px';
    document.documentElement.style.scrollPaddingTop = (total + 8) + 'px';
    const banner = document.querySelector('.banner-elementor--print');
    if (banner) banner.style.marginTop = '0';
  }
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
    fixTopOffset();
    window.addEventListener('load', fixTopOffset);
    window.addEventListener('resize', fixTopOffset);
    // recalcula se logo carregar tarde
    const logo = document.getElementById('brandLogo');
    if (logo) logo.addEventListener('load', fixTopOffset);
  }
})();