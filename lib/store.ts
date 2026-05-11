import { promises as fs } from "fs";
import path from "path";
import {
  AccessType,
  CreateEventInput,
  EventPin,
  EventStatus,
  SEED_EVENTS,
  SEED_USER,
  UserProfile,
  VIBE_OPTIONS,
  VibeTag,
  AttendedEvent,
} from "@/lib/data";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export type EntryRequestStatus = "pending" | "approved" | "rejected";
export interface EventChatMessage {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userInitials: string;
  message: string;
  createdAt: string;
}

export interface EventJoinRequest {
  id: string;
  eventId: string;
  userId: string;
  status: EntryRequestStatus;
  createdAt: string;
  userName: string;
  userHandle: string;
  userInitials: string;
}

const dataDir = path.join(process.cwd(), "data");
const eventsFile = path.join(dataDir, "events.json");
const userFile = path.join(dataDir, "user.json");

type EventRowDb = {
  id: string;
  name: string;
  emoji: string;
  vibe: string[];
  neighborhood: string;
  time_display: string;
  capacity: number;
  attending: number;
  female_count: number;
  male_count: number;
  access: string;
  status: string;
  entry: string;
  host_name: string;
  host_initials: string;
  host_rating: number | string;
  host_trusted: boolean;
  description: string;
  map_x: number;
  map_y: number;
  color: string;
  created_at: string | null;
  source: string | null;
  host_user_id?: string | null;
};

type ProfileRowDb = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  college: string;
  college_verified: boolean;
  kyc_verified: boolean;
  events_attended: number;
  rating: number | string;
  events_hosted: number;
  attended_history: AttendedEvent[] | unknown;
};

type EventChatRowDb = {
  id: string;
  event_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?:
    | {
        name: string;
        initials: string;
      }
    | {
        name: string;
        initials: string;
      }[]
    | null;
};

type EventRequestRowDb = {
  id: string;
  event_id: string;
  user_id: string;
  status: EntryRequestStatus;
  created_at: string;
  profiles?:
    | {
        name: string;
        handle: string;
        initials: string;
      }
    | {
        name: string;
        handle: string;
        initials: string;
      }[]
    | null;
};

function profileFromJoin(
  value:
    | { name: string; initials: string }
    | { name: string; handle: string; initials: string }
    | { name: string; initials: string }[]
    | { name: string; handle: string; initials: string }[]
    | null
    | undefined
): { name: string; initials: string; handle?: string } | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

const neighborhoodPosition: Record<string, { x: number; y: number }> = {
  Baner: { x: 24, y: 22 },
  Wakad: { x: 55, y: 30 },
  "Viman Nagar": { x: 78, y: 34 },
  "Kalyani Nagar": { x: 72, y: 18 },
  Kothrud: { x: 44, y: 57 },
  "FC Road": { x: 14, y: 52 },
  Hinjewadi: { x: 63, y: 62 },
  "Koregaon Park": { x: 81, y: 48 },
};

const vibeEmoji: Partial<Record<VibeTag, string>> = {
  Acoustic: "🎵",
  Techno: "🎧",
  Poker: "🃏",
  "Movie Night": "🎬",
  "Flat Party": "🏠",
  "Open Mic": "🎤",
  "Terrace Gig": "🎵",
  "Jam Session": "🎸",
  BYOJ: "🥤",
};

function rowToEventPin(row: EventRowDb): EventPin {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    vibe: row.vibe as VibeTag[],
    neighborhood: row.neighborhood,
    time: row.time_display,
    capacity: row.capacity,
    attending: row.attending,
    femaleCount: row.female_count,
    maleCount: row.male_count,
    access: row.access as AccessType,
    status: row.status as EventStatus,
    entry: row.entry,
    hostName: row.host_name,
    hostInitials: row.host_initials,
    hostRating: Number(row.host_rating),
    hostTrusted: row.host_trusted,
    description: row.description,
    mapX: row.map_x,
    mapY: row.map_y,
    color: row.color as EventPin["color"],
    createdAt: row.created_at ?? undefined,
    source: row.source === "seed" || row.source === "user" ? row.source : undefined,
  };
}

function rowToUserProfile(row: ProfileRowDb): UserProfile {
  const history = Array.isArray(row.attended_history)
    ? (row.attended_history as AttendedEvent[])
    : [];
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    initials: row.initials,
    college: row.college,
    collegeVerified: row.college_verified,
    kycVerified: row.kyc_verified,
    eventsAttended: row.events_attended,
    rating: Number(row.rating),
    eventsHosted: row.events_hosted,
    attendedHistory: history,
  };
}

async function getEventsSupabase(): Promise<EventPin[]> {
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from("events")
    .select("*")
    .order("created_at", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Supabase getEvents: ${error.message}`);
  }
  const rows = (data ?? []) as EventRowDb[];
  return rows.map(rowToEventPin);
}

async function getEventByIdSupabase(id: string): Promise<EventPin | null> {
  const sb = getServiceSupabase();
  const { data, error } = await sb.from("events").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Supabase getEventById: ${error.message}`);
  }
  if (!data) return null;
  return rowToEventPin(data as EventRowDb);
}

export async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
  const sb = getServiceSupabase();
  const { data, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw new Error(`Supabase getProfileByUserId: ${error.message}`);
  }
  if (!data) return null;
  return rowToUserProfile(data as ProfileRowDb);
}

export async function isEventHost(eventId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("host_user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase isEventHost: ${error.message}`);
  }
  return Boolean(data?.id);
}

async function createEventSupabase(input: CreateEventInput, hostUserId: string): Promise<EventPin> {
  const sb = getServiceSupabase();
  const user = await getProfileByUserId(hostUserId);
  if (!user) {
    throw new Error("Your profile was not found. Try signing out and back in.");
  }

  const events = await getEventsSupabase();
  const vibes = sanitizeVibes(input.vibe);
  const position = neighborhoodPosition[input.neighborhood] ?? { x: 50, y: 50 };
  const capacity = Math.max(2, Math.min(Number(input.capacity) || 20, 100));
  const attending = 1;
  const createdAt = new Date().toISOString();
  const id = `ev_${Date.now()}`;

  const newRow = {
    id,
    name: input.name.trim(),
    emoji: vibeEmoji[vibes[0]] ?? "✨",
    vibe: vibes,
    neighborhood: input.neighborhood,
    time_display: normalizeTime(input.time),
    capacity,
    attending,
    female_count: 0,
    male_count: 1,
    access: input.access as AccessType,
    status: getStatus(attending, capacity),
    entry: input.entry.trim() || "Free",
    host_name: user.name,
    host_initials: user.initials,
    host_rating: user.rating,
    host_trusted: user.kycVerified,
    description:
      input.description?.trim() ||
      `${input.name.trim()} in ${input.neighborhood}. Hosted by a verified Pune Afterhours member.`,
    map_x: position.x,
    map_y: position.y,
    color: ["accent", "purple", "warm", "teal"][events.length % 4] as EventPin["color"],
    created_at: createdAt,
    source: "user" as const,
    host_user_id: hostUserId,
  };

  const { data: inserted, error: insertErr } = await sb.from("events").insert(newRow).select("*").single();

  if (insertErr) {
    throw new Error(`Supabase createEvent: ${insertErr.message}`);
  }

  const { data: profileRow } = await sb.from("profiles").select("id").eq("id", hostUserId).maybeSingle();
  if (profileRow) {
    const { error: upErr } = await sb
      .from("profiles")
      .update({ events_hosted: user.eventsHosted + 1 })
      .eq("id", hostUserId);
    if (upErr) {
      console.error("[store] Could not bump events_hosted:", upErr.message);
    }
  }

  return rowToEventPin(inserted as EventRowDb);
}

export async function getUserEntryRequest(eventId: string, userId: string): Promise<EntryRequestStatus | null> {
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from("event_requests")
    .select("status")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase getUserEntryRequest: ${error.message}`);
  }
  if (!data?.status) return null;
  return data.status as EntryRequestStatus;
}

export async function createUserEntryRequest(eventId: string, userId: string): Promise<{ created: boolean }> {
  const sb = getServiceSupabase();
  const { error } = await sb.from("event_requests").insert({
    event_id: eventId,
    user_id: userId,
    status: "pending",
  });

  if (error?.code === "23505") {
    return { created: false };
  }
  if (error) {
    throw new Error(`Supabase createUserEntryRequest: ${error.message}`);
  }
  return { created: true };
}

export async function listEventRequests(eventId: string): Promise<EventJoinRequest[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from("event_requests")
    .select(
      `
      id,
      event_id,
      user_id,
      status,
      created_at,
      profiles:user_id (
        name,
        handle,
        initials
      )
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase listEventRequests: ${error.message}`);
  }

  const rows = (data ?? []) as EventRequestRowDb[];
  return rows.map((row) => ({
    ...(() => {
      const profile = profileFromJoin(row.profiles);
      return {
        userName: profile?.name ?? "Guest",
        userHandle: profile?.handle ?? "@guest",
        userInitials: profile?.initials ?? "GU",
      };
    })(),
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function updateEventRequestStatus(
  eventId: string,
  userId: string,
  status: EntryRequestStatus
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = getServiceSupabase();

  const { error } = await sb
    .from("event_requests")
    .update({ status })
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Supabase updateEventRequestStatus: ${error.message}`);
  }
}

export async function getEventChatMessages(eventId: string): Promise<EventChatMessage[]> {
  if (!isSupabaseConfigured()) return [];

  const sb = getServiceSupabase();
  const { data, error } = await sb
    .from("event_chat_messages")
    .select(
      `
        id,
        event_id,
        user_id,
        message,
        created_at,
        profiles:user_id (
          name,
          initials
        )
      `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Supabase getEventChatMessages: ${error.message}`);
  }

  const rows = (data ?? []) as EventChatRowDb[];
  return rows.map((row) => ({
    ...(() => {
      const profile = profileFromJoin(row.profiles);
      return {
        userName: profile?.name ?? "Guest",
        userInitials: profile?.initials ?? "GU",
      };
    })(),
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    message: row.message,
    createdAt: row.created_at,
  }));
}

export async function createEventChatMessage(
  eventId: string,
  userId: string,
  message: string
): Promise<EventChatMessage> {
  if (!isSupabaseConfigured()) {
    throw new Error("Chat is available only in Supabase mode.");
  }

  const sb = getServiceSupabase();
  const clean = message.trim();
  if (!clean) {
    throw new Error("Message cannot be empty.");
  }
  if (clean.length > 300) {
    throw new Error("Message is too long (max 300 characters).");
  }

  const { data: inserted, error } = await sb
    .from("event_chat_messages")
    .insert({
      event_id: eventId,
      user_id: userId,
      message: clean,
    })
    .select(
      `
        id,
        event_id,
        user_id,
        message,
        created_at,
        profiles:user_id (
          name,
          initials
        )
      `
    )
    .single();

  if (error) {
    throw new Error(`Supabase createEventChatMessage: ${error.message}`);
  }

  const row = inserted as EventChatRowDb;
  const profile = profileFromJoin(row.profiles);
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    userName: profile?.name ?? "Guest",
    userInitials: profile?.initials ?? "GU",
    message: row.message,
    createdAt: row.created_at,
  };
}

/* ---- JSON file persistence (fallback when Supabase env is not set) ---- */

async function ensureDataFiles() {
  await fs.mkdir(dataDir, { recursive: true });
  await Promise.all([
    fs
      .access(eventsFile)
      .catch(() => fs.writeFile(eventsFile, JSON.stringify(SEED_EVENTS, null, 2), "utf8")),
    fs
      .access(userFile)
      .catch(() => fs.writeFile(userFile, JSON.stringify(SEED_USER, null, 2), "utf8")),
  ]);
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDataFiles();
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, value: T) {
  await ensureDataFiles();
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

function normalizeTime(time: string) {
  const [hourRaw, minute = "00"] = time.split(":");
  const hour = Number(hourRaw);
  if (Number.isNaN(hour)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.padStart(2, "0")} ${suffix}`;
}

function sanitizeVibes(vibe: VibeTag[]) {
  const allowed = new Set(VIBE_OPTIONS);
  const clean = vibe.filter((tag) => allowed.has(tag));
  return clean.length ? clean : (["Flat Party"] as VibeTag[]);
}

function getStatus(attending: number, capacity: number): EventStatus {
  if (attending >= capacity) return "full";
  if (capacity - attending <= Math.max(2, Math.ceil(capacity * 0.2))) return "almost";
  return "open";
}

async function getEventsFile() {
  const events = await readJson<EventPin[]>(eventsFile, SEED_EVENTS);
  return events.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

async function getEventByIdFile(id: string) {
  const events = await getEventsFile();
  return events.find((event) => event.id === id) ?? null;
}

async function getCurrentUserFile() {
  return readJson<UserProfile>(userFile, SEED_USER);
}

async function createEventFile(input: CreateEventInput) {
  const events = await getEventsFile();
  const user = await getCurrentUserFile();
  const vibes = sanitizeVibes(input.vibe);
  const position = neighborhoodPosition[input.neighborhood] ?? { x: 50, y: 50 };
  const capacity = Math.max(2, Math.min(Number(input.capacity) || 20, 100));
  const attending = 1;
  const createdAt = new Date().toISOString();

  const event: EventPin = {
    id: `ev_${Date.now()}`,
    name: input.name.trim(),
    emoji: vibeEmoji[vibes[0]] ?? "✨",
    vibe: vibes,
    neighborhood: input.neighborhood,
    time: normalizeTime(input.time),
    capacity,
    attending,
    femaleCount: 0,
    maleCount: 1,
    access: input.access as AccessType,
    status: getStatus(attending, capacity),
    entry: input.entry.trim() || "Free",
    hostName: user.name,
    hostInitials: user.initials,
    hostRating: user.rating,
    hostTrusted: user.kycVerified,
    description:
      input.description?.trim() ||
      `${input.name.trim()} in ${input.neighborhood}. Hosted by a verified Pune Afterhours member.`,
    mapX: position.x,
    mapY: position.y,
    color: ["accent", "purple", "warm", "teal"][events.length % 4] as EventPin["color"],
    createdAt,
    source: "user",
  };

  await writeJson(eventsFile, [event, ...events]);
  await writeJson(userFile, { ...user, eventsHosted: user.eventsHosted + 1 });
  return event;
}

/** Local JSON demo profile (when Supabase is not configured). */
export async function getFileModeProfile(): Promise<UserProfile> {
  return getCurrentUserFile();
}

export async function getEvents(): Promise<EventPin[]> {
  if (isSupabaseConfigured()) return getEventsSupabase();
  return getEventsFile();
}

export async function getEventById(id: string): Promise<EventPin | null> {
  if (isSupabaseConfigured()) return getEventByIdSupabase(id);
  return getEventByIdFile(id);
}

export async function createEvent(input: CreateEventInput, options?: { hostUserId?: string }): Promise<EventPin> {
  if (isSupabaseConfigured()) {
    const uid = options?.hostUserId;
    if (!uid?.trim()) {
      throw new Error("hostUserId is required when using Supabase-backed storage.");
    }
    return createEventSupabase(input, uid.trim());
  }
  return createEventFile(input);
}
