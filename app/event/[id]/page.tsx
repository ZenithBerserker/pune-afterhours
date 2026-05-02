"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EventPin, getPinColor, getStatusColor } from "@/lib/data";
import { ArrowLeft, Star, Shield, Lock, Users, Clock, MapPin } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function EventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventPin | null>(null);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`, { cache: "no-store" });
        if (response.ok) {
          setEvent(await response.json());
        }
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh text-sm" style={{ background: "var(--bg)", color: "var(--muted)" }}>
        Loading event...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-3 text-center px-6" style={{ background: "var(--bg)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>This event is no longer available.</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: "var(--accent)", color: "#0a0a0f" }}
        >
          Back to discover
        </button>
      </div>
    );
  }

  const pinColor = getPinColor(event.color);
  const statusColor = getStatusColor(event.status);
  const femaleRatio = Math.round((event.femaleCount / event.capacity) * 100);
  const maleRatio = Math.round((event.maleCount / event.capacity) * 100);
  const spotsLeft = event.capacity - event.attending;

  return (
    <div className="flex flex-col h-dvh" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <div className="relative flex-shrink-0" style={{ height: 200, background: "#0d0d18", overflow: "hidden" }}>
        {/* Background glow */}
        <div
          className="absolute inset-0 flex items-center justify-center text-8xl opacity-30 select-none"
          aria-hidden
        >
          {event.emoji}
        </div>
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 60%, ${pinColor}18, transparent 70%)` }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(transparent, var(--bg))" }}
        />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", border: "0.5px solid var(--border2)" }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} color="var(--text)" />
        </button>

        {/* Tags */}
        <div className="absolute bottom-4 left-4 flex gap-1.5 flex-wrap">
          {event.vibe.map((v) => (
            <span
              key={v}
              className="text-[10px] font-medium px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(0,0,0,0.55)",
                border: "0.5px solid var(--border2)",
                color: "var(--text)",
                backdropFilter: "blur(6px)",
              }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28">
        {/* Title */}
        <h1
          className="text-2xl font-extrabold tracking-tight mt-4 mb-1"
          style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}
        >
          {event.name}
        </h1>

        {/* Host row */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: "var(--accent2)", color: "#fff" }}
          >
            {event.hostInitials}
          </div>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Hosted by {event.hostName}
          </span>
          {event.hostTrusted && (
            <div
              className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(200,245,100,0.1)", color: "var(--accent)" }}
            >
              <Shield size={9} />
              Trusted host
            </div>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: Clock, label: "When", val: `Tonight · ${event.time}` },
            { icon: MapPin, label: "Where", val: `${event.neighborhood}, Pune` },
            { icon: Users, label: "Capacity", val: `${event.attending} / ${event.capacity}` },
            {
              icon: event.access === "invite" ? Lock : Shield,
              label: "Entry",
              val: event.entry,
            },
          ].map(({ icon: Icon, label, val }) => (
            <div
              key={label}
              className="rounded-xl p-3"
              style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={10} color="var(--hint)" />
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--hint)" }}>
                  {label}
                </p>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {val}
              </p>
            </div>
          ))}
        </div>

        {/* Status badge */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
          style={{ background: statusColor.bg, border: `0.5px solid ${statusColor.text}22` }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: statusColor.text }} />
          <span className="text-xs font-medium" style={{ color: statusColor.text }}>
            {event.status === "open"
              ? `${spotsLeft} spots available`
              : event.status === "full"
              ? "This event is at full capacity"
              : `Only ${spotsLeft} spots left — request quickly`}
          </span>
        </div>

        {/* Crowd ratio */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-[11px]" style={{ color: "var(--muted)" }}>Crowd ratio</span>
            <span className="text-[11px]" style={{ color: "var(--hint)" }}>
              {event.femaleCount}F · {event.maleCount}M
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden flex" style={{ background: "var(--surface2)" }}>
            <div
              className="h-full"
              style={{
                width: `${femaleRatio}%`,
                background: "var(--accent2)",
                borderRadius: "4px 0 0 4px",
                transition: "width 0.5s ease",
              }}
            />
            <div
              className="h-full"
              style={{
                width: `${maleRatio}%`,
                background: "var(--warm)",
                borderRadius: "0 4px 4px 0",
              }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
          {event.description}
        </p>

        {/* Host rating */}
        <div
          className="flex items-center justify-between p-3 rounded-xl"
          style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{ background: "var(--accent2)", color: "#fff" }}
            >
              {event.hostInitials}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {event.hostName}
              </p>
              <p className="text-[11px]" style={{ color: "var(--hint)" }}>
                Verified host
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} color="#c8f564" fill="#c8f564" />
            <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
              {event.hostRating}
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-3 pt-2"
        style={{ background: "var(--bg)", borderTop: "0.5px solid var(--border)" }}
      >
        <button
          onClick={() => setRequested(true)}
          disabled={event.status === "full" || requested}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
          style={{
            fontFamily: "var(--font-head)",
            background: requested
              ? "var(--surface2)"
              : event.status === "full"
              ? "var(--surface2)"
              : "var(--accent)",
            color: requested || event.status === "full" ? "var(--muted)" : "#0a0a0f",
            border: requested || event.status === "full" ? "0.5px solid var(--border2)" : "none",
            cursor: event.status === "full" ? "not-allowed" : "pointer",
          }}
        >
          {requested
            ? "✓ Request sent — awaiting host approval"
            : event.status === "full"
            ? "Event is full"
            : "Request Entry →"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
