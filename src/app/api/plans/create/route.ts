import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/user";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, copyFromPlanId } = body as {
    name: string;
    copyFromPlanId?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome richiesto" }, { status: 400 });
  }

  let playerCount = 11;
  let statDefinitions: { key: string; label: string; short: string }[] = [
    { key: "punti", label: "Punti", short: "Pti" },
  ];

  if (copyFromPlanId) {
    const source = await prisma.sportPlan.findFirst({
      where: {
        id: copyFromPlanId,
        OR: [{ userId: null }, { userId: user.id }],
      },
    });
    if (source) {
      playerCount = source.playerCount;
      statDefinitions = source.statDefinitions as typeof statDefinitions;
    }
  }

  const slug = `custom-${randomBytes(4).toString("hex")}`;
  const plan = await prisma.sportPlan.create({
    data: {
      id: `plan-${randomBytes(8).toString("hex")}`,
      name: name.trim(),
      slug,
      playerCount,
      statDefinitions,
      userId: user.id,
    },
  });

  return NextResponse.json(plan);
}
