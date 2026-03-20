"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SportPlan } from "@prisma/client";
import type { StatDefinition } from "@/types/stats";

interface PlanEditorModalProps {
  plan: SportPlan;
  onClose: () => void;
  onSaved: (plan: SportPlan) => void;
}

export function PlanEditorModal({
  plan,
  onClose,
  onSaved,
}: PlanEditorModalProps) {
  const [name, setName] = useState(plan.name);
  const [playerCount, setPlayerCount] = useState(plan.playerCount);
  const [stats, setStats] = useState<StatDefinition[]>(
    (plan.statDefinitions as unknown as StatDefinition[]) ?? [],
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, playerCount, statDefinitions: stats }),
      });
      if (res.ok) {
        onSaved(await res.json());
      }
    } finally {
      setSaving(false);
    }
  };

  const addStat = () => {
    setStats((prev) => [
      ...prev,
      { key: `stat_${Date.now()}`, label: "Nuova stat", short: "N" },
    ]);
  };

  const removeStat = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStat = (
    index: number,
    field: keyof StatDefinition,
    value: string,
  ) => {
    setStats((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <CardHeader>
          <CardTitle>Modifica piano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Numero giocatori per squadra</Label>
            <Input
              type="number"
              min={1}
              max={22}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Statistiche</Label>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={addStat}
              >
                + Aggiungi
              </Button>
            </div>
            <ul className="space-y-2">
              {stats.map((s, i) => (
                <li key={s.key} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="key"
                    value={s.key}
                    onChange={(e) => updateStat(i, "key", e.target.value)}
                    className="w-28"
                  />
                  <Input
                    type="text"
                    placeholder="Etichetta"
                    value={s.label}
                    onChange={(e) => updateStat(i, "label", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="Breve"
                    value={s.short}
                    onChange={(e) => updateStat(i, "short", e.target.value)}
                    className="w-16"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeStat(i)}
                  >
                    −
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Salvataggio…" : "Salva"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
