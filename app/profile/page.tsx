"use client";
import { MOCK_USER } from "@/lib/data";
import { Shield, Star, ChevronRight, GraduationCap, Fingerprint } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mt-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          color="#c8f564"
          fill={s <= rating ? "#c8f564" : "transparent"}
        />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const user = MOCK_USER;

  return (
    <div className="flex flex-col h-dvh" style={{ background: "var(--bg)" }}>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {/* Top section */}
        <div className="px-4 pt-12 pb-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent2), var(--warm))",
                color: "#fff",
                fontFamily: "var(--font-head)",
              }}
            >
              {user.initials}
            </div>
            <div>
              <h1
                className="text-lg font-extrabold"
                style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}
              >
                {user.name}
              </h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {user.handle}
              </p>
              <div className="flex gap-1.5 mt-1.5">
                {user.collegeVerified && (
                  <div
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(124,108,252,0.15)", color: "var(--accent2)" }}
                  >
                    <GraduationCap size={9} />
                    College verified
                  </div>
                )}
                {user.kycVerified && (
                  <div
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(45,226,196,0.15)", color: "var(--teal)" }}
                  >
                    <Fingerprint size={9} />
                    eKYC done
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { val: user.eventsAttended, label: "Attended" },
              { val: user.rating, label: "Rating" },
              { val: user.eventsHosted, label: "Hosted" },
            ].map(({ val, label }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}
              >
                <p
                  className="text-xl font-extrabold"
                  style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}
                >
                  {val}
                </p>
                <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "var(--hint)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Verification card */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-5"
            style={{
              background: "rgba(200,245,100,0.05)",
              border: "0.5px solid rgba(200,245,100,0.18)",
            }}
          >
            <Shield size={18} color="var(--accent)" className="flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium" style={{ color: "var(--text)" }}>
                {user.college}
              </p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                Verified · Your profile is trusted across the network
              </p>
            </div>
            <ChevronRight size={14} color="var(--hint)" />
          </div>

          {/* Attended history */}
          <p
            className="text-[10px] uppercase tracking-widest mb-3"
            style={{ color: "var(--hint)", fontFamily: "var(--font-head)" }}
          >
            Recently attended
          </p>
          <div className="space-y-2">
            {user.attendedHistory.map((ev, i) => (
              <div
                key={ev.id}
                className="fade-up flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "var(--surface2)",
                  border: "0.5px solid var(--border)",
                  animationDelay: `${i * 60}ms`,
                  opacity: 0,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {ev.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                    {ev.name}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--hint)" }}>
                    {ev.date}
                  </p>
                  <StarRow rating={ev.rating} />
                </div>
              </div>
            ))}
          </div>

          {/* Settings section */}
          <p
            className="text-[10px] uppercase tracking-widest mt-6 mb-3"
            style={{ color: "var(--hint)", fontFamily: "var(--font-head)" }}
          >
            Account
          </p>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "0.5px solid var(--border)" }}
          >
            {[
              "Notification preferences",
              "Privacy settings",
              "Manage verification",
              "Help & safety",
            ].map((item, i, arr) => (
              <button
                key={item}
                className="w-full flex items-center justify-between px-4 py-3 transition-colors text-left"
                style={{
                  background: "var(--surface2)",
                  borderBottom: i < arr.length - 1 ? "0.5px solid var(--border)" : "none",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              >
                {item}
                <ChevronRight size={14} color="var(--hint)" />
              </button>
            ))}
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  );
}
