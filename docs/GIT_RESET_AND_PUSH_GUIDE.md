# Git Reset and Push Guide

This guide documents the process of resetting the git history and force-pushing the project to a new repository. This is useful when you need to remove sensitive data (secrets, API keys) from the commit history or start fresh with a new remote.

## 1. Prerequisites

- Ensure you have a backup of your code (optional but recommended).
- Ensure your `.gitignore` file is correctly configured to exclude sensitive files (e.g., `.env`) and temporary files (e.g., `node_modules`, `dist`, `*.log`).

## 2. Process

The following steps wipe the existing git history and create a new one from the current state of files.

### Step 1: Remove git history
Open your terminal in the project root and run:

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force .git
```

**Mac/Linux:**
```bash
rm -rf .git
```

### Step 2: Initialize new repository
Initialize a fresh git repository:
```bash
git init
```

### Step 3: Stage all files
Add all current files to the staging area:
```bash
git add .
```

### Step 4: Commit
Create the initial commit:
```bash
git commit -m "Initial commit"
```

### Step 5: Rename branch (optional)
Ensure the main branch is named `main` (if it defaults to `master`):
```bash
git branch -M main
```

### Step 6: Add Remote
Link your local repository to the empty GitHub repository:
```bash
git remote add origin https://github.com/JohnSarwom/scpng-intranet
```

### Step 7: Force Push
Push the code to the remote, overwriting any existing history there:
```bash
git push -u -f origin main
```

## Troubleshooting

- **"Secret detected"**: If GitHub blocks the push due to secrets, ensure the secret file (e.g., `.env`) is in `.gitignore` AND that you have performed the reset steps above effectively (which removes the history where the secret might have been tracked).
- **"Remote already exists"**: If `git remote add` fails, check existing remotes with `git remote -v` or remove the old one with `git remote remove origin` before adding the new one.
