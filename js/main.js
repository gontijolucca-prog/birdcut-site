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

/* ===== CART ===== */
(function(){
  let cart = 0;
  const cartCount = document.querySelector('.cart-count');
  if (!cartCount) return;
  const buttons = [document.getElementById('addToCart'), ...document.querySelectorAll('.pcard__btn:not(:disabled)')];
  buttons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      cart += 1;
      cartCount.textContent = cart;
      const old = btn.textContent;
      btn.textContent = '✓ Adicionado';
      setTimeout(() => btn.textContent = old, 1400);
    });
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

  document.querySelectorAll('a, button, .pcard, .handle, .ig-item').forEach(el => {
    el.addEventListener('mouseenter', () => bird.classList.add('hover'));
    el.addEventListener('mouseleave', () => bird.classList.remove('hover'));
  });
})();
