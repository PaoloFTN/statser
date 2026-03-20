import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MatchDetailClient } from "./MatchDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function MatchDetailPage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirectTo=/matches/${(await params).id}`);

  const { id } = await params;
  return <MatchDetailClient matchId={id} />;
}
