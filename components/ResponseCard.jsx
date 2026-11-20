"use client";
import { useState } from "react";
import { Copy, Check, AlertTriangle, RotateCcw, FlaskConical } from "lucide-react";

export default function ResponseCard({ response, info, onRetry }) {
  const [copied, setCopied] = useState(false);
  const { status, content, error, simulated, model } = response;

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div
      className={`animate-fade-up bg-card/85 backdrop-blur border rounded-xl p-4 md:p-5 flex flex-col min-w-0
        ${status === "error" ? "border-red-500/60" : status === "loading" ? "border-brand/50 glow" : "border-line hover:border-brand/40"} transition`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-display uppercase tracking-wider text-lg leading-none text-brand">{info?.label ?? response.modelId}</p>
          <p className="text-[11px] uppercase tracking-widest text-muted truncate mt-1">
            {info?.provider ?? "Provedor desconhecido"}{model && !simulated ? ` · ${model}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {simulated && status === "done" && (
            <span className="flex items-center gap-1 text-[11px] bg-amber-400/15 text-amber-500 px-2 py-0.5 rounded-full">
              <FlaskConical size={12} /> Simulada
            </span>
          )}
          {status === "done" && (
            <button onClick={copy} className="p-1.5 text-muted hover:text-fg rounded-lg hover:bg-soft" title="Copiar">
              {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            </button>
          )}
        </div>
      </div>

      {status === "loading" && (
        <div className="space-y-2.5 py-1" aria-label="Carregando">
          <div className="h-3 bg-soft rounded animate-pulse w-11/12" />
          <div className="h-3 bg-soft rounded animate-pulse w-9/12" />
          <div className="h-3 bg-soft rounded animate-pulse w-10/12" />
        </div>
      )}

      {status === "done" && (
        <p className="text-[15px] leading-7 whitespace-pre-wrap break-words">{content}</p>
      )}

      {status === "error" && (
        <div className="text-sm text-red-400 space-y-3">
          <p className="flex gap-2"><AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}</p>
          {onRetry && (
            <button onClick={onRetry} className="flex items-center gap-1.5 text-fg bg-soft hover:brightness-110 rounded-lg px-3 py-1.5">
              <RotateCcw size={14} /> Tentar de novo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
