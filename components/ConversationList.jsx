"use client";
import { useState } from "react";
import { MessageSquare, Star, Pencil, Trash2, FolderInput, Check } from "lucide-react";

function ConversationItem({ conv, active, folders, store, onPicked }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conv.title);
  const [moving, setMoving] = useState(false);

  function saveTitle(e) {
    e?.preventDefault();
    store.rename(conv.id, title);
    setEditing(false);
  }

  if (editing) {
    return (
      <form onSubmit={saveTitle} className="flex items-center gap-1 px-2 py-1">
        <input
          autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => e.key === "Escape" && (setTitle(conv.title), setEditing(false))}
          className="flex-1 bg-soft rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand/60"
        />
        <button type="submit" className="text-brand p-1"><Check size={16} /></button>
      </form>
    );
  }

  return (
    <div className={`group rounded-lg transition-colors ${active ? "bg-soft" : "hover:bg-soft/50"}`}>
      <div className="flex items-center">
        <button
          onClick={() => { store.setActiveId(conv.id); onPicked?.(); }}
          className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-2 text-sm text-left ${active ? "text-fg" : "text-muted"}`}
        >
          <MessageSquare size={15} className="shrink-0" />
          <span className="truncate">{conv.title}</span>
          {conv.favorite && <Star size={12} className="shrink-0 text-yellow-400" fill="currentColor" />}
        </button>
        <div className="flex md:opacity-0 md:group-hover:opacity-100 pr-1 text-muted">
          <button onClick={() => store.toggleFavorite(conv.id)} className="p-1 hover:text-yellow-400" title="Favoritar">
            <Star size={14} fill={conv.favorite ? "currentColor" : "none"} />
          </button>
          <button onClick={() => { setTitle(conv.title); setEditing(true); }} className="p-1 hover:text-fg" title="Renomear">
            <Pencil size={14} />
          </button>
          <button onClick={() => setMoving(!moving)} className="p-1 hover:text-fg" title="Mover para pasta">
            <FolderInput size={14} />
          </button>
          <button
            onClick={() => confirm(`Apagar "${conv.title}"? Isso não pode ser desfeito.`) && store.remove(conv.id)}
            className="p-1 hover:text-red-400" title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {moving && (
        <div className="px-3 pb-2">
          <select
            autoFocus
            value={conv.folderId ?? ""}
            onChange={(e) => { store.moveToFolder(conv.id, e.target.value || null); setMoving(false); }}
            onBlur={() => setMoving(false)}
            className="w-full bg-card border border-line rounded-lg px-2 py-1.5 text-sm outline-none"
          >
            <option value="">Sem pasta</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          {folders.length === 0 && <p className="text-xs text-muted mt-1">Crie uma pasta primeiro.</p>}
        </div>
      )}
    </div>
  );
}

export default function ConversationList({ store, filter, search, onPicked }) {
  const q = search.trim().toLowerCase();
  const items = store.conversations.filter((c) => {
    if (filter.type === "favorites" && !c.favorite) return false;
    if (filter.type === "folder" && c.folderId !== filter.id) return false;
    if (q && !c.title.toLowerCase().includes(q)) return false;
    return true;
  });

  const heading =
    filter.type === "favorites" ? "FAVORITOS"
    : filter.type === "folder" ? (store.folders.find((f) => f.id === filter.id)?.name ?? "PASTA").toUpperCase()
    : "CONVERSAS RECENTES";

  return (
    <div>
      <p className="text-[11px] font-semibold text-muted tracking-wider px-3 mb-1">{heading}</p>
      {!store.ready ? (
        <p className="px-3 text-xs text-muted">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="px-3 text-xs text-muted/70">{q ? "Nada encontrado." : "Nenhuma conversa aqui."}</p>
      ) : (
        <div className="space-y-0.5">
          {items.map((c) => (
            <ConversationItem key={c.id} conv={c} active={c.id === store.activeId}
              folders={store.folders} store={store} onPicked={onPicked} />
          ))}
        </div>
      )}
    </div>
  );
}
