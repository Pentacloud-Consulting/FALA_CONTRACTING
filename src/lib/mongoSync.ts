import fs from "fs";
import path from "path";
import { MongoClient, Binary } from "mongodb";
import { DB_BASE64 } from "./dbBackup";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://DBC_Pentacoud:Pentacloud2025@cluster0.yjflp6k.mongodb.net/fala_contracting?retryWrites=true&w=majority&appName=Cluster0";

let clientPromise: Promise<MongoClient> | null = null;
let lastSyncTimestamp: number = 0;

export function getDbPath(): string {
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.platform === "linux";

  if (isServerless) {
    const tmpPath = path.join("/tmp", "dev.db");
    try {
      if (!fs.existsSync(tmpPath) || fs.statSync(tmpPath).size === 0) {
        const bundledPath = path.join(process.cwd(), "prisma", "dev.db");
        if (fs.existsSync(bundledPath)) {
          fs.copyFileSync(bundledPath, tmpPath);
        } else if (DB_BASE64) {
          fs.writeFileSync(tmpPath, Buffer.from(DB_BASE64, "base64"));
        }
      }
    } catch (e) {
      console.warn("Synchronous DB seed warning:", e);
    }
    return tmpPath;
  }
  return path.join(process.cwd(), "prisma", "dev.db");
}

function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

/**
 * Initializes local /tmp/dev.db from bundled assets on first cold-start,
 * then syncs the latest snapshot from MongoDB Atlas.
 */
export async function ensureLatestDb(): Promise<string> {
  const localPath = getDbPath();

  // 1. Immediate local fallback if missing
  if (!fs.existsSync(localPath) || fs.statSync(localPath).size === 0) {
    let copied = false;
    const bundledPath = path.join(process.cwd(), "prisma", "dev.db");

    if (fs.existsSync(/*turbopackIgnore: true*/ bundledPath)) {
      try {
        fs.copyFileSync(bundledPath, localPath);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && DB_BASE64) {
      try {
        const buffer = Buffer.from(DB_BASE64, "base64");
        fs.writeFileSync(localPath, buffer);
      } catch (err) {
        console.warn("Could not write base64 DB:", err);
      }
    }
  }

  // 2. Fetch latest version from MongoDB Atlas
  try {
    const client = await getMongoClient();
    const col = client.db("fala_contracting").collection("sqlite_sync");
    const meta = await col.findOne(
      { _id: "master_db" as any },
      { projection: { updatedAt: 1, size: 1 } }
    );

    if (meta && meta.updatedAt) {
      const remoteTime = new Date(meta.updatedAt).getTime();
      if (remoteTime > lastSyncTimestamp) {
        const fullDoc = await col.findOne({ _id: "master_db" as any });
        if (fullDoc && fullDoc.data) {
          const buf = Buffer.from(fullDoc.data.buffer || fullDoc.data);
          fs.writeFileSync(localPath, buf);
          lastSyncTimestamp = remoteTime;
        }
      }
    }
  } catch (err) {
    // Non-blocking fallback to local DB if MongoDB is temporarily slow or unreachable
    console.warn("MongoDB sync pull non-blocking note:", (err as Error)?.message || err);
  }

  return `file:${localPath}`;
}

/**
 * Pushes the current local database state to MongoDB Atlas
 */
export async function pushDbToMongo(): Promise<void> {
  const localPath = getDbPath();
  if (!fs.existsSync(localPath)) return;

  try {
    const buf = fs.readFileSync(localPath);
    if (buf.length === 0) return;

    const client = await getMongoClient();
    const col = client.db("fala_contracting").collection("sqlite_sync");
    const now = new Date();

    await col.updateOne(
      { _id: "master_db" as any },
      {
        $set: {
          data: new Binary(buf),
          updatedAt: now,
          size: buf.length,
        },
      },
      { upsert: true }
    );

    lastSyncTimestamp = now.getTime();
  } catch (err) {
    console.error("MongoDB sync push error:", (err as Error)?.message || err);
  }
}
