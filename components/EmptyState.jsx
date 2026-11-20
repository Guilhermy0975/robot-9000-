import { Columns2, Star, FolderOpen } from "lucide-react";
import { BRAND } from "@/lib/brand";

const TIPS = [
  { icon: Columns2, title: "Compare", text: "Mande o mesmo prompt para até 4 modelos." },
  { icon: Star, title: "Favorite", text: "Marque as conversas que importam." },
  { icon: FolderOpen, title: "Organize", text: "Separe o histórico em pastas." },
];

export default function EmptyState({ anyConnected }) {
  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-2 animate-fade-up overflow-hidden">
      {/* Texto gigante de fundo, estilo pôster */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute inset-x-0 top-1/2 -translate-y-1/2 font-display uppercase text-outline opacity-25 leading-none text-[26vw] md:text-[16vw] whitespace-nowrap"
      >
        9000
      </span>

      <p className="relative font-display uppercase tracking-[0.35em] text-xs text-brand mb-3">
        Multi-model // Compare // Control
      </p>
      <h1 className="relative font-metal text-6xl md:text-8xl leading-none text-brand text-glow animate-flicker mb-4">
        {BRAND.name}
      </h1>
      <p className="relative font-display uppercase text-2xl md:text-3xl tracking-wide mb-2">
        {BRAND.tagline}
      </p>
      <p className="relative text-muted mb-10 max-w-md">{BRAND.description}</p>

      <div className="relative grid sm:grid-cols-3 gap-3 max-w-2xl w-full">
        {TIPS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="bg-card/80 backdrop-blur border border-line rounded-xl p-4 text-left hover:border-brand/60 hover:glow transition"
          >
            <Icon size={18} className="text-brand mb-2" />
            <p className="font-display uppercase tracking-wider text-sm mb-1">{title}</p>
            <p className="text-sm text-muted">{text}</p>
          </div>
        ))}
      </div>

      {!anyConnected && (
        <p className="relative text-[11px] uppercase tracking-widest text-brand/80 mt-8 max-w-md">
          Modo simulado — nenhuma IA conectada no servidor
        </p>
      )}
    </div>
  );
}
