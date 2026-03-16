"use client";

import type { TeamData, PlayerData, StatDefinition } from "@/types/stats";
import { aggregateStats } from "@/types/stats";

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
    <section
      className={`rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/30 ${borderClass}`}
    >
      <h2 className="mb-4 text-center text-xl font-bold text-zinc-900 dark:text-zinc-100">
        {team.name}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-600">
              <th className="py-2 pr-2 text-left font-medium text-zinc-600 dark:text-zinc-400">
                Giocatore
              </th>
              {statDefinitions.map(({ short, key }) => (
                <th
                  key={key}
                  className="min-w-[4rem] py-2 text-center font-medium text-zinc-600 dark:text-zinc-400"
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
                className="border-b border-zinc-100 dark:border-zinc-700/50"
              >
                <td className="py-1.5 pr-2">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      setPlayers(updatePlayerName(team.players, i, e.target.value))
                    }
                    className="w-full max-w-[8rem] rounded border border-zinc-200 bg-white px-2 py-1 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </td>
                {statDefinitions.map(({ key }) => (
                  <td key={key} className="py-1">
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="tabular-nums font-medium w-6 text-center">
                        {typeof player[key] === "number" ? player[key] : 0}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPlayers(updatePlayerStat(team.players, i, key, 1))
                        }
                        className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-white hover:bg-zinc-600 dark:bg-zinc-500 dark:hover:bg-zinc-400"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPlayers(updatePlayerStat(team.players, i, key, -1))
                        }
                        className="rounded border border-zinc-300 px-1.5 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      >
                        −
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {statDefinitions.map(({ key, label }) => (
          <span key={key}>
            {label}: {totals[key] ?? 0}
          </span>
        ))}
      </div>
    </section>
  );
}
