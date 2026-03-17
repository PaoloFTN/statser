"use client";

import type { TeamData, PlayerData, StatDefinition } from "@/types/stats";
import { aggregateStats } from "@/types/stats";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TeamStatsPanelProps {
  team: TeamData;
  onUpdate: (team: TeamData) => void;
  teamColor: "primary" | "secondary";
  statDefinitions: StatDefinition[];
}

function updatePlayerStat(
  players: PlayerData[],
  playerIndex: number,
  key: string,
  delta: number
): PlayerData[] {
  return players.map((p, i) => {
    if (i !== playerIndex) return p;
    const current = typeof p[key] === "number" ? (p[key] as number) : 0;
    const next = Math.max(0, current + delta);
    return { ...p, [key]: next };
  });
}

function updatePlayerName(
  players: PlayerData[],
  playerIndex: number,
  name: string
): PlayerData[] {
  return players.map((p, i) =>
    i === playerIndex ? { ...p, name } : p
  );
}

export function TeamStatsPanel({
  team,
  onUpdate,
  teamColor,
  statDefinitions,
}: TeamStatsPanelProps) {
  const setPlayers = (players: PlayerData[]) =>
    onUpdate({ ...team, players });

  const borderClass =
    teamColor === "primary"
      ? "border-l-4 border-l-blue-500"
      : "border-l-4 border-l-amber-500";

  const statKeys = statDefinitions.map((s) => s.key);
  const totals = aggregateStats(team.players, statKeys);

  return (
    <Card className={`${borderClass}`}>
      <CardHeader className="pb-2">
        <h2 className="text-center text-xl font-bold text-foreground">
          {team.name}
        </h2>
      </CardHeader>
      <CardContent className="pt-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-2 text-left font-medium text-muted-foreground">
                Giocatore
              </th>
              {statDefinitions.map(({ short, key }) => (
                <th
                  key={key}
                  className="min-w-[4rem] py-2 text-center font-medium text-muted-foreground"
                >
                  {short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.players.map((player, i) => (
              <tr
                key={i}
                className="border-b border-border/50"
              >
                <td className="py-1.5 pr-2">
                  <Input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      setPlayers(updatePlayerName(team.players, i, e.target.value))
                    }
                    className="h-7 max-w-[8rem] py-1 text-sm"
                  />
                </td>
                {statDefinitions.map(({ key }) => (
                  <td key={key} className="py-1">
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="tabular-nums font-medium w-6 text-center text-foreground">
                        {typeof player[key] === "number" ? player[key] : 0}
                      </span>
                      <Button
                        type="button"
                        size="icon-xs"
                        onClick={() =>
                          setPlayers(updatePlayerStat(team.players, i, key, 1))
                        }
                        className="h-6 w-6"
                      >
                        +
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() =>
                          setPlayers(updatePlayerStat(team.players, i, key, -1))
                        }
                        className="h-6 w-6"
                      >
                        −
                      </Button>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
        {statDefinitions.map(({ key, label }) => (
          <span key={key}>
            {label}: {totals[key] ?? 0}
          </span>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}
