import { db } from "@/lib/db";
import { fail, getUserId, json, unauthorized } from "@/lib/auth";
import { cleanPrompt, toClient, MAX_PROMPTS } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const prompts = await db.prompt.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: MAX_PROMPTS });
  return json(prompts.map(toClient));
}

export async function POST(req) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { data, error } = cleanPrompt(await req.json().catch(() => null));
  if (error) return fail(error);
  if ((await db.prompt.count({ where: { userId } })) >= MAX_PROMPTS) return fail("Limite de prompts atingido");
  const created = await db.prompt.create({ data: { ...data, userId } });
  return json(toClient(created));
}
