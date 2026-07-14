# Codex Labels

Create these labels exactly (suggested colors are optional):

| Label | Purpose | Suggested color |
|---|---|---|
| `codex-ready` | Owner authorizes processing | `0e8a16` |
| `codex-in-progress` | One run is processing the Issue | `1d76db` |
| `codex-pr-open` | Draft PR exists | `5319e7` |
| `codex-needs-info` | Safe implementation needs information | `fbca04` |
| `codex-blocked` | Scope, policy, or risk prevents work | `b60205` |
| `codex-failed` | Workflow or required gate failed | `d93f0b` |
| `codex-risk-approved` | Owner accepts a documented high-risk change | `c5def5` |
| `codex-dependency-approved` | Production dependency change is permitted | `c5def5` |
| `codex-migration-approved` | Schema/migration work is permitted | `c5def5` |
| `codex-automation-approved` | Named control-plane files may change | `c5def5` |

The deterministic state script removes all old state labels before applying the terminal state.
Approval labels are not removed. Normal transition is `codex-ready -> codex-in-progress ->` exactly
one of `codex-pr-open`, `codex-needs-info`, `codex-blocked`, or `codex-failed`. A Draft PR does not
close the Issue; `Closes #N` takes effect only when a human merges it.
