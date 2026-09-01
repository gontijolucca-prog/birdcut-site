// Proxy same-origin para a API Bird Cut (evita mixed-content HTTPS -> HTTP)
// Rotas: /api/*  ->  http://VPS:3001/api/*
const API_ORIGIN = 'http://167.233.116.182:3001';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const upstream = API_ORIGIN + '/api' + path + url.search;

  const headers = {};
  const contentType = context.request.headers.get('content-type');
  if (contentType) headers['content-type'] = contentType;
  const auth = context.request.headers.get('authorization');
  if (auth) headers['authorization'] = auth;

  const init = { method: context.request.method, headers };
  if (!['GET', 'HEAD'].includes(context.request.method)) {
    try { init.body = await context.request.text(); } catch (e) { /* sem body */ }
  }

  const res = await fetch(upstream, init);
  const out = new Headers(res.headers);
  out.set('access-control-allow-origin', '*');
  out.delete('content-encoding');
  out.delete('transfer-encoding');
  return new Response(res.body, { status: res.status, headers: out });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
    },
  });
}
