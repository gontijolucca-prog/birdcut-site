/* ============================================================
   Bird Cut — Área de Cliente (conta.html)
   Login/Registo/Perfil/Endereços/Pedidos via API (proxy /api/*)
   ============================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const show = (el, on) => { if (el) el.style.display = on ? '' : 'none'; };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[char]));
  const orderDate = (value) => {
    if (!value) return 'Data indisponível';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? escapeHtml(value) : new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium' }).format(date);
  };
  const money = (value) => `${(Number(value) || 0).toFixed(2).replace('.', ',')} €`;
  const safeExternalUrl = (value) => {
    try { const url = new URL(String(value || ''), location.origin); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  };

  /* ===== Alternância de vistas (usadas por onclick inline) ===== */
  window.showLogin = function () { show($('loginView'), true); show($('registerView'), false); };
  window.showRegister = function () { show($('registerView'), true); show($('loginView'), false); };
  window.resetPass = function () {
    location.href = 'mailto:contacto@birdcut.pt?subject=Recuperar%20palavra-passe%20Bird%20Cut';
  };

  /* ===== Dashboard ===== */
  window.showTab = function (id, el) {
    document.querySelectorAll('.conta-tab').forEach((t) => (t.style.display = 'none'));
    document.querySelectorAll('.conta-nav a').forEach((a) => a.classList.remove('active'));
    const tab = $('tab-' + id);
    if (tab) tab.style.display = 'block';
    if (el) el.classList.add('active');
  };

  window.doLogout = async function () {
    try { await logout(); } catch (e) { /* ignore */ }
    clearToken();
    paint(null);
  };

  function paint(user) {
    if (!user) {
      show($('authSection'), true);
      show($('dashboardSection'), false);
      return;
    }
    if (user.role === 'admin' && /(?:^|\/)conta\.html$/.test(location.pathname)) {
      location.replace('admin.html');
      return;
    }
    show($('authSection'), false);
    show($('dashboardSection'), true);
    const name = user.name || '';
    const surname = user.surname || '';
    $('userAvatar').textContent = ((name[0] || '?') + (surname[0] || '')).toUpperCase();
    $('userName').textContent = (name + ' ' + surname).trim();
    $('userEmail').textContent = user.email || '';
    if ($('profName')) $('profName').value = name;
    if ($('profSurname')) $('profSurname').value = surname;
    if ($('profEmail')) $('profEmail').value = user.email || '';
    if ($('profPhone')) $('profPhone').value = user.phone || '';
    if ($('profBirthday')) $('profBirthday').value = user.birthday || '';
    loadAddresses(user.addresses);
    loadOrders();
  }

  function loadAddresses(addresses) {
    const wrap = $('addressesList');
    if (!wrap) return;
    const list = Array.isArray(addresses) ? addresses : [];
    if (!list.length) {
      wrap.innerHTML = '<p style="color:var(--color-ink-soft)">Sem endereços guardados. Adiciona um abaixo.</p>';
      return;
    }
    wrap.innerHTML = list
      .map((a, i) => `
      <article class="pedido-card address-card" style="margin-bottom:1rem">
        <div class="pedido-card__header">
          <div><b>${escapeHtml(a.label || a.street || 'Endereço')}</b><span>${a.is_default || a.isDefault || i === 0 ? 'Principal' : 'Morada guardada'}</span></div>
          ${a.id ? `<button type="button" class="address-remove" data-address-id="${escapeHtml(a.id)}" style="color:var(--color-orange);font:inherit;border:0;background:none;cursor:pointer">Remover</button>` : ''}
        </div>
        <div class="pedido-card__body"><p>${escapeHtml(a.street || '')}<br>${escapeHtml(a.zip || '')} ${escapeHtml(a.city || '')}<br>${escapeHtml(a.country || '')}</p></div>
      </article>`)
      .join('');
    wrap.querySelectorAll('[data-address-id]').forEach((button) => {
      button.addEventListener('click', () => window.removeAddressUI(button.dataset.addressId));
    });
  }

  window.removeAddressUI = async function (id) {
    try {
      await removeAddress(id);
      const user = await getProfile();
      paint(user);
    } catch (e) {
      alert(e.message || 'Erro ao remover endereço');
    }
  };

  async function loadOrders() {
    const list = $('ordersList');
    if (!list) return;
    list.setAttribute('aria-live', 'polite');
    list.innerHTML = '<p style="color:var(--color-ink-soft)">A carregar o histórico…</p>';
    try {
      const orders = await getOrders();
      if (!Array.isArray(orders) || !orders.length) {
        list.innerHTML = '<div class="pedido-card"><div class="pedido-card__body"><p style="color:var(--color-ink-soft)">Ainda não tens pedidos.</p><a href="index.html#comprar" class="btn btn--red" style="margin-top:1rem">Ver a loja</a></div></div>';
        return;
      }
      const statusLabels = { processamento: 'Em processamento', pending: 'A aguardar pagamento', paid: 'Pago', enviado: 'Enviado', shipped: 'Enviado', entregue: 'Entregue', delivered: 'Entregue', cancelado: 'Cancelado', cancelled: 'Cancelado', refunded: 'Reembolsado' };
      list.innerHTML = orders.map((o) => {
        const id = escapeHtml(o.id ?? o.order_id ?? '—');
        const status = String(o.status || 'processamento').toLowerCase();
        const statusLabel = statusLabels[status] || escapeHtml(o.status || 'Em processamento');
        const statusClass = ['entregue', 'delivered'].includes(status) ? 'pedido-status--entregue' : ['cancelado', 'cancelled', 'refunded'].includes(status) ? 'pedido-status--cancelado' : 'pedido-status--transito';
        const created = orderDate(o.created_at || o.createdAt || o.created || o.date);
        const items = Array.isArray(o.items) ? o.items : [];
        const itemText = o.items_text || o.description || items.map((item) => `${item.name || item.title || item.id || 'Produto'} × ${item.quantity || item.qty || 1}`).join(' · ') || 'CurveLine Beard Pro';
        const payment = o.payment_status || o.paymentStatus || o.payment_state || '';
        const tracking = safeExternalUrl(o.tracking_url || o.trackingUrl || '');
        const itemRows = items.length ? `<ul class="order-detail-items">${items.map((item) => `<li><span>${escapeHtml(item.name || item.title || item.id || 'Produto')} × ${escapeHtml(item.quantity || item.qty || 1)}</span><b>${item.total != null ? money(item.total) : item.price != null ? money(item.price) : ''}</b></li>`).join('')}</ul>` : `<p>${escapeHtml(itemText)}</p>`;
        return `<article class="pedido-card order-card">
          <div class="pedido-card__header"><div><b>Pedido #${id}</b><span>${created}</span></div><span class="pedido-status ${statusClass}">${statusLabel}</span></div>
          <div class="pedido-card__body"><p class="order-items-summary">${escapeHtml(itemText)}</p>${payment ? `<p class="order-meta">Pagamento: ${escapeHtml(payment)}</p>` : ''}</div>
          <div class="pedido-card__footer"><span>Total</span><b>${money(o.total ?? o.amount ?? 0)}</b></div>
          <details class="order-details"><summary>Ver detalhes</summary><div>${itemRows}${o.shipping_address || o.shippingAddress ? `<p class="order-meta"><b>Envio:</b> ${escapeHtml(typeof (o.shipping_address || o.shippingAddress) === 'string' ? (o.shipping_address || o.shippingAddress) : Object.values(o.shipping_address || o.shippingAddress).filter(Boolean).join(', '))}</p>` : ''}${tracking ? `<a class="order-tracking" href="${escapeHtml(tracking)}" target="_blank" rel="noopener noreferrer">Acompanhar envio ↗</a>` : ''}</div></details>
        </article>`;
      }).join('');
    } catch (e) {
      list.innerHTML = '<div class="pedido-card"><div class="pedido-card__body"><p role="alert" style="color:#a32222">Não foi possível carregar o histórico agora.</p><button class="btn btn--outline" type="button" id="retryOrders">Tentar novamente</button></div></div>';
      $('retryOrders')?.addEventListener('click', loadOrders);
    }
  }

  /* ===== Boot: estado de sessão ===== */
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof onAuthChange === 'function') onAuthChange(paint);
  });

  /* ===== Login ===== */
  const loginForm = $('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('loginError');
      if (err) err.textContent = '';
      const btn = $('loginBtn');
      if (btn) { btn.disabled = true; btn.textContent = 'A entrar…'; }
      try {
        await login($('loginEmail').value.trim(), $('loginPass').value);
        const user = await getProfile();
        paint(user);
      } catch (ex) {
        if (err) err.textContent = (ex && ex.message) || 'Erro ao entrar. Tenta novamente.';
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
      }
    });
  }

  /* ===== Registo ===== */
  const registerForm = $('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('regError');
      if (err) err.textContent = '';
      if ($('regPass').value !== $('regPass2').value) {
        if (err) err.textContent = 'As palavras-passe não coincidem.';
        return;
      }
      const btn = $('regBtn');
      if (btn) { btn.disabled = true; btn.textContent = 'A criar conta…'; }
      try {
        await register(
          $('regEmail').value.trim(),
          $('regPass').value,
          $('regName').value.trim(),
          $('regSurname').value.trim()
        );
        const user = await getProfile();
        paint(user);
      } catch (ex) {
        if (err) err.textContent = (ex && ex.message) || 'Erro ao criar conta.';
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Criar Conta'; }
      }
    });
  }

  /* ===== Perfil ===== */
  const profileForm = $('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('profileMsg');
      if (msg) { msg.textContent = ''; msg.style.color = ''; }
      try {
        await updateProfile({
          name: $('profName').value.trim(),
          surname: $('profSurname').value.trim(),
          phone: $('profPhone').value.trim(),
          birthday: $('profBirthday').value,
        });
        if (msg) { msg.style.color = '#2e7d32'; msg.textContent = '✓ Dados guardados.'; }
        paint(await getProfile());
      } catch (ex) {
        if (msg) { msg.style.color = '#e56d6d'; msg.textContent = (ex && ex.message) || 'Erro ao guardar.'; }
      }
    });
  }

  /* ===== Endereço novo ===== */
  const addressForm = $('addressForm');
  if (addressForm) {
    addressForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await addAddress({
          street: $('addrStreet').value.trim(),
          zip: $('addrZip').value.trim(),
          city: $('addrCity').value.trim(),
          country: $('addrCountry').value.trim(),
        });
        addressForm.reset();
        $('addrCountry').value = 'Portugal';
        paint(await getProfile());
      } catch (ex) {
        alert((ex && ex.message) || 'Erro ao guardar endereço.');
      }
    });
  }

  /* ===== Segurança (alteração de palavra-passe) ===== */
  const passForm = $('passForm');
  if (passForm) {
    passForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = $('passMsg');
      if (!msg) return;
      msg.style.color = '#8a3b18';
      msg.textContent = 'A alteração de palavra-passe ainda não está disponível nesta API. Contacta o apoio para concluir o pedido; não foi feita nenhuma alteração.';
    });
  }
})();
