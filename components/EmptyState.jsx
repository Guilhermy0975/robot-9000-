import { Bot, Columns2, Star, FolderOpen } from "lucide-react";
import { BRAND } from "@/lib/brand";

const TIPS = [
  { icon: Columns2, text: "Ative Comparar e envie o mesmo prompt para até 4 modelos." },
  { icon: Star, text: "Favorite conversas para encontrá-las rápido." },
  { icon: FolderOpen, text: "Organize o histórico em pastas." },
];

export default function EmptyState({ anyConnected }) {
  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center text-center px-4 animate-fade-up">
      <div className="bg-brand/15 text-brand p-5 rounded-3xl mb-5"><Bot size={42} /></div>
      <h1 className="text-3xl font-bold mb-2 tracking-tight">{BRAND.tagline}</h1>
      <p className="text-muted mb-8">{BRAND.description}</p>
      <div className="grid sm:grid-cols-3 gap-3 max-w-2xl w-full">
        {TIPS.map(({ icon: Icon, text }) => (
          <div key={text} className="bg-card border border-line rounded-2xl p-4 text-sm text-muted text-left">
            <Icon size={18} className="text-brand mb-2" />
            {text}
          </div>
        ))}
      </div>
      {!anyConnected && (
        <p className="text-xs text-amber-500 mt-6 max-w-md">
          Nenhum provedor conectado no servidor: as respostas serão simuladas e marcadas como tal.
        </p>
      )}
    </div>
  );
}
