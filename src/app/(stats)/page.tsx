import { StatsBoard } from "@/components/StatsBoard";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import defaultPlansJSON from "@/lib/default-plans.json";
import { getMatches, getPlans, getUser } from "@/lib/user/api";
import { SportPlanConfig } from "@/types/stats";

export default async function Home() {
  const [matches, plans, user] = await Promise.all([
    getMatches(),
    getPlans(),
    getUser(),
  ]);

  return (
    <div className="max-w-screen-2xl w-full">
      <YouTubeEmbed>
        <StatsBoard
          defaultConfig={defaultPlansJSON[0] as SportPlanConfig}
          plans={plans}
          matches={matches}
          user={user}
        />
      </YouTubeEmbed>
    </div>
  );
}
