import {
  createEmptyTeamFromConfig,
  MatchInfo,
  SportPlanConfig,
  TeamData,
} from "@/types/stats";
import { MatchStats, NewMatch, PlanOption } from "./types";
import { Match } from "@prisma/client";
import { getUser } from "@/lib/user";

export function createNewMatch(config: SportPlanConfig): NewMatch {
  return {
    teamA: createEmptyTeamFromConfig(config, "Squadra Casa"),
    teamB: createEmptyTeamFromConfig(config, "Squadra Ospiti"),
  };
}

export function planToOption(p: {
  id: string;
  name: string;
  playerCount: number;
  default: boolean;
  statDefinitions: unknown;
}): PlanOption {
  return {
    id: p.id,
    name: p.name,
    config: {
      name: p.name,
      playerCount: p.playerCount,
      statDefinitions: p.statDefinitions as SportPlanConfig["statDefinitions"],
      default: p.default ?? false,
    },
    default: p.default ?? false,
  };
}

export const getMatchInfo = async (
  match: MatchStats,
  _teamA: TeamData,
  _teamB: TeamData,
) => {
  const teamA = JSON.parse(JSON.stringify(_teamA));
  const teamB = JSON.parse(JSON.stringify(_teamB));
  const selectedPlanId = !match.plan?.default ? match.plan.name : undefined;

  const user = await getUser();
  return {
    id: match.id,
    userId: user?.id ?? "",
    createdAt: match.id ? new Date(match.id) : new Date(),
    matchName: match.matchName.trim() || `${teamA.name} vs ${teamB.name}`,
    sportPlanId: match.plan.name !== "default" ? selectedPlanId : undefined,
    teamAData: teamA,
    teamBData: teamB,
  } as Match;
};
