"use client";
import { useEffect, useMemo, useState } from "react";
import { X, Plus, Search, Star, Pencil, Trash2, CornerDownLeft, Loader2, BookOpen, Sparkles } from "lucide-react";

// Sugestões para quem ainda não tem prompts (só são salvas se a pessoa quiser)
const STARTERS = [
  { title: "Resumir texto", category: "Estudos", content: "Resuma o texto abaixo em tópicos curtos, destacando as ideias principais:\n\n" },
  { title: "Roteiro de vídeo", category: "Conteúdo", content: "Crie um roteiro de vídeo curto (até 60 segundos) sobre o tema abaixo, com gancho forte nos 3 primeiros segundos:\n\nTema: " },
  { title: "Legenda para Instagram", category: "Conteúdo", content: "Escreva 3 opções de legenda para Instagram, com emojis e hashtags, para este post:\n\n" },
  { title: "Explicar como se eu tivesse 10 anos", category: "Estudos", content: "Explique o assunto abaixo de forma bem simples, como se eu tivesse 10 anos:\n\n" },
  { title: "Revisar texto", category: "Escrita", content: "Corrija a gramática e melhore a clareza do texto abaixo, sem mudar o sentido:\n\n" },
];

const EMPTY = { title: "", category: "", content: "" };
const field =
  "w-full bg-soft/60 border border-line rounded-lg px-3 py-2 outline-none focus:border-brand transition placeholder:text-muted";

async function api(url, options = {}) {
  const res = await fetch(url, { headers: { "content-type": "application/json" }, ...options });
  if (res.status === 401) window.location.href = "/login";
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

function PromptForm({ initial, onCancel, onSave, saving, categories }) {
  const [form, setForm] = useState(initial);
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="bg-card border border-brand/40 rounded-xl p-4 space-y-3 animate-fade-up"
    >
      <input className={field} placeholder="Título (ex.: Roteiro de vídeo)" value={form.title} autoFocus
        onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <input className={field} placeholder="Categoria (ex.: Conteúdo)" list="prompt-categories" value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <datalist id="prompt-categories">
        {categories.map((c) => <option key={c} value={c} />)}
      </datalist>
      <textarea className={field} rows={5} placeholder="Texto do prompt..." value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })} />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-muted hover:text-fg">Cancelar</button>
        <button disabled={saving}
          className="bg-brand text-white rounded-lg px-4 py-2 text-sm font-display uppercase tracking-wider glow disabled:opacity-50 inline-flex items-center gap-2">
          {saving && <Loader2 size={14} className="animate-spin" />} Salvar
        </button>
      </div>
    </form>
  );
}

export default function PromptLibrary({ open, onClose, onUse }) {
  const [prompts, setPrompts] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [onlyFav, setOnlyFav] = useState(false);
  const [editing, setEditing] = useState(null); // null | "new" | prompt
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || prompts) return;
    api("/api/prompts").then(setPrompts).catch((e) => setError(e.message));
  }, [open, prompts]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const categories = useMemo(
    () => [...new Set((prompts ?? []).map((p) => p.category))].sort((a, b) => a.localeCompare(b)),
    [prompts]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (prompts ?? [])
      .filter((p) => (category === "Todas" || p.category === category) && (!onlyFav || p.favorite))
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q))
      .sort((a, b) => (b.favorite - a.favorite) || b.updatedAt - a.updatedAt);
  }, [prompts, search, category, onlyFav]);

  async function save(form) {
    setSaving(true); setError(null);
    try {
      if (editing === "new" || !editing?.id) {
        const created = await api("/api/prompts", { method: "POST", body: JSON.stringify(form) });
        setPrompts((list) => [created, ...(list ?? [])]);
      } else {
        const updated = await api(`/api/prompts/${editing.id}`, {
          method: "PUT", body: JSON.stringify({ ...form, favorite: editing.favorite }),
        });
        setPrompts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
      }
      setEditing(null);
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  }

  async function toggleFav(p) {
    const updated = await api(`/api/prompts/${p.id}`, { method: "PUT", body: JSON.stringify({ ...p, favorite: !p.favorite }) })
      .catch((e) => setError(e.message));
    if (updated) setPrompts((list) => list.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function remove(p) {
    if (!confirm(`Excluir o prompt "${p.title}"?`)) return;
    await api(`/api/prompts/${p.id}`, { method: "DELETE" }).catch((e) => setError(e.message));
    setPrompts((list) => list.filter((x) => x.id !== p.id));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 animate-fade-up" />
      <aside className="relative w-full max-w-lg h-full bg-side border-l border-line flex flex-col animate-fade-up pt-[env(safe-area-inset-top)]">
        <header className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-display uppercase tracking-wider text-xl flex items-center gap-2">
            <BookOpen size={20} className="text-brand" /> Biblioteca de prompts
          </h2>
          <button onClick={onClose} className="text-muted hover:text-fg p-1" aria-label="Fechar"><X size={22} /></button>
        </header>

        <div className="px-5 py-3 space-y-3 border-b border-line">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-muted" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar prompts..."
                className="w-full bg-soft/60 rounded-lg py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-brand/60 placeholder:text-muted" />
            </div>
            <button onClick={() => setEditing("new")}
              className="bg-brand text-white rounded-lg px-3 glow hover:brightness-110 inline-flex items-center gap-1 text-sm">
              <Plus size={16} /> Novo
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {["Todas", ...categories].map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`shrink-0 px-3 py-1 rounded-md text-sm border transition ${category === c ? "bg-brand text-white border-brand" : "border-line text-muted hover:text-fg"}`}>
                {c}
              </button>
            ))}
            <button onClick={() => setOnlyFav(!onlyFav)}
              className={`shrink-0 px-3 py-1 rounded-md text-sm border inline-flex items-center gap-1 transition ${onlyFav ? "border-yellow-400 text-yellow-400" : "border-line text-muted hover:text-fg"}`}>
              <Star size={13} fill={onlyFav ? "currentColor" : "none"} /> Favoritos
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {error && <p className="text-sm text-red-400">{error}</p>}

          {editing && (
            <PromptForm
              key={editing === "new" ? "new" : editing.id ?? editing.title}
              initial={editing === "new" ? EMPTY : { title: editing.title, category: editing.category, content: editing.content }}
              categories={categories}
              saving={saving}
              onCancel={() => setEditing(null)}
              onSave={save}
            />
          )}

          {!prompts && !error && <p className="text-muted flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Carregando…</p>}

          {prompts && prompts.length === 0 && !editing && (
            <div className="text-center py-4">
              <p className="text-muted mb-4">Você ainda não tem prompts. Comece com uma sugestão:</p>
              <div className="space-y-2 text-left">
                {STARTERS.map((s) => (
                  <button key={s.title} onClick={() => setEditing(s)}
                    className="w-full bg-card/80 border border-line hover:border-brand rounded-xl p-3 flex items-center gap-3 transition">
                    <Sparkles size={16} className="text-brand shrink-0" />
                    <span className="flex-1">{s.title}</span>
                    <span className="text-xs text-muted">{s.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {prompts && prompts.length > 0 && visible.length === 0 && (
            <p className="text-muted text-center py-6">Nenhum prompt encontrado.</p>
          )}

          {visible.map((p) => (
            <article key={p.id} className="bg-card/80 border border-line hover:border-brand/50 rounded-xl p-4 transition">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  <p className="text-[11px] uppercase tracking-widest text-brand">{p.category}</p>
                </div>
                <div className="flex text-muted shrink-0">
                  <button onClick={() => toggleFav(p)} className="p-1.5 hover:text-yellow-400" title="Favoritar">
                    <Star size={15} className={p.favorite ? "text-yellow-400" : ""} fill={p.favorite ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setEditing(p)} className="p-1.5 hover:text-fg" title="Editar"><Pencil size={15} /></button>
                  <button onClick={() => remove(p)} className="p-1.5 hover:text-red-400" title="Excluir"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="text-sm text-muted line-clamp-3 whitespace-pre-wrap mb-3">{p.content}</p>
              <button onClick={() => { onUse(p.content); onClose(); }}
                className="w-full border border-brand/60 text-brand hover:bg-brand hover:text-white rounded-lg py-2 text-sm font-display uppercase tracking-wider inline-flex items-center justify-center gap-2 transition">
                <CornerDownLeft size={15} /> Usar no chat
              </button>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
