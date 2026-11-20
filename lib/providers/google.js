import { postJSON, normalizeMessages } from "./http";

export const gemini = {
  id: "gemini",
  label: "Gemini",
  provider: "Google",
  envKey: "GOOGLE_API_KEY",
  defaultModel: process.env.GOOGLE_MODEL || "gemini-2.5-flash",
  async generate({ apiKey, model, messages, system, temperature, maxTokens }) {
    const contents = normalizeMessages(messages).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const data = await postJSON(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      { "x-goog-api-key": apiKey },
      {
        contents,
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }
    );
    return {
      content: (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join(""),
      usage: {
        input: data.usageMetadata?.promptTokenCount ?? null,
        output: data.usageMetadata?.candidatesTokenCount ?? null,
      },
    };
  },
};
