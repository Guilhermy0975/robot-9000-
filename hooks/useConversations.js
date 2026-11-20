"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uid, makeTitle, loadLegacy, clearLegacy } from "@/lib/storage";

const SAVE_DELAY = 700;

async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Sessão expirada");
  }
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Erro ${res.status}`);
  return res.json();
}

const hasLoading = (c) => c.turns.some((t) => t.responses.some((r) => r.status === "loading"));

// Estado das conversas, salvo automaticamente na conta do usuário
export function useConversations() {
  const [data, setData] = useState({ conversations: [], folders: [] });
  const [activeId, setActiveId] = useState(null);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Último estado salvo de cada conversa (para só enviar o que mudou)
  const saved = useRef(new Map());
  const savedFolders = useRef("[]");

  // Carrega do servidor e migra o histórico antigo deste navegador (uma vez)
  useEffect(() => {
    (async () => {
      try {
        const server = await api("/api/data");
        for (const c of server.conversations) saved.current.set(c.id, JSON.stringify(c));
        savedFolders.current = JSON.stringify(server.folders);

        const legacy = loadLegacy();
        let conversations = server.conversations;
        let folders = server.folders;
        if (legacy && (legacy.conversations.length || legacy.folders.length)) {
          const knownC = new Set(conversations.map((c) => c.id));
          const knownF = new Set(folders.map((f) => f.id));
          folders = [...folders, ...legacy.folders.filter((f) => !knownF.has(f.id))];
          conversations = [
            ...conversations,
            ...legacy.conversations
              .filter((c) => !knownC.has(c.id))
              .map((c) => ({
                ...c,
                turns: (c.turns || []).map((t) => ({
                  ...t,
                  responses: t.responses.map((r) =>
                    r.status === "loading" ? { ...r, status: "error", error: "Interrompida." } : r
                  ),
                })),
              })),
          ];
          clearLegacy(); // o efeito de salvamento envia tudo para a conta
        }
        setData({ conversations, folders });
      } catch {
        setSaveError(true);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Salvamento automático: envia só as conversas que mudaram
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(async () => {
      try {
        const folderJson = JSON.stringify(data.folders);
        if (folderJson !== savedFolders.current) {
          await api("/api/folders", { method: "PUT", body: JSON.stringify({ folders: data.folders }) });
          savedFolders.current = folderJson;
        }
        for (const c of data.conversations) {
          if (hasLoading(c)) continue; // salva quando as respostas terminarem
          const snapshot = JSON.stringify(c);
          if (saved.current.get(c.id) === snapshot) continue;
          await api(`/api/conversations/${c.id}`, { method: "PUT", body: snapshot });
          saved.current.set(c.id, snapshot);
        }
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    }, SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [data, ready]);

  const mapConv = (id, fn) =>
    setData((d) => ({ ...d, conversations: d.conversations.map((c) => (c.id === id ? fn(c) : c)) }));

  const conversations = useMemo(
    () => [...data.conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [data.conversations]
  );
  const active = data.conversations.find((c) => c.id === activeId) ?? null;

  const addTurn = useCallback((convId, prompt, modelIds, folderId = null) => {
    const now = Date.now();
    const turn = {
      id: uid(),
      prompt,
      createdAt: now,
      responses: modelIds.map((modelId) => ({ modelId, status: "loading", content: "", error: null, simulated: false, model: null })),
    };
    let id = convId;
    if (!id) {
      id = uid();
      const conv = { id, title: makeTitle(prompt), favorite: false, folderId, createdAt: now, updatedAt: now, turns: [turn] };
      setData((d) => ({ ...d, conversations: [conv, ...d.conversations] }));
      setActiveId(id);
    } else {
      mapConv(id, (c) => ({ ...c, updatedAt: now, turns: [...c.turns, turn] }));
    }
    return { convId: id, turnId: turn.id };
  }, []);

  const updateResponse = useCallback((convId, turnId, modelId, patch) => {
    mapConv(convId, (c) => ({
      ...c,
      turns: c.turns.map((t) =>
        t.id !== turnId ? t : { ...t, responses: t.responses.map((r) => (r.modelId === modelId ? { ...r, ...patch } : r)) }
      ),
    }));
  }, []);

  const rename = useCallback((id, title) => {
    const clean = title.trim().slice(0, 80);
    if (clean) mapConv(id, (c) => ({ ...c, title: clean }));
  }, []);

  const toggleFavorite = useCallback((id) => mapConv(id, (c) => ({ ...c, favorite: !c.favorite })), []);
  const moveToFolder = useCallback((id, folderId) => mapConv(id, (c) => ({ ...c, folderId })), []);

  const remove = useCallback((id) => {
    setData((d) => ({ ...d, conversations: d.conversations.filter((c) => c.id !== id) }));
    setActiveId((cur) => (cur === id ? null : cur));
    saved.current.delete(id);
    api(`/api/conversations/${id}`, { method: "DELETE" }).catch(() => setSaveError(true));
  }, []);

  const createFolder = useCallback((name) => {
    const clean = name.trim().slice(0, 40);
    if (!clean) return null;
    const folder = { id: uid(), name: clean };
    setData((d) => ({ ...d, folders: [...d.folders, folder] }));
    return folder.id;
  }, []);

  const deleteFolder = useCallback((folderId) => {
    // Apaga só a pasta; as conversas voltam para "sem pasta"
    setData((d) => ({
      folders: d.folders.filter((f) => f.id !== folderId),
      conversations: d.conversations.map((c) => (c.folderId === folderId ? { ...c, folderId: null } : c)),
    }));
  }, []);

  return {
    ready, saveError, conversations, folders: data.folders, active, activeId, setActiveId,
    addTurn, updateResponse, rename, toggleFavorite, moveToFolder, remove, createFolder, deleteFolder,
  };
}
