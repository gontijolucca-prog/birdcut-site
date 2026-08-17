export async function onRequestGet(context) {
  const { STRIPE_SECRET_KEY } = context.env;
  const id = context.params.id;

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions/' + id, {
      headers: { 'Authorization': 'Bearer ' + STRIPE_SECRET_KEY },
    });
    const session = await res.json();

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
