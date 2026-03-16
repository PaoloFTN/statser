"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
      <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">Caricamento…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Account
        </h1>
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Torna alle statistiche
        </Link>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Profilo
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">{user?.email}</p>
        <button
          type="button"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/");
            router.refresh();
          }}
          className="mt-4 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Esci
        </button>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Piano predefinito
        </h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Usato quando crei una nuova partita.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={defaultPlanId ?? ""}
            onChange={(e) => setDefaultPlanId(e.target.value || null)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">— Nessuno —</option>
            {allPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.playerCount} giocatori)
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSaveDefaultPlan}
            disabled={savingDefault || defaultPlanId === user?.defaultPlanId}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {savingDefault ? "Salvataggio…" : "Salva"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Piani personalizzati
        </h2>
        <form onSubmit={handleCreatePlan} className="mb-6 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Nome nuovo piano
            </label>
            <input
              type="text"
              value={createPlanName}
              onChange={(e) => setCreatePlanName(e.target.value)}
              placeholder="Es. Calcio under 16"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Copia da (opzionale)
            </label>
            <select
              value={copyFromId}
              onChange={(e) => setCopyFromId(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">— Vuoto —</option>
              {allPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating || !createPlanName.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {creating ? "Creazione…" : "Crea piano"}
          </button>
        </form>

        <ul className="space-y-2">
          {customPlans.map((plan) => (
            <li
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 py-2 px-3 dark:border-zinc-600"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {plan.name}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {plan.playerCount} giocatori · {plan.statDefinitions.length} statistiche
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlanId(plan.id === editingPlanId ? null : plan.id)}
                  className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Modifica
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlan(plan.id)}
                  className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Elimina
                </button>
              </div>
            </li>
          ))}
        </ul>
        {customPlans.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nessun piano personalizzato. Creane uno sopra.
          </p>
        )}
      </section>

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
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Modifica piano
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Numero giocatori per squadra
            </label>
            <input
              type="number"
              min={1}
              max={22}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value) || 1)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">
                Statistiche
              </label>
              <button
                type="button"
                onClick={addStat}
                className="rounded bg-zinc-200 px-2 py-1 text-sm dark:bg-zinc-600 dark:hover:bg-zinc-500"
              >
                + Aggiungi
              </button>
            </div>
            <ul className="space-y-2">
              {stats.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="key"
                    value={s.key}
                    onChange={(e) => updateStat(i, "key", e.target.value)}
                    className="w-28 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                  />
                  <input
                    type="text"
                    placeholder="Etichetta"
                    value={s.label}
                    onChange={(e) => updateStat(i, "label", e.target.value)}
                    className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                  />
                  <input
                    type="text"
                    placeholder="Breve"
                    value={s.short}
                    onChange={(e) => updateStat(i, "short", e.target.value)}
                    className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeStat(i)}
                    className="rounded border border-red-200 px-2 py-1 text-sm text-red-600 dark:border-red-800 dark:text-red-400"
                  >
                    −
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600 dark:hover:bg-zinc-700"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {saving ? "Salvataggio…" : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}
