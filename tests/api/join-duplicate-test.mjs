/**
 * Manual test for /api/join duplicate handling
 * 
 * This test validates the following behaviors:
 * 1. First insert returns 200 with ok: true and status: "created"
 * 2. Duplicate insert returns 409 with ok: false and status: "duplicate"
 * 3. Email normalization (case/whitespace) is handled correctly
 * 
 * Run this test against a deployed or local environment:
 * BASE=http://localhost:3000 node tests/api/join-duplicate-test.mjs
 * BASE=https://your-site.pages.dev node tests/api/join-duplicate-test.mjs
 */

const BASE_URL = process.env.BASE || 'http://localhost:3000';
const TEST_EMAIL = `billhunter71+dupecheck-${Date.now()}@gmail.com`;

async function testJoinEndpoint() {
  console.log('Testing /api/join endpoint...');
  console.log('Base URL:', BASE_URL);
  console.log('Test email:', TEST_EMAIL);
  console.log('');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: First insert should return 200 and ok: true
  console.log('Test 1: First insert should return 200 with ok: true');
  try {
    const res1 = await fetch(`${BASE_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bill (Test)', email: TEST_EMAIL })
    });

    const data1 = await res1.json();
    console.log('  Status:', res1.status);
    console.log('  Response:', JSON.stringify(data1, null, 2));

    if (res1.status === 200 && data1.ok === true) {
      console.log('  ✓ PASS: First insert returned 200 with ok: true');
      testsPassed++;
    } else {
      console.log('  ✗ FAIL: Expected status 200 and ok: true');
      testsFailed++;
    }
  } catch (err) {
    console.log('  ✗ FAIL: Error during test 1:', err.message);
    testsFailed++;
  }
  console.log('');

  // Test 2: Duplicate insert should return 409 and ok: false
  console.log('Test 2: Duplicate insert (same email) should return 409 with ok: false');
  try {
    const res2 = await fetch(`${BASE_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bill (Test)', email: TEST_EMAIL })
    });

    const data2 = await res2.json();
    console.log('  Status:', res2.status);
    console.log('  Response:', JSON.stringify(data2, null, 2));

    if (res2.status === 409 && data2.ok === false && data2.status === 'duplicate') {
      console.log('  ✓ PASS: Duplicate returned 409 with ok: false and status: duplicate');
      testsPassed++;
    } else {
      console.log('  ✗ FAIL: Expected status 409, ok: false, and status: duplicate');
      testsFailed++;
    }
  } catch (err) {
    console.log('  ✗ FAIL: Error during test 2:', err.message);
    testsFailed++;
  }
  console.log('');

  // Test 3: Email normalization (whitespace/case) should also return 409
  console.log('Test 3: Email normalization (whitespace + uppercase) should return 409');
  const normalizedEmail = `  ${TEST_EMAIL.toUpperCase()}  `;
  try {
    const res3 = await fetch(`${BASE_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bill (Test)', email: normalizedEmail })
    });

    const data3 = await res3.json();
    console.log('  Status:', res3.status);
    console.log('  Test email:', JSON.stringify(normalizedEmail));
    console.log('  Response:', JSON.stringify(data3, null, 2));

    if (res3.status === 409 && data3.ok === false && data3.status === 'duplicate') {
      console.log('  ✓ PASS: Normalized email returned 409 (duplicate detected)');
      testsPassed++;
    } else {
      console.log('  ✗ FAIL: Expected status 409 for normalized email');
      testsFailed++;
    }
  } catch (err) {
    console.log('  ✗ FAIL: Error during test 3:', err.message);
    testsFailed++;
  }
  console.log('');

  // Summary
  console.log('========================================');
  console.log('Test Summary:');
  console.log(`  Passed: ${testsPassed}/3`);
  console.log(`  Failed: ${testsFailed}/3`);
  console.log('========================================');

  process.exit(testsFailed > 0 ? 1 : 0);
}

testJoinEndpoint().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
