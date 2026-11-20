// Sessão em cookie assinado (JWT). Funciona no servidor e no middleware.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "r9k_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

let cached;
async function secret() {
  if (cached) return cached;
  let raw = process.env.AUTH_SECRET;
  // Sem AUTH_SECRET, deriva um segredo da URL do banco (que também é secreta)
  if (!raw && process.env.DATABASE_URL) {
    const bytes = new TextEncoder().encode("robot9000-session:" + process.env.DATABASE_URL);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    raw = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  if (!raw) throw new Error("Configure DATABASE_URL (ou AUTH_SECRET) no servidor");
  cached = new TextEncoder().encode(raw);
  return cached;
}

export async function createToken(userId) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(await secret());
}

export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
