import { db } from "@/lib/db";
import { fail, getUserId, json, unauthorized } from "@/lib/auth";
import { cleanPrompt, toClient } from "@/lib/prompts";

export async function PUT(req, { params }) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  if (!(await db.prompt.findFirst({ where: { id, userId } }))) return fail("Prompt não encontrado", 404);
  const { data, error } = cleanPrompt(await req.json().catch(() => null));
  if (error) return fail(error);
  const updated = await db.prompt.update({ where: { id }, data });
  return json(toClient(updated));
}

export async function DELETE(_req, { params }) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  await db.prompt.deleteMany({ where: { id, userId } });
  return json({ ok: true });
}
