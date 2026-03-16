import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account");

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <AccountClient />
      </div>
    </div>
  );
}
