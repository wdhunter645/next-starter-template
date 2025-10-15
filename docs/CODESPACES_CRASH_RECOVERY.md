# Codespaces Crash Recovery Guide

This guide helps you recover from Codespaces crashes and remote extension issues.

## Problem

You're experiencing one or more of these issues:
- Codespaces crashed or hung
- Remote extensions are bouncing on/off repeatedly
- Cannot commit or push changes
- VS Code connection issues
- Extension host process crashes repeatedly

## Root Causes

Common causes of Codespaces crashes and extension issues:
1. **Memory exhaustion** - Running too many processes or heavy operations
2. **Extension conflicts** - Incompatible or misbehaving extensions
3. **Network issues** - Unstable connection between local VS Code and remote Codespace
4. **Git operations** - Authentication failures causing repeated retries
5. **Container issues** - Docker container becoming unresponsive

## Immediate Recovery Steps

### Step 1: Stop the Bleeding

If extensions are bouncing on/off, you need to stabilize the environment first:

```bash
# In the Codespaces terminal (if accessible):
# Kill any hung processes
pkill -9 node

# Check for runaway processes
ps aux | grep -E "(node|git)" | grep -v grep

# Stop any running dev servers
pkill -f "next dev"
pkill -f "npm"
```

### Step 2: Disable Problematic Extensions

If you can access VS Code settings:

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Extensions: Disable All Installed Extensions for this Workspace"
3. Reload the window
4. Re-enable extensions one by one to identify the culprit

If you can't access VS Code UI:

```bash
# List installed extensions
code --list-extensions

# Disable all extensions (if code CLI is available in Codespace)
code --disable-extensions
```

### Step 3: Restart Codespace

The safest way to recover:

1. Go to https://github.com/codespaces
2. Find your Codespace
3. Click the three dots (⋯) → Stop codespace
4. Wait 30 seconds
5. Click "Start" to restart it

**Important**: This preserves all uncommitted changes in the workspace.

## Recovering Uncommitted Changes

### If Codespace Won't Start

Your changes are still in the Codespace container. Here's how to recover them:

#### Option 1: Export Changes via GitHub UI

1. Go to https://github.com/codespaces
2. Find your Codespace → Click three dots (⋯)
3. Select "Export changes to a branch"
4. GitHub will create a new branch with your uncommitted changes

#### Option 2: Connect via GitHub CLI

```bash
# List your codespaces
gh codespace list

# Connect to your codespace via SSH
gh codespace ssh -c <codespace-name>

# Once connected, check git status
git status

# Stash your changes
git stash save "Recovery from crash"

# Or commit them
git add .
git commit -m "Recovery: saving work from crashed codespace"
```

#### Option 3: Create New Codespace and Transfer

If the Codespace is completely unrecoverable:

1. Delete the problematic Codespace (after trying export above)
2. Create a new Codespace
3. If you exported changes to a branch, merge them:
   ```bash
   git fetch origin
   git checkout <exported-branch-name>
   # Review changes, then merge to your working branch
   ```

## Fixing Remote Extension Issues

### Symptom: Extensions Keep Reloading

**Cause**: Usually an extension or the extension host is crashing.

**Solution**:

```bash
# In Codespace terminal, check extension host logs
cat ~/.vscode-remote/data/logs/*/exthost*/exthost.log | tail -50

# Look for errors like:
# - "Extension host terminated unexpectedly"
# - "Out of memory"
# - Stack traces from specific extensions
```

Based on errors found:

1. **If specific extension is crashing**: Disable that extension
2. **If "Out of memory"**: Increase Codespace machine size:
   - Go to Codespace settings
   - Select larger machine type (4-core or 8-core)
3. **If network issues**: Check your internet connection, try reconnecting

### Symptom: Git Extension Keeps Retrying

**Cause**: Git authentication failing, causing infinite retry loops.

**Solution**:

```bash
# Stop all git processes
pkill -9 git

# Clear git credential cache
git credential-cache exit
rm -f ~/.git-credentials

# Re-authenticate using GitHub CLI
gh auth login

# Test authentication
git fetch --dry-run
```

See [GIT_AUTH_TROUBLESHOOTING.md](./GIT_AUTH_TROUBLESHOOTING.md) for detailed Git auth solutions.

## Preventing Future Crashes

### 1. Monitor Resource Usage

```bash
# Check memory usage
free -h

# Check CPU usage
top -b -n 1 | head -20

# Check disk usage
df -h
```

### 2. Close Unused Terminals

Multiple terminals consume resources. Close terminals you're not using:
- Click the trash can icon on each terminal tab
- Or use `Ctrl+D` to exit

### 3. Stop Background Processes

Before leaving Codespace idle:

```bash
# Stop dev servers
# Ctrl+C in the terminal running npm/next

# Check for background processes
jobs

# Kill background jobs if needed
kill %1
```

### 4. Upgrade Machine Size

For larger projects, use a bigger Codespace:

1. Go to Repository Settings → Codespaces
2. Set default machine type to 4-core or 8-core
3. Or when creating Codespace, select larger machine

### 5. Use Minimal Extensions

Only install extensions you actively use:
- Remove unused extensions
- Disable extensions you rarely need
- Use workspace-recommended extensions only

## Advanced Troubleshooting

### View Codespace Logs

```bash
# Extension host logs
cat ~/.vscode-remote/data/logs/*/exthost*/exthost.log

# VS Code server logs
cat ~/.vscode-server/data/logs/*/window1/exthost/exthost.log

# System logs
journalctl --user -n 100
```

### Reset VS Code Server

If VS Code remote server is corrupted:

```bash
# Stop Codespace first, then start it
# Once started, in terminal:
rm -rf ~/.vscode-server
# Reload VS Code - it will reinstall the server
```

### Container Rebuild

If environment is corrupted:

1. Commit and push all changes (if possible)
2. Open Command Palette → "Codespaces: Rebuild Container"
3. Wait for rebuild to complete
4. Test that everything works

## Emergency Checklist

When Codespace crashes and you can't commit:

- [ ] Try to access Codespace terminal (even if VS Code UI is unresponsive)
- [ ] Run `git status` to see uncommitted changes
- [ ] Try `git stash` to save changes
- [ ] If stash works, try `git stash list` to verify
- [ ] Try to restart Codespace from GitHub UI
- [ ] If restart fails, use "Export changes to branch" feature
- [ ] As last resort, create new Codespace and manually recover files

## Quick Command Reference

```bash
# Save work quickly
git add . && git commit -m "WIP: saving before crash recovery"

# Stash changes
git stash save "Before crash recovery"

# Kill hung processes
pkill -9 node
pkill -9 git

# Check what's running
ps aux | head -20

# Restart VS Code server
rm -rf ~/.vscode-server && exit
```

## Still Having Issues?

1. Check [GitHub Codespaces Status](https://www.githubstatus.com/)
2. Review [GitHub Codespaces Documentation](https://docs.github.com/codespaces)
3. Open an issue in this repository with:
   - What you were doing when crash occurred
   - Error messages from logs
   - Codespace machine size
   - Extensions installed

## Related Documentation

- [Git Authentication Troubleshooting](./GIT_AUTH_TROUBLESHOOTING.md) - Fix Git push/pull issues
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development setup guide
- [QUICK_FIX.md](./QUICK_FIX.md) - Quick solutions for common issues
