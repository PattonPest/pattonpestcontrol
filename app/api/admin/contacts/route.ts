import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest): boolean {
  const token =
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token");
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

/**
 * GET /api/admin/contacts
 * Returns every ticket from the last 6 months, newest first.
 * Each row includes the contact (email/phone), serviceType, prize outcome,
 * and the timestamp when the ticket was created.
 *
 * Optional query params:
 *   search — case-insensitive substring filter on the contact field
 */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Six months ago from right now
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";

  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
      ...(search
        ? { contact: { contains: search } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      contact: true,
      serviceType: true,
      outcome: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    total: tickets.length,
    since: sixMonthsAgo.toISOString(),
    contacts: tickets.map((t) => ({
      id: t.id,
      contact: t.contact,
      serviceType: t.serviceType,
      outcome: t.outcome,
      createdAt: t.createdAt.toISOString(),
    })),
  });
}
