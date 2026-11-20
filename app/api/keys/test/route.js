import { fail, getUserId, json, unauthorized } from "@/lib/auth";
import { getAdapter, resolveSource, generate } from "@/lib/providers";
import { loadUserKey } from "@/lib/userKeys";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 30;

// Faz uma chamada mínima com a chave do usuário para ver se ela funciona
export async function POST(req) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit("keytest:" + userId, { limit: 6 }).ok) return fail("Espere um pouco antes de testar de novo.", 429);

  const b = await req.json().catch(() => null);
  const adapter = getAdapter(b?.provider);
  if (!adapter) return fail("Provedor inválido");

  const userKey = await loadUserKey(userId, adapter.id);
  if (!userKey) return fail("Salve uma chave antes de testar");

  try {
    const resolved = { ...resolveSource(adapter, userKey), maxTokens: 20, system: "" };
    const r = await generate(adapter, [{ role: "user", content: "Responda apenas com a palavra: ok" }], resolved);
    return json({ ok: true, model: r.model, sample: r.content.slice(0, 60) });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "A chave não funcionou", 400);
  }
}
