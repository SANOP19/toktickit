import { PrismaClient } from "@prisma/client";

// [Singleton Handle] Cached Prisma Client instance
let client: PrismaClient | null = null;

// [Database Lazy Initializer] Get or create Prisma Client instance
export function getPrisma(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
    // Backwards compatibility alias for Lab 2 test suites
    (client as any).requesterUser = (client as any).user;
  }
  return client;
}

