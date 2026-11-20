"use client";
import { Menu, Moon, Sun, Star } from "lucide-react";

export default function TopBar({ title, onMenu, theme, onToggleTheme, conversation, onFavorite }) {
  return (
    <header className="pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] border-b border-line flex items-center justify-between px-4 gap-3 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenu} className="text-muted hover:text-fg p-1" aria-label="Abrir/fechar menu">
          <Menu size={20} />
        </button>
        <h2 className="font-semibold truncate">{title}</h2>
      </div>
      <div className="flex items-center gap-1 text-muted">
        {conversation && (
          <button onClick={onFavorite} className="p-2 hover:text-yellow-400" title="Favoritar">
            <Star size={18} className={conversation.favorite ? "text-yellow-400" : ""}
              fill={conversation.favorite ? "currentColor" : "none"} />
          </button>
        )}
        <button onClick={onToggleTheme} className="p-2 hover:text-fg" title="Alternar tema">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
