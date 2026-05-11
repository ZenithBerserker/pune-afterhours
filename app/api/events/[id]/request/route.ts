import { NextResponse } from "next/server";
import { createUserEntryRequest, getEventById, getUserEntryRequest } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSessionUser, isSupabaseAnonConfigured } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

type CloudPayload =
  | { mode: "cloud"; loggedIn: false; status: null }
  | { mode: "cloud"; loggedIn: true; status: Awaited<ReturnType<typeof getUserEntryRequest>> };

/** Entry request metadata for the client (browse works without login on file-backed mode). */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "file" as const });
  }

  if (!isSupabaseAnonConfigured()) {
    return NextResponse.json(
      { error: "Anon key missing", mode: "cloud" as const, loggedIn: false, status: null },
      { status: 500 }
    );
  }

  const user = await getSessionUser();
  if (!user) {
    const body: CloudPayload = { mode: "cloud", loggedIn: false, status: null };
    return NextResponse.json(body);
  }

  const status = await getUserEntryRequest(params.id, user.id);
  const body: CloudPayload = { mode: "cloud", loggedIn: true, status };
  return NextResponse.json(body);
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mode: "file" as const });
  }

  if (!isSupabaseAnonConfigured()) {
    return NextResponse.json({ error: "Anon key missing" }, { status: 500 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to request entry." }, { status: 401 });
  }

  const event = await getEventById(params.id);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  if (event.status === "full") {
    return NextResponse.json({ error: "This event is full." }, { status: 400 });
  }

  try {
    await createUserEntryRequest(params.id, user.id);
    return NextResponse.json({ ok: true, mode: "cloud" as const });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
