import prizesConfig from "@/config/prizes.json";

export interface Prize {
  label: string;
  weight: number;
  description: string;
}

export function getRandomPrize(): Prize {
  const prizes: Prize[] = prizesConfig.prizes;
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
