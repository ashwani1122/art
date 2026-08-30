import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  pigmentaPrisma?: PrismaClient;
};

export function getDb() {
  if (globalForPrisma.pigmentaPrisma) return globalForPrisma.pigmentaPrisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  const adapter = new PrismaNeon({ connectionString });
  const client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.pigmentaPrisma = client;
  return client;
}
