# 🎯 IMMEDIATE FIX - No Browser Tabs!

**Hey! I heard you're frustrated with browser tabs opening. Here's your solution:**

## The One-Command Fix

Run this in your terminal:

```bash
./fix-git-auth.sh
```

This will:
1. ✅ Sign you out of GitHub CLI
2. ✅ Clear all cached credentials
3. ✅ Show you exactly what to do next

**No browser tabs will open!**

## What To Do After Running the Script

The script will give you instructions, but here's a preview:

### Step 1: Get Your PAT
Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Name: "Codespaces Dev"
- Scope: Check ✅ `repo`
- Copy the token

### Step 2: Authenticate (No Browser!)
```bash
echo "YOUR_PAT_HERE" | gh auth login --with-token
```

Replace `YOUR_PAT_HERE` with your actual token.

### Step 3: Configure Git
```bash
git config --global credential.helper store
```

### Step 4: Done!
```bash
git push
```
Enter your username and PAT when prompted.

## Alternative: Copy-Paste This Whole Block

If you already have your PAT, just copy-paste this (replace YOUR_PAT):

```bash
# Clear everything
gh auth logout --hostname github.com 2>/dev/null || true
rm -f ~/.git-credentials
git config --global --unset credential.helper 2>/dev/null || true

# Authenticate with your PAT (replace YOUR_PAT)
echo "YOUR_PAT" | gh auth login --with-token

# Configure Git
git config --global credential.helper store

# Test it
git push
```

## Why This Works

- Uses `--with-token` flag = **NO BROWSER OPENS**
- Clears all old credentials = **FRESH START**
- Works in any terminal = **NO CODESPACES ISSUES**

## Still Need Help?

See these detailed guides:
- 📖 [Terminal-Only Auth Guide](./docs/TERMINAL_ONLY_AUTH.md) - Full walkthrough
- 📖 [Quick Fix](./docs/QUICK_FIX.md) - Quick reference
- 📖 [Git Auth Troubleshooting](./docs/GIT_AUTH_TROUBLESHOOTING.md) - All solutions

---

**Bottom line:** Run `./fix-git-auth.sh` and follow the instructions. No browser tabs. Problem solved. 🎉
