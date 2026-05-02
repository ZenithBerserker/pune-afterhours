"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Sparkles, Plus, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Map, label: "Discover" },
  { href: "/host", icon: Plus, label: "Host" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex border-t z-50"
      style={{ background: "var(--bg)", borderColor: "var(--border)" }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-opacity"
            style={{ opacity: active ? 1 : 0.45 }}
          >
            <Icon
              size={20}
              color={active ? "var(--accent)" : "var(--muted)"}
              strokeWidth={active ? 2 : 1.5}
            />
            <span
              className="text-[9px] uppercase tracking-widest font-medium"
              style={{ color: active ? "var(--accent)" : "var(--hint)" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
