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

  /* ===== 1. FAIXA PRETA birdcut.pt fiel: mensagens do config + rotação 5s ===== */
  (function(){
    const bar = document.getElementById('birdcut-announcement-bar');
    if (!bar) return;
    const area = bar.querySelector('.bc-message-area');
    const prevBtn = bar.querySelector('.bc-prev');
    const nextBtn = bar.querySelector('.bc-next');
    let messages = Array.prototype.slice.call(bar.querySelectorAll('.bc-message'));
    let current = 0, timer = null;

    function showMessage(index){
      if(!messages.length) return;
      messages[current] && messages[current].classList.remove('active');
      current = (index + messages.length) % messages.length;
      messages[current].classList.add('active');
    }
    function startTimer(){
      clearInterval(timer);
      if(messages.length > 1) timer = setInterval(()=>showMessage(current+1), 5000);
    }
    function build(list){
      if(!area) return;
      area.innerHTML = list.map((m,i)=>`<div class="bc-message${i===0?' active':''}">${String(m).replace(/</g,'&lt;')}</div>`).join('');
      messages = Array.prototype.slice.call(area.querySelectorAll('.bc-message'));
    }
    async function loadMessages(){
      let cfg = null;
      try{ const ls = localStorage.getItem('bc_site_config_preview_v2'); if(ls) cfg = JSON.parse(ls); }catch(e){}
      if(!cfg){
        try{ const r = await fetch('/api/site-config?v=20261024b',{headers:{'Accept':'application/json'},cache:'no-store'}); if(r.ok){ const j = await r.json(); if(j && j.hero) cfg = j; } }catch(e){}
      }
      if(!cfg){ try{ const r = await fetch('data/site.json',{cache:'no-store'}); if(r.ok) cfg = await r.json(); }catch(e){} }
      const list = (cfg && cfg.announcement && Array.isArray(cfg.announcement.messages))
        ? cfg.announcement.messages.map(m=>String(m==null?'':m).trim()).filter(Boolean) : null;
      return (list && list.length) ? list : null;
    }

    showMessage(0);
    if(prevBtn) prevBtn.addEventListener('click',()=>{ showMessage(current-1); startTimer(); });
    if(nextBtn) nextBtn.addEventListener('click',()=>{ showMessage(current+1); startTimer(); });
    startTimer();

    loadMessages()
      .then(list=>{ if(list) build(list); })
      .catch(()=>{})
      .then(()=>{ showMessage(0); startTimer(); });
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
      if(previewImg){ previewImg.src='img/birdcut-pt/Pente-CurveLine-Amarelo.png?v=20261024'; previewImg.style.filter=''; }
      if(addBtn) addBtn.dataset.image='img/birdcut-pt/Pente-CurveLine-Amarelo.png?v=20261024';
      bcCombs.forEach((c)=>{ const isY = c.dataset.comb==='Amarelo' || c.dataset.comb==='Pink'; c.style.opacity = isY ? '1' : '0.35'; c.style.transform = isY ? 'scale(1.02)' : 'scale(1)'; });
    } else {
      if(previewImg){ previewImg.src='img/birdcut-pt/Pente-CurveLine-Laranja.png?v=20261024'; previewImg.style.filter=''; }
      if(addBtn) addBtn.dataset.image='img/birdcut-pt/Pente-CurveLine-Laranja.png?v=20261024';
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
      const imagePath = yellow ? 'img/birdcut-pt/Pente-CurveLine-Amarelo.png?v=20261024' : 'img/birdcut-pt/Pente-CurveLine-Laranja.png?v=20261024';
      card.querySelectorAll('.ac-product-card__swatches .sw').forEach(button=>{
        const active = button === swatch;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if(image){ image.src=imagePath; image.alt=`CurveLine Beard Pro — ${color}`; }
      if(title){ title.textContent=`${card.dataset.name || 'CurveLine Beard Pro'} — ${color}`; title.href = yellow ? '/produto-amarelo' : '/produto-laranja'; }
      if(quick){
        quick.dataset.image=imagePath;
        quick.dataset.name=`CurveLine Beard Pro — ${color}`;
        quick.setAttribute('aria-label',`Adicionar CurveLine Beard Pro — ${color} ao carrinho`);
      }
      if(window.BC_renderStock) window.BC_renderStock(color);
    });
  }
  // Stock por cor (p1 = Laranja, p2 = Amarelo)
  let bcStock=null;
  function renderStock(color){
    const card=document.querySelector('.ac-product-card'); if(!card) return;
    const key=isYellow(color)?'Amarelo':'Laranja';
    if(!bcStock) return;
    const stock=Number(bcStock[key]||0);
    const price=card.querySelector('.ac-product-card__price');
    const quick=card.querySelector('.ac-product-card__quick');
    const note=card.querySelector('.ac-product-card__stock');
    card.classList.toggle('is-soldout', stock<=0);
    if(quick){ quick.disabled=stock<=0; if(stock<=0) quick.setAttribute('aria-label','Esgotado'); }
    if(price){
      if(!price.dataset.original) price.dataset.original=price.textContent;
      price.textContent = stock<=0 ? 'Esgotado' : price.dataset.original;
    }
    if(note) note.remove();
    if(stock>0 && stock<=5 && price){
      price.insertAdjacentHTML('afterend','<div class="ac-product-card__stock">Últimas '+stock+' unidades</div>');
    }
  }
  window.BC_renderStock=renderStock;
  fetch('/api/products').then(r=>r.ok?r.json():null).then(list=>{
    if(!Array.isArray(list)) return;
    const lar=list.find(p=>p.id==='p1')||list.find(p=>/Laranja$/.test(p.name||''));
    const ama=list.find(p=>p.id==='p2')||list.find(p=>/Amarelo$/.test(p.name||''));
    bcStock={ Laranja: lar?lar.stock:null, Amarelo: ama?ama.stock:null };
    const active=document.querySelector('.ac-product-card__swatches .sw.active');
    renderStock(active?(active.dataset.color||'Laranja'):'Laranja');
  }).catch(()=>{});

  // O site-config volta a desenhar o card: reaplicar o stock quando isso acontece
  const bsGrid=document.querySelector('.best-selling__grid');
  if(bsGrid && typeof MutationObserver!=='undefined'){
    let applying=false;
    new MutationObserver(muts=>{
      if(applying) return;
      const relevant=muts.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1&&(n.matches?.('.ac-product-card')||n.querySelector?.('.ac-product-card'))));
      if(!relevant) return;
      applying=true;
      requestAnimationFrame(()=>{
        const a=document.querySelector('.ac-product-card__swatches .sw.active');
        renderStock(a?(a.dataset.color||'Laranja'):'Laranja');
        applying=false;
      });
    }).observe(bsGrid,{childList:true,subtree:true});
  }

  // init — respeita a cor da página de produto (ex.: /produto-amarelo)
  const initialColor = (function(){
    const btn=document.getElementById('addToCart');
    const name=btn && btn.dataset ? String(btn.dataset.name||'') : '';
    if(/Amarelo/i.test(name)) return 'Amarelo';
    const sw=document.querySelector('.ac-product-card__swatches .sw.active');
    return sw && sw.dataset && sw.dataset.color ? sw.dataset.color : 'Laranja';
  })();
  setActiveColor(initialColor);
  if(window.BC_renderStock) window.BC_renderStock(initialColor);

  /* ===== 3. QUANTIDADE ===== */
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', () => {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
    });
    qtyPlus.addEventListener('click', () => {
      const max = parseInt(qtyInput.getAttribute('max'),10) || 99; qtyInput.value = Math.min(max, (parseInt(qtyInput.value, 10) || 1) + 1);
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

  /* ===== 6. EXPERIÊNCIAS — marquee infinito (igual aos International Barbers) ===== */
  (function(){
    const track = document.querySelector('.exps-grid');
    if(!track) return;
    document.querySelectorAll('.exps-arrow').forEach(a=>a.remove());
    const build = () => {
      track.querySelectorAll('[data-loop-clone="true"]').forEach(n=>n.remove());
      const base = Array.from(track.querySelectorAll('.exp-card')).filter(n=>n.dataset.loopClone!=='true');
      if(!base.length) return;
      base.forEach(node=>{
        const clone = node.cloneNode(true);
        clone.dataset.loopClone = 'true';
        clone.setAttribute('aria-hidden','true');
        clone.classList.remove('reveal');
        track.appendChild(clone);
      });
    };
    window.addEventListener('birdcut:experiences-updated', build);
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', build, {once:true});
    else build();
  })();
})();