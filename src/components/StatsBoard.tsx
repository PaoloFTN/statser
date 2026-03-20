"use client";

import { useEffect, useId, useState } from "react";
import {
  createEmptyTeamFromConfig,
  type TeamData,
  type MatchInfo,
} from "@/types/stats";

import { useLocalMatches } from "@/hooks/useLocalMatches";
import { getMatches } from "@/lib/storage";
import { saveMatchToCloud, deleteCloudMatch } from "@/lib/user/api";
import { StatsBoardHeader } from "./StatsBoardHeader";
import { SavedMatchesCard } from "./SavedMatchesCard";

import { MatchStats, PlanOption, StatsBoardProps } from "./types";
import { createNewMatch, getMatchInfo, planToOption } from "./utils";
import { StatsBoardTeams } from "./StatsBoardTeams";

export function StatsBoard({
  defaultConfig,
  plans,
  matches,
  user,
}: StatsBoardProps) {
  const allPlans = plans.map(planToOption) as PlanOption[];
  const stableId = useId();
  const local = useLocalMatches(matches);

  useEffect(() => {
    local.mergeWithLocal(getMatches());
  }, []);

  const defaultPlanId = user.defaultPlanId ?? plans[0]?.id ?? null;

  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(
    defaultPlanId,
  );

  const config =
    allPlans.find((p: PlanOption) => p.id === defaultPlanId)?.config ??
    defaultConfig;

  const [teamA, setTeamA] = useState<TeamData>(() =>
    createEmptyTeamFromConfig(config, "Squadra Casa"),
  );
  const [teamB, setTeamB] = useState<TeamData>(() =>
    createEmptyTeamFromConfig(config, "Squadra Ospiti"),
  );

  const [match, setMatch] = useState<MatchStats>({
    id: stableId,
    matchName: "",
    cloudMatches: null,
    showSaved: false,
    currentId: null,
    savingToCloud: false,
    plan: config,
  });

  const isLoggedIn = match.cloudMatches !== null;

  const handleSave = async () => {
    const tmpMatch = await getMatchInfo(match, teamA, teamB);
    local.save(tmpMatch);

    setMatch((prev) => ({
      ...prev,
      currentId: tmpMatch.id,
      showSaved: false,
    }));
  };

  const handleLoad = async (p: MatchInfo) => {
    setTeamA(JSON.parse(JSON.stringify(p.teamA)));
    setTeamB(JSON.parse(JSON.stringify(p.teamB)));
    setMatch((prev) => ({
      ...prev,
      currentId: p.id,
      showSaved: false,
    }));
  };

  const handleDelete = (id: string) => {
    local.remove(id);
  };

  const handleNewMatch = () => {
    const { teamA: a, teamB: b } = createNewMatch(config);
    setTeamA(a);
    setTeamB(b);
    setMatch((prev) => ({
      ...prev,
      currentId: null,
      matchName: "",
      showSaved: false,
    }));
  };

  const handleSaveToCloud = async () => {
    if (!isLoggedIn) return;
    setMatch((prev) => ({ ...prev, savingToCloud: true }));

    const tmpMatch = await getMatchInfo(match, teamA, teamB);

    try {
      const data = await saveMatchToCloud(tmpMatch);

      setMatch((prev) => ({
        ...prev,
        cloudMatches: [...(prev.cloudMatches || []), data],
      }));
    } finally {
      setMatch((prev) => ({ ...prev, savingToCloud: false }));
    }
  };

  const handleLoadCloud = (p: MatchInfo) => {
    setTeamA(JSON.parse(JSON.stringify(p.teamA)));
    setTeamB(JSON.parse(JSON.stringify(p.teamB)));
    setMatch((prev) => ({
      ...prev,
      currentId: p.id,
      showSaved: false,
    }));
  };

  const handleDeleteCloud = async (id: string) => {
    await deleteCloudMatch(id);
    setMatch((prev) => ({
      ...prev,
      cloudMatches: prev.cloudMatches?.filter((m) => m.id !== id) || null,
    }));
  };

  const handleChangeMatchName = (name: string) => {
    setMatch((prev) => ({ ...prev, matchName: name }));
  };

  const handleToggleSaved = () => {
    setMatch((prev) => ({ ...prev, showSaved: !prev.showSaved }));
  };

  const savedCount = local.matches.length + (match.cloudMatches?.length ?? 0);
  const showSavedCard =
    match.showSaved &&
    (local.matches.length > 0 || (match.cloudMatches?.length ?? 0) > 0);

  return (
    <div className="w-full max-w-screen-2xl space-y-6 px-4 py-8">
      <StatsBoardHeader
        config={config}
        allPlans={allPlans}
        selectedPlanId={selectedPlanId}
        onPlanChange={setSelectedPlanId}
        matchName={match.matchName}
        onMatchNameChange={handleChangeMatchName}
        onSave={handleSave}
        onSaveToCloud={handleSaveToCloud}
        onToggleSaved={handleToggleSaved}
        onNewMatch={handleNewMatch}
        isLoggedIn={isLoggedIn}
        savingToCloud={match.savingToCloud}
        savedCount={savedCount}
      />

      {showSavedCard && (
        <SavedMatchesCard
          savedMatches={local.matches}
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
