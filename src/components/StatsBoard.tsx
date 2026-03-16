"use client";

import { useState, useEffect } from "react";
import { TeamStatsPanel } from "./TeamStatsPanel";
import {
  createEmptyTeamFromConfig,
  type TeamData,
  type Partita,
  type SportPlanConfig,
} from "@/types/stats";
import { getPartite, savePartita, deletePartita } from "@/lib/storage";

type PlanOption = { id: string; name: string; config: SportPlanConfig };

interface StatsBoardProps {
  defaultConfig: SportPlanConfig;
}

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
      playerCount: p.playerCount,
      statDefinitions: p.statDefinitions as SportPlanConfig["statDefinitions"],
    },
  };
}

export function StatsBoard({ defaultConfig }: StatsBoardProps) {
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [allPlans, setAllPlans] = useState<PlanOption[]>([
    { id: "default", name: "Calcio", config: defaultConfig },
  ]);
  const [defaultPlanId, setDefaultPlanId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [userRes, plansRes, matchesRes] = await Promise.all([
        fetch("/api/user", { credentials: "include" }),
        fetch("/api/plans", { credentials: "include" }),
        fetch("/api/matches", { credentials: "include" }),
      ]);
      if (userRes.ok && plansRes.ok) {
        const user = await userRes.json();
        const { defaultPlans, customPlans } = await plansRes.json();
        const combined = [
          ...(defaultPlans ?? []).map(planToOption),
          ...(customPlans ?? []).map(planToOption),
        ];
        if (combined.length > 0) {
          setAllPlans(combined);
          setDefaultPlanId(user.defaultPlanId ?? combined[0]?.id ?? null);
        }
      }
      if (matchesRes.ok) {
        const list = await matchesRes.json();
        setCloudMatches(
          list.map(
            (m: {
              id: string;
              matchName: string;
              sportPlanId: string;
              teamAData: TeamData;
              teamBData: TeamData;
              createdAt: number;
            }) => ({
              id: m.id,
              matchName: m.matchName,
              sportPlanId: m.sportPlanId,
              teamA: m.teamAData,
              teamB: m.teamBData,
              createdAt: m.createdAt,
            }),
          ),
        );
      } else if (matchesRes.status === 401) {
        setCloudMatches(null);
      } else {
        setCloudMatches([]);
      }
      setPlansLoaded(true);
    })();
  }, []);

  const initialPlanId =
    defaultPlanId && allPlans.some((p) => p.id === defaultPlanId)
      ? defaultPlanId
      : (allPlans[0]?.id ?? "default");
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);

  useEffect(() => {
    if (
      plansLoaded &&
      defaultPlanId &&
      allPlans.some((p) => p.id === defaultPlanId)
    ) {
      setSelectedPlanId(defaultPlanId);
    }
  }, [plansLoaded, defaultPlanId, allPlans]);

  const config =
    allPlans.find((p) => p.id === selectedPlanId)?.config ?? defaultConfig;

  const [teamA, setTeamA] = useState<TeamData>(() =>
    createEmptyTeamFromConfig(config, "Squadra Casa"),
  );
  const [teamB, setTeamB] = useState<TeamData>(() =>
    createEmptyTeamFromConfig(config, "Squadra Ospiti"),
  );
  const [matchName, setMatchName] = useState("");
  const [savedPartite, setSavedPartite] = useState<Partita[]>([]);
  const [cloudMatches, setCloudMatches] = useState<Partita[] | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [currentPartitaId, setCurrentPartitaId] = useState<string | null>(null);
  const [savingToCloud, setSavingToCloud] = useState(false);

  useEffect(() => {
    setSavedPartite(getPartite());
  }, []);

  const isLoggedIn = cloudMatches !== null;

  const handleSave = () => {
    const partita: Partita = {
      id: currentPartitaId ?? crypto.randomUUID(),
      createdAt: currentPartitaId
        ? (savedPartite.find((p) => p.id === currentPartitaId)?.createdAt ??
          Date.now())
        : Date.now(),
      matchName: matchName.trim() || `${teamA.name} vs ${teamB.name}`,
      sportPlanId: selectedPlanId !== "default" ? selectedPlanId : undefined,
      teamA: JSON.parse(JSON.stringify(teamA)),
      teamB: JSON.parse(JSON.stringify(teamB)),
    };
    savePartita(partita);
    setSavedPartite(getPartite());
    setCurrentPartitaId(partita.id);
    setShowSaved(false);
  };

  const handleLoad = (p: Partita) => {
    setTeamA(JSON.parse(JSON.stringify(p.teamA)));
    setTeamB(JSON.parse(JSON.stringify(p.teamB)));
    setMatchName(p.matchName);
    setCurrentPartitaId(p.id);
    setShowSaved(false);
  };

  const handleDelete = (id: string) => {
    deletePartita(id);
    setSavedPartite(getPartite());
  };

  const handleNewMatch = () => {
    const { teamA: a, teamB: b } = createNewMatch(config);
    setTeamA(a);
    setTeamB(b);
    setMatchName("");
    setCurrentPartitaId(null);
  };

  const handleSaveToCloud = async () => {
    if (!isLoggedIn) return;
    setSavingToCloud(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          matchName: matchName.trim() || `${teamA.name} vs ${teamB.name}`,
          sportPlanId:
            selectedPlanId === "default" ||
            !allPlans.some((p) => p.id === selectedPlanId)
              ? allPlans[0]?.id
              : selectedPlanId,
          teamAData: teamA,
          teamBData: teamB,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCloudMatches((prev) =>
          prev === null
            ? null
            : [
                {
                  id: data.id,
                  matchName: data.matchName,
                  sportPlanId: selectedPlanId,
                  teamA: JSON.parse(JSON.stringify(teamA)),
                  teamB: JSON.parse(JSON.stringify(teamB)),
                  createdAt: data.createdAt,
                },
                ...prev,
              ],
        );
      }
    } finally {
      setSavingToCloud(false);
    }
  };

  const handleLoadCloud = (p: Partita) => {
    setTeamA(JSON.parse(JSON.stringify(p.teamA)));
    setTeamB(JSON.parse(JSON.stringify(p.teamB)));
    setMatchName(p.matchName);
    setCurrentPartitaId(p.id);
    setShowSaved(false);
    if (p.sportPlanId && allPlans.some((pl) => pl.id === p.sportPlanId)) {
      setSelectedPlanId(p.sportPlanId);
    }
  };

  const handleDeleteCloud = async (id: string) => {
    const res = await fetch(`/api/matches/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setCloudMatches((prev) =>
        prev ? prev.filter((m) => m.id !== id) : null,
      );
    }
  };

  return (
    <div className="w-full max-w-screen-2xl space-y-6 px-4 py-8">
      <header className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Statistiche Partita
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {config.playerCount} giocatori per squadra · Salvataggio in locale
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {allPlans.length > 1 && (
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {allPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
            placeholder="Nome partita (opzionale)"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Salva partita
          </button>
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleSaveToCloud}
              disabled={savingToCloud}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {savingToCloud ? "Salvataggio…" : "Salva su account"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowSaved((v) => !v)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Partite salvate ({savedPartite.length + (cloudMatches?.length ?? 0)}
            )
          </button>
          <button
            type="button"
            onClick={handleNewMatch}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Nuova partita
          </button>
        </div>
      </header>

      {showSaved &&
        (savedPartite.length > 0 || (cloudMatches?.length ?? 0) > 0) && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
            <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
              Partite salvate
            </h3>
            {savedPartite.length > 0 && (
              <>
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Sul dispositivo (localStorage)
                </p>
                <ul className="mb-4 space-y-2">
                  {savedPartite.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 py-2 px-3 dark:border-zinc-600"
                    >
                      <div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {p.matchName}
                        </span>
                        <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
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
                        <button
                          type="button"
                          onClick={() => handleLoad(p)}
                          className="rounded bg-zinc-800 px-3 py-1 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        >
                          Carica
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Elimina
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {isLoggedIn && (cloudMatches?.length ?? 0) > 0 && (
              <>
                <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Su account (cloud)
                </p>
                <ul className="space-y-2">
                  {cloudMatches?.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 py-2 px-3 dark:border-zinc-600"
                    >
                      <div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {p.matchName}
                        </span>
                        <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
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
                        <button
                          type="button"
                          onClick={() => handleLoadCloud(p)}
                          className="rounded bg-zinc-800 px-3 py-1 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        >
                          Carica
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCloud(p.id)}
                          className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          Elimina
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label className="text-sm text-zinc-500 dark:text-zinc-400">
              Nome squadra:
            </label>
            <input
              type="text"
              value={teamA.name}
              onChange={(e) => setTeamA({ ...teamA, name: e.target.value })}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
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
            <label className="text-sm text-zinc-500 dark:text-zinc-400">
              Nome squadra:
            </label>
            <input
              type="text"
              value={teamB.name}
              onChange={(e) => setTeamB({ ...teamB, name: e.target.value })}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
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
