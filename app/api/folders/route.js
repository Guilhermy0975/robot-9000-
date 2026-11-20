import { db } from "@/lib/db";
import { fail, getUserId, json, unauthorized } from "@/lib/auth";

// Substitui a lista de pastas do usuário pela enviada
export async function PUT(req) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.folders) || body.folders.length > 100) return fail("Formato inválido");

  const folders = body.folders
    .filter((f) => typeof f?.id === "string" && /^[\w-]{6,64}$/.test(f.id) && typeof f?.name === "string")
    .map((f) => ({ id: f.id, name: f.name.trim().slice(0, 40) || "Pasta" }));
  const ids = folders.map((f) => f.id);

  // Não deixa "roubar" pasta de outro usuário pelo ID
  const taken = await db.folder.findMany({ where: { id: { in: ids }, NOT: { userId } }, select: { id: true } });
  if (taken.length) return fail("Sem permissão", 403);

  await db.$transaction([
    db.conversation.updateMany({ where: { userId, folderId: { notIn: ids } }, data: { folderId: null } }),
    db.folder.deleteMany({ where: { userId, id: { notIn: ids } } }),
    ...folders.map((f) =>
      db.folder.upsert({ where: { id: f.id }, create: { ...f, userId }, update: { name: f.name } })
    ),
  ]);
  return json({ ok: true });
}
