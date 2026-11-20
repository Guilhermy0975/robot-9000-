import { db } from "./db";
import { decrypt } from "./crypto";

// Chaves do usuário já descriptografadas (uso exclusivo no servidor)
export async function loadUserKeys(userId) {
  const rows = await db.providerKey.findMany({ where: { userId } });
  const map = {};
  for (const r of rows) {
    try {
      map[r.provider] = {
        apiKey: decrypt(r.keyEnc),
        model: r.model,
        temperature: r.temperature,
        maxTokens: r.maxTokens,
        system: r.system,
      };
    } catch {
      // chave ilegível (ex.: segredo do servidor mudou) — ignora
    }
  }
  return map;
}

export async function loadUserKey(userId, provider) {
  return (await loadUserKeys(userId))[provider] ?? null;
}
