# API Tests

## Join Endpoint Duplicate Handling Test

### Purpose
Tests the `/api/join` endpoint to ensure it correctly handles duplicate email submissions with proper HTTP status codes.

### Requirements
- The migration `0006_join_requests_unique_email.sql` must be applied to the D1 database
- The endpoint must be accessible (either local dev or deployed)

### Running the Test

#### Against Deployed Environment
```bash
BASE=https://next-starter-template-6yr.pages.dev node tests/api/join-duplicate-test.mjs
```

#### Against Local Development
```bash
# Start the dev server first
npm run dev

# In another terminal, run the test
BASE=http://localhost:3000 node tests/api/join-duplicate-test.mjs
```

### Expected Results

The test validates three scenarios:

1. **First Insert**: Returns HTTP 200 with `{ ok: true, status: "created" }`
2. **Duplicate Insert**: Returns HTTP 409 with `{ ok: false, status: "duplicate", error: "Email already subscribed." }`
3. **Normalized Email**: Whitespace and case variations of the same email also return HTTP 409

All three tests should pass for the fix to be considered successful.

### Manual Testing with curl

```bash
# Replace BASE with your URL
BASE=https://next-starter-template-6yr.pages.dev

# Test 1: First insert (should be 200)
curl -i -X POST "$BASE/api/join" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bill (Test)","email":"billhunter71+dupecheck@gmail.com"}'

# Test 2: Duplicate (should be 409)
curl -i -X POST "$BASE/api/join" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bill (Test)","email":"billhunter71+dupecheck@gmail.com"}'

# Test 3: Normalization (should be 409)
curl -i -X POST "$BASE/api/join" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bill (Test)","email":"  BILLHUNTER71+DUPECHECK@GMAIL.COM  "}'
```
