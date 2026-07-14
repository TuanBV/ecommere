#!/usr/bin/env bash
set -euo pipefail

issue_number="${1:?usage: resolve-context.sh ISSUE_NUMBER [OUTPUT_FILE]}"
output="${2:-.codex-runtime/issue-context.json}"
[[ "$issue_number" =~ ^[1-9][0-9]*$ ]] || { echo "invalid issue number" >&2; exit 2; }
command -v gh >/dev/null || { echo "gh is required" >&2; exit 2; }
mkdir -p "$(dirname "$output")"

repo_json="$(gh api "repos/${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}")"
issue_json="$(gh api "repos/$GITHUB_REPOSITORY/issues/$issue_number")"
# Use files instead of interpolating untrusted JSON through generated shell code.
repo_tmp="$(mktemp)"; issue_tmp="$(mktemp)"
trap 'rm -f "$repo_tmp" "$issue_tmp"' EXIT
printf '%s' "$repo_json" > "$repo_tmp"
printf '%s' "$issue_json" > "$issue_tmp"
python3 - "$repo_tmp" "$issue_tmp" "$output" "$issue_number" "${CODEX_BASE_BRANCH:-}" "${INPUT_BASE_BRANCH:-}" <<'PY'
import json, re, sys
repo = json.load(open(sys.argv[1], encoding="utf-8"))
issue = json.load(open(sys.argv[2], encoding="utf-8"))
output, number, variable_base, input_base = sys.argv[3:]
labels = sorted(x["name"] for x in issue.get("labels", []))
base = input_base or variable_base or repo["default_branch"]
slug = re.sub(r"[^a-z0-9]+", "-", issue.get("title", "").lower()).strip("-")[:48].strip("-") or "task"
normalized_labels = {x.lower() for x in labels}
if normalized_labels & {"hotfix", "type:hotfix"}:
    branch_type = "hotfix"
elif normalized_labels & {"bug", "bugfix", "type:bug", "type:bugfix"}:
    branch_type = "bugfix"
elif normalized_labels & {"refactor", "type:refactor"}:
    branch_type = "refactor"
else:
    branch_type = "feature"
if not input_base and not variable_base:
    base = repo["default_branch"] if branch_type == "hotfix" else "develop"
data = {
  "repository": repo["full_name"], "repository_id": repo["id"],
  "default_branch": repo["default_branch"], "issue_number": int(number),
  "issue_node_id": issue["node_id"], "state": issue["state"],
  "is_pull_request": "pull_request" in issue, "title": issue.get("title") or "",
  "body": issue.get("body") or "", "author": issue["user"]["login"],
  "author_association": issue.get("author_association", "NONE"), "labels": labels,
  "updated_at": issue["updated_at"], "base_branch": base,
  "branch_type": branch_type,
  "working_branch": f"{branch_type}/{number}-{slug}"
}
with open(output, "w", encoding="utf-8", newline="\n") as f:
    json.dump(data, f, ensure_ascii=False, indent=2); f.write("\n")
PY
echo "context written to $output"
