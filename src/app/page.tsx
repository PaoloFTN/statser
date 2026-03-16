import { StatsBoard } from "@/components/StatsBoard";
import { CALCIO_DEFAULT_CONFIG } from "@/lib/default-config";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200 font-sans dark:from-zinc-900 dark:to-zinc-950">
      <main className="flex min-h-screen w-full flex-col items-center">
        <StatsBoard defaultConfig={CALCIO_DEFAULT_CONFIG} />
      </main>
    </div>
  );
}
