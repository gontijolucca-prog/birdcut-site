import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { STRIPE_SECRET_KEY, STRIPE_PRICE_ID, SITE_URL } = context.env;
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    const body = await context.request.json();
    const quantity = body.quantity || 1;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'multibanco'],
      mode: 'payment',
      line_items: [{
        price: STRIPE_PRICE_ID,
        quantity: quantity,
      }],
      success_url: `${SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/`,
      locale: 'pt',
      shipping_address_collection: {
        allowed_countries: ['PT', 'ES', 'FR', 'DE', 'NL', 'BE', 'IT'],
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
