// Utilitários do histórico. Desde o Módulo 2 os dados ficam no servidor;
// o localStorage só é lido uma vez, para migrar conversas antigas.
const LEGACY_KEY = "robot9000:data:v1";

export function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function loadLegacy() {
  try {
    const data = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
    if (!data) return null;
    return {
      conversations: Array.isArray(data.conversations) ? data.conversations : [],
      folders: Array.isArray(data.folders) ? data.folders : [],
    };
  } catch {
    return null;
  }
}

export function clearLegacy() {
  try { localStorage.removeItem(LEGACY_KEY); } catch {}
}

export function makeTitle(prompt) {
  const clean = prompt.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? clean.slice(0, 48) + "…" : clean || "Nova conversa";
}

// Histórico que cada modelo enxerga: perguntas do usuário + só as próprias respostas
export function buildHistory(turns, modelId, prompt) {
  const msgs = [];
  for (const t of turns) {
    msgs.push({ role: "user", content: t.prompt });
    const r = t.responses.find((x) => x.modelId === modelId && x.status === "done" && !x.simulated);
    if (r) msgs.push({ role: "assistant", content: r.content || (r.images?.length ? "(imagem gerada)" : ""), ...(r.images?.length ? { images: r.images } : {}) });
  }
  msgs.push({ role: "user", content: prompt });
  return msgs.slice(-40);
}
