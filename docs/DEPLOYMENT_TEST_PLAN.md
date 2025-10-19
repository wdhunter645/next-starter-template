# Deployment Orchestrator Test Plan

This document outlines the test plan for validating the deployment orchestrator implementation.

## Test Objectives

1. Verify the deployment workflow accepts environment inputs correctly
2. Validate the orchestrator script checks preconditions properly
3. Ensure workflow triggering and monitoring works as expected
4. Confirm smoke tests execute against correct domains
5. Validate error handling and failure scenarios

## Prerequisites for Testing

### Required Secrets

Ensure these secrets are configured in the repository:

- `CLOUDFLARE_API_TOKEN` - API token with Pages deployment permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Production project name
- `CLOUDFLARE_STAGING_PROJECT_NAME` (optional) - Staging project name
- `OPENAI_API_KEY` - OpenAI API key (if used by application)

### Required Tools

- GitHub CLI (`gh`) - Authenticated with repository access
- `curl` - For HTTP requests
- `jq` - For JSON parsing
- `bash` 4.0+ - For script execution

## Test Cases

### TC1: Precondition Validation

**Objective:** Verify the orchestrator checks for required secrets

**Steps:**
1. Temporarily remove one required secret (e.g., rename `OPENAI_API_KEY`)
2. Run: `./scripts/deploy-orchestrator.sh`
3. Observe output

**Expected Results:**
- Script should fail fast with clear error message
- Should list missing secret: `OPENAI_API_KEY`
- Should provide link to repository secrets settings
- Exit code: 1

**Verification:**
```bash
./scripts/deploy-orchestrator.sh
echo "Exit code: $?"
```

---

### TC2: Workflow File Validation

**Objective:** Verify deploy.yml exists and has correct structure

**Steps:**
1. Check workflow file exists
2. Validate YAML syntax
3. Verify workflow_dispatch inputs are defined

**Expected Results:**
- File exists at `.github/workflows/deploy.yml`
- YAML is valid
- Has `workflow_dispatch` trigger
- Has `environment` input with choices: staging, production
- Has `branch` input

**Verification:**
```bash
# Check file exists
test -f .github/workflows/deploy.yml && echo "✓ File exists"

# Validate YAML
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))" && echo "✓ YAML valid"

# Check for workflow_dispatch
grep -q "workflow_dispatch:" .github/workflows/deploy.yml && echo "✓ Has workflow_dispatch"

# Check for environment input
grep -A 5 "environment:" .github/workflows/deploy.yml | grep -q "staging" && echo "✓ Has staging option"
```

---

### TC3: Staging Deployment

**Objective:** Deploy to staging and verify deployment

**Steps:**
1. Run orchestrator (will be stopped after staging)
2. Monitor workflow execution
3. Verify staging deployment completes
4. Check smoke tests pass

**Manual Test:**
```bash
# Trigger staging deployment manually
gh workflow run deploy.yml \
  -R wdhunter645/next-starter-template \
  --ref main \
  -f environment=staging \
  -f branch=main

# Wait and check status
gh run list --workflow=deploy.yml --limit 1

# Check staging site
curl -I https://test.lougehrigfanclub.com/
```

**Expected Results:**
- Workflow triggers successfully
- Build completes without errors
- Deployment succeeds
- Staging site returns HTTP 200 for homepage
- API endpoints return HTTP 200 or expected status

---

### TC4: Smoke Tests - Staging

**Objective:** Verify smoke tests work against staging

**Steps:**
1. Run smoke tests manually against staging
2. Verify all endpoints are tested
3. Check pass/fail reporting

**Verification:**
```bash
# Run smoke tests against staging
SMOKE_URL=https://test.lougehrigfanclub.com npm run smoke:preview

# Or test individual endpoints
curl -I https://test.lougehrigfanclub.com/
curl -I https://test.lougehrigfanclub.com/api/supabase/status
```

**Expected Results:**
- Homepage returns HTTP 200
- API status endpoint returns HTTP 200 or 404 (if not implemented)
- Health check endpoint (if exists) returns HTTP 200
- Script reports pass/fail correctly

---

### TC5: Production Deployment

**Objective:** Deploy to production and verify deployment

**Steps:**
1. After staging succeeds, continue to production
2. Monitor production workflow execution
3. Verify production deployment completes
4. Check smoke tests pass

**Manual Test:**
```bash
# Trigger production deployment manually
gh workflow run deploy.yml \
  -R wdhunter645/next-starter-template \
  --ref main \
  -f environment=production \
  -f branch=main

# Check production site
curl -I https://www.lougehrigfanclub.com/
```

**Expected Results:**
- Workflow triggers successfully
- Build completes without errors
- Deployment succeeds
- Production site returns HTTP 200 for homepage
- API endpoints return HTTP 200 or expected status

---

### TC6: Smoke Tests - Production

**Objective:** Verify smoke tests work against production

**Steps:**
1. Run smoke tests manually against production
2. Verify all endpoints are tested
3. Check pass/fail reporting

**Verification:**
```bash
# Run smoke tests against production
SMOKE_URL=https://www.lougehrigfanclub.com npm run smoke:preview

# Or test individual endpoints
curl -I https://www.lougehrigfanclub.com/
curl -I https://www.lougehrigfanclub.com/api/supabase/status
```

**Expected Results:**
- All tests pass with HTTP 200
- Script reports success
- Exit code: 0

---

### TC7: Full Orchestration

**Objective:** Run complete orchestration from start to finish

**Steps:**
1. Ensure all secrets are configured
2. Run: `./scripts/deploy-orchestrator.sh`
3. Monitor progress through all stages
4. Verify final summary

**Expected Results:**
- ✓ Preconditions pass
- ✓ Staging deployment triggers and completes
- ✓ Staging smoke tests pass
- ✓ Production deployment triggers and completes
- ✓ Production smoke tests pass
- ✓ Summary is printed or posted as comment
- Exit code: 0

**Verification:**
```bash
./scripts/deploy-orchestrator.sh
echo "Exit code: $?"
```

---

### TC8: Error Handling - Workflow Failure

**Objective:** Verify orchestrator handles workflow failures correctly

**Steps:**
1. Introduce a build error (e.g., syntax error in code)
2. Run orchestrator
3. Verify it detects and reports the failure

**Expected Results:**
- Orchestrator waits for workflow completion
- Detects failure conclusion
- Prints first error line from logs
- Stops before production deployment
- Exit code: 1

---

### TC9: Error Handling - Smoke Test Failure

**Objective:** Verify orchestrator handles smoke test failures correctly

**Steps:**
1. Deploy to staging
2. Temporarily break staging site (or use wrong domain)
3. Run smoke tests
4. Verify failure is detected

**Expected Results:**
- Smoke test detects non-200 response
- Prints failing URL and status code
- Stops before production deployment
- Exit code: 1

---

### TC10: Manual Workflow Trigger

**Objective:** Verify manual deployment workflow works via GitHub UI

**Steps:**
1. Go to repository Actions tab
2. Select "Manual Deployment Orchestrator" workflow
3. Click "Run workflow"
4. Optionally enter PR/issue number
5. Monitor execution

**Expected Results:**
- Workflow appears in Actions UI
- Can be triggered with custom inputs
- Orchestrator runs successfully
- Summary comment posts (if PR/issue number provided)

**Verification:**
```bash
# Check workflow exists
gh workflow list | grep "Manual Deployment Orchestrator"

# View recent runs
gh run list --workflow=manual-deploy.yml --limit 5
```

---

## Integration Tests

### IT1: PR Comment Integration

**Objective:** Verify summary posts to PR as comment

**Steps:**
1. Create or identify test PR
2. Run: `./scripts/deploy-orchestrator.sh <PR_NUMBER>`
3. Check PR comments

**Expected Results:**
- Comment appears on PR with summary
- Contains staging and production workflow URLs
- Contains site URLs for both environments
- Marks deployment as COMPLETE

---

### IT2: Workflow Dispatch from Actions

**Objective:** Test triggering deployment from GitHub Actions UI

**Steps:**
1. Navigate to Actions → Manual Deployment Orchestrator
2. Click "Run workflow"
3. Enter PR number (optional)
4. Click "Run workflow" button
5. Monitor execution

**Expected Results:**
- Workflow starts successfully
- Orchestrator script runs
- All steps complete
- Summary appears in logs or as PR comment

---

## Performance Tests

### PT1: Deployment Duration

**Objective:** Measure total deployment time

**Metrics to Capture:**
- Precondition check time: < 30 seconds
- Staging deployment time: ~5-10 minutes
- Staging smoke test time: < 1 minute
- Production deployment time: ~5-10 minutes
- Production smoke test time: < 1 minute
- Total time: ~12-22 minutes

---

## Acceptance Criteria

For the implementation to be considered complete:

- [ ] All test cases (TC1-TC10) pass
- [ ] Integration tests (IT1-IT2) pass
- [ ] Performance is within acceptable limits (PT1)
- [ ] Documentation is complete and accurate
- [ ] Error messages are clear and actionable
- [ ] Script exits with appropriate codes
- [ ] No secrets or credentials are logged
- [ ] Works in both local and CI environments

---

## Known Limitations

1. **Workflow triggering delay:** There's a ~5 second wait after triggering to allow GitHub to create the run record
2. **Log retrieval:** Failed job logs are limited to first 50 lines for readability
3. **Timeout:** Maximum wait time of 30 minutes per workflow
4. **Health endpoints:** Script checks for `/_health` or `/api/healthz` but doesn't fail if neither exists

---

## Test Environment Setup

### Local Development

```bash
# Install dependencies
brew install gh curl jq  # macOS
# or
sudo apt install gh curl jq  # Linux

# Authenticate GitHub CLI
gh auth login

# Verify authentication
gh auth status

# Test script syntax
bash -n ./scripts/deploy-orchestrator.sh
```

### CI/CD Environment

The manual deployment workflow (`.github/workflows/manual-deploy.yml`) automatically sets up the required environment:

- Installs GitHub CLI
- Authenticates with `GITHUB_TOKEN`
- Runs orchestrator script

---

## Rollback Plan

If issues are discovered:

1. **Workflow Issues:**
   - Revert changes to `.github/workflows/deploy.yml`
   - Use previous deployment method

2. **Script Issues:**
   - Fix bugs in `scripts/deploy-orchestrator.sh`
   - Test locally before committing
   - Use `git revert` if needed

3. **Documentation Issues:**
   - Update docs to reflect actual behavior
   - Add troubleshooting sections

---

## Next Steps

After successful testing:

1. Run full orchestration in production
2. Document any issues encountered
3. Update documentation based on findings
4. Train team on new deployment process
5. Consider automating on schedule or triggers

---

**Last Updated:** 2025-10-19  
**Test Owner:** Development Team  
**Status:** Ready for Testing
