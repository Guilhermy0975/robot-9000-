import { postJSON, normalizeMessages } from "./http";

export const gemini = {
  id: "gemini",
  keyUrl: "https://aistudio.google.com/apikey",
  label: "Gemini",
  provider: "Google",
  envKey: "GOOGLE_API_KEY",
  defaultModel: process.env.GOOGLE_MODEL || "gemini-flash-latest",
  async generate(args) {
    try {
      return await callGemini(args);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!BUSY_RE.test(msg)) throw e;
      // Google sobrecarregado: tenta uma vez com um modelo mais leve
      if (args.model !== FALLBACK_MODEL) {
        try {
          const r = await callGemini({ ...args, model: FALLBACK_MODEL });
          return { ...r, model: FALLBACK_MODEL };
        } catch {}
      }
      throw new Error("O Gemini está sobrecarregado agora (problema do Google, não da sua chave). Tente de novo em alguns minutos.");
    }
  },
};

const FALLBACK_MODEL = process.env.GOOGLE_FALLBACK_MODEL || "gemini-flash-lite-latest";
const BUSY_RE = /high demand|overloaded|UNAVAILABLE|try again later|HTTP 503/i;

async function callGemini({ apiKey, model, messages, system, temperature, maxTokens }) {
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
}
