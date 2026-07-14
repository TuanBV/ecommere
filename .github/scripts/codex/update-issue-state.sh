#!/usr/bin/env bash
set -euo pipefail

issue="${1:?usage: update-issue-state.sh ISSUE STATE [MESSAGE_FILE]}"
state="${2:?state required}"
message_file="${3:-}"
[[ "$issue" =~ ^[1-9][0-9]*$ ]] || exit 2
case "$state" in in_progress|pr_open|needs_info|blocked|failed) ;; *) echo "invalid state" >&2; exit 2;; esac
[[ "${INPUT_DRY_RUN:-false}" == "true" ]] && { echo "dry-run: would set $state"; exit 0; }
declare -A label=(
  [in_progress]=codex-in-progress [pr_open]=codex-pr-open [needs_info]=codex-needs-info
  [blocked]=codex-blocked [failed]=codex-failed
)
all=(codex-ready codex-in-progress codex-pr-open codex-needs-info codex-blocked codex-failed)
for old in "${all[@]}"; do
  [[ "$old" == "${label[$state]}" ]] || gh issue edit "$issue" --remove-label "$old" >/dev/null 2>&1 || true
done
gh issue edit "$issue" --add-label "${label[$state]}" >/dev/null
if [[ -n "$message_file" && -s "$message_file" ]]; then
  # The file is generated from sanitized structured results, never raw logs.
  gh issue comment "$issue" --body-file "$message_file" >/dev/null
fi
