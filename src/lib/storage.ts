import type { Partita } from "@/types/stats";
import { STORAGE_KEY } from "@/types/stats";

export function getPartite(): Partita[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partita[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePartita(partita: Partita): void {
  const list = getPartite();
  const existing = list.findIndex((p) => p.id === partita.id);
  const next =
    existing >= 0
      ? list.map((p) => (p.id === partita.id ? partita : p))
      : [...list, partita];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function deletePartita(id: string): void {
  const list = getPartite().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
