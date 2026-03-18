import { NextRequest, NextResponse } from "next/server";
import { getSpringPrizePools } from "@/lib/prizes";

function checkAuth(req: NextRequest): boolean {
  const token =
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token");
  return !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

/** GET /api/admin/spring-prizes — return spring (March–May) prize pools with odds */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getSpringPrizePools());
}
