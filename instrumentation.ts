/**
 * Next.js instrumentation hook — runs once when the server module initialises
 * (both locally with `npm run dev` / `npm start` and on every Vercel cold-start).
 *
 * We use this to make sure the SQLite database file exists and all schema
 * tables are present before the first request is handled.
 *
 * Rather than spawning the heavy Prisma CLI child process (which freezes the
 * Node.js thread for 15-30 s and causes client-side request timeouts on cold
 * Vercel starts), we run the equivalent CREATE TABLE / CREATE INDEX statements
 * directly through the Prisma client that is already loaded in-process.
 * IF NOT EXISTS makes every statement idempotent and safe to re-run on warm
 * restarts.
 */
export async function register() {
  // Only run in the Node.js runtime (not in the Edge runtime).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Dynamic import keeps the Prisma client out of the Edge bundle.
  const { prisma } = await import("@/lib/prisma");

  try {
    // Using $executeRaw (tagged-template form) so Prisma validates the SQL
    // at the call site. All statements are fully static — no user input is
    // ever interpolated — so parameterisation is not needed, but the tagged
    // template is still preferable to the "unsafe" variant as a convention.
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Ticket" (
        "id"          TEXT     NOT NULL PRIMARY KEY,
        "outcome"     TEXT     NOT NULL,
        "contact"     TEXT     NOT NULL,
        "serviceType" TEXT     NOT NULL DEFAULT '',
        "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "revealed"    BOOLEAN  NOT NULL DEFAULT false,
        "ipHash"      TEXT
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Prize" (
        "id"          TEXT     NOT NULL PRIMARY KEY,
        "label"       TEXT     NOT NULL,
        "description" TEXT     NOT NULL,
        "weight"      INTEGER  NOT NULL,
        "active"      BOOLEAN  NOT NULL DEFAULT true,
        "sortOrder"   INTEGER  NOT NULL DEFAULT 0,
        "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   DATETIME NOT NULL
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Setting" (
        "key"   TEXT NOT NULL PRIMARY KEY,
        "value" TEXT NOT NULL
      )
    `;

    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Ticket_contact_idx" ON "Ticket"("contact")`;
  } catch (err) {
    // Log but don't crash the server — Prisma queries will fail gracefully if
    // tables are genuinely missing, which is a clearer signal than a silent crash.
    console.error("[DB] Schema initialisation failed:", err);
  }

  // Add serviceType column to existing Ticket tables that were created before this
  // column was introduced. SQLite does not support ADD COLUMN IF NOT EXISTS, so we
  // attempt the ALTER and silently ignore the error when the column already exists.
  try {
    await prisma.$executeRaw`ALTER TABLE "Ticket" ADD COLUMN "serviceType" TEXT NOT NULL DEFAULT ''`;
  } catch {
    // Column already exists — nothing to do.
  }
}
