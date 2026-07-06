#!/usr/bin/env bash
# Kiểm tra syntax cơ bản cho cấu hình Claude Code: settings.json hợp lệ,
# mọi hook shell script không lỗi syntax, và các thư mục rule/skill/agent tồn tại.
# Dùng thủ công sau khi thêm/sửa file trong .claude/**:
#   bash .claude/hooks/verify-json-and-shell.sh
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLAUDE_DIR="$ROOT_DIR/.claude"
FAILED=0

echo "== 1. Kiểm tra .claude/settings.json =="
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
if [ ! -f "$SETTINGS_FILE" ]; then
  echo "  KHÔNG TÌM THẤY: $SETTINGS_FILE" >&2
  FAILED=1
elif command -v jq >/dev/null 2>&1; then
  if jq empty "$SETTINGS_FILE" >/dev/null 2>&1; then
    echo "  OK: settings.json là JSON hợp lệ"
  else
    echo "  LỖI: settings.json không parse được bằng jq" >&2
    FAILED=1
  fi
else
  echo "  Bỏ qua (không có jq) — không kiểm tra được JSON syntax" >&2
fi

echo "== 2. Kiểm tra syntax shell script trong .claude/hooks/ =="
if [ -d "$CLAUDE_DIR/hooks" ]; then
  for script in "$CLAUDE_DIR"/hooks/*.sh; do
    [ -e "$script" ] || continue
    if bash -n "$script" 2>/tmp/verify-shell-err.$$; then
      echo "  OK: $(basename "$script")"
    else
      echo "  LỖI syntax: $(basename "$script")" >&2
      cat /tmp/verify-shell-err.$$ >&2
      FAILED=1
    fi
    rm -f /tmp/verify-shell-err.$$
  done
else
  echo "  KHÔNG TÌM THẤY thư mục .claude/hooks" >&2
  FAILED=1
fi

echo "== 3. Kiểm tra các thư mục cấu hình tồn tại =="
for dir in rules skills agents hooks; do
  if [ -d "$CLAUDE_DIR/$dir" ]; then
    count=$(find "$CLAUDE_DIR/$dir" -type f | wc -l | tr -d ' ')
    echo "  OK: .claude/$dir ($count file)"
  else
    echo "  KHÔNG TÌM THẤY: .claude/$dir" >&2
    FAILED=1
  fi
done

echo "== Kết quả =="
if [ "$FAILED" -eq 0 ]; then
  echo "Tất cả kiểm tra PASS."
  exit 0
else
  echo "Có kiểm tra FAIL — xem log phía trên." >&2
  exit 1
fi
