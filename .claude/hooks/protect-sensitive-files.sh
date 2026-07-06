#!/usr/bin/env bash
# PreToolUse hook (matcher: Read|Edit|Write) — chặn đọc/sửa file nhạy cảm.
# Đọc JSON tool call từ stdin. Exit 2 + stderr message = block. Exit 0 = allow.
set -euo pipefail

INPUT="$(cat)"

get_path() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // .tool_input.notebook_path // empty' 2>/dev/null || true
  else
    printf '%s' "$INPUT"
  fi
}

TARGET_PATH="$(get_path)"

if [ -z "$TARGET_PATH" ]; then
  exit 0
fi

# Chuẩn hoá dấu phân cách để pattern match ổn định trên cả Windows/Unix path.
NORMALIZED_PATH="${TARGET_PATH//\\//}"

SENSITIVE_PATTERNS=(
  '(^|/)\.env($|\.[^/]*$)'
  '(^|/)secrets?(/|$)'
  '\.pem$'
  '\.key$'
  '(^|/)id_rsa[^/]*$'
  '(^|/)credentials\.json$'
  '(^|/)\.npmrc$'
  '(^|/)\.pgpass$'
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if printf '%s' "$NORMALIZED_PATH" | grep -qiE "$pattern"; then
    echo "[protect-sensitive-files] Truy cập bị chặn: file nhạy cảm ($pattern)." >&2
    echo "Path: $TARGET_PATH" >&2
    echo "Không đọc/sửa file chứa secret, key, credential. Nếu cần cấu hình env, hãy chỉnh .env.example hoặc mô tả thay đổi cần thiết cho người dùng tự áp dụng." >&2
    exit 2
  fi
done

exit 0
