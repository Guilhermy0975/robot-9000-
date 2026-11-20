import { db } from "@/lib/db";
import { getUserId, json, unauthorized } from "@/lib/auth";
import { getUsage } from "@/lib/usage";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } });
  if (!user) return unauthorized();
  return json({ user, quota: await getUsage(userId) });
}
