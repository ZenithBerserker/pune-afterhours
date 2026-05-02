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
} from "@/lib/data";

const dataDir = path.join(process.cwd(), "data");
const eventsFile = path.join(dataDir, "events.json");
const userFile = path.join(dataDir, "user.json");

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

export async function getEvents() {
  const events = await readJson<EventPin[]>(eventsFile, SEED_EVENTS);
  return events.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export async function getEventById(id: string) {
  const events = await getEvents();
  return events.find((event) => event.id === id) ?? null;
}

export async function getCurrentUser() {
  return readJson<UserProfile>(userFile, SEED_USER);
}

export async function createEvent(input: CreateEventInput) {
  const events = await getEvents();
  const user = await getCurrentUser();
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
