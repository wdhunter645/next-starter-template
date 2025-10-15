# Contributing to Next.js Starter Template

Thank you for your interest in contributing! This guide will help you set up your development environment and contribute effectively.

## Getting Started

### 1. Fork and Clone the Repository

1. Fork this repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/next-starter-template.git
   cd next-starter-template
   ```

### 2. Set Up Git Configuration

Before making any commits, configure Git with your information:

```bash
# Set your name and email
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 3. Configure Git Authentication

Choose one of the following authentication methods:

#### Option A: HTTPS with Personal Access Token (Easier for beginners)

1. Create a Personal Access Token:
   - Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "Next Starter Template Development")
   - Select the `repo` scope (full control of private repositories)
   - Click "Generate token"
   - **Important:** Copy the token immediately - you won't be able to see it again!

2. Configure Git credential helper:
   ```bash
   # For macOS
   git config --global credential.helper osxkeychain
   
   # For Windows
   git config --global credential.helper wincred
   
   # For Linux
   git config --global credential.helper cache
   # Or to store permanently (less secure)
   git config --global credential.helper store
   ```

3. When you push for the first time, Git will prompt for credentials:
   - **Username:** Your GitHub username
   - **Password:** Paste your Personal Access Token (NOT your GitHub password)

#### Option B: SSH Keys (Recommended for experienced developers)

1. Check for existing SSH keys:
   ```bash
   ls -al ~/.ssh
   # Look for id_ed25519.pub or id_rsa.pub
   ```

2. If you don't have an SSH key, generate one:
   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   # Press Enter to accept the default file location
   # Enter a secure passphrase when prompted
   ```

3. Start the SSH agent and add your key:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

4. Copy your public key:
   ```bash
   # macOS
   pbcopy < ~/.ssh/id_ed25519.pub
   
   # Linux
   cat ~/.ssh/id_ed25519.pub
   # Then manually copy the output
   
   # Windows (Git Bash)
   clip < ~/.ssh/id_ed25519.pub
   ```

5. Add the SSH key to your GitHub account:
   - Go to [GitHub Settings > SSH and GPG keys](https://github.com/settings/keys)
   - Click "New SSH key"
   - Paste your key and give it a descriptive title
   - Click "Add SSH key"

6. Test your connection:
   ```bash
   ssh -T git@github.com
   # You should see: "Hi username! You've successfully authenticated..."
   ```

7. Update your repository to use SSH:
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/next-starter-template.git
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Upstream Remote

To keep your fork synchronized with the original repository:

```bash
git remote add upstream https://github.com/wdhunter645/next-starter-template.git
```

## Development Workflow

### Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Make Your Changes

1. Make your code changes
2. Test your changes locally:
   ```bash
   npm run dev
   npm run lint
   npm run build
   ```

### Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add new feature description"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### Push Your Changes

```bash
# Push to your fork
git push origin feature/your-feature-name
```

If this is your first push and you're using HTTPS, you'll be prompted for credentials:
- **Username:** Your GitHub username
- **Password:** Your Personal Access Token

### Create a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Provide a clear description of your changes
4. Submit the pull request

## Troubleshooting Git Issues

### Issue: "fatal: could not read Username for 'https://github.com': No such device or address"

**Solution:** Your credential helper isn't configured. Set it up:

```bash
# For macOS
git config --global credential.helper osxkeychain

# For Windows
git config --global credential.helper wincred

# For Linux
git config --global credential.helper cache
```

### Issue: "Authentication failed"

**Solutions:**

1. If using HTTPS with Personal Access Token:
   - Ensure your token has the `repo` scope
   - Token may have expired - generate a new one
   - Clear cached credentials:
     ```bash
     # macOS
     git credential-osxkeychain erase
     # Then enter: protocol=https, host=github.com, and press Enter twice
     
     # Linux
     git credential-cache exit
     
     # Windows
     # Open Credential Manager and remove GitHub credentials
     ```

2. If using SSH:
   - Verify your SSH key is added to GitHub
   - Test connection: `ssh -T git@github.com`
   - Ensure SSH agent is running: `eval "$(ssh-agent -s)"`
   - Add your key: `ssh-add ~/.ssh/id_ed25519`

### Issue: Git doesn't prompt for username/password

**Solution:** Reconfigure or clear the credential helper:

```bash
# Clear stored credentials
git credential reject
# Type: protocol=https, host=github.com, and press Enter twice

# Or unset the helper temporarily
git config --unset credential.helper
```

### Issue: "Permission denied (publickey)" (SSH)

**Solution:**

1. Verify your SSH key is added to your GitHub account
2. Check the SSH agent has your key:
   ```bash
   ssh-add -l
   ```
3. If not listed, add it:
   ```bash
   ssh-add ~/.ssh/id_ed25519
   ```

## Code Style

- Follow the existing code style
- Run `npm run lint` before committing
- Ensure `npm run build` succeeds

## Questions?

If you have questions or need help, please:
- Check the [GitHub authentication documentation](https://docs.github.com/en/authentication)
- Open an issue in the repository
- Reach out to the maintainers

Thank you for contributing!
