import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { THEMES, autoDetectTheme } from "@/lib/themes";

function checkAuth(req: NextRequest): boolean {
  const token =
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token");
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

/**
 * GET /api/admin/theme
 * Returns active theme id, auto-detected id, and all available themes.
 */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const setting = await prisma.setting.findUnique({
    where: { key: "activeTheme" },
  });
  return NextResponse.json({
    activeTheme: setting?.value ?? "auto",
    autoDetected: autoDetectTheme(),
    themes: Object.values(THEMES),
  });
}

/**
 * PUT /api/admin/theme
 * Body: { themeId: string }  — pass "auto" to remove the override.
 */
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { themeId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.themeId) {
    return NextResponse.json({ error: "themeId is required" }, { status: 400 });
  }

  if (body.themeId === "auto") {
    await prisma.setting.deleteMany({ where: { key: "activeTheme" } });
  } else {
    if (!THEMES[body.themeId]) {
      return NextResponse.json({ error: "Unknown theme" }, { status: 400 });
    }
    await prisma.setting.upsert({
      where: { key: "activeTheme" },
      create: { key: "activeTheme", value: body.themeId },
      update: { value: body.themeId },
    });
  }

  return NextResponse.json({ ok: true });
}
