"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlanSelector, PlanSelectorOption } from "./PlanSelector";

interface StatsBoardHeaderProps {
  config: { playerCount: number };
  allPlans: PlanSelectorOption[];
  selectedPlanId: string | undefined;
  onPlanChange: (id: string) => void;
  matchName: string;
  onMatchNameChange: (name: string) => void;
  onSave: () => void;
  onSaveToCloud: () => void;
  onToggleSaved: () => void;
  onNewMatch: () => void;
  isLoggedIn: boolean;
  savingToCloud: boolean;
  savedCount: number;
}

export function StatsBoardHeader({
  config,
  allPlans,
  selectedPlanId,
  onPlanChange,
  matchName,
  onMatchNameChange,
  onSave,
  onSaveToCloud,
  onToggleSaved,
  onNewMatch,
  isLoggedIn,
  savingToCloud,
  savedCount,
}: StatsBoardHeaderProps) {
  return (
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
          <PlanSelector
            plans={allPlans}
            value={selectedPlanId}
            onChange={onPlanChange}
            placeholder="Disciplina"
            className="w-[180px]"
          />
        )}
        <Input
          type="text"
          value={matchName}
          onChange={(e) => onMatchNameChange(e.target.value)}
          placeholder="Nome partita (opzionale)"
          className="w-48"
        />
        <Button
          type="button"
          onClick={onSave}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          Salva partita
        </Button>
        {isLoggedIn && (
          <Button
            type="button"
            onClick={onSaveToCloud}
            disabled={savingToCloud}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {savingToCloud ? "Salvataggio…" : "Salva su account"}
          </Button>
        )}
        <Button type="button" onClick={onToggleSaved} variant="outline">
          Partite salvate ({savedCount})
        </Button>
        <Button type="button" onClick={onNewMatch} variant="outline">
          Nuova partita
        </Button>
      </div>
    </header>
  );
}
