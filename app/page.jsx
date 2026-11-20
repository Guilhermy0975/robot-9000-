"use client";
import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ModelSelector from "@/components/ModelSelector";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import PromptLibrary from "@/components/PromptLibrary";
import { useConversations } from "@/hooks/useConversations";
import { useModels } from "@/hooks/useModels";
import { useTheme } from "@/hooks/useTheme";
import { useAccount } from "@/hooks/useAccount";
import { buildHistory } from "@/lib/storage";
import { BRAND } from "@/lib/brand";

export default function Home() {
  const store = useConversations();
  const { models, error: modelsError } = useModels();
  const { theme, toggle: toggleTheme } = useTheme();
  const account = useAccount();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState({ type: "all" });
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [compare, setCompare] = useState(false);
  const [single, setSingle] = useState("gpt");
  const [selected, setSelected] = useState(["gpt", "claude"]);
  const [promptsOpen, setPromptsOpen] = useState(false);

  // Se algum modelo escolhido não estiver disponível, troca pelos disponíveis
  useEffect(() => {
    if (!models.length) return;
    const ids = models.map((m) => m.id);
    if (!ids.includes(single)) setSingle(ids[0]);
    setSelected((old) => {
      const kept = old.filter((id) => ids.includes(id));
      return kept.length >= 2 ? kept : ids.slice(0, 2);
    });
  }, [models]);

  // Sidebar aberta por padrão no desktop, fechada no celular
  useEffect(() => {
    setSidebarOpen(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  const conv = store.active;
  const lastTurn = conv?.turns[conv.turns.length - 1];
  const busy = !!lastTurn?.responses.some((r) => r.status === "loading");

  // Chama UM modelo; cada chamada atualiza só o próprio cartão
  const runModel = useCallback(async (convId, turnId, modelId, history) => {
    store.updateResponse(convId, turnId, modelId, { status: "loading", error: null, content: "" });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ modelId, messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      if (data.quota) account.setQuota(data.quota);
      store.updateResponse(convId, turnId, modelId, {
        status: "done", content: data.content, simulated: !!data.simulated, model: data.model ?? null,
        tokens: data.usage && (data.usage.input != null || data.usage.output != null)
          ? { input: data.usage.input ?? null, output: data.usage.output ?? null }
          : null,
      });
    } catch (e) {
      store.updateResponse(convId, turnId, modelId, {
        status: "error", error: e instanceof Error ? e.message : "Falha de conexão",
      });
    }
  }, [store.updateResponse, account.setQuota]);

  const targets = compare ? selected : [single];
  const appKeyTargets = targets.filter((id) => models.find((m) => m.id === id)?.source === "server").length;
  const outOfQuota = account.quota && appKeyTargets > 0 && account.quota.remaining < appKeyTargets;
  const disabledReason =
    !models.length ? null
    : compare && selected.length < 2 ? "Escolha de 2 a 4 modelos"
    : outOfQuota ? (account.quota.remaining === 0 ? "Limite de hoje atingido" : `Restam ${account.quota.remaining} mensagens`)
    : null;

  function send() {
    const prompt = message.trim();
    if (!prompt || busy || disabledReason) return;
    const previous = conv?.turns ?? [];
    const folderId = filter.type === "folder" ? filter.id : null;
    const { convId, turnId } = store.addTurn(conv?.id ?? null, prompt, targets, folderId);
    setMessage("");
    for (const modelId of targets) runModel(convId, turnId, modelId, buildHistory(previous, modelId, prompt));
  }

  function retry(turnId, modelId) {
    if (!conv) return;
    const idx = conv.turns.findIndex((t) => t.id === turnId);
    if (idx < 0) return;
    runModel(conv.id, turnId, modelId, buildHistory(conv.turns.slice(0, idx), modelId, conv.turns[idx].prompt));
  }

  function newChat() {
    store.setActiveId(null);
    setMessage("");
    if (!window.matchMedia("(min-width: 768px)").matches) setSidebarOpen(false);
  }

  return (
    <div className="relative h-dvh flex overflow-hidden bg-poster text-fg">
      <div className="poster-layer" aria-hidden />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        store={store}
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
        onNew={newChat}
        account={account}
        onOpenPrompts={() => setPromptsOpen(true)}
      />

      <PromptLibrary
        open={promptsOpen}
        onClose={() => setPromptsOpen(false)}
        onUse={(text) => setMessage((m) => (m.trim() ? m.trimEnd() + "\n\n" + text : text))}
      />

      <main className="relative z-10 flex-1 flex flex-col min-w-0">
        <TopBar
          title={conv?.title ?? BRAND.name}
          onMenu={() => setSidebarOpen((o) => !o)}
          theme={theme}
          onToggleTheme={toggleTheme}
          conversation={conv}
          onFavorite={() => conv && store.toggleFavorite(conv.id)}
        />

        <div className="px-4 py-2.5 border-b border-line shrink-0 bg-app/40 backdrop-blur">
          {modelsError ? (
            <p className="text-sm text-red-400">{modelsError}</p>
          ) : (
            <ModelSelector
              models={models}
              compare={compare}
              setCompare={setCompare}
              single={single}
              setSingle={setSingle}
              selected={selected}
              setSelected={setSelected}
            />
          )}
        </div>

        <section className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <ChatArea conversation={conv} models={models} onRetry={retry} />
          </div>
        </section>

        <footer className="shrink-0 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-8">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              value={message}
              onChange={setMessage}
              onSend={send}
              busy={busy}
              disabledReason={disabledReason}
              onOpenPrompts={() => setPromptsOpen(true)}
            />
            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted mt-2">
              {store.saveError
                ? "Erro ao salvar na sua conta. Verifique a internet."
                : account.quota && models.some((m) => m.source === "server")
                  ? `${BRAND.name} // ${account.quota.remaining} de ${account.quota.limit} mensagens grátis hoje`
                  : `${BRAND.name} // histórico salvo na sua conta`}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
