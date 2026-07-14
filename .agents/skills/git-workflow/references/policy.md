# Repository Git Policy

## Branch model

Protected branches are `main` (production), `staging` (staging), and `develop` (development).
Use `feature/<issue>-<slug>`, `bugfix/<issue>-<slug>`, and `refactor/<issue>-<slug>` from `develop`;
use `release/<semver>` from `develop`; use `hotfix/<issue>-<slug>` from `main`.

Never commit or resolve conflicts directly on protected branches. Delete completed branches only
through an explicitly authorized human or reviewed automation operation.

## Commits and pull requests

Use Conventional Commits: `<type>(<scope>): <subject>`. Scope is optional. Allowed types are `feat`,
`fix`, `docs`, `refactor`, `test`, `chore`, and `revert`. Write an English imperative subject, omit
the final period, and keep the subject at most 50 characters.

Keep commits atomic: one independently reviewable behavior change per commit. Inspect unstaged and
staged diffs before committing. Never commit secrets or large binary files; large required binaries
need an owner-approved Git LFS change.

Use a Conventional Commit PR title. The PR body must state summary, changes, verification evidence,
security impact, risks, rollback, screenshots when UI changes, and the related Issue. Human review is
mandatory.

## Merge, tags, and conflicts

Use squash merge for feature/bugfix/refactor into `develop`. Use merge commits for `develop` into
`main` and hotfix into `main`. Never force-push or rewrite published history.

Resolve conflicts on the work branch by merging its target branch into it. Understand both versions,
remove all markers, review the diff, and rerun affected quality and security checks. Ask an owner when
business intent is unclear.

Use annotated Semantic Versioning tags `vX.Y.Z`. Creating or pushing tags is restricted to owners or
reviewed release automation.
