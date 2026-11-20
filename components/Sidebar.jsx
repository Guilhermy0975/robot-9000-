"use client";
import { useState } from "react";
import {
  Plus, Search, Star, Folder, FolderPlus, MessagesSquare, BookOpen,
  Settings, BarChart3, UserCircle2, X, Trash2,
} from "lucide-react";
import Logo from "./Logo";
import ConversationList from "./ConversationList";

function NavItem({ icon: Icon, label, active, onClick, soon, count }) {
  return (
    <button
      onClick={onClick}
      disabled={soon}
      title={soon ? "Disponível em um próximo módulo" : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
        ${active ? "bg-brand/15 text-brand" : "text-muted hover:text-fg hover:bg-soft/60"}
        disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-muted disabled:cursor-not-allowed`}
    >
      <Icon size={17} />
      <span className="flex-1 text-left truncate">{label}</span>
      {soon && <span className="text-[10px] uppercase tracking-wide bg-soft px-1.5 py-0.5 rounded">em breve</span>}
      {count != null && !soon && <span className="text-xs opacity-70">{count}</span>}
    </button>
  );
}

export default function Sidebar({ open, onClose, store, filter, setFilter, search, setSearch, onNew }) {
  const [newFolder, setNewFolder] = useState(null);
  const { conversations, folders } = store;

  const favCount = conversations.filter((c) => c.favorite).length;

  function submitFolder(e) {
    e.preventDefault();
    const id = store.createFolder(newFolder ?? "");
    setNewFolder(null);
    if (id) setFilter({ type: "folder", id });
  }

  return (
    <>
      {open && <div onClick={onClose} className="md:hidden fixed inset-0 bg-black/60 z-30 animate-fade-up" />}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-72 shrink-0 bg-side/95 backdrop-blur scanlines border-r border-line flex flex-col
          transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full md:hidden"}`}
      >
        <div className="p-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between">
          <Logo />
          <button onClick={onClose} className="md:hidden text-muted hover:text-fg p-1" aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 space-y-3">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:brightness-110 text-white rounded-lg py-2.5 font-display uppercase tracking-widest text-sm glow transition"
          >
            <Plus size={18} /> Nova conversa
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-muted" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full bg-soft/60 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand/60 placeholder:text-muted"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <nav className="space-y-0.5">
            <NavItem icon={MessagesSquare} label="Todas as conversas" count={conversations.length}
              active={filter.type === "all"} onClick={() => setFilter({ type: "all" })} />
            <NavItem icon={Star} label="Favoritos" count={favCount}
              active={filter.type === "favorites"} onClick={() => setFilter({ type: "favorites" })} />
            <NavItem icon={BookOpen} label="Biblioteca de prompts" soon />
            <NavItem icon={BarChart3} label="Estatísticas" soon />
          </nav>

          <div>
            <div className="flex items-center justify-between px-3 mb-1">
              <p className="text-[11px] font-semibold text-muted tracking-wider">PASTAS</p>
              <button onClick={() => setNewFolder("")} className="text-muted hover:text-fg" title="Nova pasta">
                <FolderPlus size={15} />
              </button>
            </div>
            {newFolder !== null && (
              <form onSubmit={submitFolder} className="px-2 mb-1">
                <input
                  autoFocus
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  onBlur={() => setNewFolder(null)}
                  placeholder="Nome da pasta + Enter"
                  className="w-full bg-soft rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand/60"
                />
              </form>
            )}
            {folders.length === 0 && newFolder === null && (
              <p className="px-3 text-xs text-muted/70">Nenhuma pasta.</p>
            )}
            {folders.map((f) => (
              <div key={f.id} className="group flex items-center">
                <NavItem icon={Folder} label={f.name}
                  count={conversations.filter((c) => c.folderId === f.id).length}
                  active={filter.type === "folder" && filter.id === f.id}
                  onClick={() => setFilter({ type: "folder", id: f.id })} />
                <button
                  onClick={() => {
                    if (confirm(`Apagar a pasta "${f.name}"? As conversas não serão apagadas.`)) {
                      store.deleteFolder(f.id);
                      if (filter.id === f.id) setFilter({ type: "all" });
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 p-1.5"
                  title="Apagar pasta"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <ConversationList store={store} filter={filter} search={search} onPicked={onClose} />
        </div>

        <div className="border-t border-line p-3 space-y-0.5">
          <NavItem icon={Settings} label="Configurações" soon />
          <div className="flex items-center gap-3 px-3 py-2 text-sm">
            <UserCircle2 size={28} className="text-muted" />
            <div className="min-w-0">
              <p className="font-medium truncate">Convidado</p>
              <p className="text-xs text-muted truncate">Dados salvos neste navegador</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
