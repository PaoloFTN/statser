"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { MatchInfo } from "@/types/stats";

export function MatchesListClient({ matches }: { matches: MatchInfo[] }) {
  return (
    <div className="space-y-6 pt-12 ">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Partite salvate</h1>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ArrowLeft /> Nuova partita
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Elenco</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Nessuna partita salvata. Salva una partita dalla pagina
              Statistiche.
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
                        {m.sportPlanId}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString("it-IT", {
                        day: "2-digit",
                        month: "long",
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
