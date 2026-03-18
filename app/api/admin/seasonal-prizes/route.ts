import { NextRequest, NextResponse } from "next/server";
import { getSpringPrizes, type SeasonalPrize } from "@/lib/prizes";

function checkAuth(req: NextRequest): boolean {
  const token =
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token");
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

function withOdds(prizes: SeasonalPrize[]) {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  return prizes.map((p) => ({
    label: p.label,
    description: p.description,
    weight: p.weight,
    odds: total > 0 ? `${((p.weight / total) * 100).toFixed(1)}%` : "—",
  }));
}

/** GET /api/admin/seasonal-prizes — return spring seasonal prize odds for both customer types */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recurring, onetime } = getSpringPrizes();
  return NextResponse.json({
    spring: {
      recurring: withOdds(recurring),
      onetime: withOdds(onetime),
    },
  });
}
