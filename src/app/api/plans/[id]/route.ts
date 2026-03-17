import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/user";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(
  request: Request,
  { params }: Params
) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const plan = await prisma.sportPlan.findFirst({
    where: { id, userId: user.id },
  });
  if (!plan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, playerCount, statDefinitions } = body as {
    name?: string;
    playerCount?: number;
    statDefinitions?: { key: string; label: string; short: string }[];
  };

  const updated = await prisma.sportPlan.update({
    where: { id },
    data: {
      ...(name != null && { name }),
      ...(playerCount != null && { playerCount }),
      ...(statDefinitions != null && { statDefinitions }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const plan = await prisma.sportPlan.findFirst({
    where: { id, userId: user.id },
    include: { _count: { select: { matches: true } } },
  });
  if (!plan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (plan._count.matches > 0) {
    return NextResponse.json(
      { error: "Impossibile eliminare: esistono partite che usano questo piano" },
      { status: 400 }
    );
  }

  await prisma.sportPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
