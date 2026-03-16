import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRandomPrize } from "@/lib/prizes";

export async function POST() {
  const prize = getRandomPrize();

  const ticket = await prisma.ticket.create({
    data: {
      outcome: prize.label,
    },
  });

  return NextResponse.json({
    ticketId: ticket.id,
    outcome: prize.label,
    description: prize.description,
  });
}
