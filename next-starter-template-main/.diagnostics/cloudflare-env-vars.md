# Cloudflare Pages Environment Variables

## Required Environment Variables

Set these in your Cloudflare Pages project settings under "Environment variables":

### NEXT_PUBLIC_APP_VERSION
- **Description:** Application version displayed in the footer
- **Required:** No (falls back to "1.0.0")
- **Example:** `1.0.0`
- **Usage:** Displayed in Footer component
- **How to set:** 
  1. Go to Cloudflare Pages dashboard
  2. Select your project
  3. Go to Settings > Environment variables
  4. Add `NEXT_PUBLIC_APP_VERSION` with value `1.0.0`

### NEXT_PUBLIC_SITE_NAME
- **Description:** Site name displayed throughout the application
- **Required:** No (falls back to "Lou Gehrig Fan Club")
- **Example:** `Lou Gehrig Fan Club`
- **Usage:** Displayed in Footer component
- **Note:** This already has a sensible default, so only set if you need to override

## Auto-Set by Cloudflare

These variables are automatically set by Cloudflare Pages and do not need manual configuration:

### CF_PAGES_COMMIT_SHA
- **Description:** Git commit SHA of the deployed code
- **Set by:** Cloudflare Pages automatically
- **Usage:** Displayed in Footer component as shortened version (first 7 chars)
- **Example:** `abc1234567890...` (displayed as `abc1234`)

## How to Set Environment Variables in Cloudflare Pages

1. Navigate to your Cloudflare Dashboard
2. Go to Pages
3. Select your project (e.g., "lou-gehrig-fan-club")
4. Click "Settings"
5. Click "Environment variables"
6. Click "Add variable"
7. Enter the variable name and value
8. Select the environment (Production, Preview, or both)
9. Click "Save"

## Verification

After setting environment variables:
1. Trigger a new deployment (push to your branch or redeploy)
2. Check the footer - it should display the version and commit SHA
3. Visit `/health` to verify the app is running

## Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are available in both server and client code
- Changes to environment variables require a redeploy to take effect
- Use Preview environment variables to test before applying to Production
