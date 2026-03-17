import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/user";

export async function GET(request: Request) {
  const { user: authUser, response } = await getAuthFromRequest(request);
  if (response) return response;
  if (!authUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, email: true, defaultPlanId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not synced" }, { status: 404 });
  }

  return NextResponse.json(user);
}
