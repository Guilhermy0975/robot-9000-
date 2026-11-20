"use client";
import { useEffect, useRef } from "react";
import { Paperclip, Send, Loader2 } from "lucide-react";

export default function ChatInput({ value, onChange, onSend, busy, disabledReason }) {
  const ref = useRef(null);

  // Cresce conforme o texto (até um limite)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  const canSend = value.trim() && !busy && !disabledReason;

  return (
    <div className="bg-card border border-line rounded-2xl p-2 shadow-xl shadow-black/10 focus-within:border-brand/50 transition">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (canSend) onSend();
          }
        }}
        rows={1}
        placeholder="Pergunte qualquer coisa..."
        className="w-full bg-transparent outline-none resize-none px-3 py-2 text-[15px] placeholder:text-muted"
      />
      <div className="flex items-center justify-between px-1">
        <button
          disabled
          title="Upload de arquivos chega em um próximo módulo"
          className="p-2 text-muted opacity-50 cursor-not-allowed"
        >
          <Paperclip size={18} />
        </button>
        <div className="flex items-center gap-3">
          {disabledReason && <span className="text-xs text-amber-400">{disabledReason}</span>}
          <button
            onClick={onSend}
            disabled={!canSend}
            className="bg-brand text-white p-2.5 rounded-xl hover:brightness-110 disabled:opacity-40 transition"
            aria-label="Enviar"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
