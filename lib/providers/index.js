// Registro central de provedores. Para adicionar um modelo novo:
// 1) crie um arquivo com { id, label, provider, envKey, defaultModel, keyUrl, generate }
// 2) adicione na lista abaixo. A interface o reconhece automaticamente.
import { gpt } from "./openai";
import { claude } from "./anthropic";
import { gemini } from "./google";
import { llama } from "./groq";
import { mockGenerate } from "./mock";

export const ADAPTERS = [gpt, claude, gemini, llama];

export const DEFAULT_SETTINGS = { temperature: 0.7, maxTokens: 1024, system: "" };

export function getAdapter(id) {
  return ADAPTERS.find((a) => a.id === id) ?? null;
}

export function serverKeyFor(adapter) {
  return process.env[adapter.envKey]?.trim() || null;
}

/**
 * Decide qual chave usar para um modelo:
 * 1) a chave do próprio usuário  2) a chave do app (servidor)  3) simulação
 * `userKey` é { apiKey, model, temperature, maxTokens, system } ou null.
 */
export function resolveSource(adapter, userKey) {
  if (userKey?.apiKey) {
    return {
      source: "user",
      apiKey: userKey.apiKey,
      model: userKey.model || adapter.defaultModel,
      temperature: userKey.temperature ?? DEFAULT_SETTINGS.temperature,
      maxTokens: userKey.maxTokens ?? DEFAULT_SETTINGS.maxTokens,
      system: userKey.system ?? "",
    };
  }
  const serverKey = serverKeyFor(adapter);
  if (serverKey) return { source: "server", apiKey: serverKey, model: adapter.defaultModel, ...DEFAULT_SETTINGS };
  return { source: "simulated" };
}

export async function generate(adapter, messages, resolved) {
  if (resolved.source === "simulated") {
    const r = await mockGenerate(adapter, messages);
    return { ...r, simulated: true, model: "simulado" };
  }
  const r = await adapter.generate({
    apiKey: resolved.apiKey,
    model: resolved.model,
    messages,
    system: resolved.system,
    temperature: resolved.temperature,
    maxTokens: resolved.maxTokens,
  });
  return { ...r, content: r.content || "(resposta vazia)", simulated: false, model: resolved.model };
}
