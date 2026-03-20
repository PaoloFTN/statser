import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/user";
import { randomBytes } from "crypto";
import { CreatePlanParams } from "@/app/(stats)/account/page";
import DefaultPlansJSON from "@/lib/default-plans.json";
import { SportPlan } from "@prisma/client";

export async function POST(request: Request) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("create plan");

  const body = await request.json();
  const { name, copyFromPlanId } = body as CreatePlanParams;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome richiesto" }, { status: 400 });
  }

  let playerCount = 11;
  let statDefinitions: { key: string; label: string; short: string }[] = [
    { key: "punti", label: "Punti", short: "Pti" },
  ];

  if (copyFromPlanId) {
    let source = await prisma.sportPlan.findFirst({
      where: {
        OR: [
          { userId: null },
          { userId: user.id },
          { id: copyFromPlanId },
          { slug: copyFromPlanId },
        ],
      },
    });

    if (!source) {
      source =
        (DefaultPlansJSON.find(
          (p) => p.slug === copyFromPlanId,
        ) as unknown as SportPlan) ?? null;

      console.log(JSON.stringify(source));
      if (source) {
        playerCount = source.playerCount;
        statDefinitions = source.statDefinitions as typeof statDefinitions;
      }
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
