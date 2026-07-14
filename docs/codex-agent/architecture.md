# Codex Agent Kit Architecture

## Trust and execution flow

Issue text is untrusted data stored in `.codex-runtime/issue-context.json`; it is never concatenated
into a shell command. `prepare` authenticates the actor, validates the open Issue and labels, resolves
the base branch, and uploads context. Codex runs with `contents: read`, a workspace-write sandbox,
and no GitHub write token. Dependencies are installed before Codex because its sandbox has no direct
network access.

Codex uses read-only exploration, triage, planning, test, security, and final-review agents, with one
workspace writer. Its JSON is schema-constrained and its patch/result are artifacts. A fresh
`promote` runner applies the patch, checks the schema semantics and diff policy, then uses only the
deterministic commit script. A separate `publish` job creates or updates the Draft PR and Issue state.
No path approves, merges, closes the Issue directly, releases, or deploys.

```text
trusted actor + codex-ready/manual dispatch
  -> prepare (Issue read, context validation)
  -> Codex (contents read, workspace patch, structured result)
  -> promote (fresh checkout, patch/diff guards, contents write)
  -> publish (Draft PR + Issue labels/comment)
  -> human review and merge
```

Artifacts cross permission boundaries and are treated as untrusted until revalidated. Concurrency is
per repository/Issue; reruns reuse `codex/issue-<number>-<slug>` and the open PR for that head.

## Base and branch resolution

Manual `base_branch` wins, followed by repository variable `CODEX_BASE_BRANCH`, an existing remote
`develop`, then the GitHub default branch. Branch names are generated only from Issue number and a
sanitized title slug. Push is never forced; an existing Issue branch is checked out and extended.

## Pull request review

The review workflow checks out the trusted base commit so a PR cannot replace the review prompt or
Codex config. It fetches the untrusted head as a Git object, runs Codex read-only, and a separate write
job upserts one marker-tagged bot comment. It cannot edit, approve, or merge the branch.
