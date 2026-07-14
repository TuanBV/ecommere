---
name: create-draft-pr
description: Build structured Draft PR metadata from verified Issue results; never use this skill to execute GitHub writes or claim unproven tests.
---

# Create Draft PR Data

## Preconditions and inputs

Valid successful result JSON, approved diff, quality/security evidence, Issue number, and work/base
branches. All statements must be supported by recorded evidence.

## Procedure

1. Produce an imperative title and sections: Issue, Summary, Implementation, Changed files,
   acceptance checklist, Tests and commands, Security review, Risks, Rollback, Manual verification,
   and Agent limitations.
2. End with exactly `Closes #<issue-number>` so closure occurs only after merge.
3. Mark unavailable or unverified checks honestly and keep the PR Draft.

## Safety boundaries and output

Return only structured `pr_title` and `pr_body`. Never run `git push`, `gh pr create/edit/merge`, API
writes, approve, or merge. If evidence is missing or status is not success, return `blocked` and no
publishable PR data.
