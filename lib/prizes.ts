import { prisma } from "@/lib/prisma";
import defaultPrizesConfig from "@/config/prizes.json";

export interface Prize {
  id: string;
  label: string;
  weight: number;
  description: string;
  active: boolean;
  sortOrder: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seasonal prize pools — used during Spring (March, April, May).
// These are not stored in the database and take precedence over DB prizes.
// ─────────────────────────────────────────────────────────────────────────────

export interface SeasonalPrize {
  label: string;
  weight: number;
  description: string;
}

const SPRING_PRIZES_RECURRING: SeasonalPrize[] = [
  {
    label: "10% off Summer Mosquito Program",
    weight: 30,
    description: "Enjoy 10% off our Summer Mosquito Program!",
  },
  {
    label: "10% off Summer Tick Program",
    weight: 30,
    description: "Enjoy 10% off our Summer Tick Program!",
  },
  {
    label: "5% off Stinging Insect Treatment",
    weight: 35,
    description: "Enjoy 5% off your next Stinging Insect Treatment!",
  },
  {
    label: "Better Luck Next Time",
    weight: 5,
    description: "Thank you for playing! Come back next month for another chance.",
  },
];

const SPRING_PRIZES_ONETIME: SeasonalPrize[] = [
  {
    label: "Sign Up for Quarterly Service and Get a $25 Coupon",
    weight: 65,
    description:
      "Sign up for our Quarterly Service and receive a $25 coupon toward your first service!",
  },
  {
    label: "10% off Summer Mosquito Program",
    weight: 10,
    description: "Enjoy 10% off our Summer Mosquito Program!",
  },
  {
    label: "10% off Summer Tick Program",
    weight: 10,
    description: "Enjoy 10% off our Summer Tick Program!",
  },
  {
    label: "5% off Stinging Insect Treatment",
    weight: 10,
    description: "Enjoy 5% off your next Stinging Insect Treatment!",
  },
  {
    label: "Better Luck Next Time",
    weight: 5,
    description: "Thank you for playing! Come back next month for another chance.",
  },
];

/** All seasonal prize descriptions keyed by label for quick lookup. */
const SEASONAL_PRIZE_DESCRIPTIONS: Record<string, string> = Object.fromEntries(
  [...SPRING_PRIZES_RECURRING, ...SPRING_PRIZES_ONETIME].map((p) => [
    p.label,
    p.description,
  ])
);

/** Returns the description for a seasonal prize label, or null if not found. */
export function getSeasonalPrizeDescription(label: string): string | null {
  return SEASONAL_PRIZE_DESCRIPTIONS[label] ?? null;
}

/**
 * Returns the spring seasonal prize pools for both customer types.
 * Useful for displaying prize odds in the admin panel and on the scratch page.
 */
export function getSpringPrizes(): {
  recurring: SeasonalPrize[];
  onetime: SeasonalPrize[];
} {
  return {
    recurring: SPRING_PRIZES_RECURRING,
    onetime: SPRING_PRIZES_ONETIME,
  };
}

/** Returns true when the current calendar month is a spring month (March–May). */
function isSpringMonth(): boolean {
  const month = new Date().getMonth() + 1; // 1-indexed
  return month >= 3 && month <= 5;
}

/** Draws from a seasonal prize pool using secure weighted randomness. */
function drawFromPool(prizes: SeasonalPrize[]): SeasonalPrize {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  let roll = (arr[0] / 0x100000000) * totalWeight;
  for (const prize of prizes) {
    if (roll < prize.weight) return prize;
    roll -= prize.weight;
  }
  return prizes[prizes.length - 1];
}

/** Seeds the Prize table from config/prizes.json the first time it's empty. */
async function ensurePrizesSeeded(): Promise<void> {
  const count = await prisma.prize.count();
  if (count === 0) {
    await prisma.prize.createMany({
      data: defaultPrizesConfig.prizes.map((p, i) => ({
        label: p.label,
        description: p.description,
        weight: p.weight,
        active: true,
        sortOrder: i,
      })),
    });
  }
}

/**
 * Draws a prize using secure randomness weighted by each prize's weight.
 * During Spring (March–May) the service-type-specific seasonal prize pool is
 * used instead of the database prizes.
 */
export async function getRandomPrize(serviceType?: string): Promise<Prize> {
  if (isSpringMonth()) {
    const pool =
      serviceType === "recurring"
        ? SPRING_PRIZES_RECURRING
        : SPRING_PRIZES_ONETIME;
    const seasonal = drawFromPool(pool);
    return {
      id: "seasonal",
      label: seasonal.label,
      weight: seasonal.weight,
      description: seasonal.description,
      active: true,
      sortOrder: 0,
    };
  }

  await ensurePrizesSeeded();

  const prizes = await prisma.prize.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (prizes.length === 0) throw new Error("No active prizes configured");

  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  let roll = (arr[0] / 0x100000000) * totalWeight;

  for (const prize of prizes) {
    if (roll < prize.weight) return prize;
    roll -= prize.weight;
  }
  return prizes[prizes.length - 1];
}

/** Returns all prizes (active + inactive) for admin use. */
export async function getAllPrizes(): Promise<Prize[]> {
  await ensurePrizesSeeded();
  return prisma.prize.findMany({ orderBy: { sortOrder: "asc" } });
}
