import { PrismaClient } from "@prisma/client";
import path from "path";

const localDbPath = path.join(process.cwd(), "prisma", "dev.db");
const activeDbUrl = `file:${localDbPath}`;
process.env.DATABASE_URL = activeDbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Backward-compatibility alias for legacy code
if (!(prisma as any).customer) {
  (prisma as any).customer = prisma.account;
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

