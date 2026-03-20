export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen max-w-screen-7xl mx-auto bg-gradient-to-b from-background via-muted/30 to-muted/50 font-sans dark:via-muted/20 dark:to-muted/30">
      <main className="flex min-h-screen w-full flex-col items-center pt-12">
        {children}
      </main>
    </div>
  );
}
