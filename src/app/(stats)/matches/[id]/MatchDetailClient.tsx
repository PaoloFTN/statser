"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TeamData = {
  name: string;
  players: Array<{ name: string; [key: string]: string | number }>;
};

type MatchDetail = {
  id: string;
  matchName: string;
  sportPlanName: string;
  teamAData: TeamData;
  teamBData: TeamData;
  createdAt: number;
};

function KeyValueRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex border-b border-border py-2 text-sm last:border-0">
      <dt className="w-40 shrink-0 font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-foreground">{String(value)}</dd>
    </div>
  );
}

function TeamSection({ team, title }: { team: TeamData; title: string }) {
  const statKeys = team.players[0]
    ? Object.keys(team.players[0]).filter(
        (k) => k !== "name" && typeof team.players[0]![k] === "number",
      )
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Nome
                </th>
                {statKeys.map((key) => (
                  <th
                    key={key}
                    className="px-3 py-2 text-left font-medium text-muted-foreground"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {team.players.map((player, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">{player.name}</td>
                  {statKeys.map((key) => (
                    <td className="px-3 py-2" key={key}>
                      {typeof player[key] === "number" ? player[key] : 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function MatchDetailClient({ matchId }: { matchId: string }) {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/matches/${matchId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) setError("Partita non trovata");
          else setError("Errore di caricamento");
          return null;
        }
        return res.json();
      })
      .then((data) => data && setMatch(data))
      .finally(() => setLoading(false));
  }, [matchId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Caricamento…</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !match) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{error ?? "Partita non trovata"}</p>
        <Link
          href="/matches"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          ← Elenco partite
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-12 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          {match.matchName || "Dettaglio partita"}
        </h1>
        <Link
          href="/matches"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          ← Elenco partite
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informazioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <KeyValueRow label="Nome partita" value={match.matchName || "—"} />
          <KeyValueRow
            label="Data"
            value={new Date(match.createdAt).toLocaleString("it-IT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <KeyValueRow label="Disciplina" value={match.sportPlanName ?? "—"} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <TeamSection team={match.teamAData} title={match.teamAData.name} />
        <TeamSection team={match.teamBData} title={match.teamBData.name} />
      </div>
    </div>
  );
}
