import { MatchInfo, STORAGE_KEY } from "@/types/stats";
import { Match } from "@prisma/client";

export function getMatches(): MatchInfo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MatchInfo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMatch(match: Match): void {
  const list = getMatches();
  const existing = list.findIndex((p) => p.id === match.id);
  const next =
    existing >= 0
      ? list.map((p) => (p.id === match.id ? match : p))
      : [...list, match];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function deleteMatch(id: string): void {
  const list = getMatches().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
