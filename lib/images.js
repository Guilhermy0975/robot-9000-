import { db } from "./db";

export const IMAGE_ID_RE = /^[a-z0-9]{10,40}$/i;
const MAX_IMAGE_BYTES = 8_000_000;

// Salva as imagens geradas e devolve os ids
export async function saveImages(userId, images) {
  const ids = [];
  for (const img of images.slice(0, 4)) {
    const buf = Buffer.from(img.data, "base64");
    if (!buf.length || buf.length > MAX_IMAGE_BYTES) continue;
    const mime = /^image\/(png|jpeg|webp)$/.test(img.mime) ? img.mime : "image/png";
    const row = await db.generatedImage.create({ data: { userId, mime, data: buf }, select: { id: true } });
    ids.push(row.id);
  }
  return ids;
}

// Carrega uma imagem do usuário em base64 (para mandar de volta ao modelo)
export async function loadImage(userId, id) {
  if (!IMAGE_ID_RE.test(String(id))) return null;
  const img = await db.generatedImage.findFirst({ where: { id, userId } });
  return img ? { mime: img.mime, data: Buffer.from(img.data).toString("base64") } : null;
}

// Apaga as imagens citadas numa lista de turnos (ao excluir uma conversa)
export async function deleteImagesOf(userId, turns) {
  const ids = [];
  for (const t of Array.isArray(turns) ? turns : [])
    for (const r of Array.isArray(t?.responses) ? t.responses : [])
      for (const id of Array.isArray(r?.images) ? r.images : []) if (IMAGE_ID_RE.test(String(id))) ids.push(id);
  if (ids.length) await db.generatedImage.deleteMany({ where: { userId, id: { in: ids } } });
}
