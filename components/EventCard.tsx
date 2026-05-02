"use client";
import Link from "next/link";
import { EventPin, getStatusColor } from "@/lib/data";

interface Props {
  event: EventPin;
  delay?: number;
}

export default function EventCard({ event, delay = 0 }: Props) {
  const statusColor = getStatusColor(event.status);
  const spotsLeft = event.capacity - event.attending;

  return (
    <Link
      href={`/event/${event.id}`}
      className="fade-up flex items-center gap-3 rounded-xl p-3 transition-all"
      style={{
        background: "var(--surface2)",
        border: "0.5px solid var(--border)",
        animationDelay: `${delay}ms`,
        opacity: 0,
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {event.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--text)", fontFamily: "var(--font-head)" }}
        >
          {event.name}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
          {event.time} · {event.neighborhood} · {event.vibe.slice(0, 2).join(" / ")}
        </p>
      </div>

      {/* Badge */}
      <div
        className="text-[10px] font-medium px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ background: statusColor.bg, color: statusColor.text }}
      >
        {event.status === "open"
          ? "Open"
          : event.status === "full"
          ? "Full"
          : `${spotsLeft} left`}
      </div>
    </Link>
  );
}
