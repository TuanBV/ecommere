---
name: git-workflow
description: Apply this repository's Git Flow for branch selection and naming, Conventional Commits, atomic changes, pull requests, merge strategy, tags, and conflict resolution. Use when starting work from a GitHub Issue, creating or validating a branch/commit/PR, synchronizing a work branch, resolving conflicts, preparing a release or hotfix, or reviewing Git operations.
---

# Git Workflow

Follow the canonical policy in [references/policy.md](references/policy.md).

## Select the branch

1. Refresh remote state without changing the worktree.
2. Use `develop` for feature, bugfix, refactor, and release work; use `main` for hotfix work.
3. Name Issue branches `feature/<issue>-<slug>`, `bugfix/<issue>-<slug>`,
   `refactor/<issue>-<slug>`, or `hotfix/<issue>-<slug>`.
4. Refuse direct work on `main`, `develop`, or `staging`. Never move a dirty worktree to another
   branch unless the user explicitly approves a safe strategy.

## Commit and PR

1. Keep each commit atomic and invoke `$safe-git-commit`.
2. Use `<type>(<scope>): <subject>` with an English imperative subject of at most 50 characters.
3. Use only `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, or `revert`.
4. Use the same Conventional Commit format for the PR title.
5. Include summary, changes, verification, security, risks, rollback, manual checks, screenshots for
   visible UI changes, and exactly `Closes #<issue>` in the PR body.
6. Keep PRs Draft until evidence is complete; require human review and merge.

## Synchronize and resolve conflicts

1. On the work branch, merge the PR target branch into it; do not rebase a public branch.
2. Never resolve conflicts on `main`, `develop`, or `staging`.
3. Understand both sides before editing; ask when business intent is ambiguous.
4. Remove every conflict marker, inspect the complete diff, then rerun relevant quality and security
   checks.
5. Never force-push. Do not amend or rewrite published history.

## Merge and release boundaries

- Recommend squash merge for feature/bugfix/refactor into `develop`.
- Recommend merge commit for `develop` into `main` and hotfix into `main`.
- Treat `staging` as protected; promotion requires a PR and human review.
- Tags use annotated Semantic Versioning `vX.Y.Z` and are owner/release-automation operations.
- Codex may prepare metadata, local commits, and conflict guidance. It must not directly push, merge
  PRs, delete remote branches, or create/push tags.
