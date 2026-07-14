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
summary=re.sub(r"[^a-zA-Z0-9 ]+"," ",r["summary"]).strip().lower()
summary=re.sub(r"\s+"," ",summary)[:50].rstrip() or "implement issue"
branch_type=c.get("branch_type", c["working_branch"].split("/",1)[0])
kind={"feature":"feat","bugfix":"fix","refactor":"refactor","hotfix":"fix"}.get(branch_type,"chore")
if all(x.endswith((".md",".yml",".yaml",".json",".toml",".rules")) for x in r["changed_files"]): kind="docs"
print(c["base_branch"]); print(c["working_branch"]); print(c["issue_number"]); print(f"{kind}: {summary}")
PY
)
base="${values[0]}" branch="${values[1]}" issue="${values[2]}" message="${values[3]}"
[[ "$branch" =~ ^(feature|bugfix|refactor|hotfix)/$issue-[a-z0-9][a-z0-9-]*$ ]] || exit 2
[[ "$base" != "$branch" && "$base" != feature/* && "$base" != bugfix/* && "$base" != refactor/* && "$base" != hotfix/* ]] || exit 2
[[ "$base" == "develop" || ( "$base" == "main" && "$branch" == hotfix/* ) ]] || exit 2

if [[ "$dry_run" == "true" ]]; then echo "dry-run: would commit and push $branch"; exit 0; fi
git config user.name "codex-agent[bot]"
git config user.email "codex-agent[bot]@users.noreply.github.com"
git switch -C "$branch"
python3 - "$result" <<'PY' | while IFS= read -r path; do
import json,sys
for path in json.load(open(sys.argv[1],encoding="utf-8"))["changed_files"]:
    print(path)
PY
  [[ -n "$path" && "$path" != /* && "$path" != *".."* ]] || exit 2
  case "$path" in
    .git/*|.env|.env.*|uploads/*|scripts/dump-core.sql|.codex-runtime/*) exit 2 ;;
  esac
  git add -- "$path"
done
git diff --cached --quiet && { echo "no changes to commit"; exit 0; }
git diff --cached --check
git commit -m "$message"
if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  git push origin "HEAD:refs/heads/$branch"
else
  git push --set-upstream origin "HEAD:refs/heads/$branch"
fi
