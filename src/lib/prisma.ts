import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { DB_BASE64 } from "./dbBackup";

function getSqliteUrl(): string {
  // If an external DATABASE_URL is explicitly set (e.g. Postgres / Turso), use it
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  // Detect serverless environment (Vercel, AWS Lambda, or Linux container)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.platform === "linux";

  if (isServerless) {
    const tmpDbPath = path.join("/tmp", "dev.db");

    try {
      // Check if /tmp/dev.db exists and has content
      let hasValidDb = false;
      if (fs.existsSync(tmpDbPath)) {
        try {
          const stats = fs.statSync(tmpDbPath);
          if (stats.size > 0) {
            hasValidDb = true;
          }
        } catch {
          hasValidDb = false;
        }
      }

      if (!hasValidDb) {
        let copied = false;
        const bundledPath = path.join(process.cwd(), "prisma", "dev.db");

        if (fs.existsSync(/*turbopackIgnore: true*/ bundledPath)) {
          try {
            fs.copyFileSync(bundledPath, tmpDbPath);
            copied = true;
          } catch (err) {
            console.warn("Could not copy from bundled path:", err);
          }
        }

        // If not copied from disk, restore from embedded base64 backup
        if (!copied && DB_BASE64) {
          const buffer = Buffer.from(DB_BASE64, "base64");
          fs.writeFileSync(tmpDbPath, buffer);
        }
      }
    } catch (e) {
      console.error("Error setting up serverless SQLite database in /tmp:", e);
    }

    return `file:${tmpDbPath}`;
  }

  // Local development fallback
  const localDb = path.join(process.cwd(), "prisma", "dev.db");
  return `file:${localDb}`;
}

const activeDbUrl = getSqliteUrl();
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
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

