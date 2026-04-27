/* eslint-disable */
require('dotenv').config({ path: '.env' })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('DATABASE_URL from env:', process.env.DATABASE_URL)
  try {
    await prisma.$connect()
    console.log('✅ Connected successfully')
  } catch (e) {
    console.error('❌ Connection failed:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
