import { NextResponse } from "next/server";
import {
  createEventChatMessage,
  getEventById,
  getEventChatMessages,
  getUserEntryRequest,
} from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSessionUser, isSupabaseAnonConfigured } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "file", messages: [] as unknown[] });
  }

  const messages = await getEventChatMessages(params.id);
  return NextResponse.json({ mode: "cloud", messages });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Chat requires Supabase mode." }, { status: 400 });
  }

  if (!isSupabaseAnonConfigured()) {
    return NextResponse.json({ error: "Anon key missing." }, { status: 500 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to chat." }, { status: 401 });
  }

  const event = await getEventById(params.id);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const requestStatus = await getUserEntryRequest(params.id, user.id);
  const canChat = event.hostTrusted || requestStatus === "approved" || requestStatus === "pending";
  if (!canChat) {
    return NextResponse.json(
      { error: "Request entry first. Chat unlocks after you request or join." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as { message?: string };
  try {
    const message = await createEventChatMessage(params.id, user.id, body.message ?? "");
    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not send message.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
