"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventPin, getPinColor } from "@/lib/data";

interface Props {
  events: EventPin[];
}

export default function MapView({ events }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="relative flex-1 map-grid overflow-hidden" style={{ background: "#0d0d18" }}>
      {/* SVG roads */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 360 280"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line x1="0" y1="100" x2="360" y2="105" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
        <line x1="0" y1="185" x2="360" y2="180" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <line x1="110" y1="0" x2="95" y2="280" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
        <line x1="235" y1="0" x2="255" y2="280" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
        <line x1="0" y1="45" x2="150" y2="62" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1="150" y1="62" x2="360" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1="0" y1="235" x2="360" y2="230" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        {/* Label overlays */}
        <text x="18" y="94" fontSize="8" fill="rgba(255,255,255,0.18)" fontFamily="var(--font-dm)">Baner Rd</text>
        <text x="18" y="178" fontSize="8" fill="rgba(255,255,255,0.13)" fontFamily="var(--font-dm)">Wakad Rd</text>
        <text x="116" y="14" fontSize="8" fill="rgba(255,255,255,0.13)" fontFamily="var(--font-dm)">NH48</text>
      </svg>

      {/* Event pins */}
      {events.map((event) => {
        const color = getPinColor(event.color);
        const isHovered = hoveredId === event.id;

        return (
          <button
            key={event.id}
            className="absolute flex flex-col items-center cursor-pointer transition-transform duration-200"
            style={{
              left: `${event.mapX}%`,
              top: `${event.mapY}%`,
              transform: `translate(-50%, -50%) scale(${isHovered ? 1.15 : 1})`,
              zIndex: isHovered ? 10 : 1,
            }}
            onMouseEnter={() => setHoveredId(event.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => router.push(`/event/${event.id}`)}
            aria-label={`${event.name} in ${event.neighborhood}`}
          >
            {/* Pin shape */}
            <div
              className="w-11 h-11 flex items-center justify-center text-lg pin-live"
              style={{
                background: color,
                borderRadius: "50% 50% 50% 4px",
                transform: "rotate(-45deg)",
                boxShadow: isHovered
                  ? `0 0 0 5px rgba(255,255,255,0.1), 0 0 24px ${color}44`
                  : `0 0 0 3px rgba(255,255,255,0.07)`,
                transition: "box-shadow 0.2s",
              }}
            >
              <span style={{ transform: "rotate(45deg)", display: "block", fontSize: "18px" }}>
                {event.emoji}
              </span>
            </div>

            {/* Label */}
            {isHovered && (
              <div
                className="absolute top-full mt-2 text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap z-20"
                style={{
                  background: "var(--surface2)",
                  border: "0.5px solid var(--border2)",
                  color: "var(--text)",
                  pointerEvents: "none",
                }}
              >
                {event.name} · {event.neighborhood}
              </div>
            )}

            {/* Always-visible small label */}
            {!isHovered && (
              <div
                className="absolute top-full mt-1.5 text-[9px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: "rgba(10,10,15,0.75)",
                  border: "0.5px solid var(--border)",
                  color: "var(--muted)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {event.neighborhood}
              </div>
            )}
          </button>
        );
      })}

      {/* You are here */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: "38%", top: "42%", transform: "translate(-50%,-50%)" }}
        aria-label="Your current location"
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white"
          style={{ background: "var(--accent2)" }}
        />
        <div
          className="absolute w-8 h-8 rounded-full opacity-20"
          style={{ background: "var(--accent2)", animation: "pulse-dot 2s infinite" }}
        />
      </div>
    </div>
  );
}
