"use client";
import { Columns2 } from "lucide-react";

function StatusDot({ connected }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`}
      title={connected ? "Conectado" : "Simulado (sem chave no servidor)"}
    />
  );
}

export default function ModelSelector({ models, compare, setCompare, single, setSingle, selected, setSelected }) {
  function toggle(id) {
    setSelected((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : old.length < 4 ? [...old, id] : old
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {models.map((m) => {
        const on = compare ? selected.includes(m.id) : single === m.id;
        return (
          <button
            key={m.id}
            onClick={() => (compare ? toggle(m.id) : setSingle(m.id))}
            className={`shrink-0 flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-display uppercase tracking-wider border transition
              ${on ? "bg-brand text-white border-brand glow" : "bg-card border-line text-muted hover:text-fg hover:border-brand/50"}`}
            title={`${m.provider} · ${m.connected ? m.model : "resposta simulada"}`}
          >
            <StatusDot connected={m.connected} />
            {m.label}
          </button>
        );
      })}
      <span className="w-px h-6 bg-line shrink-0 mx-1" />
      <button
        onClick={() => setCompare(!compare)}
        className={`shrink-0 flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-display uppercase tracking-wider border transition
          ${compare ? "bg-brand/15 text-brand border-brand/40" : "bg-card border-line text-muted hover:text-fg"}`}
      >
        <Columns2 size={15} /> Comparar{compare ? ` (${selected.length})` : ""}
      </button>
    </div>
  );
}
