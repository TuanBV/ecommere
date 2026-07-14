# Runbook

| Scenario | Response |
|---|---|
| Diff too large | Keep `codex-blocked`; split the Issue or explicitly narrow paths. Do not raise limits without reviewing risk. |
| Tests fail | Inspect sanitized artifact, reproduce locally, fix product code, and rerun all gates. Never weaken the test. |
| Agent loop | Cancel run, remove `codex-ready`, inspect Issue for ambiguity/injection, tighten criteria, then retry. |
| Duplicate PR | Find open PR by the exact Issue branch; close only the duplicate manually and preserve the canonical Draft. |
| Branch exists, no PR | Validate branch contents, rerun; deterministic PR script creates a Draft from the existing branch. |
| Issue edited mid-run | Cancel if scope changed materially; rerun to create fresh context. Review `updated_at` in the artifact. |
| Base branch changed | Cancel, resolve the intended base variable, handle conflicts manually, and rerun without force push. |
| Merge conflict | On the work branch, merge the PR target branch into it, resolve with full context, rerun affected checks, and push normally. Never rebase published history or force-push. |
| API key expired | Rotate `OPENAI_API_KEY`, cancel failed runs, and retry. Never paste the key into logs or Issues. |
| GitHub rate limit | Wait for reset, reduce retries, or use a narrowly permissioned GitHub App installation token. |
| Invalid output JSON | Keep `codex-failed`, inspect the sanitized final output, correct prompt/schema incompatibility under an automation-approved Issue, retry. |
| Suspected prompt injection | Cancel, set `codex-blocked`, preserve sanitized evidence, remove malicious content or close the Issue, and review any produced diff before deletion. |
| Suspected secret leak | Cancel/disable workflows, revoke and rotate the secret, restrict artifacts/logs, audit access, remove leaked material from history through owner-led incident response. |

Failure reporting uses `if: always()` logic, removes `codex-in-progress`, posts only a concise reason
plus run URL, and retains sanitized diagnostics for 14 days. Never post full logs to an Issue.
