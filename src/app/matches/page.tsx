import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MatchesListClient } from "./MatchesListClient";

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/matches");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <MatchesListClient />
    </div>
  );
}
