# Setup

## Required checklist

1. Enable GitHub Actions and create repository secret `OPENAI_API_KEY`. Never put it in variables,
   Issues, workflow YAML, or local committed files.
2. In **Settings -> Actions -> General -> Workflow permissions**, select read/write permissions and
   enable **Allow GitHub Actions to create and approve pull requests**. The kit creates Draft PRs but
   never approves them.
3. Create every label in [labels.md](labels.md).
4. Optionally create repository variable `CODEX_BASE_BRANCH`. Without it, the workflow uses remote
   `develop` when present, otherwise the repository default branch.
5. Optionally create `CODEX_MAX_CHANGED_FILES` (default `30`), `CODEX_MAX_DIFF_LINES` (default
   `1500`), `CODEX_MAX_NEW_DEPENDENCIES` (default `0`), `CODEX_ALLOWED_PATHS` (regex), and
   `CODEX_DENIED_PATHS` (regex).
   For a private repository with GitHub Advanced Security, set
   `CODEX_ENABLE_DEPENDENCY_REVIEW=true`; public repositories run dependency review automatically.
6. Protect `main` and, if used, `develop`: require pull requests, at least one human approval,
   conversation resolution, no force pushes/deletions, and required `CI / quality`,
   `CI / migration-validation`, and `CI / secret-scan`. Require dependency review if available.
7. Add CODEOWNERS for `.github/`, `.codex/`, `.agents/`, `AGENTS.md`, Prisma/schema/migrations,
   auth, checkout, and deployment scripts when another trusted reviewer is available.

## First use

Create an Issue with the **Codex task** form, keep data sanitized, add any required approval labels,
then add `codex-ready`. Alternatively run **Codex Issue Worker -> Run workflow**, enter the Issue
number, optional base, and choose `dry_run`. `force_reanalyze` is reserved for workflow evolution;
current runs always re-read live Issue context. Remove `codex-ready` or cancel the run to stop future
promotion; per-Issue concurrency prevents overlap. Correct the Issue/labels and rerun for retry.

Dry-run performs analysis only and must not update labels, push, or create a PR. To disable automation
urgently, disable the two Codex workflows in the Actions UI; do not delete branches while investigating.

## Token options

`GITHUB_TOKEN` is the default. A GitHub App installation token is recommended for multiple repos,
granular permissions, a distinct bot identity, or reliable CI triggering from bot-created PRs. Create
an App with repository Contents read/write, Issues read/write, Pull requests read/write, and Metadata
read; store its App ID as a variable and private key as a secret; mint the token in the write jobs and
replace only their `GH_TOKEN`/checkout token. Do not pass the App key or token to Codex.

A fine-grained PAT is a last-resort fallback, not preferred. Restrict it to this repository and the
same minimum Contents/Issues/Pull requests permissions, store it as a secret, rotate it frequently,
and never expose it to the Codex job.

## Operations and cost

Rotate `OPENAI_API_KEY` in GitHub Secrets, cancel active runs, and verify no logs/artifacts contain the
old value. Each trigger consumes GitHub Actions minutes and OpenAI API tokens; PR synchronization can
run repeated reviews. Timeouts, concurrency, trusted-actor checks, diff limits, and manual labels
bound cost, but owners should monitor usage and rate limits.
