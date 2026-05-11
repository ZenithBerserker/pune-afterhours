"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Mode = "signin" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      if (mode === "signup") {
        const { error: signErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim() || email.split("@")[0],
              college: college.trim(),
            },
          },
        });
        if (signErr) throw signErr;
        setInfo(
          "Check your inbox to confirm email if required. You can switch to Sign in afterward."
        );
        router.refresh();
      } else {
        const { error: inErr } = await supabase.auth.signInWithPassword({ email, password });
        if (inErr) throw inErr;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-16 pb-10" style={{ background: "var(--bg)", maxWidth: 430, margin: "0 auto" }}>
      <Link
        href="/"
        className="text-[11px] uppercase tracking-widest mb-8"
        style={{ color: "var(--muted)" }}
      >
        ← Back to discover
      </Link>
      <h1
        className="text-2xl font-extrabold tracking-tight mb-1"
        style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}
      >
        Pune Afterhours
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        {mode === "signin" ? "Welcome back." : "Create an account to host and send entry requests."}
      </p>

      <div className="flex gap-2 mb-6">
        {(["signin", "signup"] as const).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: active ? "var(--accent)" : "var(--surface2)",
                color: active ? "#0a0a0f" : "var(--muted)",
                border: `0.5px solid ${active ? "var(--accent)" : "var(--border2)"}`,
              }}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        {mode === "signup" && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
                Display name
              </label>
              <input
                className="form-input"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                required={mode === "signup"}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
                College (optional)
              </label>
              <input
                className="form-input"
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="College or university"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
            Email
          </label>
          <input
            className="form-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
            Password
          </label>
          <input
            className="form-input"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        {error && (
          <div
            className="text-xs p-3 rounded-xl"
            style={{
              background: "rgba(255,107,74,0.08)",
              border: "0.5px solid rgba(255,107,74,0.24)",
              color: "var(--warm)",
            }}
          >
            {error}
          </div>
        )}
        {info && (
          <div
            className="text-xs p-3 rounded-xl"
            style={{
              background: "rgba(200,245,100,0.08)",
              border: "0.5px solid rgba(200,245,100,0.22)",
              color: "var(--accent)",
            }}
          >
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-opacity"
          style={{
            fontFamily: "var(--font-head)",
            background: "var(--accent2)",
            color: "#fff",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
