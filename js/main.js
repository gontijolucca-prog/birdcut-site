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

/* ===== CARRINHO ===== */
(function(){
  // Auth state — atualizar UI
  if (typeof onAuthChange === 'function') {
    onAuthChange(user => {
      const contaLink = document.querySelector('a[href="conta.html"]');
      if (user && contaLink) {
        contaLink.querySelector('span').textContent = user.email?.split('@')[0] || 'Conta';
      } else if (contaLink) {
        contaLink.querySelector('span').textContent = 'Conta';
      }
    });
  }

  let cart = JSON.parse(localStorage.getItem('birdcut-cart') || '[]');
  const cartCount = document.querySelector('.cart-count');
  const cartBtn = document.querySelector('.icon-btn--cart');

  // Mini-carrinho HTML
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

  function save(){ localStorage.setItem('birdcut-cart', JSON.stringify(cart)); }
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
    // Event listeners
    items.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
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
      btn.addEventListener('click', () => {
        cart.splice(parseInt(btn.dataset.idx), 1);
        save(); updateCount(); renderMini();
      });
    });
  }

  // Abrir/fechar mini-carrinho
  if (cartBtn) cartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    renderMini();
    miniCart.classList.toggle('open');
  });
  miniCart.querySelector('.mini-cart__close').addEventListener('click', () => miniCart.classList.remove('open'));
  document.addEventListener('click', (e) => {
    if (!miniCart.contains(e.target) && !cartBtn.contains(e.target)) miniCart.classList.remove('open');
  });

  // Adicionar ao carrinho (suporta qtyInput)
  function addToCart(name, priceNum, image, qtyAdd){
    qtyAdd = parseInt(qtyAdd || 1, 10);
    if (qtyAdd < 1) qtyAdd = 1;
    const key = name + '|' + priceNum + '|' + image;
    const existing = cart.find(i => (i.name + '|' + i.priceNum + '|' + i.image) === key);
    if (existing) existing.qty += qtyAdd;
    else cart.push({ name, price: priceNum.toFixed(2).replace('.',','), priceNum, image, qty: qtyAdd });
    save(); updateCount();
    if (cartBtn) { cartBtn.style.transform = 'scale(1.15)'; setTimeout(() => cartBtn.style.transform = '', 200); }
  }

  // Botões "Comprar agora" / "Adicionar ao Carrinho" (lê qtyInput se existir)
  document.querySelectorAll('#addToCart, .pcard__btn:not(:disabled)').forEach(btn => {
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

  // Checkout Stripe
  miniCart.querySelector('.mini-cart__checkout').addEventListener('click', async () => {
    const btn = miniCart.querySelector('.mini-cart__checkout');
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
})();

/* ===== INFLUENCER SLIDER (autoplay contínuo) ===== */
(function(){
  // O carrossel é CSS-only (animation marquee). Nenhum JS necessário.
})();

/* ===== CURSOR FOLLOW (pássaro Bird Cut) ===== */
(function(){
  if (window.matchMedia('(hover: none)').matches) return;
  const bird = document.createElement('img');
  bird.className = 'cursor-bird';
  bird.src = 'img/logo-green.png';
  bird.alt = '';
  document.body.appendChild(bird);
  document.body.classList.add('cursor-on');

  let mx = -100, my = -100, bx = -100, by = -100;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
  }, {passive:true});

  (function loop(){
    bx += (mx - bx) * 0.35;
    by += (my - by) * 0.35;
    bird.style.transform = `translate(${bx}px,${by}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .pcard, .handle, .ig-item, .mini-cart').forEach(el => {
    el.addEventListener('mouseenter', () => bird.classList.add('hover'));
    el.addEventListener('mouseleave', () => bird.classList.remove('hover'));
  });
})();

/* ===== NEWSLETTER ===== */
document.querySelectorAll('form.newsletter-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const old = btn.textContent;
    btn.textContent = '✓ Obrigado!';
    const input = form.querySelector('input');
    if (input) input.value = '';
    setTimeout(() => btn.textContent = old, 2200);
  });
});

/* ===== CONTACT FORM ===== */
(function(){
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = '✓ Mensagem enviada!';
    btn.disabled = true;
    form.querySelectorAll('input, textarea').forEach(i => i.value = '');
    setTimeout(() => { btn.textContent = 'Enviar Mensagem'; btn.disabled = false; }, 2500);
  });
})();
