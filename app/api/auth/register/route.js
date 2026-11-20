import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { fail, json } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { SESSION_COOKIE, createToken, cookieOptions } from "@/lib/session";

export async function POST(req) {
  if (!rateLimit("auth:" + clientIp(req), { limit: 10 }).ok) return fail("Muitas tentativas. Espere um minuto.", 429);

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2) return fail("Informe seu nome");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return fail("E-mail inválido");
  if (password.length < 8 || password.length > 200) return fail("A senha precisa ter pelo menos 8 caracteres");

  if (await db.user.findUnique({ where: { email } })) return fail("Este e-mail já tem conta. Faça login.", 409);

  const user = await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 11) },
  });

  const res = json({ id: user.id, name: user.name, email: user.email });
  res.cookies.set(SESSION_COOKIE, await createToken(user.id), cookieOptions);
  return res;
}
