"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NavAuth() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setMounted(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!mounted) return null;

  return (
    <nav className="flex items-center gap-2">
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Statistiche
      </Link>
      {user ? (
        <>
          <Link
            href="/matches"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Partite
          </Link>
          <Link
            href="/account"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Account
          </Link>
        </>
      ) : (
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Accedi
        </Link>
      )}
    </nav>
  );
}
