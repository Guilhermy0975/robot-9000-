"use client";
import { useEffect, useRef } from "react";
import ComparisonView from "./ComparisonView";
import EmptyState from "./EmptyState";

export default function ChatArea({ conversation, models, onRetry }) {
  const bottom = useRef(null);
  const turns = conversation?.turns ?? [];
  const last = turns[turns.length - 1];

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, last?.responses.map((r) => r.status).join()]);

  if (!turns.length) return <EmptyState anyConnected={models.some((m) => m.connected)} />;

  return (
    <div className="space-y-10">
      {turns.map((t) => (
        <article key={t.id} className="space-y-4">
          <div className="flex justify-end animate-fade-up">
            <div className="bg-gradient-to-br from-brand to-[#8a0a12] text-white px-4 py-3 rounded-xl rounded-br-sm glow max-w-[85%] md:max-w-2xl whitespace-pre-wrap break-words text-[15px]">
              {t.prompt}
            </div>
          </div>
          <ComparisonView responses={t.responses} models={models} onRetry={(modelId) => onRetry(t.id, modelId)} />
        </article>
      ))}
      <div ref={bottom} />
    </div>
  );
}
