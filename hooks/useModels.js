"use client";
import { useEffect, useState } from "react";

// Lista de modelos vinda do servidor (sem nenhuma chave de API)
export function useModels() {
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setModels)
      .catch(() => setError("Não foi possível carregar os modelos."));
  }, []);

  return { models, error };
}
