import { BRAND } from "@/lib/brand";

// Ícones simples em SVG (sem depender de bibliotecas externas)
const ICONS = {
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-4 h-4">
      <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-4 h-4">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  ),
};

export default function SocialLinks({ variant = "full" }) {
  const compact = variant === "compact";
  return (
    <div className={compact ? "px-3 py-2" : "w-full max-w-2xl"}>
      <p
        className={`font-display uppercase tracking-[0.25em] text-brand ${compact ? "text-[11px] mb-2" : "text-sm mb-3 text-glow"}`}
      >
        Siga o {BRAND.creator}
      </p>
      <div className={`flex gap-2 ${compact ? "" : "justify-center flex-wrap"}`}>
        {BRAND.socials.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${s.label} — ${BRAND.creator}`}
            className={`flex items-center gap-2 border border-line bg-card/80 text-fg hover:border-brand hover:text-brand hover:glow transition rounded-lg
              ${compact ? "p-2" : "px-4 py-2.5 text-sm font-display uppercase tracking-wider"}`}
          >
            {ICONS[s.id]}
            {!compact && s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
