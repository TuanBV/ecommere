# Claude Code Web Quality Workflow

Tài liệu hướng dẫn team dev sử dụng Claude Code với bộ cấu hình web-quality đã thiết lập trong `.claude/` cho project ecommerce này. Dựa trên `codex-web-quality-skills/` (Lighthouse: Performance, Accessibility, SEO, Best Practices).

## 1. Cách dùng hằng ngày

```text
1. Tạo branch riêng cho task.
2. Mở Claude Code ở root project.
3. Yêu cầu Claude Explore trước (đọc file liên quan).
4. Yêu cầu Plan (liệt kê file dự kiến thay đổi).
5. Implement minimal diff, đúng phạm vi task.
6. Chạy verify (lint/build/audit phù hợp).
7. Chạy review (tự đọc git diff, hoặc dùng skill review nếu có).
8. Chỉ commit khi verify pass — dùng /safe-commit.
```

Toàn bộ rule chi tiết nằm trong `CLAUDE.md` (import từ `.claude/rules/`) và tự động áp dụng trong mọi session — không cần nhắc lại mỗi lần.

## 2. Khi audit web quality tổng thể

```text
/web-quality-audit
Target: [URL hoặc route/file, ví dụ apps/web/src/app/(site)/san-pham/[slug]/page.tsx]
Scope: performance, accessibility, SEO, best-practices
Mode: audit only, do not fix yet
```

Output sẽ phân loại theo Critical/High/Medium/Low kèm evidence `file:line` và fix đề xuất — xem chi tiết format ở `.claude/rules/web-quality/web-quality-audit.md`.

## 3. Khi audit riêng từng khía cạnh

| Nhu cầu | Skill |
|---|---|
| Tốc độ tải, resource loading, ảnh/font/JS/CSS | `/performance-review` |
| LCP / INP / CLS cụ thể | `/core-web-vitals-review` |
| Accessibility, WCAG 2.2 | `/accessibility-review` |
| Meta tag, structured data, sitemap | `/seo-review` |
| Security header, CSP, dependency, sourcemap | `/best-practices-review` |

Ví dụ:

```text
/core-web-vitals-review
Focus: LCP / INP / CLS
File: apps/web/src/components/product-card.tsx
Không redesign UI, chỉ tối ưu Core Web Vitals.
```

## 4. Khi chuẩn bị deploy

```text
/pre-deploy-quality-gate
Chạy lint, build, kiểm tra git status, kiểm tra migration Prisma.
Báo cáo pass/fail và rủi ro còn lại.
Không tự deploy.
```

## 5. Khi commit

```text
/safe-commit
Kiểm tra branch, staged files, lint, commit message.
Không commit vào main/master.
Không có AI attribution trong commit message.
```

## 6. Output format chuẩn cho mọi task code

```md
## Tóm tắt
...

## File đã đọc
...

## File đã sửa
...

## Verification
| Command | Result |
|---|---|

## Rủi ro còn lại
...

## Bước tiếp theo
...
```

## 7. Bản đồ cấu hình `.claude/`

```text
.claude/
  settings.json              # permission policy (allow/ask/deny) + hooks
  rules/                     # rule tự động áp dụng, import từ CLAUDE.md
    00-language.md
    01-project-operating-model.md
    02-git-safety.md
    03-security.md
    web-quality/              # performance, core-web-vitals, accessibility, seo, best-practices, audit tổng
    frontend/                 # quy tắc riêng cho apps/web/src
    deployment/                # pre-deploy quality gate
  skills/                     # gọi bằng /ten-skill
  agents/                     # subagent chuyên môn, dùng qua Agent tool hoặc orchestrator
  hooks/                      # script chặn hành vi nguy hiểm + script audit thủ công
```

## 8. Permission policy (tóm tắt)

- **allow**: đọc file, các lệnh git đọc-only (`status`/`diff`/`log`/`branch`), `npm run lint/build/dev`, `npm audit`, chạy hook script.
- **ask**: `npm install`/`git commit`/`git push`, mọi lệnh Docker, `prisma migrate`, script deploy/restore DB, service/nginx.
- **deny**: đọc/sửa file secret (`.env*`, `*.pem`, `*.key`, `id_rsa*`, `credentials.json`), lệnh phá hủy (`rm -rf`, `git reset --hard`, `git push --force`, `docker compose down -v`, `curl | sh`).

Chi tiết đầy đủ xem `.claude/settings.json`.

## 9. Hook đang bật (tự động chạy)

| Hook | Kích hoạt khi | Hành động |
|---|---|---|
| `block-dangerous-bash.sh` | Mọi lệnh `Bash` | Chặn command khớp pattern phá hủy |
| `block-main-master-commit.sh` | Lệnh chứa `git commit` | Chặn nếu branch hiện tại là `main`/`master`/`production`/`release` |
| `block-ai-attribution-commit-msg.sh` | Lệnh chứa `git commit` | Chặn nếu message có cụm AI attribution |
| `protect-sensitive-files.sh` | `Read`/`Edit`/`Write` | Chặn nếu path khớp pattern file nhạy cảm |

Hai script còn lại (`web-quality-static-check.sh`, `verify-json-and-shell.sh`) **không** wire tự động — chạy thủ công khi cần audit HTML tĩnh hoặc kiểm tra lại cấu hình `.claude/` sau khi sửa, tránh làm chậm mọi turn.

```bash
bash .claude/hooks/web-quality-static-check.sh apps/web/public
bash .claude/hooks/verify-json-and-shell.sh
```

## 10. Giới hạn hiện tại cần biết

- Project chưa có test runner (unit/e2e) trong `apps/api`/`apps/web` — bước "test" trong quy trình sẽ luôn báo "không có script" cho tới khi team bổ sung.
- Hook dựa trên exit code 2 + stderr theo convention PreToolUse hook của Claude Code; nếu phiên bản Claude Code đang dùng thay đổi giao thức hook, cần cập nhật lại các script trong `.claude/hooks/`.
- `web-quality-static-check.sh` chỉ quét file `.html`/`.htm` tĩnh (ví dụ trong `apps/web/public`), không phân tích JSX/TSX runtime — với component Next.js, dùng skill review (`/performance-review`, `/accessibility-review`, ...) thay vì script này.
