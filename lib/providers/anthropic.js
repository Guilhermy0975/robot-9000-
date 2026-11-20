import { postJSON, normalizeMessages } from "./http";

export const claude = {
  id: "claude",
  keyUrl: "https://console.anthropic.com/settings/keys",
  label: "Claude",
  provider: "Anthropic",
  envKey: "ANTHROPIC_API_KEY",
  defaultModel: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
  async generate({ apiKey, model, messages, system, temperature, maxTokens }) {
    const data = await postJSON(
      "https://api.anthropic.com/v1/messages",
      { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      {
        model,
        max_tokens: maxTokens,
        temperature,
        ...(system ? { system } : {}),
        messages: normalizeMessages(messages),
      }
    );
    return {
      content: (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join(""),
      usage: { input: data.usage?.input_tokens ?? null, output: data.usage?.output_tokens ?? null },
    };
  },
};
