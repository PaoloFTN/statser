import { useState, useCallback } from "react";
import { type MatchInfo, STORAGE_KEY } from "@/types/stats";
import type { Match } from "@prisma/client";

function writeStorage(matches: MatchInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

export function useLocalMatches(serverMatches: MatchInfo[] = []) {
  const [matches, setMatches] = useState<MatchInfo[]>(serverMatches);

  const mergeWithLocal = useCallback(
    (localMatches: MatchInfo[]) => {
      setMatches([...localMatches, ...serverMatches]);
    },
    [serverMatches],
  );

  const save = useCallback((match: Match) => {
    setMatches((prev) => {
      const exists = prev.findIndex((m) => m.id === match.id);
      const next =
        exists >= 0
          ? prev.map((m) => (m.id === match.id ? match : m))
          : [...prev, match];
      writeStorage(next);
      return next;
    });
  }, []);

  const add = useCallback((match: MatchInfo) => {
    setMatches((prev) => {
      const next = [...prev, match];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setMatches((prev) => {
      const next = prev.filter((m) => m.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  return { matches, save, add, remove, mergeWithLocal };
}
