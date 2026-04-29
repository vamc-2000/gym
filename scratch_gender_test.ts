import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Test Gender",
        email: `test_gender_${Date.now()}@example.com`,
        password: "password123",
        gender: "Male"
      }
    });
    console.log("SUCCESS:", user);
  } catch (err) {
    console.error("FAILED:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
