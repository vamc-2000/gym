import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmins() {
  const password = await bcrypt.hash("Admin123!", 10);
  
  // Super Admin
  await prisma.user.upsert({
    where: { email: "superadmin@gymstreak.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@gymstreak.com",
      password,
      role: "SUPER_ADMIN",
      gender: "Other",
      goal: "General Fitness",
      fitnessLevel: "Advanced"
    }
  });

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@gymstreak.com" },
    update: {},
    create: {
      name: "Vasu Admin",
      email: "admin@gymstreak.com",
      password,
      role: "ADMIN",
      gender: "Male",
      goal: "Muscle Gain",
      fitnessLevel: "Intermediate"
    }
  });

  console.log("Admins seeded successfully");
  await prisma.$disconnect();
}

seedAdmins();
