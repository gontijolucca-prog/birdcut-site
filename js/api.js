// ===== Bird Cut API =====
const API_URL = 'http://167.233.116.182:3001';

function getToken() { return localStorage.getItem('bc_token'); }
function setToken(t) { localStorage.setItem('bc_token', t); }
function clearToken() { localStorage.removeItem('bc_token'); }

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
  return api('/api/register', { method: 'POST', body: JSON.stringify({ email, password, name, surname }) })
    .then(d => { setToken(d.token); return d; });
}

function login(email, password) {
  return api('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    .then(d => { setToken(d.token); return d; });
}

function logout() { clearToken(); return Promise.resolve(); }

function getProfile() { return api('/api/profile'); }

function updateProfile(data) {
  return api('/api/profile', { method: 'PUT', body: JSON.stringify(data) });
}

function addAddress(addr) {
  return api('/api/addresses', { method: 'POST', body: JSON.stringify(addr) });
}

function removeAddress(id) {
  return api('/api/addresses/' + id, { method: 'DELETE' });
}

function getOrders() { return api('/api/orders'); }

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
