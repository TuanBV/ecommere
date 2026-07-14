# Customization

Prefer repository variables for base branch and diff limits; do not fork scripts for routine policy.
Keep one command surface: `.github/scripts/codex/*.sh`. Run locally from a Bash environment with
`python3`, Git, Node/npm, and `gh` as required:

```bash
GITHUB_REPOSITORY=owner/repo GH_TOKEN=... bash .github/scripts/codex/resolve-context.sh 123
bash .github/scripts/codex/validate-issue.sh .codex-runtime/issue-context.json
bash .github/scripts/codex/run-quality-gate.sh
bash .github/scripts/codex/validate-diff.sh origin/main
bash .github/scripts/codex/create-or-update-pr.sh 123
```

Do not put tokens in shell history; the example token is a placeholder. `create-or-update-pr.sh` and
state/commit scripts are write operations intended for reviewed workflow jobs.

When adding tests, add explicit workspace `test`, `test:unit`, or `test:integration` scripts and update
the quality script/CI to run them. When replacing the currently unavailable web lint command, add an
explicit compatible ESLint configuration and locked dev dependencies in a separately reviewed PR.
For new modules, retain nested `AGENTS.md` only when rules differ materially; avoid duplicated policy.

Changes to prompts, schema, workflows, rules, agents, skills, or deterministic scripts are
control-plane changes. Test them through an Issue explicitly naming those paths with
`codex-automation-approved` and require security review plus CODEOWNER approval.

After implementation and all required reviews pass, use `$safe-git-commit` for a scoped local commit.
The skill refuses protected branches and never pushes; reviewed workflow scripts remain the only
write path to GitHub.

Git Flow uses `main`, `staging`, and `develop` as protected branches. Apply an Issue type label
(`type:hotfix`, `type:bug`, `type:refactor`, or `type:feature`) before automation runs; the
deterministic resolver maps it to `hotfix/`, `bugfix/`, `refactor/`, or `feature/`.
