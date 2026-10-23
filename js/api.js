// ===== Bird Cut API =====
// Same-origin: o proxy em /api/* (Cloudflare Pages Function) encaminha para o backend
const API_URL = '';

function getToken() { return localStorage.getItem('bc_token') || sessionStorage.getItem('bc_token'); }
function setToken(t, remember) {
  try { localStorage.removeItem('bc_token'); sessionStorage.removeItem('bc_token'); } catch (e) { /* storage indisponível */ }
  (remember === false ? sessionStorage : localStorage).setItem('bc_token', t);
}
function clearToken() {
  try { localStorage.removeItem('bc_token'); } catch (e) { /* storage indisponível */ }
  try { sessionStorage.removeItem('bc_token'); } catch (e) { /* storage indisponível */ }
}

async function api(path, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_URL + path, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw { code: res.status, message: data.error || 'Erro' };
  return data;
}

function register(email, password, name, surname) {
  // o backend compara e-mails sem normalizar: baixar para minúsculas evita contas duplicadas
  const mail = String(email || '').trim().toLowerCase();
  return api('/api/register', { method: 'POST', body: JSON.stringify({ email: mail, password, name, surname }) })
    .then(d => { setToken(d.token); return d; });
}

function login(email, password, remember) {
  const raw = String(email||'').trim();
  const e = raw.toLowerCase();
  const tryLogin = (mail) => api('/api/login', { method: 'POST', body: JSON.stringify({ email: mail, password }) });
  // 1) tal como foi escrito; 2) em minúsculas (contas antigas com maiúsculas no registo)
  return tryLogin(raw).catch(err => {
    if (err && err.code === 401 && raw !== e) return tryLogin(e);
    throw err;
  }).then(d => { setToken(d.token, remember); return d; });
}

// O backend de contas autentica por email; o username admin é apenas o identificador público.
function loginAdmin(username, password, remember) {
  const value = String(username || '').trim().toLowerCase();
  // Aceita o e-mail de administrador ou o atalho "adminbirdcut"
  const email = value.includes('@') ? value : (value === 'adminbirdcut' ? 'adminbirdcut@birdcut.pt' : '');
  if (!email) return Promise.reject({ code: 400, message: 'Usa o teu e-mail de administrador.' });
  return login(email, password, remember);
}

// ===== Reposição de palavra-passe =====
function requestPasswordReset(email) {
  return api('/api/password-reset/request', { method: 'POST', body: JSON.stringify({ email }) });
}

function confirmPasswordReset(token, newPassword) {
  return api('/api/password-reset/confirm', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
}

function logout() { clearToken(); try{ localStorage.removeItem('bc_user'); }catch{} return Promise.resolve(); }

function getProfile() {
  return api('/api/profile');
}

function updateProfile(data) {
  return api('/api/profile', { method: 'PUT', body: JSON.stringify(data) });
}

function addAddress(addr) {
  return api('/api/addresses', { method: 'POST', body: JSON.stringify(addr) });
}

function removeAddress(id) {
  return api('/api/addresses/' + id, { method: 'DELETE' });
}

function updateAddress(id, data) {
  return api('/api/addresses/' + id, { method: 'PUT', body: JSON.stringify(data) });
}

function updatePassword(currentPassword, newPassword) {
  return api('/api/profile', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });
}

function getOrders() {
  return api('/api/orders');
}

function createOrder(data) {
  return api('/api/orders', { method: 'POST', body: JSON.stringify(data) });
}

function createGuestOrder(data) {
  return api('/api/orders/guest', { method: 'POST', body: JSON.stringify(data) });
}

function isLoggedIn() { return !!getToken(); }

function onAuthChange(cb) {
  const token = getToken();
  if (token) {
    api('/api/profile').then(user => cb(user)).catch(() => cb(null));
  } else {
    cb(null);
  }
}
