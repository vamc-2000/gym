import { prisma } from "../lib/prisma";

async function checkPrisma() {
  const models = Object.keys(prisma).filter(key => !key.startsWith("$") && !key.startsWith("_"));
  console.log("Available models:", models);
  process.exit(0);
}

checkPrisma();
