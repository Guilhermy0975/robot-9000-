import { Bot } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-brand text-white p-2 rounded-lg glow">
        <Bot size={20} />
      </div>
      <span className="font-metal text-2xl leading-none text-brand text-glow animate-flicker">
        {BRAND.name}
      </span>
    </div>
  );
}
