import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRandomPrize } from "@/lib/prizes";
import { generateRedemptionCode } from "@/lib/redemptionCode";

/** Normalise an email or phone so "Bob@Example.com" and "bob@example.com" are the same. */
function normaliseContact(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

export async function POST(req: NextRequest) {
  let body: { contact?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body.contact || body.contact.trim() === "") {
    return NextResponse.json(
      { error: "A phone number or email address is required." },
      { status: 400 }
    );
  }

  const contact = normaliseContact(body.contact);

  // Enforce one ticket per contact per calendar month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const existing = await prisma.ticket.findFirst({
    where: {
      contact,
      createdAt: { gte: monthStart },
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        error: "already_played",
        ticketId: existing.id,
        outcome: existing.outcome,
        redemptionCode: existing.redemptionCode,
        message: "You have already played this month. Come back next month!",
      },
      { status: 409 }
    );
  }

  const prize = await getRandomPrize();

  // Retry up to 5 times in the unlikely event of a code collision
  let ticket;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      ticket = await prisma.ticket.create({
        data: {
          outcome: prize.label,
          contact,
          redemptionCode: generateRedemptionCode(),
        },
      });
      break;
    } catch (err: unknown) {
      const isUniqueViolation =
        err instanceof Error && err.message.includes("Unique constraint");
      if (!isUniqueViolation || attempt === 4) throw err;
    }
  }

  if (!ticket) {
    return NextResponse.json(
      { error: "Failed to create ticket. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ticketId: ticket.id,
    outcome: prize.label,
    description: prize.description,
    redemptionCode: ticket.redemptionCode,
  });
}
