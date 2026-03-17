"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamStatsPanel } from "./TeamStatsPanel";
import type { TeamData } from "@/types/stats";
import type { StatDefinition } from "@/types/stats";

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
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Label className="text-muted-foreground">Nome squadra:</Label>
          <Input
            type="text"
            value={teamA.name}
            onChange={(e) => onTeamAChange({ ...teamA, name: e.target.value })}
            className="max-w-[12rem]"
          />
        </div>
        <TeamStatsPanel
          team={teamA}
          onUpdate={onTeamAChange}
          teamColor="primary"
          statDefinitions={statDefinitions}
        />
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Label className="text-muted-foreground">Nome squadra:</Label>
          <Input
            type="text"
            value={teamB.name}
            onChange={(e) => onTeamBChange({ ...teamB, name: e.target.value })}
            className="max-w-[12rem]"
          />
        </div>
        <TeamStatsPanel
          team={teamB}
          onUpdate={onTeamBChange}
          teamColor="secondary"
          statDefinitions={statDefinitions}
        />
      </div>
    </div>
  );
}
