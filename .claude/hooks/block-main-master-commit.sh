#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash) — chặn `git commit` khi đang ở branch bảo vệ.
# Đọc JSON tool call từ stdin. Exit 2 + stderr message = block. Exit 0 = allow.
set -euo pipefail

INPUT="$(cat)"

get_command() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true
  else
    printf '%s' "$INPUT"
  fi
}

COMMAND="$(get_command)"

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Chỉ quan tâm lệnh git commit.
if ! printf '%s' "$COMMAND" | grep -qiE 'git[[:space:]]+commit'; then
  exit 0
fi

PROTECTED_BRANCHES='^(main|master|production|release)$'

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"

if [ -z "$CURRENT_BRANCH" ]; then
  # Không xác định được branch (không phải git repo hoặc lỗi) -> để command tự báo lỗi, không chặn ở đây.
  exit 0
fi

if printf '%s' "$CURRENT_BRANCH" | grep -qiE "$PROTECTED_BRANCHES"; then
  echo "[block-main-master-commit] Không được commit trực tiếp vào branch '$CURRENT_BRANCH'." >&2
  echo "Hãy tạo branch riêng cho task (ví dụ: git checkout -b feature/ten-task) rồi commit ở đó." >&2
  exit 2
fi

exit 0
