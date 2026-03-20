import { SportPlanConfig, MatchInfo, TeamData } from "@/types/stats";
import { SportPlan, User } from "@prisma/client";

export type PlanOption = {
  id: string;
  name: string;
  config: SportPlanConfig;
  default: boolean;
};

export interface StatsBoardProps {
  defaultConfig: SportPlanConfig;
  plans: (SportPlan & { default: boolean })[];
  matches: MatchInfo[];
  user: User;
}

export type MatchStats = {
  id: string;
  matchName: string;
  cloudMatches: MatchInfo[] | null;
  showSaved: boolean;
  currentId: string | null;
  savingToCloud: boolean;
  plan: SportPlanConfig;
};

export type NewMatch = {
  teamA: TeamData;
  teamB: TeamData;
};
