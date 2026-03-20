import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/user";
import DefaultPlansJSON from "@/lib/default-plans.json";
import { InputJsonValue } from "@prisma/client/runtime/wasm-compiler-edge";
import { randomBytes } from "crypto";

export async function PATCH(request: Request) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { defaultPlanId } = body as { defaultPlanId: string | null };

  let plan = null;

  if (defaultPlanId !== null) {
    plan = await prisma.sportPlan.findFirst({
      where: {
        id: defaultPlanId,
        OR: [{ userId: null }, { userId: user.id }],
      },
    });
    if (!plan) {
      const dfPlan = DefaultPlansJSON.find((p) => p.id === defaultPlanId);

      if (!dfPlan) {
        return NextResponse.json(
          { error: "Piano non trovato" },
          { status: 400 },
        );
      }

      plan = await prisma.sportPlan.create({
        data: {
          id: dfPlan.id,
          name: dfPlan.name,
          slug: dfPlan.slug,
          playerCount: dfPlan.playerCount,
          statDefinitions: dfPlan.statDefinitions as unknown as InputJsonValue,
          userId: user.id,
        },
      });
    }
  }

  if (!plan) {
    return NextResponse.json({ error: "Piano non trovato" }, { status: 400 });
  }

  await prisma.defaultPlan.create({
    data: {
      id: randomBytes(8).toString("hex"),
      userId: user.id,
      sportPlanId: plan?.id,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const { user, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
