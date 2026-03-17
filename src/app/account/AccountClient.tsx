"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SportPlan = {
  id: string;
  name: string;
  slug: string;
  playerCount: number;
  statDefinitions: { key: string; label: string; short: string }[];
  userId: string | null;
};

type User = { id: string; email: string; defaultPlanId: string | null };

export function AccountClient() {
  const [user, setUser] = useState<User | null>(null);
  const [defaultPlans, setDefaultPlans] = useState<SportPlan[]>([]);
  const [customPlans, setCustomPlans] = useState<SportPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultPlanId, setDefaultPlanId] = useState<string | null>(null);
  const [savingDefault, setSavingDefault] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [createPlanName, setCreatePlanName] = useState("");
  const [copyFromId, setCopyFromId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const allPlans = [...defaultPlans, ...customPlans];

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        router.push("/login?redirectTo=/account");
        return;
      }
      try {
        await fetch("/api/auth/sync", { credentials: "include" });
        const [userRes, plansRes] = await Promise.all([
          fetch("/api/user", { credentials: "include" }),
          fetch("/api/plans", { credentials: "include" }),
        ]);
        if (userRes.ok) {
          const uData = await userRes.json();
          setUser(uData);
          setDefaultPlanId(uData.defaultPlanId);
        }
        if (plansRes.ok) {
          const { defaultPlans: dp, customPlans: cp } = await plansRes.json();
          setDefaultPlans(dp ?? []);
          setCustomPlans(cp ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleSaveDefaultPlan = async () => {
    if (defaultPlanId === user?.defaultPlanId) return;
    setSavingDefault(true);
    try {
      const res = await fetch("/api/user/default-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ defaultPlanId }),
      });
      if (res.ok) {
        setUser((u) => (u ? { ...u, defaultPlanId } : null));
      }
    } finally {
      setSavingDefault(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPlanName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/plans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: createPlanName.trim(),
          copyFromPlanId: copyFromId || undefined,
        }),
      });
      if (res.ok) {
        const plan = await res.json();
        setCustomPlans((prev) => [...prev, plan]);
        setCreatePlanName("");
        setCopyFromId("");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Eliminare questo piano? Non sarà possibile recuperarlo.")) return;
    const res = await fetch(`/api/plans/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      setCustomPlans((prev) => prev.filter((p) => p.id !== id));
      if (defaultPlanId === id) {
        setDefaultPlanId(null);
        setUser((u) => (u ? { ...u, defaultPlanId: null } : null));
      }
    } else {
      const data = await res.json();
      alert(data.error ?? "Errore");
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">Caricamento…</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Account
        </h1>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Torna alle statistiche
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{user?.email}</p>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push("/");
              router.refresh();
            }}
          >
            Esci
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Piano predefinito</CardTitle>
          <p className="text-sm text-muted-foreground">
            Usato quando crei una nuova partita.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Select
            value={defaultPlanId ?? "__none__"}
            onValueChange={(v) => setDefaultPlanId(v === "__none__" ? null : v)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="— Nessuno —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— Nessuno —</SelectItem>
              {allPlans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.playerCount} giocatori)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={handleSaveDefaultPlan}
            disabled={savingDefault || defaultPlanId === user?.defaultPlanId}
          >
            {savingDefault ? "Salvataggio…" : "Salva"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Piani personalizzati</CardTitle>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleCreatePlan} className="mb-6 flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label>Nome nuovo piano</Label>
            <Input
              type="text"
              value={createPlanName}
              onChange={(e) => setCreatePlanName(e.target.value)}
              placeholder="Es. Calcio under 16"
            />
          </div>
          <div className="space-y-2">
            <Label>Copia da (opzionale)</Label>
            <Select value={copyFromId} onValueChange={(v) => setCopyFromId(v ?? "")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="— Vuoto —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— Vuoto —</SelectItem>
                {allPlans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={creating || !createPlanName.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {creating ? "Creazione…" : "Crea piano"}
          </Button>
        </form>

        <ul className="space-y-2">
          {customPlans.map((plan) => (
            <li
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-border py-2 px-3"
            >
              <span className="font-medium text-foreground">
                {plan.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {plan.playerCount} giocatori · {plan.statDefinitions.length} statistiche
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingPlanId(plan.id === editingPlanId ? null : plan.id)}
                >
                  Modifica
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  Elimina
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {customPlans.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nessun piano personalizzato. Creane uno sopra.
          </p>
        )}
        </CardContent>
      </Card>

      {editingPlanId && (
        <PlanEditorModal
          plan={customPlans.find((p) => p.id === editingPlanId)!}
          onClose={() => setEditingPlanId(null)}
          onSaved={(updated) => {
            setCustomPlans((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            setEditingPlanId(null);
          }}
        />
      )}
    </div>
  );
}

function PlanEditorModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: SportPlan;
  onClose: () => void;
  onSaved: (plan: SportPlan) => void;
}) {
  const [name, setName] = useState(plan.name);
  const [playerCount, setPlayerCount] = useState(plan.playerCount);
  const [stats, setStats] = useState(plan.statDefinitions);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          playerCount,
          statDefinitions: stats,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSaved(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const addStat = () => {
    const key = `stat_${Date.now()}`;
    setStats((prev) => [...prev, { key, label: "Nuova stat", short: "N" }]);
  };

  const removeStat = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, field: "key" | "label" | "short", value: string) => {
    setStats((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
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
              <Button type="button" size="sm" variant="secondary" onClick={addStat}>
                + Aggiungi
              </Button>
            </div>
            <ul className="space-y-2">
              {stats.map((s, i) => (
                <li key={i} className="flex gap-2">
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
