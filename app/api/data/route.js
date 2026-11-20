import { db } from "@/lib/db";
import { getUserId, json, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Tudo do usuário logado: conversas e pastas
export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const [conversations, folders] = await Promise.all([
    db.conversation.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 300 }),
    db.folder.findMany({ where: { userId } }),
  ]);

  return json({
    conversations: conversations.map((c) => ({
      id: c.id,
      title: c.title,
      favorite: c.favorite,
      folderId: c.folderId,
      turns: Array.isArray(c.turns) ? c.turns : [],
      createdAt: c.createdAt.getTime(),
      updatedAt: c.updatedAt.getTime(),
    })),
    folders: folders.map((f) => ({ id: f.id, name: f.name })),
  });
}
