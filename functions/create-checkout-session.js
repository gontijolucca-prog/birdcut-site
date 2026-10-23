export async function onRequestPost(context) {
  const { STRIPE_SECRET_KEY, STRIPE_PRICE_ID, SITE_URL, BC_API } = context.env;
  const CORS = { 'Content-Type': 'application/json' };

  try {
    const body = await context.request.json().catch(() => ({}));
    let quantity = parseInt(body.quantity || 1, 10);
    if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;
    if (quantity > 20) quantity = 20;

    const color = String(body.color || '').slice(0, 40);
    const productId = body.productId === 'p2' ? 'p2' : 'p1';

    // Pré-verificação de stock (não bloqueia a venda se o backend estiver em baixo)
    try {
      const apiBase = BC_API || 'https://media.pontofinal.site/bcapi';
      const r = await fetch(apiBase + '/api/products', { cf: { cacheTtl: 30 } });
      if (r.ok) {
        const products = await r.json();
        const p = Array.isArray(products) ? products.find(x => x.id === productId) : null;
        if (p && Number(p.stock) < quantity) {
          return new Response(JSON.stringify({ error: 'Sem stock suficiente (' + p.stock + ' disponíveis)' }), { status: 409, headers: CORS });
        }
      }
    } catch (e) { /* segue para o Stripe */ }

    const formData = new URLSearchParams();
    formData.append('mode', 'payment');
    formData.append('payment_method_types[]', 'card');
    formData.append('payment_method_types[]', 'multibanco');
    formData.append('payment_method_types[]', 'mb_way');
    formData.append('line_items[0][price]', STRIPE_PRICE_ID);
    formData.append('line_items[0][quantity]', quantity);
    formData.append('success_url', SITE_URL + '/success.html?session_id={CHECKOUT_SESSION_ID}');
    formData.append('cancel_url', SITE_URL + '/?checkout=cancel');
    formData.append('locale', 'pt');
    formData.append('metadata[product_id]', productId);
    formData.append('metadata[color]', color);
    formData.append('metadata[quantity]', String(quantity));
    formData.append('payment_intent_data[metadata][product_id]', productId);
    formData.append('payment_intent_data[metadata][color]', color);
    formData.append('tax_id_collection[enabled]', 'true');
    ['PT', 'ES', 'FR', 'DE', 'NL', 'BE', 'IT', 'LU'].forEach(c =>
      formData.append('shipping_address_collection[allowed_countries][]', c));

    // Portes opcionais (só entram se configurares SHIPPING_FEE, em cêntimos)
    const fee = parseInt(context.env.SHIPPING_FEE || '0', 10);
    if (fee > 0) {
      const freeQty = parseInt(context.env.FREE_SHIPPING_QTY || '0', 10);
      const gratis = freeQty > 0 && quantity >= freeQty;
      formData.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
      formData.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(gratis ? 0 : fee));
      formData.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'eur');
      formData.append('shipping_options[0][shipping_rate_data][display_name]', gratis ? 'Portes grátis' : 'Portes (CTT)');
    }

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + STRIPE_SECRET_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const session = await res.json();
    if (session.url) return new Response(JSON.stringify({ url: session.url }), { headers: CORS });
    return new Response(JSON.stringify({ error: session.error?.message || 'Stripe error' }), { status: 400, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}
