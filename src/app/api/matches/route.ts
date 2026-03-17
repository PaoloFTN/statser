import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/user";

export async function GET(request: Request) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { sportPlan: { select: { name: true } } },
  });

  return NextResponse.json(
    matches.map((m) => ({
      id: m.id,
      matchName: m.matchName,
      sportPlanId: m.sportPlanId,
      sportPlanName: m.sportPlan.name,
      teamAData: m.teamAData,
      teamBData: m.teamBData,
      createdAt: m.createdAt.getTime(),
    })),
  );
}

export async function POST(request: Request) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { matchName, sportPlanId, teamAData, teamBData } = body as {
    matchName: string;
    sportPlanId: string;
    teamAData: unknown;
    teamBData: unknown;
  };

  if (!matchName?.trim() || !sportPlanId || !teamAData || !teamBData) {
    return NextResponse.json(
      { error: "matchName, sportPlanId, teamAData, teamBData richiesti" },
      { status: 400 },
    );
  }

  let plan = await prisma.sportPlan.findFirst({
    where: {
      id: sportPlanId,
      OR: [{ userId: null }, { userId: user.id }],
    },
  });
  if (!plan) {
    plan = await prisma.sportPlan.create({
      data: {
        userId: user.id,
        id: sportPlanId,
        name: "Piano di default",
        slug: "piano-di-default",
        playerCount: 11,
        statDefinitions: [],
      },
    });
  }

  const match = await prisma.match.create({
    data: {
      userId: user.id,
      sportPlanId: plan?.id ?? sportPlanId,
      matchName: matchName.trim(),
      teamAData: teamAData as object,
      teamBData: teamBData as object,
    },
  });

  return NextResponse.json({
    id: match.id,
    matchName: match.matchName,
    createdAt: match.createdAt.getTime(),
  });
}
