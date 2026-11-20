import { BRAND } from "@/lib/brand";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/art/logo-96.jpg"
        alt=""
        width={40}
        height={40}
        className="w-10 h-10 rounded-lg object-cover glow ring-1 ring-brand/60"
      />
      <span className="font-logo italic text-[1.7rem] leading-none tracking-tight text-brand text-glow animate-flicker">
        {BRAND.name}
      </span>
    </div>
  );
}
