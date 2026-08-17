import Stripe from 'stripe';

export async function onRequestGet(context) {
  const { STRIPE_SECRET_KEY } = context.env;
  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const id = context.params.id;

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    return new Response(JSON.stringify({
      status: session.payment_status,
      amount: session.amount_total,
      customer_email: session.customer_details?.email,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
