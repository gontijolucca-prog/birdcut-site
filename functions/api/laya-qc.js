export async function onRequestPost(context) {
  const LAYA_URL = "http://127.0.0.1:8788/predict"; // só funciona localmente, em Pages falha aberto
  try {
    const body = await context.request.json();
    const { texto, tipo } = body; // tipo: copy | produto | imagem_desc
    if (!texto) return json({ error: "texto required" }, 400);

    // Tenta Laya local (em dev). Em produção Pages, falha aberto e devolve ok
    let answers = null;
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch(LAYA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: { texto: texto.slice(0, 2000) },
          questions: {
            vende: { type: "noul", instructions: "Esta copy/produto vende? Tem apelo comercial claro?" },
            premium: { type: "noul", instructions: "Parece premium e de qualidade?" },
            erro: { type: "noul", instructions: "Contém erro, preço errado ou claim proibido?" },
          },
        }),
        signal: ctrl.signal,
      });
      if (r.ok) {
        const j = await r.json();
        answers = j.answers;
      }
    } catch (e) {
      // Pages sem Laya -> falha aberto
    }

    if (!answers) return json({ ok: true, offline: true, note: "Laya offline em produção — falha aberto" });

    const vende = answers.vende?.noul ?? 0.5;
    const premium = answers.premium?.noul ?? 0.5;
    const erro = answers.erro?.noul ?? 0;

    const qc = {
      vende: vende > 0.6,
      premium: premium > 0.55,
      sem_erro: erro < 0.4,
      scores: { vende, premium, erro },
      verdict: erro > 0.6 ? "FAIL" : vende < 0.4 ? "REVISAR" : "PASS",
    };
    return json({ ok: qc.verdict !== "FAIL", qc, answers });
  } catch (e) {
    return json({ ok: true, offline: true, error: String(e).slice(0, 200) });
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
