// Registro central de provedores. Para adicionar um modelo novo:
// 1) crie um arquivo com { id, label, provider, envKey, defaultModel, generate }
// 2) adicione na lista abaixo. A interface o reconhece automaticamente.
import { gpt } from "./openai";
import { claude } from "./anthropic";
import { gemini } from "./google";
import { llama } from "./groq";
import { mockGenerate } from "./mock";

const ADAPTERS = [gpt, claude, gemini, llama];

export const DEFAULT_SETTINGS = { temperature: 0.7, maxTokens: 1024, system: "" };

export function getAdapter(id) {
  return ADAPTERS.find((a) => a.id === id) ?? null;
}

function apiKeyFor(adapter) {
  return process.env[adapter.envKey]?.trim() || null;
}

// Informações públicas (sem segredos) para o navegador
export function listModels() {
  return ADAPTERS.map((a) => ({
    id: a.id,
    label: a.label,
    provider: a.provider,
    model: a.defaultModel,
    connected: !!apiKeyFor(a),
  }));
}

export async function generate(adapter, messages) {
  const apiKey = apiKeyFor(adapter);
  if (!apiKey) {
    const r = await mockGenerate(adapter, messages);
    return { ...r, simulated: true, model: "simulado" };
  }
  const r = await adapter.generate({ apiKey, model: adapter.defaultModel, messages, ...DEFAULT_SETTINGS });
  return { ...r, content: r.content || "(resposta vazia)", simulated: false, model: adapter.defaultModel };
}
