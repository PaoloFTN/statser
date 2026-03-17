"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedMatchRow } from "./SavedMatchRow";
import type { MatchInfo } from "@/types/stats";

interface SavedMatchesCardProps {
  savedMatches: MatchInfo[];
  cloudMatches: MatchInfo[] | null;
  isLoggedIn: boolean;
  onLoadLocal: (match: MatchInfo) => void;
  onDeleteLocal: (id: string) => void;
  onLoadCloud: (match: MatchInfo) => void;
  onDeleteCloud: (id: string) => void;
}

export function SavedMatchesCard({
  savedMatches,
  cloudMatches,
  isLoggedIn,
  onLoadLocal,
  onDeleteLocal,
  onLoadCloud,
  onDeleteCloud,
}: SavedMatchesCardProps) {
  const hasLocal = savedMatches.length > 0;
  const hasCloud = isLoggedIn && (cloudMatches?.length ?? 0) > 0;
  if (!hasLocal && !hasCloud) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partite salvate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasLocal && (
          <>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Sul dispositivo (localStorage)
            </p>
            <ul className="mb-4 space-y-2">
              {savedMatches.map((p) => (
                <SavedMatchRow
                  key={p.id}
                  match={p}
                  onLoad={onLoadLocal}
                  onDelete={onDeleteLocal}
                />
              ))}
            </ul>
          </>
        )}
        {hasCloud && (
          <>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Su account (cloud)
            </p>
            <ul className="space-y-2">
              {cloudMatches!.map((p) => (
                <SavedMatchRow
                  key={p.id}
                  match={p}
                  onLoad={onLoadCloud}
                  onDelete={onDeleteCloud}
                />
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
