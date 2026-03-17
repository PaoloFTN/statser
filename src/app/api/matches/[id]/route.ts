import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/user";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const match = await prisma.match.findFirst({
    where: { id, userId: user.id },
    include: { sportPlan: { select: { name: true } } },
  });
  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: match.id,
    matchName: match.matchName,
    sportPlanId: match.sportPlanId,
    sportPlanName: match.sportPlan.name,
    teamAData: match.teamAData,
    teamBData: match.teamBData,
    createdAt: match.createdAt.getTime(),
  });
}

export async function DELETE(request: Request, { params }: Params) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const match = await prisma.match.findFirst({
    where: { id, userId: user.id },
  });
  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.match.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
