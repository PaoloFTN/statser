import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/user";

export async function GET(request: Request) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
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
