#!/usr/bin/env bash
set -euo pipefail

base="${1:?usage: validate-diff.sh BASE_REF [CONTEXT_JSON]}"
context="${2:-.codex-runtime/issue-context.json}"
result="${3:-.codex-runtime/issue-result.json}"
max_files="${CODEX_MAX_CHANGED_FILES:-30}"
max_lines="${CODEX_MAX_DIFF_LINES:-1500}"
max_deps="${CODEX_MAX_NEW_DEPENDENCIES:-0}"
[[ "$max_files" =~ ^[0-9]+$ && "$max_lines" =~ ^[0-9]+$ && "$max_deps" =~ ^[0-9]+$ ]] || exit 2
git rev-parse --verify "$base^{commit}" >/dev/null
mapfile -t files < <(git diff --name-only --diff-filter=ACMRTUXB "$base" --)
python3 - "$result" "${files[@]}" <<'PY'
import json,sys
expected=set(json.load(open(sys.argv[1],encoding="utf-8"))["changed_files"])
actual=set(sys.argv[2:])
if expected != actual: raise SystemExit(f"changed_files mismatch: expected={sorted(expected)}, actual={sorted(actual)}")
PY
(( ${#files[@]} <= max_files )) || { echo "changed-file limit exceeded" >&2; exit 4; }
lines="$(git diff --numstat "$base" -- | awk '{a+=$1; d+=$2} END {print a+d+0}')"
(( lines <= max_lines )) || { echo "diff-line limit exceeded" >&2; exit 4; }

labels="$(python3 - "$context" <<'PY'
import json,sys
print("\n".join(json.load(open(sys.argv[1],encoding="utf-8"))["labels"]))
PY
)"
issue_text="$(python3 - "$context" <<'PY'
import json,sys
x=json.load(open(sys.argv[1],encoding="utf-8")); print((x["title"]+"\n"+x["body"]).lower())
PY
)"
has_label() { grep -Fxq "$1" <<<"$labels"; }
control_re='^(AGENTS\.md|\.codex/|\.agents/|\.github/(workflows|actions|scripts/codex|codex/prompts|codex/schemas)/)'
denied_re='(^|/)\.env($|\.)|(^|/)([^/]*(secret|credential)[^/]*)$'

for file in "${files[@]}"; do
  [[ "$file" != /* && "$file" != *".."* ]] || { echo "unsafe path: $file" >&2; exit 4; }
  if [[ "$file" =~ $denied_re ]]; then echo "sensitive path denied: $file" >&2; exit 4; fi
  if [[ "$file" =~ $control_re ]] && ! has_label codex-automation-approved; then
    echo "control-plane change lacks codex-automation-approved: $file" >&2; exit 4
  fi
  if [[ "$file" =~ $control_re ]] && ! grep -Fqi "$file" <<<"$issue_text"; then
    echo "control-plane file is not explicitly named in Issue: $file" >&2; exit 4
  fi
  [[ ! -L "$file" ]] || { echo "symlink denied: $file" >&2; exit 4; }
  if [[ -f "$file" ]] && ! grep -Iq . "$file"; then echo "binary file denied: $file" >&2; exit 4; fi
done

if [[ -n "${CODEX_ALLOWED_PATHS:-}" ]]; then
  for file in "${files[@]}"; do grep -Eq "${CODEX_ALLOWED_PATHS}" <<<"$file" || { echo "path not allowed: $file" >&2; exit 4; }; done
fi
if [[ -n "${CODEX_DENIED_PATHS:-}" ]]; then
  for file in "${files[@]}"; do ! grep -Eq "${CODEX_DENIED_PATHS}" <<<"$file" || { echo "configured denied path: $file" >&2; exit 4; }; done
fi
if git diff --name-only "$base" -- | grep -Eq '(^|/)package(-lock)?\.json$'; then
  has_label codex-dependency-approved || { echo "dependency files require codex-dependency-approved" >&2; exit 4; }
  count="$(git diff --unified=0 "$base" -- '*/package.json' package.json | grep -Ec '^\+\s*"[^"]+"\s*:' || true)"
  (( count <= max_deps )) || { echo "new dependency limit exceeded" >&2; exit 4; }
fi
if git diff --name-only "$base" -- | grep -Eq '^(database/(migrations|init)/|apps/api/prisma/schema\.prisma$)'; then
  has_label codex-migration-approved || { echo "migration change lacks codex-migration-approved" >&2; exit 4; }
fi
git diff --check "$base" --
! git diff "$base" -- | grep -Eiq '(BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|github_pat_[A-Za-z0-9_]+|AKIA[0-9A-Z]{16})' || {
  echo "potential secret in diff" >&2; exit 4;
}
echo "diff valid: ${#files[@]} files, $lines lines"
