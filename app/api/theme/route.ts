import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoDetectTheme, getTheme } from "@/lib/themes";

/**
 * GET /api/theme
 * Returns the currently active theme object.
 * If an admin has pinned a theme, that wins; otherwise auto-detects by date.
 */
export async function GET() {
  const setting = await prisma.setting.findUnique({
    where: { key: "activeTheme" },
  });
  const themeId = setting?.value ?? autoDetectTheme();
  return NextResponse.json(getTheme(themeId));
}
