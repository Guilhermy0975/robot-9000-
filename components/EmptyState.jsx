import { Columns2, Star, FolderOpen } from "lucide-react";
import { BRAND } from "@/lib/brand";

const TIPS = [
  { icon: Columns2, title: "Compare", text: "Mande o mesmo prompt para até 4 modelos." },
  { icon: Star, title: "Favorite", text: "Marque as conversas que importam." },
  { icon: FolderOpen, title: "Organize", text: "Separe o histórico em pastas." },
];

export default function EmptyState({ anyConnected }) {
  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-2 animate-fade-up">
      {/* Arte principal do Robot 9000 */}
      <div className="relative w-56 h-56 md:w-72 md:h-72 mb-6">
        <div className="absolute -inset-6 rounded-full bg-brand/30 blur-3xl" aria-hidden />
        <img
          src="/art/robot9000.jpg"
          alt={BRAND.name}
          className="relative w-full h-full object-cover rounded-2xl ring-1 ring-brand/60 glow"
        />
      </div>

      <p className="font-display uppercase tracking-[0.35em] text-xs text-brand mb-3">
        Multi-model // Compare // Control
      </p>
      <p className="font-display uppercase text-2xl md:text-3xl tracking-wide mb-2">
        {BRAND.tagline}
      </p>
      <p className="text-muted mb-10 max-w-md">{BRAND.description}</p>

      <div className="grid sm:grid-cols-3 gap-3 max-w-2xl w-full">
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
        <p className="text-[11px] uppercase tracking-widest text-brand/80 mt-8 max-w-md">
          Modo simulado — nenhuma IA conectada no servidor
        </p>
      )}
    </div>
  );
}
