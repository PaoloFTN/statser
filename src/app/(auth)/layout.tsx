import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <div className="flex h-[calc(100vh-50px)] flex-1 flex-col items-center justify-center overflow-hidden bg-white px-4 dark:bg-zinc-900">
      {children}
    </div>
  );
}
