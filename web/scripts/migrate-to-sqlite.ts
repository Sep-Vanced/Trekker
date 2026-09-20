import { readFileSync, writeFileSync } from "fs";

// 1. Update prisma/schema.prisma
const schemaPath = "prisma/schema.prisma";
let schema = readFileSync(schemaPath, "utf8");
schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
writeFileSync(schemaPath, schema);
console.log("✅ schema.prisma: postgresql -> sqlite");

// 2. Update src/lib/prisma.ts — replace PrismaPg adapter with plain PrismaClient
const prismaPath = "src/lib/prisma.ts";
let prismaFile = readFileSync(prismaPath, "utf8");
prismaFile = `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`;
writeFileSync(prismaPath, prismaFile);
console.log("✅ src/lib/prisma.ts: removed PrismaPg adapter, using plain PrismaClient");

// 3. Update .env — point DATABASE_URL to a local SQLite file
const envPath = ".env";
let env = readFileSync(envPath, "utf8");
env = env.replace(
  /DATABASE_URL="[^"]*"/,
  'DATABASE_URL="file:./dev.db"'
);
env = env.replace(
  /DIRECT_URL="[^"]*"/,
  'DIRECT_URL=""'
);
writeFileSync(envPath, env);
console.log("✅ .env: DATABASE_URL -> file:./dev.db");

console.log("\nAll conversions complete!");
console.log("Next steps:");
console.log("  npx prisma migrate dev --name init --schema prisma/schema.prisma");
console.log("  npx prisma generate");