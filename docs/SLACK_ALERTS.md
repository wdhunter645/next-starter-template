# Slack Alerts for Snapshot Workflows

This document explains how to set up and use Slack notifications for automated snapshot workflows in the LGFC repository.

## Overview

The repository includes automated snapshot workflows that capture the state of:
- **Repository Snapshot** (`snapshot.yml`): Daily snapshots of repository structure, key files, and hashes
- **Cloudflare Pages Snapshot** (`cf_pages_snapshot.yml`): Daily snapshots including Cloudflare Pages deployment information

Both workflows send status notifications to a Slack channel using an Incoming Webhook.

---

## Setup Instructions

### 1. Create Slack Incoming Webhook

1. Go to your Slack workspace settings
2. Navigate to **Apps & Integrations**
3. Search for **Incoming Webhooks** (built-in Slack integration)
4. Click **Add to Slack**
5. Select the channel where you want to receive notifications (e.g., `#monitoring`, `#ops-notifications`, `#deployments`)
6. Click **Add Incoming Webhooks Integration**
7. Copy the **Webhook URL** (format: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`)

**Important**: 
- The webhook URL is a secret - treat it like a password
- The webhook can only post messages to the configured channel
- No read permissions or other Slack features are required

### 2. Add Webhook to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `SLACK_WEBHOOK_URL`
5. Value: Paste the webhook URL from step 1
6. Click **Add secret**

### 3. Verify Configuration

The workflows will automatically use the webhook if it's configured. To test:

1. Go to **Actions** tab in GitHub
2. Select either **Repository Snapshot** or **Cloudflare Pages Snapshot** workflow
3. Click **Run workflow**
4. Select a test notification type (success/failure/warning) from the dropdown
5. Click **Run workflow**
6. Check your Slack channel for the test message

---

## How It Works

### Slack Notification Script

The `scripts/slack_notify.sh` script handles all Slack notifications:

```bash
bash scripts/slack_notify.sh <status> <workflow> <details>
```

**Parameters:**
- `status`: Job status (success, failure, cancelled, or custom)
- `workflow`: Workflow name for context
- `details`: Additional information (run number, etc.)

**Environment:**
- `SLACK_WEBHOOK_URL`: Required - Slack webhook endpoint
- `GITHUB_REPOSITORY`: Auto-set by GitHub Actions
- `GITHUB_RUN_NUMBER`: Auto-set by GitHub Actions

### Workflow Integration

Both snapshot workflows include a notification step that runs regardless of job outcome:

```yaml
- name: 📤 Notify Slack
  if: always() && secrets.SLACK_WEBHOOK_URL != ''
  run: bash scripts/slack_notify.sh "${{ job.status }}" "${{ github.workflow }}" "Run #${{ github.run_number }}"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

**Key features:**
- `if: always()` - Ensures notification fires on both success and failure
- Checks if webhook secret exists before attempting to send
- Passes job status dynamically
- Includes workflow name and run number for context

### Message Format

Slack messages use color-coded attachments:

- ✅ **Success** (green): Job completed successfully
- ❌ **Failure** (red): Job failed
- ⚠️ **Warning** (yellow): Job cancelled or other status

Example message:
```
✅ Repository Snapshot completed with status: success
Details: Run #42
Repo: wdhunter645/next-starter-template
Run: 42
```

---

## Testing

### Manual Test via Workflow Dispatch

Both workflows support manual testing with custom status:

1. Go to **Actions → [Workflow Name]**
2. Click **Run workflow**
3. Select test notification type:
   - `success` - Sends green success notification
   - `failure` - Sends red failure notification
   - `warning` - Sends yellow warning notification
4. Click **Run workflow**
5. Check Slack channel for the test message

### Testing the Script Directly

To test the notification script locally (requires webhook URL):

```bash
# Set webhook URL
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Test success notification
bash scripts/slack_notify.sh success "Test Workflow" "Manual test"

# Test failure notification
bash scripts/slack_notify.sh failure "Test Workflow" "Manual test"

# Test warning notification
bash scripts/slack_notify.sh warning "Test Workflow" "Manual test"
```

---

## Troubleshooting

### HTTP 400 - Bad Request

**Cause:** Malformed JSON payload

**Solutions:**
- Verify the script hasn't been modified incorrectly
- Check that special characters in workflow names are being handled properly
- Review the JSON payload format in `scripts/slack_notify.sh`

**Debug:**
```bash
# Add debug output to see the payload
bash -x scripts/slack_notify.sh success "Test" "Debug test"
```

### HTTP 403 - Forbidden

**Cause:** Invalid or revoked webhook URL

**Solutions:**
- Verify the webhook URL in GitHub Secrets is correct
- Check if the webhook was deleted in Slack
- Regenerate the webhook in Slack and update the GitHub Secret

### HTTP 500 - Internal Server Error

**Cause:** Slack service issue

**Solutions:**
- Check [Slack Status](https://status.slack.com/)
- Retry after a few minutes
- The workflow will continue even if notification fails

### Notifications Not Appearing

**Checklist:**
- [ ] `SLACK_WEBHOOK_URL` secret exists in GitHub repository settings
- [ ] Webhook URL is valid and not revoked
- [ ] Slack channel still exists
- [ ] Workflow has `if: always()` condition on notification step
- [ ] Check workflow run logs for error messages

**Verify secret exists:**
```yaml
# In workflow YAML, add a debug step:
- name: Check webhook configured
  run: |
    if [ -z "${{ secrets.SLACK_WEBHOOK_URL }}" ]; then
      echo "❌ SLACK_WEBHOOK_URL not configured"
    else
      echo "✅ SLACK_WEBHOOK_URL is configured"
    fi
```

### Script Permission Denied

**Cause:** Script is not executable

**Solution:**
```bash
chmod +x scripts/slack_notify.sh
git add scripts/slack_notify.sh
git commit -m "Make slack_notify.sh executable"
```

---

## Security Considerations

### ✅ Best Practices

1. **Never log webhook URLs**
   - The script never prints the webhook URL
   - GitHub Actions masks secret values automatically

2. **Validate responses**
   - Script exits with error if Slack returns non-200 status
   - Failed notifications don't break the workflow

3. **Minimal permissions**
   - Webhook can only post messages
   - No read access to Slack data
   - Limited to specific channel

4. **Payload size**
   - Messages are kept under 4 KB
   - Only essential information included

### ❌ Security Anti-Patterns to Avoid

- Don't include secret values in notification messages
- Don't print webhook URL in logs or debug output
- Don't commit webhook URL to repository
- Don't use webhook for sensitive data transmission

---

## Example Screenshots

### Successful Snapshot Notification

```
┌─────────────────────────────────────────┐
│ 🤖 Slack Bot                            │
├─────────────────────────────────────────┤
│ ✅ Repository Snapshot completed with   │
│ status: success                         │
│ Details: Run #123                       │
│ Repo: wdhunter645/next-starter-template │
│ Run: 123                                │
└─────────────────────────────────────────┘
```

### Failed Snapshot Notification

```
┌─────────────────────────────────────────┐
│ 🤖 Slack Bot                            │
├─────────────────────────────────────────┤
│ ❌ Cloudflare Pages Snapshot completed  │
│ with status: failure                    │
│ Details: Run #124                       │
│ Repo: wdhunter645/next-starter-template │
│ Run: 124                                │
└─────────────────────────────────────────┘
```

---

## Scheduled Execution

Both workflows run automatically on a daily schedule:

- **Repository Snapshot**: 2:00 AM UTC daily
- **Cloudflare Pages Snapshot**: 3:00 AM UTC daily

You'll receive Slack notifications for each scheduled run.

---

## Customization

### Change Notification Channel

To send notifications to a different channel:

1. Create a new webhook for the target channel in Slack
2. Update the `SLACK_WEBHOOK_URL` secret in GitHub

### Customize Message Format

Edit `scripts/slack_notify.sh` to modify:
- Message text and formatting
- Color scheme
- Additional context fields
- Emoji icons

### Add More Workflows

To add Slack notifications to other workflows:

1. Add the notification step at the end of the job
2. Use `if: always()` to ensure it runs on success and failure
3. Pass appropriate context via script parameters

Example:
```yaml
- name: Notify Slack
  if: always() && secrets.SLACK_WEBHOOK_URL != ''
  run: bash scripts/slack_notify.sh "${{ job.status }}" "${{ github.workflow }}" "Run #${{ github.run_number }}"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Maintenance

### Webhook Rotation

To rotate the webhook URL periodically:

1. Create a new webhook in Slack for the same channel
2. Update `SLACK_WEBHOOK_URL` secret in GitHub
3. Delete the old webhook from Slack

### Monitoring

Check workflow logs regularly to ensure notifications are being sent:

1. Go to **Actions** tab
2. Select a recent workflow run
3. Expand the "Notify Slack" step
4. Verify "Slack notification sent successfully (HTTP 200)" appears

---

## Additional Resources

- [Slack Incoming Webhooks Documentation](https://api.slack.com/messaging/webhooks)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Slack Message Formatting](https://api.slack.com/reference/surfaces/formatting)

---

## Support

For issues with:
- **Slack setup**: Contact your Slack workspace admin
- **GitHub Actions**: Check workflow run logs in Actions tab
- **Script errors**: Review `scripts/slack_notify.sh` and workflow YAML files
