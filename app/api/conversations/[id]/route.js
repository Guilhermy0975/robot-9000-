import { db } from "@/lib/db";
import { fail, getUserId, json, unauthorized } from "@/lib/auth";

const MAX_BYTES = 1_000_000;
const ID_RE = /^[\w-]{6,64}$/;

// Limpa o formato vindo do navegador (nunca confia no que chega)
function cleanTurns(turns) {
  if (!Array.isArray(turns)) return null;
  return turns.slice(-300).map((t) => ({
    id: String(t?.id ?? "").slice(0, 64),
    prompt: String(t?.prompt ?? "").slice(0, 20000),
    createdAt: Number(t?.createdAt) || Date.now(),
    responses: (Array.isArray(t?.responses) ? t.responses : []).slice(0, 4).map((r) => ({
      modelId: String(r?.modelId ?? "").slice(0, 32),
      status: r?.status === "done" ? "done" : "error",
      content: String(r?.content ?? "").slice(0, 60000),
      error: r?.error ? String(r.error).slice(0, 500) : null,
      simulated: !!r?.simulated,
      model: r?.model ? String(r.model).slice(0, 80) : null,
      tokens: r?.tokens
        ? { input: Number.isFinite(+r.tokens.input) ? Math.max(0, Math.round(+r.tokens.input)) : null,
            output: Number.isFinite(+r.tokens.output) ? Math.max(0, Math.round(+r.tokens.output)) : null }
        : null,
    })),
  }));
}

// Cria ou atualiza a conversa inteira (salvamento automático)
export async function PUT(req, { params }) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  if (!ID_RE.test(id)) return fail("ID inválido");

  const raw = await req.text();
  if (raw.length > MAX_BYTES) return fail("Conversa grande demais", 413);
  let body;
  try { body = JSON.parse(raw); } catch { return fail("JSON inválido"); }

  const turns = cleanTurns(body.turns);
  if (!turns) return fail("Formato inválido");

  const existing = await db.conversation.findUnique({ where: { id }, select: { userId: true } });
  if (existing && existing.userId !== userId) return fail("Sem permissão", 403);

  let folderId = typeof body.folderId === "string" ? body.folderId : null;
  if (folderId && !(await db.folder.findFirst({ where: { id: folderId, userId } }))) folderId = null;

  const data = {
    title: String(body.title ?? "Nova conversa").trim().slice(0, 80) || "Nova conversa",
    favorite: !!body.favorite,
    folderId,
    turns,
    updatedAt: new Date(Number(body.updatedAt) || Date.now()),
  };

  if (existing) await db.conversation.update({ where: { id }, data });
  else
    await db.conversation.create({
      data: { ...data, id, userId, createdAt: new Date(Number(body.createdAt) || Date.now()) },
    });

  return json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  await db.conversation.deleteMany({ where: { id, userId } });
  return json({ ok: true });
}
