import " dotenv/config\;
import { PrismaClient } from \@prisma/client\;

const prisma = new PrismaClient();

const ok = await prisma.\u0024queryRawUnsafe(\SELECT 1 as ok\);
console.log(\SQLITE CONNECTION OK:\, JSON.stringify(ok));

for (const table of [\campsite\, \trekRoute\, \checkpoint\, \user\, \weatherReport\]) {
 try {
 const count = await prisma[table].count();
 console.log(table + \: \ + count);
 } catch (e) {
 console.log(table + \: error - \ + e.message.split(String.fromCharCode(10))[0]);
 }
}

await prisma.\u0024disconnect();
