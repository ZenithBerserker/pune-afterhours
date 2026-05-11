import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSessionUser, isSupabaseAnonConfigured } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

/** Tells the client whether email/password sessions are wired (vs local JSON demo). */
export async function GET() {
  if (!isSupabaseConfigured() || !isSupabaseAnonConfigured()) {
    return NextResponse.json({ persistentAuth: false, loggedIn: false });
  }

  const user = await getSessionUser();
  return NextResponse.json({ persistentAuth: true, loggedIn: Boolean(user) });
}
