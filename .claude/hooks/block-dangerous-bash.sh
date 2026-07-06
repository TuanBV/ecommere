#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash) — chặn các command phá hủy/nguy hiểm.
# Đọc JSON tool call từ stdin. Exit 2 + stderr message = block (Claude Code convention).
# Exit 0 = allow.
set -euo pipefail

INPUT="$(cat)"

get_command() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true
  else
    # Fallback thô khi không có jq: lấy toàn bộ input làm text để pattern-match.
    printf '%s' "$INPUT"
  fi
}

COMMAND="$(get_command)"

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Danh sách pattern nguy hiểm (case-insensitive).
DANGEROUS_PATTERNS=(
  'rm[[:space:]]+-[a-zA-Z]*r[a-zA-Z]*f'
  'rm[[:space:]]+-[a-zA-Z]*f[a-zA-Z]*r'
  'git[[:space:]]+reset[[:space:]]+--hard'
  'git[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f[a-zA-Z]*d'
  'git[[:space:]]+push[[:space:]]+.*--force'
  'git[[:space:]]+push[[:space:]]+.*[[:space:]]-f([[:space:]]|$)'
  'curl[[:space:]].*\|[[:space:]]*sh'
  'curl[[:space:]].*\|[[:space:]]*bash'
  'wget[[:space:]].*\|[[:space:]]*sh'
  'wget[[:space:]].*\|[[:space:]]*bash'
  'chmod[[:space:]]+777'
  'mkfs\.'
  ':\(\)\{[[:space:]]*:\|:&[[:space:]]*\};:'
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if printf '%s' "$COMMAND" | grep -qiE "$pattern"; then
    echo "[block-dangerous-bash] Command bị chặn vì khớp pattern nguy hiểm: $pattern" >&2
    echo "Command: $COMMAND" >&2
    echo "Nếu thực sự cần chạy lệnh này, hãy chạy trực tiếp thủ công sau khi xác nhận rủi ro." >&2
    exit 2
  fi
done

exit 0
