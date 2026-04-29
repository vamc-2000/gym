import { summaryController } from './controllers/SummaryController';
import { NextRequest } from 'next/server';
import { generateAccessToken } from './utils/jwt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst({ where: { email: 'saivamsid4@gmail.com' } });
  if (!user) return console.log('user not found');
  
  const token = generateAccessToken(user);
  
  // mock request
  const req = new NextRequest('http://localhost:3000/api/dashboard/summary', {
    headers: { 'authorization': `Bearer ${token}` }
  });
  
  const res = await summaryController.getSummary(req);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
