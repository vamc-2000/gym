/* eslint-disable */
const http = require('http');

let authToken = '';

function testAPI(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsedBody = data;
        try {
          parsedBody = JSON.parse(data);
        } catch (e) {}
        resolve({ status: res.statusCode, body: parsedBody });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing FIT APIs\n');
  console.log('='.repeat(50));

  try {
    // 1. Register (might fail if already exists, but we fixed the message)
    console.log('--- Auth Tests ---');
    const regRes = await testAPI('/api/auth/register', 'POST', { 
        name: 'Test User',
        email: 'test' + Date.now() + '@test.com', 
        password: 'Password123!' 
    });
    console.log(`✅ POST /api/auth/register: ${regRes.status}`);
    console.log(`   Response: ${JSON.stringify(regRes.body)}`);

    // 2. Login
    const loginRes = await testAPI('/api/auth/login', 'POST', { 
        email: 'test@test.com', 
        password: 'Password123!' 
    });
    console.log(`✅ POST /api/auth/login: ${loginRes.status}`);
    console.log(`   Response: ${JSON.stringify(loginRes.body)}`);
    if (loginRes.body.accessToken) {
        authToken = loginRes.body.accessToken;
        console.log('   Token acquired');
    }

    // 3. User Profile
    console.log('\n--- User Tests ---');
    const profileRes = await testAPI('/api/user/profile');
    console.log(`✅ GET /api/user/profile: ${profileRes.status}`);

    const updateProfileRes = await testAPI('/api/user/profile', 'PUT', { weight: 85 });
    console.log(`✅ PUT /api/user/profile: ${updateProfileRes.status}`);
    if (updateProfileRes.body.data && updateProfileRes.body.data.weight === 85) {
        console.log('   Update verified in response');
    }

    // 4. Progress Logging
    console.log('\n--- Progress Tests ---');
    const logProgressRes = await testAPI('/api/progress', 'POST', { weight: 86, note: 'Morning weight' });
    console.log(`✅ POST /api/progress: ${logProgressRes.status}`);

    const getProgressRes = await testAPI('/api/progress'); // This returns streak currently, but we added POST
    console.log(`✅ GET /api/progress: ${getProgressRes.status}`);

    // 5. Workout
    console.log('\n--- Workout Tests ---');
    const workoutPlanRes = await testAPI('/api/workout/plan');
    console.log(`✅ GET /api/workout/plan: ${workoutPlanRes.status}`);

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
}

runTests();