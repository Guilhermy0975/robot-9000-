import { db } from "@/lib/db";
import { fail, getUserId, json, unauthorized } from "@/lib/auth";
import { encrypt, hintOf } from "@/lib/crypto";
import { ADAPTERS, DEFAULT_SETTINGS, getAdapter, serverKeyFor } from "@/lib/providers";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Lista os provedores com o estado da chave do usuário (só o final mascarado)
export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const rows = await db.providerKey.findMany({ where: { userId } });
  return json(
    ADAPTERS.map((a) => {
      const r = rows.find((x) => x.provider === a.id);
      return {
        id: a.id,
        label: a.label,
        provider: a.provider,
        keyUrl: a.keyUrl,
        defaultModel: a.defaultModel,
        hasKey: !!r,
        keyHint: r?.keyHint ?? null,
        appKey: !!serverKeyFor(a),
        model: r?.model ?? "",
        temperature: r?.temperature ?? DEFAULT_SETTINGS.temperature,
        maxTokens: r?.maxTokens ?? DEFAULT_SETTINGS.maxTokens,
        system: r?.system ?? "",
      };
    })
  );
}

// Salva (ou atualiza) a chave e as configurações de um provedor
export async function PUT(req) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit("keys:" + userId, { limit: 20 }).ok) return fail("Muitas alterações. Espere um minuto.", 429);

  const b = await req.json().catch(() => null);
  const adapter = getAdapter(b?.provider);
  if (!adapter) return fail("Provedor inválido");

  const apiKey = typeof b.apiKey === "string" ? b.apiKey.trim() : "";
  if (apiKey && (apiKey.length < 10 || apiKey.length > 300 || /\s/.test(apiKey))) return fail("Chave em formato inválido");

  const existing = await db.providerKey.findUnique({ where: { userId_provider: { userId, provider: adapter.id } } });
  if (!existing && !apiKey) return fail("Cole a sua chave de API");

  const temperature = Math.min(2, Math.max(0, Number(b.temperature)));
  const maxTokens = Math.round(Math.min(8192, Math.max(64, Number(b.maxTokens))));
  const settings = {
    model: String(b.model ?? "").trim().slice(0, 80),
    temperature: Number.isFinite(temperature) ? temperature : DEFAULT_SETTINGS.temperature,
    maxTokens: Number.isFinite(maxTokens) ? maxTokens : DEFAULT_SETTINGS.maxTokens,
    system: String(b.system ?? "").slice(0, 4000),
    ...(apiKey ? { keyEnc: encrypt(apiKey), keyHint: hintOf(apiKey) } : {}),
  };

  if (existing) {
    await db.providerKey.update({ where: { userId_provider: { userId, provider: adapter.id } }, data: settings });
  } else {
    await db.providerKey.create({ data: { userId, provider: adapter.id, ...settings } });
  }
  return json({ ok: true });
}

export async function DELETE(req) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const provider = new URL(req.url).searchParams.get("provider");
  if (!getAdapter(provider)) return fail("Provedor inválido");
  await db.providerKey.deleteMany({ where: { userId, provider } });
  return json({ ok: true });
}
