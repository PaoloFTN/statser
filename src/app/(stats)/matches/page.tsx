import { redirect } from "next/navigation";

import { MatchesListClient } from "./MatchesListClient";
import { getUser } from "@/lib/user";
import { getMatches } from "@/lib/storage";

export default async function MatchesPage() {
  const [user, matches] = await Promise.all([getUser(), getMatches()]);
  if (!user) redirect("/login?redirectTo=/matches");

  return (
    <div className="max-w-screen-2xl w-full px-4">
      <MatchesListClient matches={matches ?? []} />
    </div>
  );
}
