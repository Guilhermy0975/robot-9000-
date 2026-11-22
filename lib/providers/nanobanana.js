import { postJSON, normalizeMessages } from "./http";

// Nano Banana: o modelo de imagem do Gemini. Usa a MESMA chave do Gemini
// (keyFrom), então quem já conectou o Gemini não precisa colar nada de novo.
// Troque o modelo com NANO_BANANA_MODEL (ex.: gemini-3-pro-image, o Pro).
export const nanobanana = {
  id: "nanobanana",
  keyFrom: "gemini",
  keyUrl: "https://aistudio.google.com/apikey",
  label: "Nano Banana",
  provider: "Google · Imagem",
  envKey: "GOOGLE_API_KEY",
  image: true,
  defaultModel: process.env.NANO_BANANA_MODEL || "gemini-3.1-flash-image",

  // inputImage: { mime, data(base64) } = última imagem gerada, para editar
  async generate({ apiKey, model, messages, inputImage }) {
    const msgs = normalizeMessages(messages);
    const last = msgs.pop();
    // O histórico vai como texto; a imagem anterior vai junto do pedido atual
    const context = msgs.length
      ? "Conversa até aqui:\n" +
        msgs.map((m) => `${m.role === "user" ? "Usuário" : "Você"}: ${m.content}`).join("\n") +
        "\n\nPedido atual:\n"
      : "";
    const parts = [{ text: context + (last?.content ?? "") }];
    if (inputImage) {
      parts.push({ text: "Esta é a imagem que você gerou por último. Se o pedido for uma alteração, edite esta imagem." });
      parts.push({ inlineData: { mimeType: inputImage.mime, data: inputImage.data } });
    }

    let data;
    try {
      data = await postJSON(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        { "x-goog-api-key": apiKey },
        {
          contents: [{ role: "user", parts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }
      );
    } catch (e) {
      throw new Error(friendlyError(e instanceof Error ? e.message : String(e)));
    }

    const cand = data.candidates?.[0];
    const outParts = cand?.content?.parts ?? [];
    const images = outParts
      .filter((p) => (p.inlineData ?? p.inline_data)?.data && !p.thought)
      .map((p) => {
        const d = p.inlineData ?? p.inline_data;
        return { mime: d.mimeType ?? d.mime_type ?? "image/png", data: d.data };
      });
    const text = outParts.filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim();

    if (!images.length) {
      const why = data.promptFeedback?.blockReason || cand?.finishReason;
      throw new Error(
        text || (why && why !== "STOP" ? `O Google não gerou a imagem (${why}).` : "O modelo não devolveu nenhuma imagem. Tente descrever de outro jeito.")
      );
    }

    return {
      content: text,
      images,
      usage: {
        input: data.usageMetadata?.promptTokenCount ?? null,
        output: data.usageMetadata?.candidatesTokenCount ?? null,
      },
    };
  },
};

// Troca as mensagens longas do Google por algo que dá para entender
function friendlyError(msg) {
  if (/free_tier/i.test(msg) && /limit:\s*0/i.test(msg))
    return "O plano grátis do Google não inclui geração de imagens. Para usar o Nano Banana, ative o faturamento na sua conta do Google AI Studio (aistudio.google.com → Billing). O custo vai para a conta dona da chave.";
  if (/quota|rate.?limit|RESOURCE_EXHAUSTED/i.test(msg))
    return "Limite do Google atingido para imagens. Espere um pouco e tente de novo.";
  if (/billing/i.test(msg))
    return "O Google pede faturamento ativado para gerar imagens com essa chave (aistudio.google.com → Billing).";
  return msg;
}
