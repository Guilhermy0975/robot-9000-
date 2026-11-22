import { openAICompatible } from "./openai";

// O id "llama" fica igual para não quebrar conversas e chaves já salvas.
// Os modelos Llama do Groq passaram a ser só para planos Enterprise; o padrão
// agora é o GPT-OSS, disponível no plano gratuito. GROQ_MODEL troca isso.
export const llama = {
  id: "llama",
  keyUrl: "https://console.groq.com/keys",
  label: "Groq",
  provider: "Groq · GPT-OSS",
  envKey: "GROQ_API_KEY",
  defaultModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  generate: openAICompatible("https://api.groq.com/openai/v1"),
};
