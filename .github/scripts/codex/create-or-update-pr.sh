#!/usr/bin/env bash
set -euo pipefail

issue="${1:?usage: create-or-update-pr.sh ISSUE [CONTEXT] [RESULT]}"
context="${2:-.codex-runtime/issue-context.json}"
result="${3:-.codex-runtime/issue-result.json}"
[[ "${INPUT_DRY_RUN:-false}" == "true" ]] && { echo "dry-run: would create or update Draft PR"; exit 0; }
readarray -t data < <(python3 - "$context" "$result" "$issue" <<'PY'
import json,sys
c=json.load(open(sys.argv[1],encoding="utf-8")); r=json.load(open(sys.argv[2],encoding="utf-8"))
if r["status"]!="success" or c["issue_number"]!=int(sys.argv[3]): raise SystemExit("invalid PR inputs")
if f"Closes #{c['issue_number']}" not in r["pr_body"]: raise SystemExit("PR body lacks closing keyword")
print(c["base_branch"]); print(c["working_branch"]); print(r["pr_title"])
PY
)
base="${data[0]}" head="${data[1]}" title="${data[2]}"
body_file="$(mktemp)"; trap 'rm -f "$body_file"' EXIT
python3 - "$result" "$body_file" <<'PY'
import json,sys
open(sys.argv[2],"w",encoding="utf-8",newline="\n").write(json.load(open(sys.argv[1],encoding="utf-8"))["pr_body"]+"\n")
PY
pr_number="$(gh pr list --state open --head "$head" --json number --jq '.[0].number // empty')"
if [[ -n "$pr_number" ]]; then
  gh pr edit "$pr_number" --title "$title" --body-file "$body_file" --base "$base"
  gh pr ready "$pr_number" --undo >/dev/null 2>&1 || true
else
  pr_url="$(gh pr create --draft --base "$base" --head "$head" --title "$title" --body-file "$body_file")"
  pr_number="${pr_url##*/}"
fi
printf '%s\n' "$pr_number" > .codex-runtime/pr-number.txt
gh pr view "$pr_number" --json url --jq .url
