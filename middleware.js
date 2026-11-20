import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";

export async function middleware(req) {
  const userId = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = req.nextUrl.pathname.startsWith("/login");
  if (!userId && !isLogin) return NextResponse.redirect(new URL("/login", req.url));
  if (userId && isLogin) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

// Só as páginas; as rotas /api verificam a sessão por conta própria
export const config = { matcher: ["/", "/login"] };
