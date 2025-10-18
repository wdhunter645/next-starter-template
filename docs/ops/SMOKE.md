# Smoke Testing

Smoke tests are quick validation checks to ensure core functionality is working after deployment.

## Overview

The smoke test script (`scripts/smoke.sh`) validates:
- API endpoints return expected status codes
- JSON responses are valid
- Public routes are accessible
- Protected routes respond appropriately

## Running Smoke Tests

### Local Development
```bash
# Start dev server in one terminal
npm run dev

# Run smoke tests in another terminal
./scripts/smoke.sh http://localhost:3000
```

### Preview/Staging
```bash
# Test against preview deployment
./scripts/smoke.sh https://preview-pr-123.pages.dev

# Test against staging
./scripts/smoke.sh https://test.lougehrigfanclub.com
```

### Production
```bash
# Test production site
./scripts/smoke.sh https://www.lougehrigfanclub.com
```

## What Gets Tested

### API Endpoints
1. **`/api/env/check`**
   - Returns environment variable status
   - Validates JSON response
   - Shows which env vars are present/missing

2. **`/api/phase2/status`**
   - Returns build information
   - Lists expected routes
   - Validates system health

### Public Routes
All public pages should return HTTP 200:
- `/` - Home
- `/weekly` - Weekly Matchup
- `/milestones` - Milestones
- `/charities` - Charities
- `/news` - News & Q&A
- `/calendar` - Calendar
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service

### Protected Routes
These should return HTTP 200 but show auth required messages:
- `/member` - Member area (requires session)
- `/admin` - Admin area (requires session + admin role)

## Script Requirements

The smoke script requires:
- `curl` - Make HTTP requests
- `jq` - Parse JSON responses (optional but recommended)

Install on Ubuntu/Debian:
```bash
sudo apt-get install curl jq
```

Install on macOS:
```bash
brew install curl jq
```

## Output Format

The script provides color-coded output:
- ✓ **Green** - Test passed
- ✗ **Red** - Test failed
- ⚠ **Yellow** - Warning (e.g., invalid JSON)

Example output:
```
🔍 Running smoke tests against: http://localhost:3000

═══════════════════════════════════════
  API Endpoints
═══════════════════════════════════════
Testing: Environment variable check... ✓ PASS (HTTP 200, valid JSON)
{
  "ok": true,
  "summary": {
Testing: Phase 2 status... ✓ PASS (HTTP 200, valid JSON)
{
  "ok": true,
  "timestamp": "2025-01-15T10:30:00.000Z",

═══════════════════════════════════════
  Public Routes
═══════════════════════════════════════
Testing: Home page... ✓ PASS (HTTP 200)
Testing: Weekly page... ✓ PASS (HTTP 200)
...

═══════════════════════════════════════
  Summary
═══════════════════════════════════════
Tests run:    12
Tests passed: 12
Tests failed: 0

✓ All smoke tests passed!
```

## Using in CI/CD

### GitHub Actions
```yaml
- name: Run smoke tests
  run: |
    npm run build
    npm start &
    sleep 5
    ./scripts/smoke.sh http://localhost:3000
```

### Cloudflare Pages Deploy Hook
After deployment:
```bash
# In deployment script
PREVIEW_URL="https://${CF_PAGES_URL}"
./scripts/smoke.sh "$PREVIEW_URL"
```

## NPM Script Alias

Add to `package.json` for convenience:
```json
{
  "scripts": {
    "smoke:preview": "bash scripts/smoke.sh"
  }
}
```

Run with:
```bash
npm run smoke:preview http://localhost:3000
```

## Troubleshooting

### Test fails with "000" status code
- Server is not running or unreachable
- Check URL is correct
- Verify firewall/network settings

### JSON validation fails
- Endpoint returned non-JSON response
- Check endpoint implementation
- Verify Content-Type header is `application/json`

### curl command not found
```bash
# Ubuntu/Debian
sudo apt-get install curl

# macOS
brew install curl
```

### jq command not found
Script will work without `jq` but won't validate JSON or show pretty output:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

## Exit Codes

- **0** - All tests passed
- **1** - One or more tests failed

Use in CI:
```bash
if ./scripts/smoke.sh "$PREVIEW_URL"; then
  echo "Smoke tests passed"
else
  echo "Smoke tests failed - blocking deployment"
  exit 1
fi
```

## Extending Smoke Tests

To add new tests, edit `scripts/smoke.sh`:

### Add new endpoint test
```bash
test_json_endpoint "/api/my-new-endpoint" "My new endpoint description"
```

### Add new route test
```bash
test_endpoint "/my-new-route" 200 "My new route description"
```

### Add custom validation
```bash
RESPONSE=$(curl -s "$BASE_URL/api/custom")
if echo "$RESPONSE" | grep -q "expected_value"; then
  echo "✓ Custom check passed"
else
  echo "✗ Custom check failed"
fi
```

## Best Practices

1. **Run after every deployment** - Catch issues early
2. **Test preview URLs** - Validate before merging
3. **Keep tests fast** - Smoke tests should complete in seconds
4. **Test critical paths only** - Don't test every possible scenario
5. **Log failures** - Save output when tests fail for debugging
6. **Automate in CI** - Make smoke tests part of deploy pipeline

## Related Documentation

- [API Reference](../API_REFERENCE.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)
- [Rollout Checklist](./ROLLOUT.md) (to be created in PR #13)
