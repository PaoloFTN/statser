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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const plan = await prisma.sportPlan.findFirst({
    where: {
      id: sportPlanId,
      OR: [{ userId: null }, { userId: user.id }],
    },
  });
  if (!plan) {
    return NextResponse.json({ error: "Piano non trovato" }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      userId: user.id,
      sportPlanId: plan.id,
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
