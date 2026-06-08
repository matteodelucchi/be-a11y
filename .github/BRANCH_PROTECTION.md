# Branch Protection Rules

This document describes the recommended branch protection rules for the be-a11y repository.

## Main Branch Protection

### Branch: `main`

**Status:** Protected ✅

**Rules:**
- ✅ Require pull request reviews before merging
  - Minimum approvals: **2**
  - Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - All CI workflows must pass:
    - Pull Request Validation (`pr-validation.yml`)
    - Accessibility Gate (`accessibility-gate.yml`)
- ✅ Include administrators
- ✅ Restrict who can push to matching branches
  - Only repository administrators can push directly to `main`
  - All other contributors must use pull requests
- ❌ Do not allow force pushes
- ❌ Do not allow deletions

**Required Status Checks:**
1. `Pull Request Validation / validate` - Tests, linting, build verification
2. `Accessibility Gate / accessibility-check` - Accessibility self-check

## Release Branches

### Branch: `release/*`

**Status:** Protected ✅

**Rules:**
- ✅ Require pull request reviews before merging
  - Minimum approvals: **1** (fast-track for releases)
- ✅ Require status checks to pass before merging
- ✅ Include administrators
- ✅ Restrict who can push
  - Only repository administrators can push directly
- ❌ Do not allow force pushes
- ❌ Do not allow deletions

## Feature/Hotfix Branches

### Branch: `feature/*`, `fix/*`, `hotfix/*`

**Status:** Not protected ❌

**Guidelines:**
- Follow conventional commits for all commits
- Open pull request to `main` for review
- Delete branch after merge (auto-deleted via GitHub settings)

## Hotfix Process

For urgent bug fixes:

1. Create branch from `main`: `hotfix/issue-description`
2. Implement fix with tests
3. Open PR to `main`
4. Get **1 approval** (expedited review)
5. Merge to `main`
6. Create release tag: `vX.Y.Z`
7. Release workflow auto-publishes

## How to Configure

To set up branch protection rules:

1. Go to **Repository Settings → Branches → Branch protection rules**
2. Click **Add branch protection rule**
3. For `main` branch:
   - Branch name pattern: `main`
   - Check all boxes as described above
   - Required status checks: Select `pr-validation` and `accessibility-gate`
4. For `release/*` branches:
   - Branch name pattern: `release/*`
   - Configure as described above

## Bypassing Protection

In rare emergencies, repository administrators can:
- Temporarily disable branch protection
- Push directly to protected branches
- Force push (not recommended)

**Note:** Always communicate with the team when bypassing protection rules.

---

## Workflow Summary

| Action | Branch | Review Required | CI Required | Admin Override |
|--------|--------|----------------|--------------|---------------|
| Feature development | `feature/*` | Yes (2) | Yes | No |
| Bug fix | `fix/*` | Yes (2) | Yes | No |
| Hotfix | `hotfix/*` | Yes (1) | Yes | No |
| Release prep | `release/*` | Yes (1) | Yes | Yes |
| Direct push | `main` | No | No | Yes |
| Merge PR | `main` | Yes (2) | Yes | No |
