import { db } from "@/lib/db";
import { getUserId, json, unauthorized } from "@/lib/auth";
import { ADAPTERS } from "@/lib/providers";
import { estimateCost, PRICES } from "@/lib/pricing";
import { getUsage } from "@/lib/usage";

export const dynamic = "force-dynamic";

const DAYS = 14;
const dayOf = (ms) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(ms));
const approxTokens = (text) => Math.ceil((text?.length ?? 0) / 4);

// Estatísticas calculadas a partir das conversas do próprio usuário
export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const conversations = await db.conversation.findMany({ where: { userId }, select: { turns: true } });

  const perModel = Object.fromEntries(
    ADAPTERS.map((a) => [a.id, {
      id: a.id, label: a.label, provider: a.provider,
      responses: 0, errors: 0, simulated: 0,
      realInput: 0, realOutput: 0, estInput: 0, estOutput: 0,
    }])
  );

  const now = Date.now();
  const days = [];
  for (let i = DAYS - 1; i >= 0; i--) days.push({ day: dayOf(now - i * 86_400_000), prompts: 0, responses: 0 });
  const dayIndex = new Map(days.map((d, i) => [d.day, i]));

  let prompts = 0;
  let responses = 0;

  for (const c of conversations) {
    for (const t of Array.isArray(c.turns) ? c.turns : []) {
      prompts++;
      const di = dayIndex.get(dayOf(t.createdAt || now));
      if (di != null) days[di].prompts++;

      for (const r of t.responses ?? []) {
        const m = perModel[r.modelId];
        if (!m) continue;
        if (r.status === "error") { m.errors++; continue; }
        if (r.simulated) { m.simulated++; continue; }
        m.responses++;
        responses++;
        if (di != null) days[di].responses++;
        // Valor real quando o provedor informou; senão, estimativa (~4 letras por token)
        if (r.tokens?.input != null) m.realInput += r.tokens.input;
        else m.estInput += approxTokens(t.prompt);
        if (r.tokens?.output != null) m.realOutput += r.tokens.output;
        else m.estOutput += approxTokens(r.content);
      }
    }
  }

  const models = Object.values(perModel).map((m) => {
    const input = m.realInput + m.estInput;
    const output = m.realOutput + m.estOutput;
    return {
      ...m,
      tokens: input + output,
      realTokens: m.realInput + m.realOutput,
      estimatedTokens: m.estInput + m.estOutput,
      cost: estimateCost(m.id, input, output),
      priceRef: PRICES[m.id]?.ref ?? null,
    };
  });

  return json({
    totals: {
      conversations: conversations.length,
      prompts,
      responses,
      tokens: models.reduce((s, m) => s + m.tokens, 0),
      realTokens: models.reduce((s, m) => s + m.realTokens, 0),
      estimatedTokens: models.reduce((s, m) => s + m.estimatedTokens, 0),
      cost: models.reduce((s, m) => s + m.cost, 0),
    },
    models,
    days,
    quota: await getUsage(userId),
  });
}
