"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VIBE_OPTIONS, NEIGHBORHOODS, VibeTag, AccessType } from "@/lib/data";
import { Globe, Link2, Lock } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const ACCESS_OPTIONS: { key: AccessType; icon: typeof Globe; label: string; desc: string }[] = [
  { key: "public", icon: Globe, label: "Public", desc: "Any verified user" },
  { key: "mutual", icon: Link2, label: "Mutual friends", desc: "Your network only" },
  { key: "invite", icon: Lock, label: "Invite only", desc: "You approve each guest" },
];

export default function HostPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [time, setTime] = useState("22:00");
  const [capacity, setCapacity] = useState("20");
  const [entry, setEntry] = useState("Free · BYOJ");
  const [selectedVibes, setSelectedVibes] = useState<VibeTag[]>(["Acoustic"]);
  const [access, setAccess] = useState<AccessType>("public");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleVibe(v: VibeTag) {
    setSelectedVibes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  async function handleSubmit() {
    if (!name || !neighborhood) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          neighborhood,
          time,
          capacity: Number(capacity),
          entry,
          vibe: selectedVibes,
          access,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Could not create event.");
      }

      setSubmitted(true);
      setTimeout(() => router.push("/"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create event.");
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh text-center px-6" style={{ background: "var(--bg)" }}>
        <div className="text-5xl mb-4">🎉</div>
        <h2
          className="text-2xl font-extrabold mb-2"
          style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}
        >
          Event created!
        </h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Your event was saved and is live on the map.
        </p>
        <p className="text-xs mt-4" style={{ color: "var(--hint)" }}>
          Redirecting to discover…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="px-4 pt-12 pb-4" style={{ background: "var(--bg)" }}>
        <h1
          className="text-xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}
        >
          Drop an event
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Your space, your rules. Verified guests only.
        </p>
      </header>

      {/* Form */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28 space-y-5">

        {/* Event name */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
            Event name
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Chill terrace night"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Neighborhood */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
            Location (neighbourhood)
          </label>
          <select
            className="form-input"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            style={{ appearance: "none" }}
          >
            <option value="" disabled>Select neighbourhood…</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n} style={{ background: "var(--surface2)", color: "var(--text)" }}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Time + Capacity row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
              Start time
            </label>
            <input
              className="form-input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
              Max guests
            </label>
            <input
              className="form-input"
              type="number"
              min="2"
              max="100"
              placeholder="20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
        </div>

        {/* Entry */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
            Entry details
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Free · BYOJ or ₹100 cover"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
        </div>

        {/* Vibe tags */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
            Vibe tags
          </label>
          <div className="flex flex-wrap gap-2">
            {VIBE_OPTIONS.map((v) => {
              const on = selectedVibes.includes(v);
              return (
                <button
                  key={v}
                  onClick={() => toggleVibe(v)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: on ? "rgba(200,245,100,0.1)" : "var(--surface2)",
                    border: `0.5px solid ${on ? "var(--accent)" : "var(--border2)"}`,
                    color: on ? "var(--accent)" : "var(--muted)",
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>

        {/* Access */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--hint)" }}>
            Who can see this event?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ACCESS_OPTIONS.map(({ key, icon: Icon, label, desc }) => {
              const on = access === key;
              return (
                <button
                  key={key}
                  onClick={() => setAccess(key)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                  style={{
                    background: on ? "rgba(124,108,252,0.1)" : "var(--surface2)",
                    border: `0.5px solid ${on ? "var(--accent2)" : "var(--border2)"}`,
                  }}
                >
                  <Icon size={16} color={on ? "var(--accent2)" : "var(--hint)"} />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: on ? "var(--accent2)" : "var(--text)" }}
                  >
                    {label}
                  </span>
                  <span className="text-[9px] text-center leading-tight" style={{ color: "var(--hint)" }}>
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save error */}
        {error && (
          <div
            className="p-3 rounded-xl text-xs"
            style={{ background: "rgba(255,107,74,0.08)", border: "0.5px solid rgba(255,107,74,0.24)", color: "var(--warm)" }}
          >
            {error}
          </div>
        )}

        {/* Noise reminder */}
        <div
          className="flex items-start gap-3 p-3 rounded-xl"
          style={{ background: "rgba(255,107,74,0.07)", border: "0.5px solid rgba(255,107,74,0.2)" }}
        >
          <span className="text-lg flex-shrink-0">🔇</span>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            We'll send you a reminder at <strong style={{ color: "var(--warm)" }}>9:45 PM</strong> to
            lower music volume. Noise compliance keeps the community safe.
          </p>
        </div>

      </div>

      {/* Submit */}
      <div
        className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-3 pt-2"
        style={{ background: "var(--bg)", borderTop: "0.5px solid var(--border)" }}
      >
        <button
          onClick={handleSubmit}
          disabled={!name || !neighborhood || saving}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
          style={{
            fontFamily: "var(--font-head)",
            background: name && neighborhood && !saving ? "var(--accent2)" : "var(--surface2)",
            color: name && neighborhood && !saving ? "#fff" : "var(--hint)",
            border: name && neighborhood && !saving ? "none" : "0.5px solid var(--border2)",
            cursor: name && neighborhood && !saving ? "pointer" : "not-allowed",
          }}
        >
          {saving ? "Creating event..." : "Create event"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
