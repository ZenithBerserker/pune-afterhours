export type VibeTag =
  | "Acoustic"
  | "Techno"
  | "Poker"
  | "Movie Night"
  | "Flat Party"
  | "Open Mic"
  | "Terrace Gig"
  | "Jam Session"
  | "BYOJ";

export type AccessType = "public" | "mutual" | "invite";
export type EventStatus = "open" | "almost" | "full";

export interface EventPin {
  id: string;
  name: string;
  emoji: string;
  vibe: VibeTag[];
  neighborhood: string;
  time: string;
  capacity: number;
  attending: number;
  femaleCount: number;
  maleCount: number;
  access: AccessType;
  status: EventStatus;
  entry: string;
  hostName: string;
  hostInitials: string;
  hostRating: number;
  hostTrusted: boolean;
  description: string;
  // Map position (percentage of map area)
  mapX: number;
  mapY: number;
  color: "accent" | "purple" | "warm" | "teal";
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  initials: string;
  college: string;
  collegeVerified: boolean;
  kycVerified: boolean;
  eventsAttended: number;
  rating: number;
  eventsHosted: number;
  attendedHistory: AttendedEvent[];
}

export interface AttendedEvent {
  id: string;
  name: string;
  emoji: string;
  date: string;
  rating: number;
}

export const MOCK_EVENTS: EventPin[] = [
  {
    id: "1",
    name: "Rooftop Terrace Gig",
    emoji: "🎵",
    vibe: ["Terrace Gig", "Acoustic", "BYOJ"],
    neighborhood: "Baner",
    time: "10:00 PM",
    capacity: 25,
    attending: 18,
    femaleCount: 9,
    maleCount: 9,
    access: "public",
    status: "open",
    entry: "Free · BYOJ",
    hostName: "Aryan R.",
    hostInitials: "AR",
    hostRating: 4.9,
    hostTrusted: true,
    description: "Chill acoustic vibes on a rooftop in Baner. Bring your own juice, good music and good company guaranteed. Small gathering, verified guests only.",
    mapX: 24,
    mapY: 22,
    color: "accent",
  },
  {
    id: "2",
    name: "Poker Night",
    emoji: "🃏",
    vibe: ["Poker", "BYOJ"],
    neighborhood: "Wakad",
    time: "9:00 PM",
    capacity: 12,
    attending: 8,
    femaleCount: 3,
    maleCount: 5,
    access: "mutual",
    status: "almost",
    entry: "Free",
    hostName: "Sneha K.",
    hostInitials: "SK",
    hostRating: 4.7,
    hostTrusted: true,
    description: "Friendly poker tournament with snacks. Beginners welcome. Mutual friends network only — keep it tight.",
    mapX: 55,
    mapY: 30,
    color: "purple",
  },
  {
    id: "3",
    name: "Late Night Techno",
    emoji: "🎧",
    vibe: ["Techno", "Flat Party"],
    neighborhood: "Kalyani Nagar",
    time: "11:00 PM",
    capacity: 30,
    attending: 30,
    femaleCount: 14,
    maleCount: 16,
    access: "invite",
    status: "full",
    entry: "₹100 · BYOJ",
    hostName: "Rishi M.",
    hostInitials: "RM",
    hostRating: 4.5,
    hostTrusted: false,
    description: "Deep techno set in a proper flat setup. Strict invite-only. Noise compliance guaranteed — we wrap at 9:45 PM volume cutoff.",
    mapX: 72,
    mapY: 18,
    color: "teal",
  },
  {
    id: "4",
    name: "Acoustic Open Mic",
    emoji: "🎤",
    vibe: ["Open Mic", "Acoustic", "BYOJ"],
    neighborhood: "FC Road",
    time: "8:00 PM",
    capacity: 20,
    attending: 11,
    femaleCount: 7,
    maleCount: 4,
    access: "public",
    status: "open",
    entry: "Free",
    hostName: "Divya P.",
    hostInitials: "DP",
    hostRating: 5.0,
    hostTrusted: true,
    description: "Monthly open mic at a FC Road flat. Original songs, covers, poetry — all welcome. Very warm crowd.",
    mapX: 14,
    mapY: 52,
    color: "warm",
  },
  {
    id: "5",
    name: "FIFA + Pizza Night",
    emoji: "🍕",
    vibe: ["Flat Party", "BYOJ"],
    neighborhood: "Kothrud",
    time: "7:30 PM",
    capacity: 16,
    attending: 10,
    femaleCount: 4,
    maleCount: 6,
    access: "mutual",
    status: "open",
    entry: "Free · BYOJ",
    hostName: "Kabir S.",
    hostInitials: "KS",
    hostRating: 4.8,
    hostTrusted: true,
    description: "FIFA tournament on the big screen. We're ordering pizzas together. Just bring your juice and your competitive spirit.",
    mapX: 44,
    mapY: 57,
    color: "accent",
  },
];

export const MOCK_USER: UserProfile = {
  id: "u1",
  name: "Priya Sharma",
  handle: "@priya.symbiosis",
  initials: "PS",
  college: "Symbiosis Institute of Design",
  collegeVerified: true,
  kycVerified: true,
  eventsAttended: 14,
  rating: 4.9,
  eventsHosted: 2,
  attendedHistory: [
    { id: "h1", name: "Terrace Jam — Viman Nagar", emoji: "🎵", date: "Last Saturday", rating: 5 },
    { id: "h2", name: "Poker Night — Wakad", emoji: "🃏", date: "2 weeks ago", rating: 4 },
    { id: "h3", name: "Horror Marathon — Kothrud", emoji: "🎬", date: "3 weeks ago", rating: 5 },
    { id: "h4", name: "Acoustic Jam — FC Road", emoji: "🎤", date: "Last month", rating: 5 },
  ],
};

export const VIBE_OPTIONS: VibeTag[] = [
  "Acoustic", "Techno", "Poker", "Movie Night", "Flat Party", "Open Mic", "Terrace Gig", "Jam Session", "BYOJ",
];

export const NEIGHBORHOODS = [
  "Baner", "Wakad", "Viman Nagar", "Kalyani Nagar", "Kothrud", "FC Road", "Hinjewadi", "Koregaon Park",
];

export function getStatusColor(status: EventStatus) {
  if (status === "open") return { bg: "rgba(200,245,100,0.12)", text: "#c8f564" };
  if (status === "almost") return { bg: "rgba(45,226,196,0.12)", text: "#2de2c4" };
  return { bg: "rgba(255,107,74,0.12)", text: "#ff6b4a" };
}

export function getStatusLabel(status: EventStatus) {
  if (status === "open") return "Open";
  if (status === "almost") return `${30 - 20} spots`; // simplified
  return "Full";
}

export function getPinColor(color: EventPin["color"]) {
  if (color === "accent") return "#c8f564";
  if (color === "purple") return "#7c6cfc";
  if (color === "warm") return "#ff6b4a";
  return "#2de2c4";
}
