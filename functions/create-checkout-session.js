export async function onRequestPost(context) {
  const { STRIPE_SECRET_KEY, BC_API } = context.env;
  const siteUrl = new URL(context.request.url).origin;
  const CORS = { 'Content-Type': 'application/json' };

  try {
    const body = await context.request.json().catch(() => ({}));
    const presale = body.presale === true;
    let quantity = parseInt(body.quantity || 1, 10);
    if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;

    const maxQty = presale ? 2 : 20;
    if (quantity > maxQty) {
      return new Response(JSON.stringify({ error: presale ? 'Máximo de 2 unidades por pessoa na pré-venda.' : 'Quantidade máxima excedida.' }), { status: 400, headers: CORS });
    }

    const color = String(body.color || 'Laranja').slice(0, 40);
    const productId = body.productId === 'p2' ? 'p2' : 'p1';
    const email = String(body.email || '').trim().toLowerCase().slice(0, 200);

    // Preço: 18,89 € normal; 2% desconto na pré-venda (18,51 €)
    const base = parseInt(context.env.BASE_PRICE_CENTS || '1889', 10);
    const unit = presale ? Math.round(base * 0.98) : base;

    // Stock
    try {
      const apiBase = BC_API || 'https://media.pontofinal.site/bcapi';
      const r = await fetch(apiBase + '/api/products', { headers: { 'accept': 'application/json' } });
      if (r.ok) {
        const products = await r.json();
        const p = Array.isArray(products) ? products.find(x => x.id === productId) : null;
        if (p && Number(p.stock) < quantity) {
          return new Response(JSON.stringify({ error: 'Sem stock suficiente (' + p.stock + ' disponíveis)' }), { status: 409, headers: CORS });
        }
      }
    } catch (e) { /* segue */ }

    const formData = new URLSearchParams();
    formData.append('mode', 'payment');
    formData.append('payment_method_types[]', 'card');
    formData.append('payment_method_types[]', 'multibanco');
    formData.append('payment_method_types[]', 'mb_way');
    formData.append('line_items[0][price_data][currency]', 'eur');
    formData.append('line_items[0][price_data][unit_amount]', String(unit));
    formData.append('line_items[0][price_data][product_data][name]', 'CurveLine Beard Pro — ' + color);
    formData.append('line_items[0][price_data][product_data][description]', presale ? 'Pré-venda — 2% de desconto' : 'CurveLine Beard Pro');
    formData.append('line_items[0][quantity]', String(quantity));
    formData.append('success_url', siteUrl + '/success.html?session_id={CHECKOUT_SESSION_ID}');
    formData.append('cancel_url', siteUrl + (presale ? '/pre-venda.html?cancel=1' : '/?checkout=cancel'));
    formData.append('locale', 'pt');
    if (email) { formData.append('customer_email', email); formData.append('client_reference_id', email); }
    formData.append('metadata[product_id]', productId);
    formData.append('metadata[color]', color);
    formData.append('metadata[quantity]', String(quantity));
    formData.append('metadata[presale]', presale ? '1' : '0');
    formData.append('metadata[email]', email);
    formData.append('payment_intent_data[metadata][presale]', presale ? '1' : '0');
    formData.append('tax_id_collection[enabled]', 'true');
    ['PT', 'ES', 'FR', 'DE', 'NL', 'BE', 'IT', 'LU'].forEach(c =>
      formData.append('shipping_address_collection[allowed_countries][]', c));

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
    if (session.url) return new Response(JSON.stringify({ url: session.url, unit, presale }), { headers: CORS });
    return new Response(JSON.stringify({ error: session.error?.message || 'Stripe error' }), { status: 400, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}
