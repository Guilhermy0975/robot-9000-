"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, KeyRound, Check, Trash2, Loader2, ExternalLink, ShieldCheck, Zap, ChevronDown,
} from "lucide-react";
import Logo from "@/components/Logo";

const input =
  "w-full bg-soft/60 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-brand transition placeholder:text-muted";

function Badge({ item }) {
  if (item.hasKey) return <span className="text-[11px] uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">Sua chave</span>;
  if (item.appKey) return <span className="text-[11px] uppercase tracking-wider bg-brand/15 text-brand px-2 py-0.5 rounded-full">Grátis do app</span>;
  return <span className="text-[11px] uppercase tracking-wider bg-amber-400/15 text-amber-500 px-2 py-0.5 rounded-full">Não conectado</span>;
}

function ProviderCard({ item, onChanged }) {
  const [key, setKey] = useState("");
  const [form, setForm] = useState({
    model: item.model, temperature: item.temperature, maxTokens: item.maxTokens, system: item.system,
  });
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);

  async function call(url, options) {
    const res = await fetch(url, { headers: { "content-type": "application/json" }, ...options });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) window.location.href = "/login";
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  }

  async function save() {
    setBusy("save"); setMsg(null);
    try {
      await call("/api/keys", { method: "PUT", body: JSON.stringify({ provider: item.id, apiKey: key, ...form }) });
      setKey("");
      setMsg({ ok: true, text: "Salvo! Toque em Testar para conferir." });
      onChanged();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally { setBusy(null); }
  }

  async function test() {
    setBusy("test"); setMsg(null);
    try {
      const r = await call("/api/keys/test", { method: "POST", body: JSON.stringify({ provider: item.id }) });
      setMsg({ ok: true, text: `Funcionando! (${r.model})` });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally { setBusy(null); }
  }

  async function remove() {
    if (!confirm(`Remover a sua chave do ${item.label}?`)) return;
    setBusy("remove"); setMsg(null);
    try {
      await call(`/api/keys?provider=${item.id}`, { method: "DELETE" });
      setMsg({ ok: true, text: "Chave removida." });
      onChanged();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally { setBusy(null); }
  }

  return (
    <section className="bg-card/85 backdrop-blur border border-line rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display uppercase tracking-wider text-xl text-brand leading-none">{item.label}</h2>
          <p className="text-xs uppercase tracking-widest text-muted mt-1">{item.provider}</p>
        </div>
        <Badge item={item} />
      </div>

      <div>
        <label className="text-sm text-muted flex items-center gap-1.5 mb-1.5"><KeyRound size={14} /> Chave de API</label>
        <input
          className={input}
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder={item.hasKey ? `Atual: ${item.keyHint} (deixe vazio para manter)` : "Cole a sua chave aqui"}
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <a href={item.keyUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-brand hover:underline mt-1.5">
          Onde conseguir minha chave <ExternalLink size={13} />
        </a>
      </div>

      <button onClick={() => setAdvanced(!advanced)} className="flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ChevronDown size={15} className={`transition ${advanced ? "rotate-180" : ""}`} /> Configurações do modelo
      </button>

      {advanced && (
        <div className="space-y-3 animate-fade-up">
          <div>
            <label className="text-sm text-muted">Modelo</label>
            <input className={input} placeholder={`Padrão: ${item.defaultModel}`} value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted">Temperatura: {Number(form.temperature).toFixed(1)}</label>
              <input type="range" min={0} max={2} step={0.1} value={form.temperature} className="w-full accent-[var(--app-brand)] mt-3"
                onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm text-muted">Limite de resposta</label>
              <input className={input} type="number" min={64} max={8192} value={form.maxTokens}
                onChange={(e) => setForm({ ...form, maxTokens: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted">Prompt de sistema (como a IA deve se comportar)</label>
            <textarea className={input} rows={3} value={form.system} placeholder="Ex.: Responda sempre em português, de forma curta."
              onChange={(e) => setForm({ ...form, system: e.target.value })} />
          </div>
          {!item.hasKey && <p className="text-xs text-muted">Essas configurações valem quando você usa a sua própria chave.</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={save} disabled={!!busy}
          className="bg-brand text-white rounded-lg px-4 py-2 font-display uppercase tracking-wider text-sm glow hover:brightness-110 disabled:opacity-50 inline-flex items-center gap-2">
          {busy === "save" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Salvar
        </button>
        {item.hasKey && (
          <>
            <button onClick={test} disabled={!!busy}
              className="border border-line rounded-lg px-4 py-2 text-sm hover:border-brand disabled:opacity-50 inline-flex items-center gap-2">
              {busy === "test" ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />} Testar
            </button>
            <button onClick={remove} disabled={!!busy}
              className="text-red-400 hover:text-red-300 text-sm px-2 py-2 inline-flex items-center gap-1 disabled:opacity-50">
              <Trash2 size={15} /> Remover
            </button>
          </>
        )}
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</p>}
    </section>
  );
}

export default function SettingsPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = () =>
    fetch("/api/keys")
      .then((r) => {
        if (r.status === 401) window.location.href = "/login";
        return r.ok ? r.json() : Promise.reject();
      })
      .then(setItems)
      .catch(() => setError("Não foi possível carregar as configurações."));

  useEffect(() => { load(); }, []);

  return (
    <div className="relative min-h-dvh bg-poster">
      <div className="poster-layer" aria-hidden />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-fg">
            <ArrowLeft size={18} /> Voltar
          </Link>
          <Logo />
        </div>

        <h1 className="font-display uppercase tracking-wider text-3xl mb-2">Conecte suas IAs</h1>
        <p className="text-muted mb-4">
          Cole a chave de API de cada provedor que você usa. Com a sua chave, você conversa
          sem limite diário e o custo fica na sua conta do provedor.
        </p>
        <div className="flex gap-3 bg-card/70 border border-line rounded-xl p-4 mb-8 text-sm text-muted">
          <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
          <p>
            Sua chave é guardada <b className="text-fg">criptografada</b> no servidor, nunca volta para o navegador
            e só é usada nas suas conversas. Você pode removê-la quando quiser. Nunca compartilhe a sua chave
            em mensagens ou com outras pessoas.
          </p>
        </div>

        {error && <p className="text-red-400">{error}</p>}
        {!items && !error && (
          <p className="text-muted flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Carregando…</p>
        )}
        <div className="space-y-5">
          {items?.map((item) => <ProviderCard key={item.id + String(item.hasKey) + item.keyHint} item={item} onChanged={load} />)}
        </div>
      </div>
    </div>
  );
}
