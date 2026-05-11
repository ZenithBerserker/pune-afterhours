import { NextResponse } from "next/server";
import { getFileModeProfile, getProfileByUserId } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSessionUser, isSupabaseAnonConfigured } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(await getFileModeProfile());
  }

  if (!isSupabaseAnonConfigured()) {
    return NextResponse.json(
      { error: "Add NEXT_PUBLIC_SUPABASE_ANON_KEY to use accounts with Supabase." },
      { status: 500 }
    );
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByUserId(sessionUser.id);
  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found yet. Wait a second and refresh, or contact support." },
      { status: 503 }
    );
  }

  return NextResponse.json(profile);
}
