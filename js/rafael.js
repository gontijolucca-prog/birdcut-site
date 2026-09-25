/* ============================================================
   RAFEL MODEL v2 — interações fieis ao modelo (2026-08-23)
   ============================================================ */
(function () {
  'use strict';

  /* ===== Navegação por âncoras entre páginas ===== */
  (function(){
    let tries = 0, stable = 0;
    const scrollToAnchor = () => {
      tries++;
      if(!location.hash) return;
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = location.hash.slice(1); }
      const target = document.getElementById(id);
      if(!target) return;
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const difference = target.getBoundingClientRect().top - offset;
      if(Math.abs(difference) > 3){
        stable = 0;
        window.scrollTo({ top: Math.max(0, window.scrollY + difference), left: 0, behavior: 'instant' });
      } else stable++;
      if(stable >= 2 || tries >= 24) clearInterval(retryTimer);
    };
    const retryTimer = setInterval(scrollToAnchor, 120);
    document.addEventListener('DOMContentLoaded',scrollToAnchor,{once:true});
    window.addEventListener('load',scrollToAnchor,{once:true});
    window.addEventListener('hashchange',scrollToAnchor);
    window.addEventListener('pageshow',scrollToAnchor);
  })();

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
  function isYellow(color){ return color==='Amarelo' || color==='amarelo' || color==='Yellow' || color==='yellow' || color==='Pink' || color==='pink'; }
  function isOrange(color){ return color==='Laranja' || color==='laranja' || color==='Orange' || color==='orange'; }
  function setActiveColor(color){
    const yellow = isYellow(color);
    // compat: update hidden swatches
    swatches.forEach(x=>x.classList.remove('is-active'));
    const sw = document.querySelector(yellow ? '.swatch--amarelo' : '.swatch--laranja');
    if(sw) sw.classList.add('is-active');
    // update bc-color active
    bcColors.forEach(b=>b.classList.remove('active'));
    let bc = document.querySelector(`.bc-color[data-color="${color}"]`);
    if(!bc){
      // fallback para compat Pink/Orange
      const fallback = yellow ? 'Amarelo' : 'Laranja';
      bc = document.querySelector(`.bc-color[data-color="${fallback}"]`) || document.querySelector(`.bc-color[data-color="${yellow ? 'Pink' : 'Orange'}"]`);
    }
    if(bc) bc.classList.add('active');
    // preview & cart image
    const addBtn = document.getElementById('addToCart');
    if(yellow){
      if(previewImg){ previewImg.src='img/birdcut-pt/Pente-CurveLine-Amarelo.png'; previewImg.style.filter=''; }
      if(addBtn) addBtn.dataset.image='img/birdcut-pt/Pente-CurveLine-Amarelo.png';
      bcCombs.forEach((c)=>{ const isY = c.dataset.comb==='Amarelo' || c.dataset.comb==='Pink'; c.style.opacity = isY ? '1' : '0.35'; c.style.transform = isY ? 'scale(1.02)' : 'scale(1)'; });
    } else {
      if(previewImg){ previewImg.src='img/birdcut-pt/Pente-CurveLine-Laranja.png'; previewImg.style.filter=''; }
      if(addBtn) addBtn.dataset.image='img/birdcut-pt/Pente-CurveLine-Laranja.png';
      bcCombs.forEach((c)=>{ const isO = c.dataset.comb==='Laranja' || c.dataset.comb==='Orange'; c.style.opacity = isO ? '1' : '0.35'; c.style.transform = isO ? 'scale(1.02)' : 'scale(1)'; });
    }
  }
  swatches.forEach((s) => {
    s.addEventListener('click', () => {
      const isYellowSw = s.classList.contains('swatch--amarelo');
      setActiveColor(isYellowSw ? 'Amarelo' : 'Laranja');
    });
  });
  bcColors.forEach(b=>{
    b.addEventListener('click', ()=> setActiveColor(b.dataset.color));
  });
  // Best-selling: delegação mantém o selector activo após o site-config redesenhar o card.
  const bestSellingGrid = document.querySelector('.best-selling__grid');
  if(bestSellingGrid){
    bestSellingGrid.addEventListener('click', event=>{
      const swatch = event.target.closest('.ac-product-card__swatches .sw');
      if(!swatch || !bestSellingGrid.contains(swatch)) return;
      const card = swatch.closest('.ac-product-card');
      const image = card?.querySelector('.ac-product-card__media img');
      const quick = card?.querySelector('.ac-product-card__quick');
      const title = card?.querySelector('.ac-product-card__title');
      const color = swatch.dataset.color || swatch.title || 'Laranja';
      const yellow = isYellow(color);
      const imagePath = yellow ? 'img/birdcut-pt/Pente-CurveLine-Amarelo.png' : 'img/birdcut-pt/Pente-CurveLine-Laranja.png';
      card.querySelectorAll('.ac-product-card__swatches .sw').forEach(button=>{
        const active = button === swatch;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if(image){ image.src=imagePath; image.alt=`CurveLine Beard Pro — ${color}`; }
      if(title) title.textContent=`${card.dataset.name || 'CurveLine Beard Pro'} — ${color}`;
      if(quick){
        quick.dataset.image=imagePath;
        quick.setAttribute('aria-label',`Adicionar CurveLine Beard Pro — ${color} ao carrinho`);
      }
    });
  }
  // init
  setActiveColor('Laranja');

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

  /* ===== 5. FAQ DROPDOWN — estilo Frederica ===== */
  (function(){
    const items = document.querySelectorAll('.faq-item');
    if(!items.length) return;
    items.forEach(item=>{
      const btn = item.querySelector('.faq-q');
      const panel = item.querySelector('.faq-a');
      if(!btn || !panel) return;
      btn.addEventListener('click', ()=>{
        const isOpen = item.classList.contains('is-open');
        // fecha outros (accordion)
        items.forEach(o=>{
          o.classList.remove('is-open');
          const b=o.querySelector('.faq-q');
          const p=o.querySelector('.faq-a');
          if(b) b.setAttribute('aria-expanded','false');
          if(p) p.hidden=true;
        });
        if(!isOpen){
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded','true');
          panel.hidden=false;
        }
      });
    });
  })();

  /* ===== 6. EXPERIÊNCIAS — carrossel circular sem salto visível ===== */
  (function(){
    const slider = document.querySelector('.exps-slider');
    const wrap = slider?.querySelector('.exps-scroll-wrap');
    const track = wrap?.querySelector('.exps-grid');
    if(!slider || !wrap || !track) return;
    const prev = slider.querySelector('.exps-arrow--prev');
    const next = slider.querySelector('.exps-arrow--next');
    let originalCount = 0, cloneCount = 0, itemStep = 0, settleTimer = 0, resizeTimer = 0, layoutKey = '';
    const step = () => {
      const card = track.querySelector('.exp-card:not([data-loop-clone])');
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      return (card ? card.getBoundingClientRect().width : 360) + gap;
    };
    const currentLayoutKey = () => `${wrap.clientWidth}:${Math.round(step())}`;
    const scheduleRebuild = () => {
      const key = currentLayoutKey();
      if(key === layoutKey) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(()=>{ if(currentLayoutKey() !== layoutKey) buildLoop(); },180);
    };
    const jump = (left) => {
      wrap.classList.add('is-loop-jumping');
      wrap.scrollLeft = left;
      requestAnimationFrame(()=>requestAnimationFrame(()=>wrap.classList.remove('is-loop-jumping')));
    };
    const buildLoop = () => {
      track.querySelectorAll('[data-loop-clone="true"]').forEach(node=>node.remove());
      const originals = Array.from(track.children).filter(node=>node.classList.contains('exp-card'));
      originalCount = originals.length;
      if(originalCount < 2){
        if(prev) prev.hidden = true;
        if(next) next.hidden = true;
        return;
      }
      if(prev) prev.hidden = false;
      if(next) next.hidden = false;
      itemStep = step();
      layoutKey = `${wrap.clientWidth}:${Math.round(itemStep)}`;
      cloneCount = Math.min(originalCount, Math.max(1, Math.ceil(wrap.clientWidth / itemStep) + 1));
      const before = originals.slice(-cloneCount).map(node=>node.cloneNode(true));
      const after = originals.slice(0, cloneCount).map(node=>node.cloneNode(true));
      before.forEach(node=>{ node.dataset.loopClone='true'; node.setAttribute('aria-hidden','true'); node.classList.remove('reveal'); track.insertBefore(node, track.firstChild); });
      after.forEach(node=>{ node.dataset.loopClone='true'; node.setAttribute('aria-hidden','true'); node.classList.remove('reveal'); track.appendChild(node); });
      itemStep = step();
      jump(cloneCount * itemStep);
    };
    const normalize = () => {
      if(!originalCount || !itemStep) return;
      const start = cloneCount * itemStep;
      const end = start + originalCount * itemStep;
      if(wrap.scrollLeft < start - itemStep * .5) jump(wrap.scrollLeft + originalCount * itemStep);
      else if(wrap.scrollLeft >= end - itemStep * .5) jump(wrap.scrollLeft - originalCount * itemStep);
    };
    const scheduleNormalize = () => { clearTimeout(settleTimer); settleTimer=setTimeout(normalize,140); };
    if(prev) prev.addEventListener('click',()=>wrap.scrollBy({left:-itemStep,behavior:'smooth'}));
    if(next) next.addEventListener('click',()=>wrap.scrollBy({left:itemStep,behavior:'smooth'}));
    wrap.addEventListener('scroll',scheduleNormalize,{passive:true});
    window.addEventListener('birdcut:experiences-updated',buildLoop);
    window.addEventListener('resize',scheduleRebuild);
    if('ResizeObserver' in window) new ResizeObserver(scheduleRebuild).observe(wrap);
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',buildLoop,{once:true});
    else buildLoop();
  })();
})();