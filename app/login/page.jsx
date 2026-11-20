"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import SocialLinks from "@/components/SocialLinks";

const input =
  "w-full bg-soft/60 border border-line rounded-lg px-4 py-3 outline-none focus:border-brand focus:glow transition placeholder:text-muted";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Algo deu errado");
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="relative min-h-dvh bg-poster flex items-center justify-center p-5">
      <div className="poster-layer" aria-hidden />
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/art/robot9000.jpg" alt={BRAND.name} className="w-36 h-36 rounded-2xl object-cover ring-1 ring-brand/60 glow mb-4" />
          <p className="font-display uppercase tracking-[0.3em] text-xs text-brand">{BRAND.tagline}</p>
        </div>

        <form onSubmit={submit} className="bg-card/85 backdrop-blur border border-line rounded-2xl p-6 space-y-4">
          <h1 className="font-display uppercase tracking-wider text-2xl text-center">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>

          {mode === "register" && (
            <input className={input} placeholder="Seu nome" autoComplete="name" value={form.name} onChange={set("name")} required />
          )}
          <input className={input} type="email" placeholder="E-mail" autoComplete="email" value={form.email} onChange={set("email")} required />
          <input
            className={input} type="password" placeholder="Senha (mín. 8 caracteres)"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={form.password} onChange={set("password")} required minLength={8}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-brand text-white rounded-lg py-3 font-display uppercase tracking-widest glow hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta grátis"}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="w-full text-sm text-muted hover:text-fg"
          >
            {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
