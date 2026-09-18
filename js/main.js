/* ===== SLIDER (só na home) ===== */
(function(){
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  const dotsWrap = document.getElementById('dots');
  let idx = 0, timer;
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', () => go(i));
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap.children;
  function go(i){
    slides[idx].classList.remove('active');
    dots[idx].classList.remove('active');
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add('active');
    dots[idx].classList.add('active');
    reset();
  }
  function next(){ go(idx + 1); }
  function reset(){ clearInterval(timer); timer = setInterval(next, 6000); }
  const nextBtn = document.getElementById('next'), prevBtn = document.getElementById('prev');
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', () => go(idx - 1));
  reset();
})();

/* ===== HEADER SHADOW ===== */
(function(){
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, {passive:true});
})();

/* ===== REVEAL ON SCROLL ===== */
(function(){
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12});
  els.forEach(el => io.observe(el));
})();

/* ===== MOBILE MENU ===== */
(function(){
  const mm = document.getElementById('mobileMenu');
  const burger = document.getElementById('burger');
  const close = document.getElementById('menuClose');
  if (!mm || !burger) return;
  burger.addEventListener('click', () => mm.classList.add('open'));
  if (close) close.addEventListener('click', () => mm.classList.remove('open'));
  mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mm.classList.remove('open')));
})();

/* ===== CARRINHO + TRACKING ===== */
(function(){
  if (typeof onAuthChange === 'function') {
    onAuthChange(user => {
      const contaLink = document.querySelector('a[href="conta.html"]');
      const accountLabel = contaLink?.querySelector('span');
      if (accountLabel) accountLabel.textContent = user?.email?.split('@')[0] || 'Conta';
    });
  }

  let cart = JSON.parse(localStorage.getItem('birdcut-cart') || '[]');
  const cartCount = document.querySelector('.cart-count');
  const cartBtn = document.querySelector('.icon-btn--cart');

  const miniCart = document.createElement('div');
  miniCart.className = 'mini-cart';
  miniCart.innerHTML = `
    <div class="mini-cart__head"><h3>Carrinho</h3><button class="mini-cart__close" aria-label="Fechar">×</button></div>
    <div class="mini-cart__items"></div>
    <div class="mini-cart__foot">
      <div class="mini-cart__total"><span>Total</span><b></b></div>
      <button class="btn btn--red mini-cart__checkout">Finalizar Compra</button>
    </div>
  `;
  document.body.appendChild(miniCart);

  function save(){
    localStorage.setItem('birdcut-cart', JSON.stringify(cart));
    if(window.BC_cartTrack) try{ window.BC_cartTrack(cart); }catch(e){}
  }
  function updateCount(){
    const total = cart.reduce((s,i) => s + i.qty, 0);
    if (cartCount) cartCount.textContent = total;
  }
  function renderMini(){
    const items = miniCart.querySelector('.mini-cart__items');
    const totalEl = miniCart.querySelector('.mini-cart__total b');
    if (!cart.length){
      items.innerHTML = '<p style="padding:2rem 0;text-align:center;color:var(--color-ink-soft)">Carrinho vazio</p>';
      totalEl.textContent = '0,00 €';
      return;
    }
    items.innerHTML = cart.map((item,i) => `
      <div class="mini-cart__item">
        <img src="${item.image}" alt="${item.name}">
        <div class="mini-cart__info">
          <b>${item.name}</b>
          <span>${item.price} €</span>
          <div class="mini-cart__qty">
            <button data-idx="${i}" data-action="minus">−</button>
            <span>${item.qty}</span>
            <button data-idx="${i}" data-action="plus">+</button>
          </div>
        </div>
        <button class="mini-cart__remove" data-idx="${i}" aria-label="Remover">×</button>
      </div>
    `).join('');
    const total = cart.reduce((s,i) => s + i.priceNum * i.qty, 0);
    totalEl.textContent = total.toFixed(2).replace('.',',') + ' €';
    items.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        if (btn.dataset.action === 'plus') cart[idx].qty++;
        else if (btn.dataset.action === 'minus') {
          cart[idx].qty--;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        save(); updateCount(); renderMini();
      });
    });
    items.querySelectorAll('.mini-cart__remove').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        cart.splice(parseInt(btn.dataset.idx), 1);
        save(); updateCount(); renderMini();
      });
    });
  }

  if (cartBtn) cartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    renderMini();
    miniCart.classList.toggle('open');
  });
  miniCart.querySelector('.mini-cart__close').addEventListener('click', () => miniCart.classList.remove('open'));
  document.addEventListener('click', (e) => {
    if (!miniCart.contains(e.target) && !cartBtn.contains(e.target)) miniCart.classList.remove('open');
  });

  function addToCart(name, priceNum, image, qtyAdd){
    qtyAdd = parseInt(qtyAdd || 1, 10);
    if (qtyAdd < 1) qtyAdd = 1;
    const key = name + '|' + priceNum + '|' + image;
    const existing = cart.find(i => (i.name + '|' + i.priceNum + '|' + i.image) === key);
    const itemData = {name, priceNum, image, qty: qtyAdd};
    if (existing) existing.qty += qtyAdd;
    else cart.push({ name, price: priceNum.toFixed(2).replace('.',','), priceNum, image, qty: qtyAdd });
    save(); updateCount();
    if(window.BC_addToCartTrack) try{ window.BC_addToCartTrack(itemData, cart); }catch(e){}
    if (cartBtn) { cartBtn.style.transform = 'scale(1.15)'; setTimeout(() => cartBtn.style.transform = '', 200); }
  }

  document.querySelectorAll('#addToCart, .pcard__btn:not(:disabled), .ac-product-card__quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name || 'CurveLine Beard Pro';
      const price = parseFloat(btn.dataset.price || '18.89');
      const image = btn.dataset.image || 'img/birdcut-pt/Pente-laranja.png';
      const qtyInput = document.getElementById('qtyInput');
      const qty = qtyInput ? parseInt(qtyInput.value || '1', 10) : 1;
      addToCart(name, price, image, qty);
      const old = btn.textContent;
      btn.textContent = '✓ Adicionado';
      setTimeout(() => btn.textContent = old, 1400);
    });
  });

  miniCart.querySelector('.mini-cart__checkout').addEventListener('click', async () => {
    const btn = miniCart.querySelector('.mini-cart__checkout');
    if(window.BC_beginCheckoutTrack) try{ window.BC_beginCheckoutTrack(cart); }catch(e){}
    btn.textContent = 'A redirecionar...';
    btn.disabled = true;
    try {
      const qty = cart.reduce((s,i) => s + i.qty, 0);
      const res = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ quantity: qty })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { alert('Erro: ' + (data.error || 'Desconhecido')); btn.textContent = 'Finalizar Compra'; btn.disabled = false; }
    } catch(e) {
      alert('Erro de ligação. Tente novamente.');
      btn.textContent = 'Finalizar Compra';
      btn.disabled = false;
    }
  });

  updateCount();
  // sync inicial se carrinho já tinha itens
  if(cart.length && window.BC_cartTrack) try{ window.BC_cartTrack(cart); }catch(e){}
})();
