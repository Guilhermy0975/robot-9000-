// Respostas simuladas: usadas quando o provedor não tem chave configurada.
// O texto deixa claro que nenhuma IA foi consultada.

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function mockGenerate(adapter, messages) {
  const prompt = messages[messages.length - 1]?.content ?? "";
  await wait(500 + Math.random() * 1500);

  // Ajuda a testar o estado de erro na interface
  if (prompt.toLowerCase().includes("#erro")) {
    throw new Error(`Erro simulado do ${adapter.label} (você usou #erro na mensagem).`);
  }

  const preview = prompt.length > 160 ? prompt.slice(0, 160) + "…" : prompt;
  return {
    content:
      `Resposta simulada do ${adapter.label}.\n\n` +
      `Nenhuma IA foi consultada: a conexão com ${adapter.provider} ainda não está configurada no servidor.\n\n` +
      `Sua mensagem foi: "${preview}"`,
    usage: { input: null, output: null },
  };
}
