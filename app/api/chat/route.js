import { generate, getAdapter, keyIdFor, resolveSource } from "@/lib/providers";
import { rateLimit } from "@/lib/rateLimit";
import { fail, getUserId, json, unauthorized } from "@/lib/auth";
import { consume, refund, getUsage } from "@/lib/usage";
import { loadUserKey } from "@/lib/userKeys";
import { IMAGE_ID_RE, loadImage, saveImages } from "@/lib/images";

export const maxDuration = 60; // imagens podem levar uns 20–40 s

const MAX_MESSAGES = 60;
const MAX_CHARS = 20_000;

// Gera UMA resposta de UM modelo. No modo comparação o navegador chama
// esta rota uma vez por modelo, então cada resposta é independente.
// Ordem da chave: a do próprio usuário → a do app → resposta simulada.
// Só a chave do app gasta o limite diário.
export async function POST(req) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const limit = rateLimit("chat:" + userId, { limit: 20 });
  if (!limit.ok) return fail(`Calma! Tente de novo em ${limit.retryAfter}s.`, 429);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Corpo da requisição inválido");

  const adapter = getAdapter(body.modelId);
  if (!adapter) return fail("Modelo desconhecido");

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES)
    return fail("Histórico de mensagens inválido");
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string")
      return fail("Formato de mensagem inválido");
    if (m.content.length > MAX_CHARS) return fail("Mensagem longa demais");
  }
  if (messages[messages.length - 1].role !== "user" || !messages[messages.length - 1].content.trim())
    return fail("A última mensagem precisa ser do usuário");

  const resolved = resolveSource(adapter, await loadUserKey(userId, keyIdFor(adapter)));
  const usesAppKey = resolved.source === "server";

  if (usesAppKey && !(await consume(userId))) {
    return fail("Você usou todas as mensagens grátis de hoje. Conecte a sua própria chave em Configurações para continuar.", 429);
  }

  try {
    // Modelos de imagem: manda junto a última imagem gerada, para poder editá-la
    const extra = {};
    if (adapter.image && resolved.source !== "simulated") {
      const lastId = [...messages].reverse().flatMap((m) => (Array.isArray(m.images) ? m.images : [])).find((id) => IMAGE_ID_RE.test(String(id)));
      if (lastId) extra.inputImage = await loadImage(userId, lastId);
    }
    const { images, ...result } = await generate(adapter, messages.map((m) => ({ role: m.role, content: m.content })), resolved, extra);
    const imageIds = images?.length ? await saveImages(userId, images) : [];
    return json({ ...result, images: imageIds, source: resolved.source, quota: await getUsage(userId) });
  } catch (e) {
    if (usesAppKey) await refund(userId);
    const msg = e instanceof Error ? e.message : "Falha ao gerar resposta";
    return fail(resolved.source === "user" ? `Erro com a sua chave: ${msg}` : msg, 502);
  }
}
