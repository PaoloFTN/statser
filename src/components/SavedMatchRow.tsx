"use client";

import { Button } from "@/components/ui/button";
import type { MatchInfo } from "@/types/stats";

interface SavedMatchRowProps {
  match: MatchInfo;
  onLoad: (match: MatchInfo) => void;
  onDelete: (id: string) => void;
}

const dateFormat: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function SavedMatchRow({ match, onLoad, onDelete }: SavedMatchRowProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border py-2 px-3">
      <div>
        <span className="font-medium text-foreground">{match.matchName}</span>
        <span className="ml-2 text-xs text-muted-foreground">
          {new Date(match.createdAt).toLocaleDateString("it-IT", dateFormat)}
        </span>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => onLoad(match)}>
          Carica
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => onDelete(match.id)}
        >
          Elimina
        </Button>
      </div>
    </li>
  );
}
