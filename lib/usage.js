// Limite diário de respostas de IA por usuário (padrão: 30 por dia)
import { db } from "./db";

export const DAILY_LIMIT = Math.max(1, parseInt(process.env.DAILY_LIMIT || "30", 10) || 30);

// Dia no fuso de Brasília, para o limite "virar" à meia-noite daqui
export function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export async function getUsage(userId) {
  const row = await db.usage.findUnique({ where: { userId_day: { userId, day: today() } } });
  const used = row?.count ?? 0;
  return { used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used) };
}

// Reserva 1 uso de forma atômica; devolve false se o limite já acabou
export async function consume(userId) {
  const day = today();
  await db.usage.upsert({
    where: { userId_day: { userId, day } },
    create: { userId, day, count: 0 },
    update: {},
  });
  const res = await db.usage.updateMany({
    where: { userId, day, count: { lt: DAILY_LIMIT } },
    data: { count: { increment: 1 } },
  });
  return res.count === 1;
}

// Devolve o uso quando a IA falhou (o usuário não perde mensagem por erro)
export async function refund(userId) {
  await db.usage.updateMany({
    where: { userId, day: today(), count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
}
