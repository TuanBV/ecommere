#!/usr/bin/env bash
set -euo pipefail

context_file="${1:-.codex-runtime/issue-context.json}"
dry_run="${INPUT_DRY_RUN:-false}"
python3 - "$context_file" "${GITHUB_EVENT_NAME:-}" "${GITHUB_EVENT_ACTION:-}" "$dry_run" <<'PY'
import json, sys
p, event, action, dry = sys.argv[1:]
x = json.load(open(p, encoding="utf-8"))
errors = []
if x.get("state") != "open": errors.append("Issue is closed")
if x.get("is_pull_request"): errors.append("Target is a pull request")
if event == "issues" and (action != "labeled" or "codex-ready" not in x.get("labels", [])):
    errors.append("issues trigger requires newly applied codex-ready label")
if event not in {"issues", "workflow_dispatch"}: errors.append("unsupported trigger")
if dry not in {"true", "false"}: errors.append("dry_run must be true or false")
if errors:
    print("; ".join(errors), file=sys.stderr); raise SystemExit(3)
print("trigger valid")
PY
