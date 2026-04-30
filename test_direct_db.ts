import { prisma } from "./lib/prisma";

async function testDB() {
  console.log("🔍 Testing Direct DB Connection...");
  try {
    await prisma.$connect();
    const count = await prisma.user.count();
    console.log(`✅ Success! User count: ${count}`);
  } catch (e: unknown) {

    console.error("❌ DB Connection Failed!");
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
