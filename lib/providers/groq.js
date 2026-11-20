import { openAICompatible } from "./openai";

export const llama = {
  id: "llama",
  keyUrl: "https://console.groq.com/keys",
  label: "Llama",
  provider: "Groq",
  envKey: "GROQ_API_KEY",
  defaultModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  generate: openAICompatible("https://api.groq.com/openai/v1"),
};
