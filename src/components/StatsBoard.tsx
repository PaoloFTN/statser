"use client";

import { useState } from "react";
import {
  createEmptyTeamFromConfig,
  type TeamData,
  type MatchInfo,
  type SportPlanConfig,
} from "@/types/stats";
import { SportPlan, User } from "@prisma/client";
import { deleteMatch, getMatches, saveMatch } from "@/lib/storage";
import { StatsBoardHeader } from "./StatsBoardHeader";
import { SavedMatchesCard } from "./SavedMatchesCard";
import { StatsBoardTeams } from "./StatsBoardTeams";

export type PlanOption = { id: string; name: string; config: SportPlanConfig };

interface StatsBoardProps {
  defaultConfig: SportPlanConfig;
  plans: SportPlan[];
  matches: MatchInfo[];
  user: User;
}

export type MatchStats = {
  id: string;
  matchName: string;
  savedMatches: MatchInfo[];
  cloudMatches: MatchInfo[] | null;
  showSaved: boolean;
  currentId: string | null;
  savingToCloud: boolean;
  plan: SportPlanConfig;
};

function createNewMatch(config: SportPlanConfig): {
  teamA: TeamData;
  teamB: TeamData;
} {
  return {
    teamA: createEmptyTeamFromConfig(config, "Squadra Casa"),
    teamB: createEmptyTeamFromConfig(config, "Squadra Ospiti"),
  };
}

function planToOption(p: {
  id: string;
  name: string;
  playerCount: number;
  statDefinitions: unknown;
}): PlanOption {
  return {
    id: p.id,
    name: p.name,
    config: {
      name: p.name,
      playerCount: p.playerCount,
      statDefinitions: p.statDefinitions as SportPlanConfig["statDefinitions"],
    },
  };
}

export function StatsBoard({
  defaultConfig,
  plans,
  matches,
  user,
}: StatsBoardProps) {
  const allPlans = plans.map(planToOption);

  const defaultPlanId = user.defaultPlanId ?? plans[0]?.id ?? null;

  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(
    defaultPlanId,
  );

  const config =
    allPlans.find((p) => p.id === defaultPlanId)?.config ?? defaultConfig;

  const [teamA, setTeamA] = useState<TeamData>(() =>
    createEmptyTeamFromConfig(config, "Squadra Casa"),
  );
  const [teamB, setTeamB] = useState<TeamData>(() =>
    createEmptyTeamFromConfig(config, "Squadra Ospiti"),
  );

  const [match, setMatch] = useState<MatchStats | null>({
    id: crypto.randomUUID(),
    matchName: "",
    savedMatches: [...getMatches(), ...matches],
    cloudMatches: null,
    showSaved: false,
    currentId: null,
    savingToCloud: false,
    plan: config,
  });

  const isLoggedIn = match?.cloudMatches !== null;

  const handleSave = () => {
    const tmpMatch: MatchInfo = {
      id: new Date().toISOString(),
      createdAt: match?.id ? new Date(match.id).getTime() : Date.now(),
      matchName: match?.matchName.trim() || `${teamA.name} vs ${teamB.name}`,
      sportPlanId: match?.plan.name !== "default" ? selectedPlanId : undefined,
      teamA: JSON.parse(JSON.stringify(teamA)),
      teamB: JSON.parse(JSON.stringify(teamB)),
    };

    saveMatch({
      id: tmpMatch.id,
      userId: user.id,
      createdAt: new Date(tmpMatch.createdAt),
      matchName: tmpMatch.matchName,
      sportPlanId: tmpMatch.sportPlanId ?? "",
      teamAData: JSON.parse(JSON.stringify(teamA)),
      teamBData: JSON.parse(JSON.stringify(teamB)),
    });

    setMatch((prev) =>
      prev
        ? {
            ...prev,
            currentId: tmpMatch.id,
            showSaved: false,
            savedMatches: [...prev.savedMatches, tmpMatch],
          }
        : prev,
    );
  };

  const handleLoad = (p: MatchInfo) => {
    setTeamA(JSON.parse(JSON.stringify(p.teamA)));
    setTeamB(JSON.parse(JSON.stringify(p.teamB)));
    setMatch((prev) =>
      prev
        ? {
            ...prev,
            currentId: p.id,
            showSaved: false,
            savedMatches: [...prev.savedMatches, p],
          }
        : prev,
    );
  };

  const handleDelete = (id: string) => {
    deleteMatch(id);
    setMatch((prev) =>
      prev
        ? {
            ...prev,
            savedMatches: prev.savedMatches.filter((m) => m.id !== id),
          }
        : prev,
    );
  };

  const handleNewMatch = () => {
    const { teamA: a, teamB: b } = createNewMatch(config);
    const newMatch: MatchInfo = {
      id: new Date().toISOString(),
      createdAt: new Date().getTime(),
      matchName: "",
      sportPlanId: defaultPlanId,
      teamA: JSON.parse(JSON.stringify(a)),
      teamB: JSON.parse(JSON.stringify(b)),
    };
    setTeamA(a);
    setTeamB(b);
    setMatch((prev) =>
      prev
        ? {
            ...prev,
            currentId: null,
            showSaved: false,
            savedMatches: [...prev.savedMatches, newMatch],
          }
        : prev,
    );
  };

  const handleSaveToCloud = async () => {
    if (!isLoggedIn) return;
    setMatch((prev) =>
      prev
        ? {
            ...prev,
            savingToCloud: true,
          }
        : prev,
    );

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          matchName:
            match?.matchName.trim() || `${teamA.name} vs ${teamB.name}`,
          sportPlanId:
            match?.plan.name !== "default" ? defaultPlanId : undefined,
          teamAData: teamA,
          teamBData: teamB,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                cloudMatches: [...(prev.cloudMatches || []), data],
              }
            : prev,
        );
      }
    } finally {
      setMatch((prev) =>
        prev
          ? {
              ...prev,
              savingToCloud: false,
            }
          : prev,
      );
    }
  };

  const handleLoadCloud = (p: MatchInfo) => {
    setTeamA(JSON.parse(JSON.stringify(p.teamA)));
    setTeamB(JSON.parse(JSON.stringify(p.teamB)));

    setMatch((prev) =>
      prev
        ? {
            ...prev,
            currentId: p.id,
            showSaved: false,
            cloudMatches: [...(prev.cloudMatches || []), p],
          }
        : prev,
    );
  };

  const handleDeleteCloud = async (id: string) => {
    const res = await fetch(`/api/matches/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setMatch((prev) =>
        prev
          ? {
              ...prev,
              cloudMatches:
                prev.cloudMatches?.filter((m) => m.id !== id) || null,
            }
          : prev,
      );
    }
  };

  const savedCount =
    (match?.savedMatches?.length ?? 0) + (match?.cloudMatches?.length ?? 0);
  const showSavedCard =
    match?.showSaved &&
    ((match?.savedMatches?.length ?? 0) > 0 ||
      (match?.cloudMatches?.length ?? 0) > 0);

  return (
    <div className="w-full max-w-screen-2xl space-y-6 px-4 py-8">
      <StatsBoardHeader
        config={config}
        allPlans={allPlans}
        selectedPlanId={selectedPlanId}
        onPlanChange={setSelectedPlanId}
        matchName={match?.matchName ?? ""}
        onMatchNameChange={(name) =>
          setMatch((prev) => (prev ? { ...prev, matchName: name } : prev))
        }
        onSave={handleSave}
        onSaveToCloud={handleSaveToCloud}
        onToggleSaved={() =>
          setMatch((prev) =>
            prev ? { ...prev, showSaved: !prev.showSaved } : prev,
          )
        }
        onNewMatch={handleNewMatch}
        isLoggedIn={isLoggedIn}
        savingToCloud={match?.savingToCloud ?? false}
        savedCount={savedCount}
      />

      {showSavedCard && match && (
        <SavedMatchesCard
          savedMatches={match.savedMatches}
          cloudMatches={match.cloudMatches}
          isLoggedIn={isLoggedIn}
          onLoadLocal={handleLoad}
          onDeleteLocal={handleDelete}
          onLoadCloud={handleLoadCloud}
          onDeleteCloud={handleDeleteCloud}
        />
      )}

      <StatsBoardTeams
        teamA={teamA}
        teamB={teamB}
        onTeamAChange={setTeamA}
        onTeamBChange={setTeamB}
        statDefinitions={config.statDefinitions}
      />
    </div>
  );
}
