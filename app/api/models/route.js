import { ADAPTERS, keyIdFor, resolveSource } from "@/lib/providers";
import { getUserId, json, unauthorized } from "@/lib/auth";
import { loadUserKeys } from "@/lib/userKeys";

export const dynamic = "force-dynamic";

// Modelos e de onde vem a chave de cada um (nunca envia a chave)
export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const keys = await loadUserKeys(userId);
  return json(
    ADAPTERS.map((a) => {
      const r = resolveSource(a, keys[keyIdFor(a)]);
      return {
        id: a.id,
        label: a.label,
        provider: a.provider,
        model: r.model ?? a.defaultModel,
        source: r.source, // "user" | "server" | "simulated"
        connected: r.source !== "simulated",
        image: !!a.image,
      };
    })
  );
}
