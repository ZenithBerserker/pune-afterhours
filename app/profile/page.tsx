"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/lib/data";
import { useEffect, useState } from "react";
import { Shield, Star, ChevronRight, GraduationCap, Fingerprint, LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

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
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState({ persistentAuth: false, loggedIn: false });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [meRes, sessionRes] = await Promise.all([
        fetch("/api/users/me", { cache: "no-store" }),
        fetch("/api/auth/session", { cache: "no-store" }),
      ]);

      if (sessionRes.ok) {
        const s = await sessionRes.json();
        setSession({
          persistentAuth: Boolean(s.persistentAuth),
          loggedIn: Boolean(s.loggedIn),
        });
      }

      if (meRes.status === 401) {
        setGuest(true);
        setUser(null);
      } else if (meRes.ok) {
        setGuest(false);
        setUser(await meRes.json());
      }

      setLoading(false);
    }

    load();
  }, []);

  async function handleSignOut() {
    try {
      const sb = createBrowserSupabaseClient();
      await sb.auth.signOut();
    } catch {
      /* local demo — no anon client */
    }
    router.push("/");
    router.refresh();
    setGuest(true);
    setUser(null);
    setSession({ persistentAuth: session.persistentAuth, loggedIn: false });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh text-sm" style={{ background: "var(--bg)", color: "var(--muted)" }}>
        Loading profile...
      </div>
    );
  }

  if (guest || !user) {
    return (
      <div className="flex flex-col h-dvh" style={{ background: "var(--bg)" }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-24">
          <h1 className="text-xl font-extrabold mb-2" style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}>
            Your profile
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
            Sign in with email to sync hosting, requests, and your stats across devices.
          </p>
          <Link
            href="/login"
            className="w-full max-w-[280px] py-3.5 rounded-xl text-sm font-bold inline-block text-center"
            style={{ fontFamily: "var(--font-head)", background: "var(--accent)", color: "#0a0a0f" }}
          >
            Sign in / Create account
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const collegeDisplay = user.college?.trim() ? user.college : "Add where you study (coming soon)";

  return (
    <div className="flex flex-col h-dvh" style={{ background: "var(--bg)" }}>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="px-4 pt-12 pb-6">
          {session.persistentAuth && session.loggedIn && (
            <button
              type="button"
              onClick={() => handleSignOut()}
              className="flex items-center gap-2 text-[11px] uppercase tracking-widest mb-4 ml-auto"
              style={{ color: "var(--hint)" }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          )}

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
              <h1 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}>
                {user.name}
              </h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {user.handle}
              </p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
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
                <p className="text-xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: "var(--text)" }}>
                  {val}
                </p>
                <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "var(--hint)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

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
                {collegeDisplay}
              </p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                {user.collegeVerified || user.kycVerified
                  ? "Your profile is trusted across the network"
                  : "Verification badges appear after review"}
              </p>
            </div>
            <ChevronRight size={14} color="var(--hint)" />
          </div>

          <p
            className="text-[10px] uppercase tracking-widest mb-3"
            style={{ color: "var(--hint)", fontFamily: "var(--font-head)" }}
          >
            Recently attended
          </p>
          <div className="space-y-2">
            {user.attendedHistory.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Once you join events, your history shows up here.
              </p>
            ) : (
              user.attendedHistory.map((ev, i) => (
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
              ))
            )}
          </div>

          <p
            className="text-[10px] uppercase tracking-widest mt-6 mb-3"
            style={{ color: "var(--hint)", fontFamily: "var(--font-head)" }}
          >
            Account
          </p>
          <div className="rounded-xl overflow-hidden" style={{ border: "0.5px solid var(--border)" }}>
            {["Notification preferences", "Privacy settings", "Manage verification", "Help & safety"].map(
              (item, i, arr) => (
                <button
                  key={item}
                  type="button"
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
              )
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
