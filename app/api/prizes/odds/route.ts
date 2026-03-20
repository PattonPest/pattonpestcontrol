import { NextResponse } from "next/server";
import { getSpringPrizes, getAllPrizes } from "@/lib/prizes";

interface PrizeOddsEntry {
  label: string;
  description: string;
  odds: string;
}

function withOdds(
  prizes: { label: string; description: string; weight: number }[]
): PrizeOddsEntry[] {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  return prizes.map((p) => ({
    label: p.label,
    description: p.description,
    odds: total > 0 ? `${((p.weight / total) * 100).toFixed(1)}%` : "—",
  }));
}

function isSpringMonth(): boolean {
  const month = new Date().getMonth() + 1; // 1-indexed
  return month >= 3 && month <= 5;
}

/**
 * GET /api/prizes/odds
 * Public endpoint — no auth required.
 * Returns the current active prize pool with win odds for each service type.
 *
 * During spring (March–May) the seasonal prize pools are used, which differ
 * between recurring-service and one-time-service customers.
 *
 * Outside spring the standard database prize pool is used for both types.
 */
export async function GET() {
  if (isSpringMonth()) {
    const { recurring, onetime } = getSpringPrizes();
    return NextResponse.json({
      season: "spring",
      differentiated: true,
      recurring: withOdds(recurring),
      onetime: withOdds(onetime),
    });
  }

  // Non-seasonal: same pool for both service types
  const allPrizes = await getAllPrizes();
  const active = allPrizes.filter((p) => p.active);
  const pool = withOdds(active);

  return NextResponse.json({
    season: "standard",
    differentiated: false,
    recurring: pool,
    onetime: pool,
  });
}
