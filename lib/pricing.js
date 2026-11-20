// Preços de referência em US$ por 1 milhão de tokens (entrada / saída).
// São ESTIMATIVAS para o modelo padrão de cada provedor: os preços mudam e
// dependem do modelo e do plano de cada pessoa. Confira no site do provedor.
export const PRICES = {
  gpt: { input: 0.4, output: 1.6, ref: "gpt-4.1-mini" },
  claude: { input: 3, output: 15, ref: "Claude Sonnet" },
  gemini: { input: 0.3, output: 2.5, ref: "Gemini Flash" },
  llama: { input: 0.59, output: 0.79, ref: "Llama 3.3 70B (Groq)" },
};

export function estimateCost(modelId, input, output) {
  const p = PRICES[modelId];
  if (!p) return 0;
  return (input * p.input + output * p.output) / 1_000_000;
}
