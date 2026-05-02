"use client";
import { useState } from "react";
import { MOCK_EVENTS, VibeTag, VIBE_OPTIONS, EventPin } from "@/lib/data";
import MapView from "@/components/MapView";
import EventCard from "@/components/EventCard";
import BottomNav from "@/components/BottomNav";

const FILTERS: (VibeTag | "All")[] = ["All", "Terrace Gig", "Acoustic", "Techno", "Poker", "Flat Party", "Open Mic"];

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState<VibeTag | "All">("All");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered: EventPin[] =
    activeFilter === "All"
      ? MOCK_EVENTS
      : MOCK_EVENTS.filter((e) => e.vibe.includes(activeFilter as VibeTag));

  return (
    <div className="flex flex-col h-dvh" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3" style={{ background: "var(--bg)", zIndex: 10 }}>
        <h1
          className="text-xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}
        >
          pune{" "}
          <span style={{ color: "var(--accent)" }}>afterhours</span>
        </h1>
        <div
          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full"
          style={{ background: "var(--surface2)", border: "0.5px solid var(--border2)", color: "var(--muted)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full pulse"
            style={{ background: "var(--accent)" }}
          />
          Baner, Pune
        </div>
      </header>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => {
          const on = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f as VibeTag | "All")}
              className="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full transition-all"
              style={{
                background: on ? "var(--accent)" : "var(--surface2)",
                border: `0.5px solid ${on ? "var(--accent)" : "var(--border2)"}`,
                color: on ? "#0a0a0f" : "var(--muted)",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <MapView events={filtered} />

      {/* Drawer toggle */}
      <button
        onClick={() => setDrawerOpen((p) => !p)}
        className="flex justify-center py-3"
        style={{ background: "var(--surface)", borderTop: "0.5px solid var(--border2)" }}
        aria-label="Toggle event list"
      >
        <div className="w-9 h-1 rounded-full" style={{ background: "var(--border2)" }} />
      </button>

      {/* Event list drawer */}
      {drawerOpen && (
        <div
          className="slide-up overflow-y-auto no-scrollbar px-4 pb-4 space-y-2"
          style={{
            background: "var(--surface)",
            maxHeight: "52%",
            borderTop: "0.5px solid var(--border2)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-widest pt-3 pb-1"
            style={{ color: "var(--hint)", fontFamily: "var(--font-head)" }}
          >
            Tonight · {filtered.length} events near you
          </p>
          {filtered.map((ev, i) => (
            <EventCard key={ev.id} event={ev} delay={i * 50} />
          ))}
        </div>
      )}

      {/* Always-visible mini strip when drawer closed */}
      {!drawerOpen && (
        <div
          className="px-4 pb-2 overflow-x-auto no-scrollbar flex gap-2"
          style={{ background: "var(--surface)" }}
        >
          {filtered.slice(0, 3).map((ev) => (
            <a
              key={ev.id}
              href={`/event/${ev.id}`}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px]"
              style={{
                background: "var(--surface2)",
                border: "0.5px solid var(--border)",
                color: "var(--muted)",
                minWidth: 140,
              }}
            >
              <span>{ev.emoji}</span>
              <span className="truncate" style={{ color: "var(--text)", fontWeight: 500 }}>
                {ev.neighborhood}
              </span>
              <span style={{ color: "var(--hint)" }}>{ev.time}</span>
            </a>
          ))}
        </div>
      )}

      <div className="h-16" />
      <BottomNav />
    </div>
  );
}
