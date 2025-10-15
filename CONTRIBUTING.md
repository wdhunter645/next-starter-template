# Contributing to Next.js Starter Template

Thank you for your interest in contributing to this project! This guide will help you get started with development, especially when using GitHub Codespaces.

## Development Setup

### Using GitHub Codespaces

This repository is configured to work seamlessly with GitHub Codespaces. When you open this project in Codespaces:

1. The development environment will be automatically configured
2. Dependencies will be installed
3. You'll have access to all necessary tools

### Local Development

If you prefer to work locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run linting
npm run lint

# Build the project
npm run build
```

## Git Authentication in Codespaces

### Common Issue: Git Push Failures

If you encounter errors when trying to push to the repository in Codespaces, such as:
- "Authentication failed"
- "Permission denied"
- Git not prompting for credentials

This typically happens because the Codespaces implicit token doesn't have Git CLI permissions.

### Solution: Using a Personal Access Token (PAT)

To resolve Git authentication issues in Codespaces:

#### 1. Create a Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Or visit: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give your token a descriptive name (e.g., "Codespaces Development")
4. Set an expiration period (recommended: 90 days or custom)
5. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `write:packages` (if you work with packages)
6. Click "Generate token"
7. **Important**: Copy the token immediately - you won't be able to see it again!

#### 2. Configure Git in Codespaces

Once you have your PAT, configure Git in your Codespace:

```bash
# Clear any existing credentials
git config --global --unset credential.helper

# Configure Git to use your token
git config --global credential.helper store

# Now when you push, Git will prompt for credentials
# Username: your-github-username
# Password: paste-your-PAT-here
```

Alternatively, you can update the remote URL to include your credentials:

```bash
# Remove the existing remote
git remote remove origin

# Add the remote with your credentials
git remote add origin https://YOUR_USERNAME:YOUR_PAT@github.com/wdhunter645/next-starter-template.git
```

⚠️ **Security Note**: Never commit tokens to your repository!

#### 3. Alternative: Use GitHub CLI

GitHub Codespaces comes with GitHub CLI (`gh`) pre-installed:

```bash
# Authenticate with GitHub CLI
gh auth login

# Choose GitHub.com
# Choose HTTPS as your preferred protocol
# Authenticate with your browser or paste an authentication token

# After authentication, Git operations will work automatically
```

### Clearing Git Cache in Codespaces

If you need to clear cached credentials:

```bash
# Clear credential helper cache
git credential-cache exit

# Or clear the stored credentials
rm ~/.git-credentials

# Reconfigure credential helper
git config --global credential.helper store
```

### Troubleshooting

#### Issue: "fatal: could not read Username"

**Solution**: Ensure you've configured Git with your credentials or authenticated via `gh auth login`.

#### Issue: "remote: Permission to repository denied"

**Solutions**:
1. Verify your PAT has the correct scopes (especially `repo`)
2. Ensure the PAT hasn't expired
3. Try regenerating the PAT and updating your credentials

#### Issue: "Support for password authentication was removed"

**Solution**: GitHub no longer accepts passwords for Git operations. You must use a Personal Access Token (PAT) instead.

## Pull Request Guidelines

1. **Fork the repository** (if you're an external contributor)
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** with clear, descriptive commit messages
4. **Test your changes**: Run `npm run lint` and `npm run build`
5. **Push to your fork**: Use the authentication methods described above
6. **Open a Pull Request** with a clear description of your changes

## Code Style

This project uses:
- **ESLint** for linting (configuration in `eslint.config.mjs`)
- **TypeScript** for type safety
- **Prettier** formatting (via Next.js defaults)

Run linting before committing:
```bash
npm run lint
```

## Questions or Issues?

If you encounter any problems not covered in this guide, please:
1. Check existing GitHub Issues
2. Open a new issue with detailed information about your problem
3. Include error messages, steps to reproduce, and your environment details

Thank you for contributing! 🎉
