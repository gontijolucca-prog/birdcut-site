/* Bird Cut — Site Config loader (data/site.json + localStorage preview) */
(function(){
  const LS_KEY = 'bc_site_config_preview';
  async function loadConfig(){
    let cfg = null;
    // 1. Try localStorage preview (admin)
    try{
      const ls = localStorage.getItem(LS_KEY);
      if(ls) cfg = JSON.parse(ls);
    }catch(e){}
    if(cfg) return cfg;
    // 2. Try /api/site-config (if backend exists)
    try{
      const r = await fetch('/api/site-config', { headers: { 'Accept':'application/json' }});
      if(r.ok){
        const j = await r.json();
        if(j && j.hero) return j;
      }
    }catch(e){}
    // 3. Fallback to static data/site.json
    try{
      const r = await fetch('data/site.json', { cache:'no-store' });
      if(r.ok) return await r.json();
    }catch(e){}
    return null;
  }

  function apply(cfg){
    if(!cfg) return;
    // Hero
    if(cfg.hero){
      const t = document.querySelector('.hero-birdcut__title');
      const d = document.querySelector('.hero-birdcut__desc');
      const b = document.querySelector('.hero-birdcut__btn');
      const hero = document.querySelector('.hero-birdcut');
      if(t && cfg.hero.title) t.textContent = cfg.hero.title;
      if(d && cfg.hero.desc) d.innerHTML = cfg.hero.desc;
      if(b && cfg.hero.btnText) b.textContent = cfg.hero.btnText;
      if(b && cfg.hero.btnLink) b.href = cfg.hero.btnLink;
      if(hero && cfg.hero.bgImage) hero.style.backgroundImage = `url("${cfg.hero.bgImage}")`;
    }
    // Best-selling
    if(cfg.bestSelling){
      const k = document.querySelector('.best-selling__kicker');
      const tt = document.querySelector('.best-selling__title');
      if(k && cfg.bestSelling.kicker) k.textContent = cfg.bestSelling.kicker;
      if(tt && cfg.bestSelling.title) tt.textContent = cfg.bestSelling.title;
      const grid = document.querySelector('.best-selling__grid');
      if(grid && Array.isArray(cfg.bestSelling.products)){
        grid.innerHTML = cfg.bestSelling.products.map(p=>`
          <div class="ac-product-card">
            <div class="ac-product-card__media">
              <img src="${p.image}" alt="${p.name}" loading="lazy">
              <button type="button" class="ac-product-card__quick" data-name="CurveLine Beard Pro" data-price="${p.priceNum}" data-image="${p.image}" aria-label="Adicionar ${p.activeColor}"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 0v12M0 6h12" stroke="currentColor" stroke-width="1.6"/></svg></button>
            </div>
            <div class="ac-product-card__info">
              <a class="ac-product-card__title" href="#comprar">${p.name}</a>
              <div class="ac-product-card__price">${p.price}</div>
              <div class="ac-product-card__rating"><span class="stars">★★★★★</span><span class="count">(${p.rating})</span></div>
              <div class="ac-product-card__swatches">
                <span class="sw ${p.activeColor==='Laranja'?'active':''}" style="background:#f56600" data-color="Laranja" title="Laranja"></span>
                <span class="sw ${p.activeColor==='Amarelo'?'active':''}" style="background:#f4c430" data-color="Amarelo" title="Amarelo"></span>
              </div>
            </div>
          </div>`).join('');
      }
    }
    // Tecnica (A tua técnica)
    if(cfg.tecnica){
      const sec=document.querySelector('.sec-tecnica');
      if(sec){
        const h3=sec.querySelector('.sec-tecnica__text h3');
        if(h3 && cfg.tecnica.title) h3.textContent=cfg.tecnica.title;
        const img=sec.querySelector('.sec-tecnica__media img');
        if(img && cfg.tecnica.image){ img.src=cfg.tecnica.image; if(cfg.tecnica.imageAlt) img.alt=cfg.tecnica.imageAlt; }
        const btn=sec.querySelector('.sec-tecnica__btn');
        if(btn && cfg.tecnica.btnText) btn.textContent=cfg.tecnica.btnText;
        if(btn && cfg.tecnica.btnLink) btn.href=cfg.tecnica.btnLink;
      }
    }
    // Internacional (suporta grid e track scrolling)
    if(cfg.internacional){
      const tit = document.querySelector('.sec-internacional__titulo');
      if(tit && cfg.internacional.title) tit.textContent = cfg.internacional.title;
      const grid = document.querySelector('.infl-grid');
      const track = document.querySelector('.infl-track');
      if(grid && Array.isArray(cfg.internacional.images)){
        grid.innerHTML = cfg.internacional.images.map(src=>`<figure class="infl-grid__item"><img src="${src}" alt="International Barbers + Bird Cut" loading="lazy" width="819" height="1024"></figure>`).join('');
      }
      if(track && Array.isArray(cfg.internacional.images)){
        const cards=cfg.internacional.images.map(src=>`<div class="infl-card"><div class="infl-card__media"><img src="${src}" alt="International Barbers + Bird Cut" loading="lazy" width="819" height="1024"></div></div>`).join('');
        const dup=cfg.internacional.images.map(src=>`<div class="infl-card" aria-hidden="true"><div class="infl-card__media"><img src="${src}" alt="" loading="lazy" width="819" height="1024"></div></div>`).join('');
        track.innerHTML=cards+dup;
      }
    }
    // Experiencias
    if(cfg.experiencias){
      const tit = document.querySelector('.sec-experiencias__titulo');
      if(tit && cfg.experiencias.title) tit.textContent = cfg.experiencias.title;
      const wrap = document.querySelector('.exps-grid');
      if(wrap && Array.isArray(cfg.experiencias.cards)){
        wrap.innerHTML = cfg.experiencias.cards.map(c=>`
          <article class="exp-card">
            <div class="exp-card__stars" aria-label="5 estrelas">★★★★★</div>
            <h3 class="exp-card__title">${c.title}</h3>
            <p class="exp-card__text">${c.text}</p>
            <div class="exp-card__foot">
              <span class="exp-card__author">${c.author}</span><span class="exp-card__flag">${c.flag||''}</span>
              <span class="exp-card__verified">${c.verified||'Compra verificada'}</span>
            </div>
          </article>`).join('');
      }
    }
    // FAQ
    if(cfg.faq){
      const tit = document.querySelector('.sec-faq__titulo');
      if(tit && cfg.faq.title) tit.textContent = cfg.faq.title;
      const lista = document.querySelector('.sec-faq__lista');
      if(lista && Array.isArray(cfg.faq.items)){
        lista.innerHTML = cfg.faq.items.map((it,i)=>`
          <div class="faq-item" role="listitem">
            <button class="faq-q" aria-expanded="false" aria-controls="faq-a${i+1}" id="faq-q${i+1}">
              <span class="faq-q__icon" aria-hidden="true"><span class="faq-icon--plus"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 0H7V12H5V0Z" fill="currentColor"/><path d="M12 5V7H0V5H12Z" fill="currentColor"/></svg></span><span class="faq-icon--minus"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V7H0V5H12Z" fill="currentColor"/></svg></span></span>
              <span class="faq-q__heading">${it.q}</span>
            </button>
            <div class="faq-a" id="faq-a${i+1}" role="region" aria-labelledby="faq-q${i+1}" hidden>
              <p>${it.a.replace(/\n/g,'<br>')}</p>
            </div>
          </div>`).join('');
        // re-bind FAQ toggles
        lista.querySelectorAll('.faq-item').forEach(item=>{
          const btn=item.querySelector('.faq-q');
          const panel=item.querySelector('.faq-a');
          btn.addEventListener('click',()=>{
            const isOpen=item.classList.contains('is-open');
            lista.querySelectorAll('.faq-item').forEach(o=>{
              o.classList.remove('is-open');
              o.querySelector('.faq-q').setAttribute('aria-expanded','false');
              o.querySelector('.faq-a').hidden=true;
            });
            if(!isOpen){
              item.classList.add('is-open');
              btn.setAttribute('aria-expanded','true');
              panel.hidden=false;
            }
          });
        });
      }
    }
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    const cfg = await loadConfig();
    if(cfg) apply(cfg);
  });
  // expose for admin preview
  window.BC_clearPreview = ()=>{ localStorage.removeItem(LS_KEY); location.reload(); };
})();
