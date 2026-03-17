/**
 * Next.js instrumentation hook — runs once when the server module initialises
 * (both locally with `npm run dev` / `npm start` and on every Vercel cold-start).
 *
 * We use this to make sure the SQLite database file exists and all schema
 * migrations have been applied before the first request is handled.
 * This is the key step that makes the app work on Vercel without any manual
 * `npm run db:push` step, because Vercel's /tmp filesystem is ephemeral and
 * the database file starts empty on every cold-start.
 */
export async function register() {
  // Only run in the Node.js runtime (not in the Edge runtime).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const path = await import("path");
  const { execFileSync } = await import("child_process");

  // Resolve the Prisma CLI that ships with the project's own node_modules so
  // we don't depend on a global `prisma` command being available.
  const prismaBin = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    "prisma"
  );

  try {
    execFileSync(prismaBin, ["migrate", "deploy"], {
      stdio: "inherit",
      env: { ...process.env },
    });
  } catch (err) {
    // Log but don't crash the server — the app may still work if tables
    // already exist (e.g. a previous migration run succeeded).
    console.error("[DB] prisma migrate deploy failed:", err);
  }
}
