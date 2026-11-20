import { NextResponse } from "next/server";
import { generate, getAdapter } from "@/lib/providers";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const maxDuration = 120;

const MAX_MESSAGES = 60;
const MAX_CHARS = 20_000;

function bad(error, status = 400) {
  return NextResponse.json({ error }, { status });
}

// Gera UMA resposta de UM modelo. No modo comparação o navegador chama
// esta rota uma vez por modelo, então cada resposta é independente.
export async function POST(req) {
  const limit = rateLimit(clientIp(req));
  if (!limit.ok) return bad(`Muitas requisições. Tente de novo em ${limit.retryAfter}s.`, 429);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad("Corpo da requisição inválido");

  const adapter = getAdapter(body.modelId);
  if (!adapter) return bad("Modelo desconhecido");

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES)
    return bad("Histórico de mensagens inválido");
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string")
      return bad("Formato de mensagem inválido");
    if (m.content.length > MAX_CHARS) return bad("Mensagem longa demais");
  }
  if (messages[messages.length - 1].role !== "user" || !messages[messages.length - 1].content.trim())
    return bad("A última mensagem precisa ser do usuário");

  try {
    const result = await generate(adapter, messages.map((m) => ({ role: m.role, content: m.content })));
    return NextResponse.json(result);
  } catch (e) {
    // Não repassa detalhes internos além da mensagem do provedor
    return bad(e instanceof Error ? e.message : "Falha ao gerar resposta", 502);
  }
}
