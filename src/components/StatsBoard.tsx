"use client";

import { useState } from "react";
import { TeamStatsPanel } from "./TeamStatsPanel";
import {
  createEmptyTeamFromConfig,
  type TeamData,
  type MatchInfo,
  type SportPlanConfig,
} from "@/types/stats";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SportPlan, User } from "@prisma/client";
import { deleteMatch, getMatches, saveMatch } from "@/lib/storage";

type PlanOption = { id: string; name: string; config: SportPlanConfig };

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
  console.log(plans);
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

  return (
    <div className="w-full max-w-screen-2xl space-y-6 px-4 py-8">
      <header className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Statistiche Partita
          </h1>
          <p className="mt-2 text-muted-foreground">
            {config.playerCount} giocatori per squadra · Salvataggio in locale
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {allPlans.length > 1 && (
            <Select
              value={selectedPlanId}
              onValueChange={(v) => v != null && setSelectedPlanId(v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Disciplina" />
              </SelectTrigger>
              <SelectContent>
                {allPlans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            type="text"
            value={match?.matchName}
            onChange={(e) =>
              setMatch((prev) =>
                prev
                  ? {
                      ...prev,
                      matchName: e.target.value,
                    }
                  : prev,
              )
            }
            placeholder="Nome partita (opzionale)"
            className="w-48"
          />
          <Button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            Salva partita
          </Button>
          {isLoggedIn && (
            <Button
              type="button"
              onClick={handleSaveToCloud}
              disabled={match?.savingToCloud ?? false}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {(match?.savingToCloud ?? false)
                ? "Salvataggio…"
                : "Salva su account"}
            </Button>
          )}
          <Button
            type="button"
            onClick={() =>
              setMatch((prev) =>
                prev
                  ? {
                      ...prev,
                      showSaved: !prev.showSaved,
                    }
                  : prev,
              )
            }
            variant="outline"
          >
            Partite salvate (
            {match?.savedMatches?.length ??
              0 + (match?.cloudMatches?.length ?? 0)}
            )
          </Button>
          <Button type="button" onClick={handleNewMatch} variant="outline">
            Nuova partita
          </Button>
        </div>
      </header>

      {match?.showSaved &&
        ((match?.savedMatches?.length ?? 0 > 0) ||
          (match?.cloudMatches?.length ?? 0) > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Partite salvate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {match?.savedMatches?.length ??
                (0 > 0 && (
                  <>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Sul dispositivo (localStorage)
                    </p>
                    <ul className="mb-4 space-y-2">
                      {match?.savedMatches?.map((p) => (
                        <li
                          key={p.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border py-2 px-3"
                        >
                          <div>
                            <span className="font-medium text-foreground">
                              {p.matchName}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {new Date(p.createdAt).toLocaleDateString(
                                "it-IT",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleLoad(p)}
                            >
                              Carica
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(p.id)}
                            >
                              Elimina
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ))}
              {isLoggedIn && (match?.cloudMatches?.length ?? 0) > 0 && (
                <>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Su account (cloud)
                  </p>
                  <ul className="space-y-2">
                    {match?.cloudMatches?.map((p) => (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border py-2 px-3"
                      >
                        <div>
                          <span className="font-medium text-foreground">
                            {p.matchName}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {new Date(p.createdAt).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleLoadCloud(p)}
                          >
                            Carica
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCloud(p.id)}
                          >
                            Elimina
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Label className="text-muted-foreground">Nome squadra:</Label>
            <Input
              type="text"
              value={teamA.name}
              onChange={(e) => setTeamA({ ...teamA, name: e.target.value })}
              className="max-w-[12rem]"
            />
          </div>
          <TeamStatsPanel
            team={teamA}
            onUpdate={setTeamA}
            teamColor="primary"
            statDefinitions={config.statDefinitions}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Label className="text-muted-foreground">Nome squadra:</Label>
            <Input
              type="text"
              value={teamB.name}
              onChange={(e) => setTeamB({ ...teamB, name: e.target.value })}
              className="max-w-[12rem]"
            />
          </div>
          <TeamStatsPanel
            team={teamB}
            onUpdate={setTeamB}
            teamColor="secondary"
            statDefinitions={config.statDefinitions}
          />
        </div>
      </div>
    </div>
  );
}
