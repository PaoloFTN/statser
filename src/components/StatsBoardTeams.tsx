"use client";

import type { TeamData, StatDefinition } from "@/types/stats";
import { TeamStatsPanel } from "./TeamStatsPanel";

interface StatsBoardTeamsProps {
  teamA: TeamData;
  teamB: TeamData;
  onTeamAChange: (team: TeamData) => void;
  onTeamBChange: (team: TeamData) => void;
  statDefinitions: StatDefinition[];
}

export function StatsBoardTeams({
  teamA,
  teamB,
  onTeamAChange,
  onTeamBChange,
  statDefinitions,
}: StatsBoardTeamsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TeamStatsPanel
        team={teamA}
        onUpdate={onTeamAChange}
        teamColor="primary"
        statDefinitions={statDefinitions}
      />
      <TeamStatsPanel
        team={teamB}
        onUpdate={onTeamBChange}
        teamColor="secondary"
        statDefinitions={statDefinitions}
      />
    </div>
  );
}
