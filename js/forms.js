/* Bird Cut — formulários reais: contacto e newsletter (API /api/contact, /api/newsletter) */
(function(){
  'use strict';
  async function post(url, body){
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const txt = await r.text();
    let data = {};
    try { data = txt ? JSON.parse(txt) : {}; } catch(e) { data = {}; }
    if(!r.ok) throw new Error(data.error || 'Não foi possível enviar agora. Tenta novamente.');
    return data;
  }
  function note(el, text, ok){
    if(!el) return;
    el.textContent = text;
    el.style.color = ok ? '#1a7a2e' : '#c62828';
    el.hidden = false;
  }

  // Contacto
  document.querySelectorAll('form[data-contact]').forEach(function(form){
    const msg = form.querySelector('[data-form-msg]');
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const name = form.querySelector('[name=name]');
      const email = form.querySelector('[name=email]');
      const message = form.querySelector('[name=message]');
      if(!name.value.trim() || !email.value.trim() || !message.value.trim()){ note(msg,'Preenche nome, e-mail e mensagem.',false); return; }
      if(btn){ btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'A enviar…'; }
      try{
        await post('/api/contact', { name: name.value.trim(), email: email.value.trim(), message: message.value.trim() });
        note(msg,'✓ Mensagem enviada. Respondemos para o teu e-mail.',true);
        form.reset();
      }catch(err){ note(msg, err.message, false); }
      finally{ if(btn){ btn.disabled = false; btn.textContent = btn.dataset.label || 'Enviar Mensagem'; } }
    });
  });

  // Newsletter
  document.querySelectorAll('form[data-newsletter]').forEach(function(form){
    const msg = form.parentElement.querySelector('[data-newsletter-msg]') || form.querySelector('[data-form-msg]');
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const input = form.querySelector('input[type=email]');
      const btn = form.querySelector('button[type=submit]');
      if(!input.value.trim()){ note(msg,'Escreve o teu e-mail.',false); return; }
      if(btn){ btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'A subscrever…'; }
      try{
        const r = await post('/api/newsletter', { email: input.value.trim() });
        note(msg, r.already ? '✓ Já estavas subscrito. Obrigado!' : '✓ Subscrito. Vais receber as novidades da Bird Cut.', true);
        form.reset();
      }catch(err){ note(msg, err.message, false); }
      finally{ if(btn){ btn.disabled = false; btn.textContent = btn.dataset.label || 'Subscrever'; } }
    });
  });
})();
