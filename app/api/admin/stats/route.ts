import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token =
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const total = await prisma.ticket.count();
  const byOutcome = await prisma.ticket.groupBy({
    by: ["outcome"],
    _count: { outcome: true },
  });

  return NextResponse.json({
    totalTickets: total,
    byPrize: byOutcome.map((r) => ({
      prize: r.outcome,
      count: r._count.outcome,
    })),
  });
}
