import { Bot } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-brand text-white p-2 rounded-xl shadow-lg shadow-brand/30">
        <Bot size={22} />
      </div>
      <span className="font-bold text-lg tracking-tight">{BRAND.name}</span>
    </div>
  );
}
