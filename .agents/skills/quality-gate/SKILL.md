---
name: quality-gate
description: Run evidence-producing formatting, lint, type, test, build, migration, and generated-code checks after implementation; do not claim unavailable checks passed.
---

# Quality Gate

## Preconditions and inputs

Repository analysis, final candidate diff, optional changed-file list, and installed dependencies.
Use `bash .github/scripts/codex/run-quality-gate.sh`; do not install production dependencies for CI.

## Procedure

1. Run the smallest relevant checks first.
2. Run repository-required formatting, lint, type checks, tests, build, migration validation, and
   generated-code consistency when configured.
3. Record every command, exit code, summary, and status as `passed`, `failed`, `unavailable`, or
   `intentionally_skipped` in machine-readable output.
4. A required failure blocks success; an unavailable test runner must be disclosed.

## Safety boundaries and output

Never suppress exit codes, expose environment values, rewrite tests, auto-format unrelated files,
or call deploy/destructive commands. Output the JSON results path and concise gate decision. If the
runner itself fails, report `failed`; absent configured capability is `unavailable`, never `passed`.
