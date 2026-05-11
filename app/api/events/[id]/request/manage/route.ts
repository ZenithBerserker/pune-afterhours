import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSessionUser, isSupabaseAnonConfigured } from "@/lib/supabase/server-auth";
import { isEventHost, listEventRequests, updateEventRequestStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "file", requests: [] as unknown[] });
  }
  if (!isSupabaseAnonConfigured()) {
    return NextResponse.json({ error: "Anon key missing." }, { status: 500 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const host = await isEventHost(params.id, user.id);
  if (!host) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const requests = await listEventRequests(params.id);
  return NextResponse.json({ mode: "cloud", requests });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase required." }, { status: 400 });
  }
  if (!isSupabaseAnonConfigured()) {
    return NextResponse.json({ error: "Anon key missing." }, { status: 500 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const host = await isEventHost(params.id, user.id);
  if (!host) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as { userId?: string; status?: "approved" | "rejected" };
  if (!body.userId || !body.status) {
    return NextResponse.json({ error: "userId and status are required." }, { status: 400 });
  }

  await updateEventRequestStatus(params.id, body.userId, body.status);
  return NextResponse.json({ ok: true });
}
