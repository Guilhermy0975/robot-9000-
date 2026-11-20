import ResponseCard from "./ResponseCard";

const COLS = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-2 xl:grid-cols-3", 4: "md:grid-cols-2 2xl:grid-cols-4" };

// Mostra 1 a 4 respostas: empilhadas no celular, em colunas em telas maiores
export default function ComparisonView({ responses, models, onRetry }) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${COLS[responses.length] ?? COLS[4]}`}>
      {responses.map((r) => (
        <ResponseCard
          key={r.modelId}
          response={r}
          info={models.find((m) => m.id === r.modelId)}
          onRetry={() => onRetry(r.modelId)}
        />
      ))}
    </div>
  );
}
