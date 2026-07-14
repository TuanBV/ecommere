# Security Model

## Threat model

Attackers may control Issue/PR Markdown, code blocks, URLs, filenames, branch content, and proposed
commands. They may attempt prompt injection, secret theft, quota abuse, workflow privilege
escalation, supply-chain changes, destructive Git operations, or source exfiltration.

## Controls

- Only actors with GitHub `write`, `maintain`, or `admin` permission can trigger processing.
- Label trigger requires an open non-PR Issue and exact `codex-ready`; manual dispatch uses the same
  actor check. Per-Issue concurrency prevents simultaneous writers.
- GitHub text is JSON data created through GitHub API responses and Python serialization. Scripts do
  not use `eval` or run Issue-provided commands.
- Codex receives only `contents: read`; the API key is proxied by the official Action, and the Linux
  runner drops sudo. Network-dependent setup occurs before Codex.
- The promotion runner has no OpenAI key. It revalidates structured output and patch, denies secrets,
  symlinks, binaries, oversized diffs, unexpected paths, unapproved automation/migrations/dependencies,
  suspicious lockfile changes, and private-key/token patterns.
- GitHub writes are deterministic and split by permission: `contents: write` for branch promotion;
  `issues/pull-requests: write` for Draft PR and reporting.
- PR review uses trusted base-branch prompts/config, remains read-only, and only upserts a comment.
- No workflow has merge, approval, release, environment, package, or deployment behavior.

## Protected control-plane

`.github/workflows`, `.github/actions`, `.github/scripts/codex`, `.github/codex`, `.codex`, `.agents`,
and root `AGENTS.md` require both `codex-automation-approved` and explicit Issue scope. `.env*`, secret
or credential paths, SQL dump, runtime uploads, private keys, and production data are never eligible.

## Residual risks

Major-version Action tags can move; pin audited commit SHAs if repository policy requires immutable
supply-chain references. `GITHUB_TOKEN`-created PRs may not trigger downstream workflows depending on
GitHub settings; use the documented GitHub App option when necessary. Regex secret scanning is a
baseline, not a substitute for an organization secret-scanning product.
