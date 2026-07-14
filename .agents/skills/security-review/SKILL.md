---
name: security-review
description: Threat-model a candidate diff for application and automation risks before promotion; use after implementation, not as a substitute for quality checks.
---

# Security Review

## Preconditions and inputs

Base ref, candidate diff, repository threat model, Issue scope, and approval labels.

## Procedure

1. Review authentication/authorization, validation, injection, XSS/SSRF, file upload/path handling,
   secrets, PII, logging, dependencies, SQL/migrations, network/file operations, and error exposure.
2. For automation changes, review trigger trust, actor authorization, token permissions, expression
   injection, artifact trust, protected branches, diff guards, and bypass paths.
3. Classify each finding `blocking`, `warning`, or `suggestion` with file/line or symbol evidence.

## Safety boundaries and output

Read-only; do not retrieve secrets, test production, upload code, approve, or merge. Output findings,
threat assumptions, and blocking decision. Any credible secret exposure, authorization bypass, or
workflow privilege escalation blocks promotion until resolved.
