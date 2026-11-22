import { db } from "@/lib/db";
import { fail, getUserId, unauthorized } from "@/lib/auth";

// Entrega uma imagem gerada. Só o dono da imagem pode ver.
export async function GET(_req, { params }) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const { id } = await params;
  const img = await db.generatedImage.findFirst({ where: { id: String(id).slice(0, 64), userId } });
  if (!img) return fail("Imagem não encontrada", 404);
  return new Response(img.data, {
    headers: {
      "content-type": img.mime,
      "cache-control": "private, max-age=31536000, immutable",
    },
  });
}
