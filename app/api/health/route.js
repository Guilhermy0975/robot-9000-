import { NextResponse } from "next/server";
import { ADAPTERS, serverKeyFor } from "@/lib/providers";

export const dynamic = "force-dynamic";

// Diagnóstico público: diz SÓ se cada chave do app existe (sim/não), nunca o valor
export function GET() {
  const keys = Object.fromEntries(ADAPTERS.map((a) => [a.envKey, !!serverKeyFor(a)]));
  // Nomes parecidos que podem ter sido digitados errado (ex.: espaço, minúscula)
  const similar = Object.keys(process.env).filter(
    (k) => /groq|google|openai|anthropic|api_?key/i.test(k) && !(k in keys)
  );
  return NextResponse.json({
    ok: true,
    projeto: process.env.VERCEL_PROJECT_PRODUCTION_URL || null,
    ambiente: process.env.VERCEL_ENV || "local",
    versao: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7) || null,
    banco: !!process.env.DATABASE_URL,
    chaves_do_app: keys,
    nomes_parecidos: similar,
  });
}
