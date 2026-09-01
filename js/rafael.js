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

  /* ===== 2. ESCOLHER COR: muda a foto do pente (bc-color + swatch compat) ===== */
  const previewImg = document.getElementById('previewImg');
  const swatches = document.querySelectorAll('.swatch');
  const bcColors = document.querySelectorAll('.bc-color');
  const bcCombs = document.querySelectorAll('.bc-comb-item');
  function setActiveColor(color){
    // compat: update hidden swatches
    swatches.forEach(x=>x.classList.remove('is-active'));
    const sw = document.querySelector(color==='Pink' || color==='pink' ? '.swatch--amarelo' : '.swatch--laranja');
    if(sw) sw.classList.add('is-active');
    // update bc-color active
    bcColors.forEach(b=>b.classList.remove('active'));
    const bc = document.querySelector(`.bc-color[data-color="${color}"]`);
    if(bc) bc.classList.add('active');
    // preview & cart image
    const addBtn = document.getElementById('addToCart');
    if(color==='Pink'){
      if(previewImg){ previewImg.src='img/birdcut-pt/Pente-Rosa.png'; previewImg.style.filter=''; }
      if(addBtn) addBtn.dataset.image='img/birdcut-pt/Pente-Rosa.png';
      bcCombs.forEach((c,i)=>{ c.style.opacity = c.dataset.comb==='Pink' ? '1' : '0.35'; c.style.transform = c.dataset.comb==='Pink' ? 'scale(1.02)' : 'scale(1)'; });
    } else {
      if(previewImg){ previewImg.src='img/birdcut-pt/Pente-laranja.png'; previewImg.style.filter=''; }
      if(addBtn) addBtn.dataset.image='img/birdcut-pt/Pente-laranja.png';
      bcCombs.forEach((c,i)=>{ c.style.opacity = c.dataset.comb==='Orange' ? '1' : '0.35'; c.style.transform = c.dataset.comb==='Orange' ? 'scale(1.02)' : 'scale(1)'; });
    }
  }
  swatches.forEach((s) => {
    s.addEventListener('click', () => {
      const isPink = s.classList.contains('swatch--amarelo');
      setActiveColor(isPink ? 'Pink' : 'Orange');
    });
  });
  bcColors.forEach(b=>{
    b.addEventListener('click', ()=> setActiveColor(b.dataset.color));
  });
  // Best-selling cards: swatches trocam imagem do card
  document.querySelectorAll('.ac-product-card').forEach(card=>{
    const sws = card.querySelectorAll('.sw');
    const img = card.querySelector('.ac-product-card__media img');
    const quick = card.querySelector('.ac-product-card__quick');
    sws.forEach(s=>{
      s.addEventListener('click', ()=>{
        sws.forEach(x=>x.classList.remove('active'));
        s.classList.add('active');
        const col = s.dataset.color || s.title;
        if(col==='Pink' && img) img.src='img/birdcut-pt/Pente-Rosa.png';
        else if(col==='Orange' && img) img.src='img/birdcut-pt/Pente-laranja.png';
        if(quick){
          quick.dataset.image = img ? img.src : quick.dataset.image;
          // atualiza swatch visual no quick para consistência
        }
      });
    });
  });
  // init
  setActiveColor('Orange');

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