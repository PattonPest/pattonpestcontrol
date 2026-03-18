import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRandomPrize } from "@/lib/prizes";

/** Normalise an email or phone so "Bob@Example.com" and "bob@example.com" are the same,
 *  and "(555) 123-4567" and "555-123-4567" resolve to the same digits-only string.
 *  Returns an empty string if the input is not a recognisable email or phone. */
function normaliseContact(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  // Email: must have exactly one '@' with at least one character on each side
  // and a dot somewhere in the domain part.
  const atIdx = trimmed.indexOf("@");
  if (atIdx > 0 && atIdx < trimmed.length - 1 && trimmed.includes(".", atIdx)) {
    return trimmed.replace(/\s+/g, "");
  }
  // Phone: keep digits only so formatting variations map to the same value.
  return trimmed.replace(/\D/g, "");
}

export async function POST(req: NextRequest) {
  let body: { contact?: string; serviceType?: string } = {};
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
  if (!contact) {
    return NextResponse.json(
      { error: "Please provide a valid phone number or email address." },
      { status: 400 }
    );
  }

  const serviceType =
    body.serviceType === "recurring" || body.serviceType === "onetime"
      ? body.serviceType
      : "";

  // Enforce one ticket per contact per calendar month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
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
          message: "You have already played this month. Come back next month!",
        },
        { status: 409 }
      );
    }

    const prize = await getRandomPrize(serviceType);

    const ticket = await prisma.ticket.create({
      data: {
        outcome: prize.label,
        contact,
        serviceType,
      },
    });

    return NextResponse.json({
      ticketId: ticket.id,
      outcome: prize.label,
      description: prize.description,
    });
  } catch (err) {
    console.error("[scratch] Failed to issue ticket:", err);
    return NextResponse.json(
      { error: "Unable to issue a ticket right now. Please try again." },
      { status: 500 }
    );
  }
}
