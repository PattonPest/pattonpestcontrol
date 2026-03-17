import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Look up the current description from the Prize table (admin may have edited it)
  const prize = await prisma.prize.findFirst({
    where: { label: ticket.outcome },
  });

  return NextResponse.json({
    ticketId: ticket.id,
    outcome: ticket.outcome,
    description: prize?.description ?? "",
  });
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await params;
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { revealed: true },
  });

  return NextResponse.json({ ok: true });
}
