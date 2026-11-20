// Criptografia AES-256-GCM das chaves de API dos usuários (somente servidor)
import crypto from "node:crypto";

function key() {
  const raw = process.env.ENCRYPTION_KEY;
  if (raw) {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
    return crypto.createHash("sha256").update(raw).digest();
  }
  // Sem ENCRYPTION_KEY, deriva da URL do banco (também secreta)
  if (!process.env.DATABASE_URL) throw new Error("Servidor sem DATABASE_URL");
  return crypto.createHash("sha256").update("robot9000-keys:" + process.env.DATABASE_URL).digest();
}

export function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), enc].map((b) => b.toString("base64")).join(".");
}

export function decrypt(payload) {
  const [iv, tag, enc] = payload.split(".").map((p) => Buffer.from(p, "base64"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function hintOf(k) {
  return k.length <= 10 ? "••••" : `${k.slice(0, 4)}••••${k.slice(-4)}`;
}
