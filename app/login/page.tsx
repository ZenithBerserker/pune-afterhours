import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh text-sm" style={{ background: "var(--bg)", color: "var(--muted)" }}>
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
