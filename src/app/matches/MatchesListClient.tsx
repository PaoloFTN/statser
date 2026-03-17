"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MatchItem = {
  id: string;
  matchName: string;
  sportPlanName: string;
  createdAt: number;
};

export function MatchesListClient() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Caricamento…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Partite salvate</h1>
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          ← Nuova partita
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Elenco</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Nessuna partita salvata. Salva una partita dalla pagina Statistiche.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {matches.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/matches/${m.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 pe-2 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {m.matchName || "Senza nome"}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {m.sportPlanName}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
