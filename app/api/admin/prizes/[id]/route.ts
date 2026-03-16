import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest): boolean {
  const token =
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token");
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

/** PUT /api/admin/prizes/[id] — update a prize */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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

  const existing = await prisma.prize.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Prize not found" }, { status: 404 });
  }

  const updated = await prisma.prize.update({
    where: { id },
    data: {
      label: body.label !== undefined ? body.label.trim() : existing.label,
      description:
        body.description !== undefined
          ? body.description.trim()
          : existing.description,
      weight: body.weight !== undefined ? body.weight : existing.weight,
      active: body.active !== undefined ? body.active : existing.active,
      sortOrder:
        body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
    },
  });

  return NextResponse.json(updated);
}

/** DELETE /api/admin/prizes/[id] — delete a prize */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.prize.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Prize not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
