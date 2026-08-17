import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(express.static(__dirname));

// Criar Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'multibanco'],
      mode: 'payment',
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: quantity,
      }],
      success_url: `${process.env.SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/`,
      locale: 'pt',
      shipping_address_collection: {
        allowed_countries: ['PT', 'ES', 'FR', 'DE', 'NL', 'BE', 'IT'],
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Erro ao criar sessão:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Verificar estado do pagamento
app.get('/session/:id', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    res.json({
      status: session.payment_status,
      amount: session.amount_total,
      customer_email: session.customer_details?.email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🪒 Bird Cut server: http://localhost:${PORT}`);
  console.log(`Stripe mode: TEST`);
});
