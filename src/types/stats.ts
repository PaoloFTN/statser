// Schema-driven config (from SportPlan)
export interface StatDefinition {
  key: string;
  label: string;
  short: string;
}

export interface SportPlanConfig {
  playerCount: number;
  statDefinitions: StatDefinition[];
}

// Dynamic player: name + numeric stats keyed by StatDefinition.key
export interface PlayerData {
  name: string;
  [key: string]: string | number;
}

export interface TeamData {
  name: string;
  players: PlayerData[];
}

export interface Partita {
  id: string;
  createdAt: number;
  matchName: string;
  sportPlanId?: string;
  teamA: TeamData;
  teamB: TeamData;
}

export function createEmptyTeamFromConfig(
  config: SportPlanConfig,
  teamName: string
): TeamData {
  const initialStats: Record<string, number> = {};
  config.statDefinitions.forEach((s) => (initialStats[s.key] = 0));
  return {
    name: teamName,
    players: Array.from({ length: config.playerCount }, (_, i) => ({
      name: `Giocatore ${i + 1}`,
      ...initialStats,
    })),
  };
}

export function aggregateStats(
  players: PlayerData[],
  statKeys: string[]
): Record<string, number> {
  const acc: Record<string, number> = {};
  statKeys.forEach((k) => (acc[k] = 0));
  players.forEach((p) => {
    statKeys.forEach((k) => {
      const v = p[k];
      if (typeof v === "number") acc[k] += v;
    });
  });
  return acc;
}

// Legacy: fixed calcio stats (for backward compat and default)
export const CALCIO_STAT_KEYS = [
  "passaggiRiusciti",
  "passaggiSbagliati",
  "recuperi",
  "crossEffettuati",
  "crossRiusciti",
  "gol",
] as const;

export const STORAGE_KEY = "statser-partite";
