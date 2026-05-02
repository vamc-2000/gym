import { userController } from './controllers/UserController';
import { NextRequest } from 'next/server';
import { generateAccessToken } from './utils/jwt';
import { toAuthUser } from './services/AuthService';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log('user not found');
  
  const token = generateAccessToken(toAuthUser(user));

  
  const req = new NextRequest('http://localhost:3000/api/user/profile', {
    method: 'PUT',
    headers: { 'authorization': `Bearer ${token}` },
    body: JSON.stringify({
      goal: 'Fat Loss',
      fitnessLevel: 'Beginner',
      notificationSettings: {
        preferredWorkoutTime: "07:00",
        dndEnabled: false
      }
    })
  });
  
  const res = await userController.updateProfile(req);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
