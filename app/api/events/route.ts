import { NextResponse } from "next/server";
import { createEvent, getEvents } from "@/lib/store";
import { AccessType, CreateEventInput, NEIGHBORHOODS, VIBE_OPTIONS, VibeTag } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSessionUser, isSupabaseAnonConfigured } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getEvents());
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateEventInput>;
  const accessOptions: AccessType[] = ["public", "mutual", "invite"];

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Event name is required." }, { status: 400 });
  }

  if (!body.neighborhood || !NEIGHBORHOODS.includes(body.neighborhood)) {
    return NextResponse.json({ error: "Choose a supported Pune neighbourhood." }, { status: 400 });
  }

  if (!body.time?.trim()) {
    return NextResponse.json({ error: "Start time is required." }, { status: 400 });
  }

  if (!body.access || !accessOptions.includes(body.access)) {
    return NextResponse.json({ error: "Choose a valid access setting." }, { status: 400 });
  }

  const vibe = Array.isArray(body.vibe)
    ? body.vibe.filter((tag): tag is VibeTag => VIBE_OPTIONS.includes(tag as VibeTag))
    : [];

  try {
    if (isSupabaseConfigured()) {
      if (!isSupabaseAnonConfigured()) {
        return NextResponse.json(
          { error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required for hosting while using Supabase." },
          { status: 500 }
        );
      }
      const sessionUser = await getSessionUser();
      if (!sessionUser) {
        return NextResponse.json({ error: "Sign in to host an event." }, { status: 401 });
      }

      const event = await createEvent(
        {
          name: body.name,
          neighborhood: body.neighborhood,
          time: body.time,
          capacity: Number(body.capacity) || 20,
          entry: body.entry ?? "Free",
          vibe,
          access: body.access,
          description: body.description,
        },
        { hostUserId: sessionUser.id }
      );

      return NextResponse.json(event, { status: 201 });
    }

    const event = await createEvent({
      name: body.name,
      neighborhood: body.neighborhood,
      time: body.time,
      capacity: Number(body.capacity) || 20,
      entry: body.entry ?? "Free",
      vibe,
      access: body.access,
      description: body.description,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create event.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
