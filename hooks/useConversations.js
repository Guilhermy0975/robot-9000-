"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadData, saveData, uid, makeTitle } from "@/lib/storage";

export function useConversations() {
  const [data, setData] = useState({ conversations: [], folders: [] });
  const [activeId, setActiveId] = useState(null);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  // Salvamento automático a cada mudança
  useEffect(() => {
    if (ready) setSaveError(!saveData(data));
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
