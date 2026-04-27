const { connectDB } = require('./lib/db');

async function test() {
  try {
    console.log('Connecting...');
    await connectDB();
    console.log('Connected!');
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
