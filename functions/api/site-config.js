const API_BASE = 'https://media.pontofinal.site/bcapi';

export async function onRequestGet(context){
  // tenta KV primeiro se existir
  try{
    if(context.env && context.env.BC_SITE_KV){
      const v = await context.env.BC_SITE_KV.get('site_config', 'json');
      if(v) return json(v);
    }
  }catch(e){}
  // fallback: serve ficheiro estático data/site.json via ASSETS se disponível, senão fetch
  try{
    // Cloudflare Pages ASSETS binding (se existir)
    if(context.env && context.env.ASSETS){
      const req = new Request(new URL('/data/site.json', context.request.url).toString());
      const res = await context.env.ASSETS.fetch(req);
      if(res.ok) return new Response(res.body, { headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'} });
    }
  }catch(e){}
  // último fallback: proxy para ficheiro via fetch interno (não deve chegar aqui)
  return json({ error:'site-config não encontrado' }, 404);
}

export async function onRequestPut(context){
  const auth = context.request.headers.get('authorization') || '';
  if(!auth.startsWith('Bearer ')) return json({ error:'Não autenticado' }, 401);
  const token = auth.slice(7);
  // verifica admin no backend
  try{
    const check = await fetch(API_BASE + '/api/profile', { headers:{ 'Authorization':'Bearer '+token }});
    if(!check.ok) return json({ error:'Token inválido' }, 401);
    const user = await check.json();
    const allow = ['contacto@birdcut.pt','admin@birdcut.pt','gontijolucca@gmail.com','lucca@birdcut.pt'];
    const isAdmin = user && (user.role==='admin' || allow.includes((user.email||'').toLowerCase()));
    if(!isAdmin) return json({ error:'Acesso restrito a administradores' }, 403);
    const body = await context.request.json();
    // tenta guardar em KV
    if(context.env && context.env.BC_SITE_KV){
      await context.env.BC_SITE_KV.put('site_config', JSON.stringify(body));
      return json({ ok:true, saved:'kv' });
    }
    // sem KV: retorna ok mock — o admin guarda em localStorage como preview
    return json({ ok:true, saved:'mock', note:'Sem KV configurado — a guardar em localStorage preview. Configura KV BC_SITE_KV para persistir.' });
  }catch(e){
    return json({ error:e.message || 'Erro' }, 500);
  }
}

export async function onRequestOptions(){
  return new Response(null, { status:204, headers:{
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods':'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type,Authorization'
  }});
}

function json(obj, status=200){
  return new Response(JSON.stringify(obj), { status, headers:{ 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' }});
}
