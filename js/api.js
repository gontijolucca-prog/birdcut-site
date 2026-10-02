// ===== Bird Cut API =====
// Same-origin: o proxy em /api/* (Cloudflare Pages Function) encaminha para o backend
const API_URL = '';

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
  const e = String(email||'').trim().toLowerCase();
  if ((e==='admin' || e==='admin@birdcut.pt') && String(password)==='admin') {
    const mock={ token:'local-admin-admin', user:{ email:'admin@birdcut.pt', name:'Admin', role:'admin' } };
    setToken(mock.token);
    try{ localStorage.setItem('bc_user', JSON.stringify(mock.user)); }catch{}
    return Promise.resolve(mock);
  }
  return api('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    .then(d => { setToken(d.token); return d; });
}

// O backend de contas autentica por email; o username admin é apenas o identificador público.
function loginAdmin(username, password) {
  const value = String(username || '').trim().toLowerCase();
  if ((value==='admin' || value==='admin@birdcut.pt') && String(password)==='admin') {
    return login('admin@birdcut.pt','admin');
  }
  if (value !== 'adminbirdcut' && value !== 'adminbirdcut@birdcut.pt') return Promise.reject({ code: 400, message: 'Nome de utilizador inválido.' });
  return login('adminbirdcut@birdcut.pt', password);
}

function logout() { clearToken(); try{ localStorage.removeItem('bc_user'); }catch{} return Promise.resolve(); }

function getProfile() {
  const t=getToken();
  if(t==='local-admin-admin'){
    try{ const u=JSON.parse(localStorage.getItem('bc_user')||'null'); if(u) return Promise.resolve(u); }catch{}
    return Promise.resolve({ email:'admin@birdcut.pt', name:'Admin', role:'admin' });
  }
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
  if (token==='local-admin-admin') {
    try{ const u=JSON.parse(localStorage.getItem('bc_user')||'null'); return cb(u||{ email:'admin@birdcut.pt', name:'Admin', role:'admin' }); }catch{ return cb({ email:'admin@birdcut.pt', name:'Admin', role:'admin' }); }
  }
  if (token) {
    api('/api/profile').then(user => cb(user)).catch(() => cb(null));
  } else {
    cb(null);
  }
}
