import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllPrizes } from "@/lib/prizes";

function checkAuth(req: NextRequest): boolean {
  const token =
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token");
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

/** GET /api/admin/prizes — list all prizes */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prizes = await getAllPrizes();
  return NextResponse.json(prizes);
}

/** POST /api/admin/prizes — create a new prize */
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    label?: string;
    description?: string;
    weight?: number;
    active?: boolean;
    sortOrder?: number;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.label || body.label.trim() === "") {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  if (typeof body.weight !== "number" || body.weight < 0) {
    return NextResponse.json(
      { error: "weight must be a non-negative number" },
      { status: 400 }
    );
  }

  // Place new prize at the end by default
  const maxOrder = await prisma.prize.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const prize = await prisma.prize.create({
    data: {
      label: body.label.trim(),
      description: (body.description ?? "").trim(),
      weight: body.weight,
      active: body.active !== false,
      sortOrder: body.sortOrder ?? nextOrder,
    },
  });

  return NextResponse.json(prize, { status: 201 });
}
