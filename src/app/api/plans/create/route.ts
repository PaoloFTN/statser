import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set in this process" },
      { status: 500 }
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
