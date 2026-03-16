import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const defaultCalcio = await prisma.sportPlan.findUnique({
    where: { id: "plan-calcio" },
  });

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email,
      defaultPlanId: defaultCalcio?.id ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
