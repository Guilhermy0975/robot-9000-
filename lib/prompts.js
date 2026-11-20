// Validação compartilhada dos prompts (somente servidor)
export const MAX_PROMPTS = 300;

export function cleanPrompt(b) {
  const title = typeof b?.title === "string" ? b.title.trim().slice(0, 80) : "";
  const content = typeof b?.content === "string" ? b.content.trim().slice(0, 8000) : "";
  const category = (typeof b?.category === "string" ? b.category.trim().slice(0, 30) : "") || "Geral";
  if (!title) return { error: "Dê um título ao prompt" };
  if (!content) return { error: "Escreva o texto do prompt" };
  return { data: { title, content, category, favorite: !!b?.favorite } };
}

export const toClient = (p) => ({
  id: p.id, title: p.title, content: p.content, category: p.category,
  favorite: p.favorite, updatedAt: p.updatedAt.getTime(),
});
