import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const isNew = !globalForPrisma.prisma;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Enable WAL journal mode on the first time this module is loaded so multiple
// concurrent readers/writers don't block each other (supports 3+ simultaneous users).
if (isNew) {
  void prisma.$executeRawUnsafe("PRAGMA journal_mode=WAL;");
}
