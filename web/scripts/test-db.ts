import { PrismaClient } from "@prisma/client";
import "dotenv/config";

async function main() {
  const prisma = new PrismaClient();

  try {
    const result = await prisma.$queryRawUnsafe("SELECT 1 as ok");
    console.log("DB CONNECTION OK:", JSON.stringify(result));

    const campsites = await prisma.campsite.count();
    console.log("Campsites in DB:", campsites);

    const routes = await prisma.trekRoute.count();
    console.log("TrekRoutes in DB:", routes);

    const checkpoints = await prisma.checkpoint.count();
    console.log("Checkpoints in DB:", checkpoints);

    const users = await prisma.user.count();
    console.log("Users in DB:", users);
  } catch (e) {
    console.error("DB ERROR:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();