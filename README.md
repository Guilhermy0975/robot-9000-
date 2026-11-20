# Robot 9000 — Módulo 1 (frontend funcional)

Central para conversar com GPT, Claude, Gemini e Llama numa só interface,
com modo de comparação, histórico salvo, favoritos, pastas e busca.

## Como rodar

Precisa do Node.js 18.18 ou mais novo.

```bash
cd robot-9000
npm install
npm run dev
```

Abra http://localhost:3000.

**Sem chaves de API, tudo funciona com respostas simuladas**, marcadas com o
selo "Simulada". Para conectar um provedor de verdade:

```bash
cp .env.example .env.local
# preencha a chave do provedor que quiser e reinicie o npm run dev
```

As chaves ficam só no servidor. O navegador nunca as recebe.
Dica: escreva `#erro` numa mensagem simulada para ver o estado de erro.

## Onde fica cada arquivo

```
robot-9000/
├── app/
│   ├── layout.jsx            # HTML base, tema salvo
│   ├── page.jsx              # tela principal (junta os componentes)
│   ├── globals.css           # paleta e tema claro/escuro
│   └── api/
│       ├── models/route.js   # lista modelos (sem segredos)
│       └── chat/route.js     # gera 1 resposta de 1 modelo (validação + rate limit)
├── components/
│   ├── Sidebar.jsx           # logo, nova conversa, busca, filtros, pastas, perfil
│   ├── ConversationList.jsx  # histórico: abrir, renomear, favoritar, mover, excluir
│   ├── TopBar.jsx            # menu, título, favoritar, tema
│   ├── ModelSelector.jsx     # seletor de modelo e modo Comparar
│   ├── ChatArea.jsx          # mensagens da conversa
│   ├── ComparisonView.jsx    # respostas lado a lado / empilhadas
│   ├── ResponseCard.jsx      # cartão: nome, provedor, carregando, erro, copiar
│   ├── ChatInput.jsx         # campo de mensagem que cresce com o texto
│   ├── EmptyState.jsx        # tela inicial
│   └── Logo.jsx
├── hooks/
│   ├── useConversations.js   # estado + salvamento automático
│   ├── useModels.js
│   └── useTheme.js
├── lib/
│   ├── brand.js              # NOME DO APP — mude aqui
│   ├── storage.js            # persistência local (localStorage)
│   ├── rateLimit.js          # limite de 30 requisições/min por IP
│   └── providers/            # um adaptador por provedor + simulação
│       ├── index.js          # registro (adicione novos modelos aqui)
│       ├── openai.js  anthropic.js  google.js  groq.js
│       ├── mock.js  http.js
├── prisma/schema.prisma      # preparado para o Módulo 2 (PostgreSQL), ainda não usado
└── .env.example
```

## O que funciona neste módulo

- Interface principal com sidebar, tema escuro (padrão) e claro
- Seletor de modelos no topo, com indicador de conectado ou simulado
- Chat com histórico por modelo (cada modelo vê só as próprias respostas)
- Modo de comparação com 2 a 4 modelos e respostas independentes. Cada cartão
  tem nome, provedor, carregamento, erro com "Tentar de novo" e botão de copiar
- Histórico salvo automaticamente neste navegador: criar, abrir, alternar,
  renomear, excluir e favoritar conversas
- Busca por título, filtro de favoritos e pastas (criar, apagar e mover conversas)
- Responsivo: sidebar recolhível no celular, cartões empilhados e campo de
  mensagem que acompanha o teclado
- Integração real com as APIs quando a chave existe no servidor; caso contrário,
  resposta simulada e claramente identificada

## O que ainda falta (próximos módulos)

1. **Módulo 2:** login e cadastro, sessões, PostgreSQL com Prisma e migração do
   histórico local
2. **Módulo 3:** configurações por modelo (temperatura, limite, prompt de
   sistema, modelo) e páginas da conta
3. **Módulo 4:** biblioteca de prompts
4. **Módulo 5:** upload de arquivos (PDF, imagens, XLSX, CSV e TXT) com validação
   e processamento no servidor
5. **Módulo 6:** painel de estatísticas (tokens, custo estimado e gráficos)

Os itens desses módulos aparecem na sidebar como "em breve" e ficam desativados.
O botão de anexo também fica desativado até o Módulo 5.

## Publicar online e instalar no celular

1. Suba esta pasta para um repositório no GitHub.
2. Entre em https://vercel.com com a conta do GitHub, clique em **Add New → Project**,
   escolha o repositório e clique em **Deploy** (o Next.js é detectado sozinho).
3. (Opcional) Em **Settings → Environment Variables**, adicione as chaves do
   `.env.example` e faça um novo deploy para ativar as respostas reais.
4. No celular, abra o link que a Vercel gerou:
   - **Android (Chrome):** menu ⋮ → **Instalar app** ou **Adicionar à tela inicial**
   - **iPhone (Safari):** botão Compartilhar → **Adicionar à Tela de Início**

O app abre em tela cheia, com o ícone do Robot 9000.
Atenção: neste módulo o histórico fica salvo no aparelho; ele só sincroniza
entre dispositivos depois do Módulo 2 (login + banco).
