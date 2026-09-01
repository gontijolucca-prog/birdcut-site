/* ============================================================
   Bird Cut — Área de Cliente (conta.html)
   Login/Registo/Perfil/Endereços/Pedidos via API (proxy /api/*)
   ============================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const show = (el, on) => { if (el) el.style.display = on ? '' : 'none'; };

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
      .map(
        (a, i) => `
      <div class="pedido-card" style="margin-bottom:1rem">
        <div class="pedido-card__header">
          <div><b>${a.street || 'Endereço'}</b><span>${i === 0 ? 'Principal' : ''}</span></div>
          ${a.id ? `<a href="#" style="color:var(--color-orange);font-size:.85rem" onclick="removeAddressUI(${JSON.stringify(a.id)});return false">Remover</a>` : ''}
        </div>
        <div class="pedido-card__body"><p>${a.street || ''}<br>${a.zip || ''} ${a.city || ''}<br>${a.country || ''}</p></div>
      </div>`
      )
      .join('');
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
    try {
      const orders = await getOrders();
      if (!Array.isArray(orders) || !orders.length) {
        list.innerHTML =
          '<p style="color:var(--color-ink-soft)">Ainda não tens pedidos. <a href="index.html#comprar" style="color:var(--color-orange);font-weight:600">Ver a loja →</a></p>';
        return;
      }
      list.innerHTML = orders
        .map(
          (o) => `
        <div class="pedido-card">
          <div class="pedido-card__header">
            <div><b>Pedido #${o.id != null ? o.id : '—'}</b><span>${(o.created_at || '').slice(0, 10)}</span></div>
            <span class="pedido-status pedido-status--transito">${o.status || 'Processamento'}</span>
          </div>
          <div class="pedido-card__body">
            <p style="color:var(--color-ink-soft);font-size:.9rem">${o.items_text || o.description || 'CurveLine Beard Pro'}</p>
          </div>
          <div class="pedido-card__footer">
            <span>Total: <b>${Number(o.total || 0).toFixed(2).replace('.', ',')} €</b></span>
          </div>
        </div>`
        )
        .join('');
    } catch (e) {
      list.innerHTML = '<p style="color:#e56d6d">Erro ao carregar pedidos.</p>';
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
      if (msg) { msg.style.color = ''; msg.textContent = ''; }
      if ($('newPass').value !== $('newPass2').value) {
        if (msg) { msg.style.color = '#e56d6d'; msg.textContent = 'As palavras-passe não coincidem.'; }
        return;
      }
      if (msg) {
        msg.style.color = 'var(--color-ink-soft)';
        msg.textContent = 'Alteração de palavra-passe em breve — contacta contacto@birdcut.pt.';
      }
    });
  }
})();
