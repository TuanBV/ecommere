#!/usr/bin/env bash
set -euo pipefail

context="${1:-.codex-runtime/issue-context.json}"
result="${2:-.codex-runtime/issue-result.json}"
dry_run="${INPUT_DRY_RUN:-false}"
readarray -t values < <(python3 - "$context" "$result" <<'PY'
import json, re, sys
c=json.load(open(sys.argv[1],encoding="utf-8")); r=json.load(open(sys.argv[2],encoding="utf-8"))
if r["status"] != "success": raise SystemExit("result is not successful")
if r["issue_number"] != c["issue_number"] or r["working_branch"] != c["working_branch"]: raise SystemExit("result/context mismatch")
summary=re.sub(r"[\r\n]+"," ",r["summary"]).strip()[:72] or "implement issue"
kind="docs" if all(x.endswith((".md",".yml",".yaml",".json",".toml",".rules",".sh")) for x in r["changed_files"]) else "fix"
print(c["base_branch"]); print(c["working_branch"]); print(c["issue_number"]); print(f"{kind}: {summary} (#{c['issue_number']})")
PY
)
base="${values[0]}" branch="${values[1]}" issue="${values[2]}" message="${values[3]}"
[[ "$branch" == "codex/issue-$issue-"* ]] || exit 2
[[ "$base" != "$branch" && "$base" != codex/* ]] || exit 2

if [[ "$dry_run" == "true" ]]; then echo "dry-run: would commit and push $branch"; exit 0; fi
git config user.name "codex-agent[bot]"
git config user.email "codex-agent[bot]@users.noreply.github.com"
git switch -C "$branch"
git add -A
git diff --cached --quiet && { echo "no changes to commit"; exit 0; }
git commit -m "$message"
if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  git push origin "HEAD:refs/heads/$branch"
else
  git push --set-upstream origin "HEAD:refs/heads/$branch"
fi
