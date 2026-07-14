#!/usr/bin/env bash
set -euo pipefail

context_file="${1:-.codex-runtime/issue-context.json}"
python3 - "$context_file" <<'PY'
import json, re, sys
x = json.load(open(sys.argv[1], encoding="utf-8"))
required = {"repository", "issue_number", "state", "title", "body", "labels", "base_branch", "working_branch", "updated_at"}
missing = sorted(required - x.keys())
if missing: raise SystemExit("missing context keys: " + ", ".join(missing))
if not isinstance(x["issue_number"], int) or x["issue_number"] < 1: raise SystemExit("invalid issue number")
if not re.fullmatch(r"codex/issue-[1-9][0-9]*-[a-z0-9]+(?:-[a-z0-9]+)*", x["working_branch"]):
    raise SystemExit("invalid working branch")
if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._/-]*", x["base_branch"]) or ".." in x["base_branch"]:
    raise SystemExit("invalid base branch")
if "codex-ready" not in x["labels"]: raise SystemExit("codex-ready is required")
risky = {
  "codex-dependency-approved": ["package.json", "dependency", "package-lock"],
  "codex-migration-approved": ["migration", "schema.prisma", "database/"],
  "codex-automation-approved": [".github/", ".codex/", ".agents/", "agents.md", "workflow", "automation"]
}
text = (x["title"] + "\n" + x["body"]).lower()
for label, hints in risky.items():
    if any(h in text for h in hints) and label not in x["labels"]:
        raise SystemExit(f"request appears to require {label}")
print("issue context valid")
PY
