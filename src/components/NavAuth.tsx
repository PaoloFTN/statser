"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    <nav className="flex items-center gap-4 text-sm">
      <Link
        href="/"
        className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Statistiche
      </Link>
      {user ? (
        <Link
          href="/account"
          className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Account
        </Link>
      ) : (
        <Link
          href="/login"
          className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Accedi
        </Link>
      )}
    </nav>
  );
}
