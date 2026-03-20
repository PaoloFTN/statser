import type { Metadata } from "next";
import "./globals.css";
import { NavAuth } from "@/components/NavAuth";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Statistiche Partita | Statser",
  description:
    "Registra passaggi, recuperi, cross e gol per due squadre di calcio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={cn("font-sans", geist.variable)}>
      <body className="antialiased min-h-screen flex flex-col">
        <header className="absolute w-full top-0 z-10 border-b border-border bg-card">
          <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 py-3">
            <span className="font-semibold text-foreground">Statser</span>
            <NavAuth />
          </div>
        </header>
        <div className="min-h-0 max-h-screen overflow-hidden pt-12 flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
