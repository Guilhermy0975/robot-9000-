"use client";
import { useCallback, useEffect, useState } from "react";

// Usuário logado + quantas mensagens ainda pode mandar hoje
export function useAccount() {
  const [user, setUser] = useState(null);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => {
        if (r.status === 401) window.location.href = "/login";
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (d) { setUser(d.user); setQuota(d.quota); }
      })
      .catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  }, []);

  return { user, quota, setQuota, logout };
}
