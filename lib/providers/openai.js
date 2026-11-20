import { postJSON, normalizeMessages } from "./http";

// Fábrica para APIs compatíveis com o formato da OpenAI (OpenAI e Groq)
export function openAICompatible(baseUrl) {
  return async function generate({ apiKey, model, messages, system, temperature, maxTokens }) {
    const data = await postJSON(
      `${baseUrl}/chat/completions`,
      { authorization: `Bearer ${apiKey}` },
      {
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [...(system ? [{ role: "system", content: system }] : []), ...normalizeMessages(messages)],
      }
    );
    return {
      content: data.choices?.[0]?.message?.content ?? "",
      usage: { input: data.usage?.prompt_tokens ?? null, output: data.usage?.completion_tokens ?? null },
    };
  };
}

export const gpt = {
  id: "gpt",
  label: "GPT",
  provider: "OpenAI",
  envKey: "OPENAI_API_KEY",
  defaultModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  generate: openAICompatible("https://api.openai.com/v1"),
};
