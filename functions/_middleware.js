const PASS = 'mt6:26';
const COOKIE = 'bc_auth';

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bird Cut — Em Desenvolvimento</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Work Sans',sans-serif;background:#1a1a1a;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.bg{position:fixed;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(90,107,47,.15),transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(90,107,47,.08),transparent 50%);pointer-events:none}
.card{position:relative;z-index:2;text-align:center;max-width:440px;padding:3.5rem 3rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(20px);border-radius:4px}
.logo{width:64px;height:64px;margin:0 auto 2rem;opacity:.9}
.logo svg{width:100%;height:100%}
h1{font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:1.6rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.6rem}
.sub{color:rgba(255,255,255,.5);font-weight:300;font-size:.95rem;margin-bottom:2.5rem;line-height:1.6}
.form{display:flex;flex-direction:column;gap:1rem}
.input{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);padding:1rem 1.2rem;color:#fff;font-family:'Josefin Sans',sans-serif;font-size:1rem;letter-spacing:.15em;text-align:center;border-radius:2px;outline:none;transition:border-color .3s}
.input::placeholder{color:rgba(255,255,255,.3);letter-spacing:.1em}
.input:focus{border-color:rgba(90,107,47,.6)}
.btn{background:rgba(90,107,47,.8);color:#fff;border:none;padding:1rem;font-family:'Josefin Sans',sans-serif;font-weight:600;font-size:.85rem;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .3s}
.btn:hover{background:rgba(90,107,47,1);transform:translateY(-1px)}
.error{color:#e56d6d;font-size:.85rem;margin-top:.5rem;min-height:1.2em}
.footer{position:fixed;bottom:2rem;left:0;right:0;text-align:center;color:rgba(255,255,255,.2);font-size:.75rem;letter-spacing:.1em}
.bird{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);opacity:.03;pointer-events:none}
.bird svg{width:min(80vw,600px);height:auto}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.card{animation:fadeUp .8s var(--ease) both}
@keyframes pulse{0%,100%{opacity:.03}50%{opacity:.06}}
.bird{animation:pulse 4s ease-in-out infinite}
</style>
</head>
<body>
<div class="bg"></div>
<div class="bird">
  <svg viewBox="0 0 169 185" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M85 0C38 0 0 38 0 85c0 22 9 42 23 57l62 43c2 1 5 1 7 0l62-43c14-15 23-35 23-57C169 38 131 0 85 0z" fill="#5a6b2f"/>
  </svg>
</div>
<div class="card">
  <div class="logo"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALUAAAC5CAYAAABukX7SAAAFlUlEQVR4nO3d643jRhBFYWmw+TgfprDxbAqdjyOyISwEcITRDB/VrFu3zvfHsL0PijwstagRdbsBAAAAAAAAAAAAwDv3m6Dl9z//fff/x59/JbcbGu4VIt6C0CERdUTMXyHw3u5OMa8Rdl93x6BfEXgvH+5BZ/69MJ/UKmExtf19dApabVtgsPxQCpu4fU2PWjke5W2DaNQVoqmwjUiKunIclbcdE6J2WZ86PAYERP0aQvUwqm8/TkbtGoDr4+rkUNTuB9798blreZ16C8JuFHWng93psToJn9RuIbg9ng52Rc0BRts19TN+l5+I42SuhReKGxG2YdQcVNy6T2q3JcgDJ3YNLD92Imx9v2b+4QQAy0nttPx44mQ1ifponI8ACBuWa2rHsKGp3afJI7k+rlZRM21RweF1cvym1MXJ3vw6NQFgtsMv3pjWn3GyGkxqDiIslx9Hw378PreTgmcuHSFhcUD/cjtRW79QPHIwmdaYJXSyMLGZ1naX9PZObMena05sw+vUe0J9/rCTY9zIMy2m7hOLE9XwHcU9B5VpjTJvk28N23GqOz6mKqQ++cJTNiK0+8q5q3GiXu/Sqw4/hf0MwOkEmBH12f0zzK82tfga52xnPt95u9gwCD7lAWyZ2G7x/xSL6uMdBSNP22DVg4j6kaduIGHXNkQDT98owq5viMUtG7XjlZAOhkDg6RvwQLh+RmLcH8o7QOGsR71vQpaI+oGwPS0JYUtNQpYh3sZFz7wyk/rdg+bHUn0sF01tqajfhc0E97FcELbU8uPdg3d82xy3acsRuUn9DldC/CyTBpVs1ETcwzIhbNmoHwi7hyU4bOmoX8MmclhEjR6WwGlN1LALu1zULEG8LQFhl4sa+AlRw25aEzXsEDXspjVRww5Rw25aEzXsEDXspjVRw065qPmwAOyiBqyiZkrDKmqChl3UgFXUTGlYRU3QsIsavY0D9waRjpopjSOko0Zv4+AdnIgadmSjZunR2zhxnz3JqAm6t3HyxpGSUaOvEXAnVKKGfNB7vz9G7v7ULD36Gd/EvPXXrv2K2jBgj/WN9B//jLyxvlTUTGlfYzVhvzrOW4791vW2VNTwvW/h8hLtzAFG1M1DXV7i2huy4rOrTNSKO6eyseG73Y8uA9TJXP1w2JmZ1i+0xoagq9nzDMJ16sKiruu6kZjUnQ/AUZ2+W3LsXOczqQtZf6V1l6BLv1DEe51DHm6ffOluPZmf/567RTWk76SO02eLKwJexPf90X1A1GIUpvEiEPuZ/cAOFKIQtELkZ/fDvftEUKEa9JXHLWofELWASkHPCD368XNJD3YnJpf0RN4ZZCkWh6iTEXM8ok5+Q2X936/eFldpO5IJ9RlRx2FSCyDoWEQNO0SdjCkdj6hhh6gTpzBTeg6ihh2iTrpsyZSeh6gnINhcRJ3wKW+in4uoYYeoAzGlNRB1kE43l1FH1EEi76+Mc4gadogadoj6pK1LCpYe1yHqk3hxqIeogz+W9e7XHv17sB+3SDiICa0rbVIzvTALy4/JJyMn7/WIeieWHfqIeicmrz6injipOQEaRs1BxwxM6uBr0siXHnWVWHiBWEd61K6qnKyOeEfxG52/v7AymWniFg6TOg/LjwlhEnQumaiVQnhe7XB79uhCJqQnh5CUTtCOZCa1EqKsTXKiZE3riKsdnBD5JCd1RhhcvvMhGfXVYTNdvchGfVVs67/j7LKHk0ODdNSzQ4kMGjokXyh+JTK61xMl4s9mSuuQn9TR0RCfvzJRR/xc81e/l2WHnzLLjxl3Go0KmumvpXTUqmt05Cq1/IhC0N7aRc0a2l+rqKODZtmhqcVacMZ0Jmhd9pOaoPuxjpqge7KOOnqJwJKjBuuoH3h7vZ8WLxSPLkuYzAAAAAAAAAAAALh19z9u+sXAMdfkrQAAAABJRU5ErkJggg==" alt="Bird Cut" style="width:100%;height:auto;filter:drop-shadow(0 0 20px rgba(90,107,47,.3))"></div>
  <h1>Bird Cut</h1>
  <p class="sub">O nosso site está quase pronto.<br>Em breve, precisão para a sua barba.</p>
  <form class="form" method="POST" action="/auth">
    <input class="input" type="password" name="password" placeholder="Insira a palavra-passe" autocomplete="off" autofocus>
    <button class="btn" type="submit">Entrar</button>
    <div class="error" id="error"></div>
  </form>
</div>
<div class="footer">© 2026 Bird Cut · Created for Creators</div>
<script>
  if (location.search.includes('error=1')) document.getElementById('error').textContent = 'Palavra-passe incorreta.';
</script>
</body>
</html>`;

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Permitir API routes sem auth (Stripe Checkout)
  if (url.pathname.startsWith('/create-checkout-session') || url.pathname.startsWith('/session/')) {
    return context.next();
  }

  // Se é POST para /auth, processar login
  if (context.request.method === 'POST' && url.pathname === '/auth') {
    const form = await context.request.formData();
    const password = form.get('password');
    if (password === PASS) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': `${COOKIE}=${PASS}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
        },
      });
    }
    return new Response(LOGIN_HTML.replace('Palavra-passe incorreta.', 'Palavra-passe incorreta.'), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Verificar cookie
  const cookie = context.request.headers.get('Cookie') || '';
  const hasAuth = cookie.split(';').some(c => c.trim() === `${COOKIE}=${PASS}`);

  if (hasAuth) {
    return context.next();
  }

  // Mostrar página de password
  return new Response(LOGIN_HTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
