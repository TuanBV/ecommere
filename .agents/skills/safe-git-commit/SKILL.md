---
name: safe-git-commit
description: Verify and create one scoped local Git commit after an implementation is complete. Use when Codex finishes an approved task, the user asks to commit or prepare a commit, or an Issue workflow reaches its final review. Never use it to push, merge, rewrite history, or commit on a protected branch.
---

# Safe Git Commit

Create a local commit only after the task has passed its required reviews and quality gates.

## Preconditions

1. Confirm implementation, verification, security review, and final review are complete.
2. Run `git branch --show-current` and stop on `main`, `master`, `develop`, `staging`,
   `production`, `release/*`, a detached HEAD, or any branch identified as protected.
   Accept Issue work only on `feature/*`, `bugfix/*`, `refactor/*`, or `hotfix/*`.
3. Run `git status --short` and identify the exact task-owned paths. Treat every pre-existing or
   unrelated change as user-owned.
4. Refuse to inspect, stage, or commit `.env*`, credentials, keys, tokens, production data,
   `scripts/dump-core.sql`, `uploads/`, generated build output, or ignored files.
5. Stop if required checks failed, approval labels are missing, the accepted plan changed, or the
   task-owned paths cannot be separated safely from unrelated edits.

## Commit workflow

1. Review the task-only diff with path-scoped `git diff -- <paths>` and, when relevant,
   `git diff --cached -- <paths>`.
2. Stage explicit paths with `git add -- <path>...`; never use `git add .`, `git add -A`, or a
   wildcard.
3. Inspect `git diff --cached --name-status` and `git diff --cached --check`. Unstage and stop if
   the index contains anything outside the accepted task.
4. Re-run the quality commands required by `$quality-gate` when the staged diff changed after the
   recorded verification.
5. Create a Conventional Commit `<type>(<scope>): <subject>` using an allowed type from
   `$git-workflow`. Use an English imperative subject of at most 50 characters without a final
   period. Do not add AI attribution or a co-author trailer unless the user explicitly requests it.
6. Run `git commit -m "<message>"`, observe the exit code, then report the commit hash from
   `git rev-parse --short HEAD` and the final `git status --short`.

## Boundaries

- Create local commits only. Never push, merge, rebase, force-push, amend, tag, or open/update a PR.
- Never bypass hooks or signatures with `--no-verify` or change Git configuration.
- Never amend an existing commit unless the user explicitly requests it and policy permits it.
- If the branch is protected, leave the worktree unchanged and ask the user to switch to or approve
  creation of a work branch. Do not move user changes between branches implicitly.
- A successful commit does not imply successful push, CI, PR creation, review, or merge.

## Report

Return the branch, committed paths, verification evidence, commit message and hash, plus any
remaining uncommitted user-owned changes. If no commit was created, state the exact blocking check.
