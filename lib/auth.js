import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "./session";

export async function getUserId() {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(error, status = 400) {
  return NextResponse.json({ error }, { status });
}

export const unauthorized = () => fail("Faça login para continuar", 401);
