import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { defaultPlanId } = body as { defaultPlanId: string | null };

  if (defaultPlanId !== null) {
    const plan = await prisma.sportPlan.findFirst({
      where: {
        id: defaultPlanId,
        OR: [{ userId: null }, { userId: user.id }],
      },
    });
    if (!plan) {
      return NextResponse.json({ error: "Piano non trovato" }, { status: 400 });
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { defaultPlanId },
  });

  return NextResponse.json({ ok: true });
}
