"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import Logo from "@/components/Logo";

const fmt = (n) => new Intl.NumberFormat("pt-BR").format(Math.round(n));
const usd = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", minimumFractionDigits: n < 1 ? 4 : 2 }).format(n);
const shortDay = (iso) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

function Tile({ label, value, note }) {
  return (
    <div className="bg-card/85 backdrop-blur border border-line rounded-xl p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted">{label}</p>
      <p className="font-display text-3xl mt-1 leading-none">{value}</p>
      {note && <p className="text-xs text-muted mt-2">{note}</p>}
    </div>
  );
}

function Tag({ kind }) {
  return kind === "real" ? (
    <span className="text-[10px] uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">real</span>
  ) : (
    <span className="text-[10px] uppercase tracking-wider bg-amber-400/15 text-amber-500 px-1.5 py-0.5 rounded">estimativa</span>
  );
}

// Gráfico de colunas: perguntas por dia (uma série, sem legenda)
function DailyChart({ days }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...days.map((d) => d.prompts));
  const ticks = [max, Math.round(max / 2), 0].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="bg-card/85 backdrop-blur border border-line rounded-xl p-4">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display uppercase tracking-wider">Perguntas por dia</h2>
        <span className="text-xs text-muted">últimos 14 dias</span>
      </div>

      <div className="relative h-44 flex">
        {/* eixo e grade discretos */}
        <div className="flex flex-col justify-between text-[10px] text-muted pr-2 pb-5 tabular-nums">
          {ticks.map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between pointer-events-none">
            {ticks.map((t) => <div key={t} className="border-t border-line" />)}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-5 flex items-end gap-[2px]">
            {days.map((d, i) => (
              <div
                key={d.day}
                className="relative flex-1 h-full flex items-end cursor-default"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setHover(hover === i ? null : i)}
              >
                <div
                  className={`w-full rounded-t-[4px] transition-colors ${hover === i ? "bg-brand" : "bg-brand/70"}`}
                  style={{ height: `${(d.prompts / max) * 100}%`, minHeight: d.prompts ? 3 : 0 }}
                />
                {hover === i && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 whitespace-nowrap bg-side border border-line rounded-md px-2 py-1 text-xs shadow-lg">
                    <b>{shortDay(d.day)}</b> · {d.prompts} pergunta{d.prompts === 1 ? "" : "s"} · {d.responses} resposta{d.responses === 1 ? "" : "s"}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex gap-[2px] text-[10px] text-muted">
            {days.map((d, i) => (
              <span key={d.day} className="flex-1 text-center">{i % 2 === 1 || days.length <= 7 ? shortDay(d.day) : ""}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Barras horizontais: tokens por modelo (magnitude em um só tom)
function ModelBreakdown({ models }) {
  const max = Math.max(1, ...models.map((m) => m.tokens));
  return (
    <div className="bg-card/85 backdrop-blur border border-line rounded-xl p-4">
      <h2 className="font-display uppercase tracking-wider mb-4">Consumo por modelo</h2>
      <div className="space-y-4">
        {models.map((m) => (
          <div key={m.id}>
            <div className="flex items-baseline justify-between gap-2 text-sm mb-1.5">
              <span className="font-semibold">{m.label} <span className="text-muted font-normal text-xs">· {m.provider}</span></span>
              <span className="tabular-nums">{fmt(m.tokens)} tokens</span>
            </div>
            <div className="h-2.5 bg-soft/60 rounded-full overflow-hidden" title={`${fmt(m.tokens)} tokens`}>
              <div className="h-full bg-brand rounded-full" style={{ width: `${(m.tokens / max) * 100}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mt-1.5">
              <span>{m.responses} respostas</span>
              {m.realTokens > 0 && <span className="inline-flex items-center gap-1"><Tag kind="real" /> {fmt(m.realTokens)}</span>}
              {m.estimatedTokens > 0 && <span className="inline-flex items-center gap-1"><Tag kind="est" /> {fmt(m.estimatedTokens)}</span>}
              {m.errors > 0 && <span>{m.errors} com erro</span>}
              {m.simulated > 0 && <span>{m.simulated} simuladas</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostTable({ models, total }) {
  return (
    <div className="bg-card/85 backdrop-blur border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display uppercase tracking-wider">Custo estimado por provedor</h2>
        <Tag kind="est" />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-widest text-muted">
            <th className="font-normal pb-2">Provedor</th>
            <th className="font-normal pb-2">Preço de referência</th>
            <th className="font-normal pb-2 text-right">Custo</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m.id} className="border-t border-line">
              <td className="py-2">{m.provider}</td>
              <td className="py-2 text-muted">{m.priceRef}</td>
              <td className="py-2 text-right tabular-nums">{usd(m.cost)}</td>
            </tr>
          ))}
          <tr className="border-t border-line font-semibold">
            <td className="py-2" colSpan={2}>Total</td>
            <td className="py-2 text-right tabular-nums">{usd(total)}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-muted mt-3 flex gap-1.5">
        <Info size={14} className="shrink-0 mt-0.5" />
        Calculado com preços de referência do modelo padrão de cada provedor. O valor real depende do
        modelo, do seu plano (inclusive planos gratuitos) e dos preços atuais — confira no site do provedor.
      </p>
    </div>
  );
}

export default function UsagePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => {
        if (r.status === 401) window.location.href = "/login";
        return r.ok ? r.json() : Promise.reject();
      })
      .then(setData)
      .catch(() => setError("Não foi possível carregar as estatísticas."));
  }, []);

  return (
    <div className="relative min-h-dvh bg-poster">
      <div className="poster-layer" aria-hidden />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-fg">
            <ArrowLeft size={18} /> Voltar
          </Link>
          <Logo />
        </div>

        <h1 className="font-display uppercase tracking-wider text-3xl mb-6">Estatísticas</h1>

        {error && <p className="text-red-400">{error}</p>}
        {!data && !error && (
          <p className="text-muted flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Calculando…</p>
        )}

        {data && (
          <div className="space-y-5 animate-fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Tile label="Conversas" value={fmt(data.totals.conversations)} />
              <Tile label="Perguntas" value={fmt(data.totals.prompts)} />
              <Tile label="Respostas de IA" value={fmt(data.totals.responses)} note="sem contar simuladas" />
              <Tile
                label="Tokens"
                value={fmt(data.totals.tokens)}
                note={data.totals.estimatedTokens > 0 ? `${fmt(data.totals.estimatedTokens)} estimados` : "todos reais"}
              />
            </div>

            <DailyChart days={data.days} />
            <ModelBreakdown models={data.models} />
            <CostTable models={data.models} total={data.totals.cost} />

            {data.quota && (
              <p className="text-sm text-muted">
                Mensagens grátis do app hoje: <b className="text-fg">{data.quota.used}</b> de {data.quota.limit} usadas.
                Com a sua própria chave, não há limite diário.
              </p>
            )}

            <div className="text-xs text-muted bg-card/60 border border-line rounded-xl p-4 space-y-1">
              <p className="flex items-center gap-2"><Tag kind="real" /> número informado pelo provedor de IA em cada resposta.</p>
              <p className="flex items-center gap-2"><Tag kind="est" /> calculado aproximadamente (cerca de 4 letras por token), quando o provedor não informou.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
