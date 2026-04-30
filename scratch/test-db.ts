import { connectDB } from '../lib/db';

async function test() {
  try {
    console.log('Connecting...');
    await connectDB();
    console.log('Connected!');
  } catch (e: unknown) {
    console.error('Error:', e);
  }
}

test();
