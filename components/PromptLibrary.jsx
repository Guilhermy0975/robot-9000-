"use client";
import { useEffect, useMemo, useState } from "react";
import { X, Plus, Search, Star, Pencil, Trash2, CornerDownLeft, Loader2, BookOpen, Sparkles, BookmarkPlus, Check, Info } from "lucide-react";
import { PROMPT_PACKS, PACK_COUNT } from "@/lib/promptPacks";

const EMPTY = { title: "", category: "", content: "" };
const field =
  "w-full bg-soft/60 border border-line rounded-lg px-3 py-2 outline-none focus:border-brand transition placeholder:text-muted";

// Mostra as partes [ENTRE COLCHETES] destacadas, para a pessoa saber o que trocar
function Highlight({ text }) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part)
      ? <span key={i} className="text-brand font-semibold">{part}</span>
      : <span key={i}>{part}</span>
  );
}

// Coleção de prompts prontos (cartões numerados por categoria)
function ReadyPrompts({ search, onUse, onSave, savedTitles }) {
  const [pack, setPack] = useState("todas");
  const q = search.trim().toLowerCase();
  let n = 0;
  const packs = PROMPT_PACKS.map((p) => ({
    ...p,
    prompts: p.prompts.map((pr) => ({ ...pr, number: ++n })),
  }))
    .filter((p) => pack === "todas" || p.id === pack)
    .map((p) => ({
      ...p,
      prompts: p.prompts.filter((pr) => !q || pr.title.toLowerCase().includes(q) || pr.content.toLowerCase().includes(q)),
    }))
    .filter((p) => p.prompts.length);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {[{ id: "todas", title: "Todas" }, ...PROMPT_PACKS].map((p) => (
          <button key={p.id} onClick={() => setPack(p.id)}
            className={`shrink-0 px-3 py-1 rounded-md text-sm border transition ${pack === p.id ? "bg-brand text-white border-brand" : "border-line text-muted hover:text-fg"}`}>
            {p.title}
          </button>
        ))}
      </div>

      {packs.length === 0 && <p className="text-muted text-center py-6">Nenhum prompt encontrado.</p>}

      {packs.map((p, pi) => (
        <section key={p.id}>
          <h3 className="flex items-center gap-3 mb-3">
            <span className="bg-brand text-white font-display text-sm rounded-md px-2 py-1 glow">{String(PROMPT_PACKS.findIndex((x) => x.id === p.id) + 1).padStart(2, "0")}</span>
            <span className="font-display uppercase tracking-wider text-lg">{p.title}</span>
          </h3>
          {p.note && (
            <p className="text-xs text-muted mb-3 flex gap-1.5"><Info size={13} className="shrink-0 mt-0.5" /> {p.note}</p>
          )}
          <div className="grid gap-3">
            {p.prompts.map((pr) => {
              const saved = savedTitles.has(pr.title);
              return (
                <article key={pr.number} className="bg-card/80 border border-line hover:border-brand/50 rounded-xl p-4 flex flex-col transition">
                  <h4 className="font-semibold mb-1.5">
                    <span className="text-brand font-display mr-1.5">{String(pr.number).padStart(2, "0")}</span>{pr.title}
                  </h4>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap flex-1 mb-3"><Highlight text={pr.content} /></p>
                  <div className="flex gap-2">
                    <button onClick={() => onUse(pr.content)}
                      className="flex-1 border border-brand/60 text-brand hover:bg-brand hover:text-white rounded-lg py-1.5 text-sm font-display uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition">
                      <CornerDownLeft size={14} /> Usar
                    </button>
                    <button onClick={() => !saved && onSave({ title: pr.title, content: pr.content, category: p.title })}
                      disabled={saved} title={saved ? "Já está nos seus prompts" : "Salvar nos meus prompts"}
                      className="border border-line rounded-lg px-2.5 text-muted hover:text-fg hover:border-brand disabled:text-emerald-400 disabled:border-emerald-500/40 transition">
                      {saved ? <Check size={15} /> : <BookmarkPlus size={15} />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

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
  const [tab, setTab] = useState("prontos");
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

  async function saveReady(form) {
    setError(null);
    try {
      const created = await api("/api/prompts", { method: "POST", body: JSON.stringify(form) });
      setPrompts((list) => [created, ...(list ?? [])]);
    } catch (e) {
      setError(e.message);
    }
  }

  const savedTitles = useMemo(() => new Set((prompts ?? []).map((p) => p.title)), [prompts]);

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
          <div className="grid grid-cols-2 gap-1 bg-soft/50 rounded-lg p-1">
            {[["prontos", `Prontos (${PACK_COUNT})`], ["meus", `Meus prompts${prompts ? ` (${prompts.length})` : ""}`]].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setEditing(null); }}
                className={`rounded-md py-1.5 text-sm font-display uppercase tracking-wider transition ${tab === id ? "bg-brand text-white glow" : "text-muted hover:text-fg"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-muted" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar prompts..."
                className="w-full bg-soft/60 rounded-lg py-2 pl-9 pr-3 outline-none focus:ring-2 focus:ring-brand/60 placeholder:text-muted" />
            </div>
            <button onClick={() => { setTab("meus"); setEditing("new"); }}
              className="bg-brand text-white rounded-lg px-3 glow hover:brightness-110 inline-flex items-center gap-1 text-sm">
              <Plus size={16} /> Novo
            </button>
          </div>
          {tab === "meus" && <div className="flex gap-2 overflow-x-auto no-scrollbar">
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
          </div>}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {error && <p className="text-sm text-red-400">{error}</p>}

          {tab === "prontos" && (
            <ReadyPrompts
              search={search}
              savedTitles={savedTitles}
              onSave={saveReady}
              onUse={(text) => { onUse(text); onClose(); }}
            />
          )}

          {tab === "meus" && <>

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
            <div className="text-center py-6 space-y-3">
              <Sparkles size={28} className="text-brand mx-auto" />
              <p className="text-muted">Você ainda não salvou prompts.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setTab("prontos")} className="border border-brand/60 text-brand rounded-lg px-4 py-2 text-sm">Ver prontos</button>
                <button onClick={() => setEditing("new")} className="bg-brand text-white rounded-lg px-4 py-2 text-sm glow">Criar o meu</button>
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
          </>}
        </div>
      </aside>
    </div>
  );
}
