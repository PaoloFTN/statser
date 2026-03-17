import { StatsBoard } from "@/components/StatsBoard";
import { CALCIO_DEFAULT_CONFIG } from "@/lib/default-config";
import { getMatches, getPlans, getUser } from "@/lib/user/api";

export default async function Home() {
  const [matches, plans, user] = await Promise.all([
    getMatches(),
    getPlans(),
    getUser(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-muted/50 font-sans dark:via-muted/20 dark:to-muted/30">
      <main className="flex min-h-screen w-full flex-col items-center">
        <StatsBoard
          defaultConfig={CALCIO_DEFAULT_CONFIG}
          plans={plans}
          matches={matches}
          user={user}
        />
      </main>
    </div>
  );
}
