#!/usr/bin/env bash
# Static quality check cho file HTML/HTM (đọc-only, không sửa file).
# Dựa trên tinh thần codex-web-quality-skills/skills/web-quality-audit/scripts/analyze.sh.
# Dùng thủ công: bash .claude/hooks/web-quality-static-check.sh <file_or_dir>
# Không được wire làm PreToolUse hook tự động vì có thể chậm trên project lớn —
# chỉ gọi khi cần audit (qua skill /web-quality-audit hoặc pre-deploy gate).
set -euo pipefail

MAX_FINDINGS=100
MAX_PER_CATEGORY_PER_FILE=20

HAVE_JQ=0
if command -v jq >/dev/null 2>&1; then
  HAVE_JQ=1
fi

fail() {
  local msg="$1"
  echo "Lỗi: $msg" >&2
  echo "Cách dùng: $0 <file_or_directory>" >&2
  exit 1
}

[ $# -ge 1 ] || fail "Chưa truyền target"
TARGET="$1"
[ -e "$TARGET" ] || fail "Target không tồn tại: $TARGET"

ISSUES=()
WARNINGS=()

analyze_html() {
  local file="$1"
  echo "Đang kiểm tra: $file" >&2

  grep -qi "<!doctype html>" "$file" || ISSUES+=("$file:0: Thiếu HTML5 doctype")
  grep -qi 'charset.*utf-8'  "$file" || WARNINGS+=("$file:0: Thiếu hoặc sai charset UTF-8")
  grep -qi 'name="viewport"' "$file" || ISSUES+=("$file:0: Thiếu meta viewport")
  grep -qi '<html[^>]*lang='  "$file" || ISSUES+=("$file:0: Thiếu thuộc tính lang trên <html>")
  grep -qi '<title>'          "$file" || ISSUES+=("$file:0: Thiếu <title>")

  local alt_count=0
  while IFS=: read -r ln tag; do
    if grep -qE 'alt=' <<<"$tag"; then continue; fi
    if [ "$alt_count" -ge "$MAX_PER_CATEGORY_PER_FILE" ]; then
      WARNINGS+=("$file:0: <img> thiếu alt — vượt quá ${MAX_PER_CATEGORY_PER_FILE} kết quả, đã cắt bớt")
      break
    fi
    WARNINGS+=("$file:$ln: <img> thiếu thuộc tính alt")
    alt_count=$((alt_count + 1))
  done < <(grep -noE '<img[^>]*>' "$file" || true)

  local http_count=0
  while IFS=: read -r ln _; do
    if [ "$http_count" -ge "$MAX_PER_CATEGORY_PER_FILE" ]; then
      WARNINGS+=("$file:0: URL non-HTTPS — vượt quá ${MAX_PER_CATEGORY_PER_FILE} kết quả, đã cắt bớt")
      break
    fi
    WARNINGS+=("$file:$ln: URL dùng http:// (non-HTTPS)")
    http_count=$((http_count + 1))
  done < <(grep -noE 'http://[^"'\''[:space:]>]*' "$file" || true)
}

if [ -d "$TARGET" ]; then
  while IFS= read -r -d '' file; do
    analyze_html "$file"
  done < <(find "$TARGET" \( -name "*.html" -o -name "*.htm" \) -print0)
elif [ -f "$TARGET" ]; then
  analyze_html "$TARGET"
else
  fail "Target không phải file hay directory hợp lệ: $TARGET"
fi

issue_total=${#ISSUES[@]}
warning_total=${#WARNINGS[@]}

echo "Đã quét. $issue_total issue, $warning_total warning." >&2

if [ "$HAVE_JQ" -eq 1 ]; then
  to_json_array() {
    printf '%s\n' "$@" | jq -Rs 'split("\n") | map(select(length > 0))'
  }
  issues_json='[]'
  warnings_json='[]'
  [ "$issue_total" -gt 0 ] && issues_json=$(to_json_array "${ISSUES[@]:0:$MAX_FINDINGS}")
  [ "$warning_total" -gt 0 ] && warnings_json=$(to_json_array "${WARNINGS[@]:0:$MAX_FINDINGS}")

  jq -n \
    --argjson issues "$issues_json" \
    --argjson warnings "$warnings_json" \
    --argjson issue_total "$issue_total" \
    --argjson warning_total "$warning_total" \
    --argjson max "$MAX_FINDINGS" \
    '{
      success: true,
      issues: $issues,
      warnings: $warnings,
      issueCount: $issue_total,
      warningCount: $warning_total,
      truncated: (($issue_total > $max) or ($warning_total > $max))
    }'
else
  # Không có jq: fallback in plain text, không fail cứng.
  echo "--- ISSUES ($issue_total) ---"
  printf '%s\n' "${ISSUES[@]:0:$MAX_FINDINGS}"
  echo "--- WARNINGS ($warning_total) ---"
  printf '%s\n' "${WARNINGS[@]:0:$MAX_FINDINGS}"
fi
