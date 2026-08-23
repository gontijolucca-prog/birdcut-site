const PASS = 'mt6:26';
const COOKIE = 'bc_auth';

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bird Cut — Em Desenvolvimento</title>
<link rel="icon" type="image/png" href="/img/favicon-bw.png?v=2">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#000000;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.bg{position:fixed;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(255,255,255,.07),transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(255,255,255,.04),transparent 50%);pointer-events:none}
.card{position:relative;z-index:2;text-align:center;max-width:440px;padding:3.5rem 3rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(20px);border-radius:4px}
.logo{width:64px;height:64px;margin:0 auto 2rem;opacity:.95}
.logo svg{width:100%;height:100%}
h1{font-family:'Playfair Display',serif;font-weight:700;font-size:1.7rem;letter-spacing:.02em;margin-bottom:.6rem;color:#fff}
.sub{color:rgba(255,255,255,.6);font-weight:400;font-size:.95rem;margin-bottom:2.5rem;line-height:1.6}
.form{display:flex;flex-direction:column;gap:1rem}
.input{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);padding:1rem 1.2rem;color:#fff;font-family:'Inter',sans-serif;font-size:1rem;letter-spacing:.12em;text-align:center;border-radius:2px;outline:none;transition:border-color .3s}
.input::placeholder{color:rgba(255,255,255,.35);letter-spacing:.1em}
.input:focus{border-color:rgba(255,255,255,.45)}
.btn{background:#fff;color:#000;border:1px solid #fff;padding:1rem;font-family:'Inter',sans-serif;font-weight:600;font-size:.85rem;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all .3s}
.btn:hover{background:#000;color:#fff;border-color:#fff;transform:translateY(-1px)}
.error{color:#ff8a8a;font-size:.85rem;margin-top:.5rem;min-height:1.2em}
.footer{position:fixed;bottom:2rem;left:0;right:0;text-align:center;color:rgba(255,255,255,.35);font-size:.75rem;letter-spacing:.1em}
.bird{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);opacity:.05;pointer-events:none}
.bird svg{width:min(80vw,600px);height:auto}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.card{animation:fadeUp .8s ease both}
@keyframes pulse{0%,100%{opacity:.05}50%{opacity:.09}}
.bird{animation:pulse 4s ease-in-out infinite}
</style>
</head>
<body>
<div class="bg"></div>
<div class="bird">
  <svg viewBox="0 0 169 185" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M85 0C38 0 0 38 0 85c0 22 9 42 23 57l62 43c2 1 5 1 7 0l62-43c14-15 23-35 23-57C169 38 131 0 85 0z" fill="#ffffff"/>
  </svg>
</div>
<div class="card">
  <div class="logo"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD/ElEQVR4nL1WMUzrRhjOnR1jH4IaAU1bGpI8SouYKqoyICEyRGJhQAKZATGA2BBiQGJmYWBmZwSJPYiBIUPTBr0nVYAU8VRI1CqOGlqiF1tQ6ti+6o98lftqx89Q+klWzr67//vu+/+7C4qEBKWUtutHCKEw8dB/QfocMfilyD90LnoJ4jBuYD9ygG3btle/3/d28FsQChp4fHxcODg4EKA9NTWlLy0tjYuiKIEIjHFgCkPVBXWt/O7u7i6bzf4Qj8dpIpGgg4ODNJlM0unp6beVSkWFcZZlWfQJ8HWAujo3NjbyFxcXn9brdVnTtI8c9ZZt20IqlSpls9kYOAErCr31XOOxFzlA1/VouVxOEUIebdvmwHHTNAWMcbNcLr/a3d19AykAF8Ax+DVN02Tv7QS4uZAXObzXarWaoijG7e1tLwi+v7/vdNRTjDHk38rlcrV4PB73IgEREIfjOK6dE8hLACuwarVaXV1d1VRV/bjRaMiUUgQPx3GQe252dja/vb09WqlUaqqqNgzDsPv6+qRUKvUJwB0rlAAAWAnqQcTi4uLjzc3Nq4gL4ASI6e7ufqdpmsw4IBQh5H5sbOzt8vKymclkxv1EtAS0O3CYiKurq5/W1tbQ9fX1FwihVjy3CGiDK44A5OZbX1/PbW5upv1EYD9yJyhnGIYxMjIyPDMzUwHDIP+sH8hAhCOWgwd4nDoxYdfs7e2lC4XCuV8acCQAPM/zUN2FQgFqoEXq7mfvQMrEwDfTNHnnW+T09PSdX3zcjhyIQfnJycnrs7Ozr51d96+qZvazNmiGB9Ily3J9YmKCwMTQArBj2/7+fidbnRdgR4AJQA6ksVislkgkfunv7/8d+o+OjjzJAbxfBysaVVWr5+fnX1kWxEZ/C2aCJEn6Y2tr63VPTw+v67pVr9fty8tLqVgsfq5pWrcoio+KonB+5wEfJKBYLFYsy/oMVue23xGAhoaGfl5ZWZl6f75hGH/quq5LkiQRQr4N7QCDrutNd4EBWJVjjOnCwsJvlmV9CfXCVglWCYLQ0dvb2xF0GPFBZwHHcf+oerb3BUFoyrLcmJ+f/waCC4IguC8Zd8x2JyH2I2aTRkdHY7ZttwJDZcO8rq4urdlsRicnJ0uEkE7Izfs3Irslg25K3E4AWDc8PDw0Nzf3HaWUt22bF0XxYWBg4FfLsoRMJhONPBOINbzSwL7BTbuzs/N9qVTqTCaTD4eHh+OEkId8Pt9BCCFsxaGIvcbTAGia1lAU5cd0Ol3K5XJvnvqvyNMBgF8xMiLmRjQahT8muFWNIVcOcM9BXmRhAz6VHOB5R/9f5J4CXkqEX0wUNPG5KXnyORD5wADPnRs6eJAjYQX/BUc49+1ZlfkwAAAAAElFTkSuQmCC" alt="Bird Cut" style="width:100%;height:auto;filter:drop-shadow(0 0 20px rgba(255,255,255,.25))"></div>
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

  // Permitir assets estáticos sem auth (para a página de login carregar favicon/logo)
  if (url.pathname.startsWith('/img/') || url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/') || url.pathname === '/favicon.ico') {
    return context.next();
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
