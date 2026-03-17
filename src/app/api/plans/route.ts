import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/user";

export async function GET(request: Request) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [defaultPlans, customPlans] = await Promise.all([
    prisma.sportPlan.findMany({
      where: { userId: null },
      orderBy: { slug: "asc" },
    }),

    prisma.sportPlan.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({
    defaultPlans,
    customPlans,
  });
}
