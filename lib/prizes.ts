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

/** Draws a prize using secure randomness weighted by each prize's weight. */
export async function getRandomPrize(): Promise<Prize> {
  await ensurePrizesSeeded();

  const prizes = await prisma.prize.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (prizes.length === 0) throw new Error("No active prizes configured");

  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  let roll = arr[0] % totalWeight;

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
