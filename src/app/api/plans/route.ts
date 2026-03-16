import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [defaultPlans, customPlans] = await Promise.all([
    prisma.sportPlan.findMany({ where: { userId: null }, orderBy: { slug: "asc" } }),
    prisma.sportPlan.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({
    defaultPlans,
    customPlans,
  });
}
