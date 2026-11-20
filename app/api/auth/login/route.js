import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { fail, json } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { SESSION_COOKIE, createToken, cookieOptions } from "@/lib/session";

export async function POST(req) {
  if (!rateLimit("auth:" + clientIp(req), { limit: 10 }).ok) return fail("Muitas tentativas. Espere um minuto.", 429);

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return fail("Informe e-mail e senha");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return fail("E-mail ou senha incorretos", 401);

  const res = json({ id: user.id, name: user.name, email: user.email });
  res.cookies.set(SESSION_COOKIE, await createToken(user.id), cookieOptions);
  return res;
}
