// Webhook do Stripe: confirma o pagamento no servidor e cria a encomenda (idempotente).
// Ativa quando STRIPE_WEBHOOK_SECRET estiver definido nas variáveis do Pages.
const enc = new TextEncoder();

function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
}

async function hmacHex(secret, payload) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function onRequestPost(context) {
  const secret = context.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'Webhook não configurado' }, 503);

  const raw = await context.request.text();
  const header = context.request.headers.get('stripe-signature') || '';
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=').map(s => s.trim())));
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return json({ error: 'Assinatura em falta' }, 400);

  // 5 minutos de tolerância contra replay
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return json({ error: 'Assinatura expirada' }, 400);

  const expected = await hmacHex(secret, `${t}.${raw}`);
  if (!safeEqual(expected, v1)) return json({ error: 'Assinatura inválida' }, 400);

  let event;
  try { event = JSON.parse(raw); } catch { return json({ error: 'JSON inválido' }, 400); }

  if (event.type !== 'checkout.session.completed') return json({ received: true });

  const s = event.data?.object || {};
  if (s.payment_status !== 'paid') return json({ received: true, unpaid: true });

  const api = context.env.BC_API || 'https://media.pontofinal.site/bcapi';
  const productId = s.metadata?.product_id === 'p2' ? 'p2' : 'p1';
  const qty = Math.max(1, Math.min(20, parseInt(s.metadata?.quantity || '1', 10) || 1));
  const email = s.customer_details?.email || 'guest';

  try {
    const r = await fetch(api + '/api/orders/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, items: [{ id: productId, qty }], stripeSession: s.id, presale: s.metadata?.presale === '1' }),
    });
    if (!r.ok) {
      const msg = await r.text();
      console.error('Webhook: encomenda falhou', r.status, msg.slice(0, 200));
      return json({ error: 'Falha ao criar encomenda' }, 502);
    }
    return json({ received: true, order: await r.json() });
  } catch (e) {
    console.error('Webhook: erro', e.message);
    return json({ error: 'Erro de ligação' }, 502);
  }
}
