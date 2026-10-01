// BirdCut Laya QC — valida copy invisível antes de publicar
// Uso: const qc = await BC_layaQC("texto da copy");
// Falha aberto: se offline, devolve {ok:true, offline:true}
async function BC_layaQC(texto) {
  try {
    const r = await fetch("/api/laya-qc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: texto.slice(0, 2000) }),
    });
    if (!r.ok) return { ok: true, offline: true };
    return await r.json();
  } catch {
    return { ok: true, offline: true };
  }
}
window.BC_layaQC = BC_layaQC;
