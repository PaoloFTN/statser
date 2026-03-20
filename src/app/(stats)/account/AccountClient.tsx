"use client";

import { useState } from "react";

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
import { User } from "@supabase/supabase-js";
import { Link } from "lucide-react";
import { SportPlan } from "@prisma/client";
import { PlanEditorModal } from "./PlanEditorModal";

type AccountClientProps = {
  user: User;
  plans: (SportPlan & { default: boolean })[] | null;
  onCreatePlan: (name: string, copyFromPlanId?: string) => Promise<SportPlan>;
  onSetDefaultPlan: (planId: string) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<SportPlan>;
};

export function AccountClient({
  user,
  plans,
  onCreatePlan,
  onSetDefaultPlan,
  onDeletePlan,
}: AccountClientProps) {
  const [defaultPlanId, setDefaultPlanId] = useState<string | null>(null);
  const [savingDefault, setSavingDefault] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [createPlanName, setCreatePlanName] = useState("");
  const [copyFromId, setCopyFromId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const [allPlans, setAllPlans] = useState<
    (SportPlan & { default: boolean })[]
  >(plans ?? []);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSaveDefaultPlan = async (defaultPlanId: string) => {
    setSavingDefault(true);
    try {
      onSetDefaultPlan(defaultPlanId);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingDefault(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = createPlanName.trim();
    if (!trimmedName) return;
    setCreating(true);
    try {
      const newPlan = await onCreatePlan(trimmedName, copyFromId);
      if (newPlan?.id) {
        setAllPlans((prev) => [...prev, { ...newPlan, default: false }]);
      }
      setCreatePlanName("");
      setCopyFromId("");
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Eliminare questo piano? Non sarà possibile recuperarlo."))
      return;
    try {
      await onDeletePlan(id);
      setAllPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 w-full px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
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
          <p className="text-muted-foreground">{user.email}</p>
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
            onClick={() => handleSaveDefaultPlan(defaultPlanId ?? "")}
            disabled={savingDefault || defaultPlanId === null}
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
          <form
            onSubmit={handleCreatePlan}
            className="mb-6 flex flex-wrap items-end gap-3 py-2"
          >
            <div className="flex flex-col gap-2">
              <Label>Nome nuovo piano</Label>
              <Input
                type="text"
                value={createPlanName}
                onChange={(e) => setCreatePlanName(e.target.value)}
                placeholder="Es. Calcio under 16"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Copia da (opzionale)</Label>
              <Select
                value={copyFromId}
                onValueChange={(v) => setCopyFromId(v ?? "")}
              >
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
            {allPlans.map((plan: SportPlan & { default: boolean }) => (
              <li
                key={plan.id}
                className="flex items-center justify-between rounded-lg border border-border py-2 px-3"
              >
                <span className="font-medium text-foreground">{plan.name}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.playerCount} giocatori
                </span>
                <div className="flex gap-2">
                  {!plan.default && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditingPlanId(
                          plan.id === editingPlanId ? null : plan.id,
                        )
                      }
                    >
                      Modifica
                    </Button>
                  )}
                  s
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
          {allPlans?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nessun piano personalizzato. Creane uno sopra.
            </p>
          )}
        </CardContent>
      </Card>

      {editingPlanId && (
        <PlanEditorModal
          plan={allPlans.find((p) => p.id === editingPlanId)!}
          onClose={() => setEditingPlanId(null)}
          onSaved={(updated) => {
            setAllPlans(
              allPlans.map((p: SportPlan & { default: boolean }) =>
                p.id === updated.id ? { ...updated, default: p.default } : p,
              ),
            );
            setEditingPlanId(null);
          }}
        />
      )}
    </div>
  );
}
