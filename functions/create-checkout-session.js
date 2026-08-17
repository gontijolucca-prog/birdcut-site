export async function onRequestPost(context) {
  const { STRIPE_SECRET_KEY, STRIPE_PRICE_ID, SITE_URL } = context.env;

  try {
    const body = await context.request.json();
    const quantity = body.quantity || 1;

    // Criar Checkout Session via API direta (sem SDK)
    const formData = new URLSearchParams();
    formData.append('mode', 'payment');
    formData.append('payment_method_types[]', 'card');
    formData.append('payment_method_types[]', 'multibanco');
    formData.append('payment_method_types[]', 'mb_way');
    formData.append('line_items[0][price]', STRIPE_PRICE_ID);
    formData.append('line_items[0][quantity]', quantity);
    formData.append('success_url', SITE_URL + '/success.html?session_id={CHECKOUT_SESSION_ID}');
    formData.append('cancel_url', SITE_URL + '/');
    formData.append('locale', 'pt');
    formData.append('shipping_address_collection[allowed_countries][]', 'PT');
    formData.append('shipping_address_collection[allowed_countries][]', 'ES');

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const session = await res.json();

    if (session.url) {
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: session.error?.message || 'Stripe error' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
