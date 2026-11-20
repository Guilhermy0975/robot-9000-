// Persistência local (navegador). Será substituída por PostgreSQL no Módulo 2,
// mantendo o mesmo formato de dados (veja prisma/schema.prisma).
const KEY = "robot9000:data:v1";
const EMPTY = { conversations: [], folders: [] };

export function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function loadData() {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const data = JSON.parse(raw);
    const conversations = Array.isArray(data.conversations) ? data.conversations : [];
    // Respostas que estavam carregando quando a página fechou viram erro
    for (const c of conversations)
      for (const t of c.turns ?? [])
        for (const r of t.responses ?? [])
          if (r.status === "loading") Object.assign(r, { status: "error", error: "Interrompida ao recarregar a página." });
    return { conversations, folders: Array.isArray(data.folders) ? data.folders : [] };
  } catch {
    return EMPTY;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false; // armazenamento cheio ou bloqueado
  }
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
    if (r) msgs.push({ role: "assistant", content: r.content });
  }
  msgs.push({ role: "user", content: prompt });
  return msgs.slice(-40);
}
