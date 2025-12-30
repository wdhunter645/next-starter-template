# Rollback Anchor

## Last Known Good SHA
`<commit-sha-here>`

**Instructions:** Update this SHA after every successful production deployment with green checks.
Example: `abc123def456789...` (full 40-character SHA or short 7-character SHA)

---

## How to Rollback

### Option 1: Revert a Single PR (Recommended)
If the issue is isolated to one recent PR:

```bash
git revert <commit-sha>
git push origin main
```

This triggers a new Cloudflare Pages deployment with the reverted changes.

### Option 2: Reset to Last Known Good SHA
For more complex rollbacks or multiple bad commits:

1. **In GitHub:**
   - Go to the Cloudflare Pages dashboard
   - Find the deployment with the Last Known Good SHA
   - Click "Retry deployment" or "Rollback to this deployment"

2. **Via Git (if needed):**
   ```bash
   git checkout main
   git reset --hard <last-known-good-sha>
   git push origin main --force-with-lease
   ```
   ⚠️ **Warning:** Force push should be coordinated with team. Use `--force-with-lease` to avoid overwriting changes pushed by others. Check recent commits and notify team members before proceeding.

3. **Verify:**
   - Monitor Cloudflare Pages deployment logs
   - Check that the deployment completes successfully
   - Test the deployed site at the production URL

---

## Deployment Process

After each successful production deployment:

1. ✅ Verify all CI checks are green
2. ✅ Verify Cloudflare Pages deployment succeeded
3. ✅ Perform basic smoke test of the deployed site
4. 📝 Update the "Last Known Good SHA" above with the current commit SHA
5. 💾 Commit this file: `git add docs/ROLLBACK_ANCHOR.md && git commit -m "docs: update rollback anchor"`

---

## Cloudflare Pages Deployment Notes

- **Build command:** `npm run build:cf`
- **Output directory:** `out`
- **Node version:** 20 (or as specified in `.node-version`)
- **Environment variables:** Set in Cloudflare Pages dashboard (not in repo)

---

## Troubleshooting

**Q: Deployment is stuck or failing repeatedly?**
- Check Cloudflare Pages deployment logs for errors
- Verify environment variables are set correctly in Cloudflare dashboard
- Check recent commits for breaking changes
- Roll back to Last Known Good SHA

**Q: How do I find the commit SHA?**
- On GitHub: Click on the commit in the commit history
- Locally: `git log --oneline -n 10`
- In Cloudflare Pages: The deployment details show the commit SHA

**Q: Should I update this file in every PR?**
- No. Only update after successful production merges to main.
