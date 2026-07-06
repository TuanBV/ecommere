---
name: pre-deploy-quality-gate
description: Checklist và verification trước khi deploy — lint, typecheck, test, build, audit. Dùng khi người dùng nói "chuẩn bị deploy", "kiểm tra trước khi deploy", "pre-deploy check", "release checklist".
---

# Pre-deploy Quality Gate

Dựa trên `.claude/rules/deployment/pre-deploy-quality-gate.md`.

## Cách thực hiện

1. Chạy (hoặc đề xuất chạy nếu cần quyền xác nhận) các command sau, ghi rõ command nào không tồn tại thay vì bỏ qua:
   ```bash
   npm run lint
   npm run build
   ```
2. Không có test runner (unit/e2e) trong `apps/api`/`apps/web` — ghi rõ "không có test script" trong báo cáo.
3. Kiểm tra `git status`/`git diff` để chắc chắn không dính file `.env`, `dist/`, `.next/`, secret.
4. Nếu có thay đổi Prisma schema: xác nhận đã `prisma generate` và có migration SQL tương ứng trong `database/migrations/`.
5. Nếu có thay đổi endpoint API: xác nhận đã kiểm tra các nơi tiêu thụ trong `apps/web`.
6. Nếu có thay đổi UI/route công khai: tham chiếu nhanh `.claude/rules/web-quality/*.md` để chắc không phá Core Web Vitals/accessibility/SEO cơ bản.
7. **Không tự deploy** (không chạy `docker compose up` trên production, không chạy `scripts/deploy-vps.sh`) — chỉ báo cáo pass/fail và để người dùng quyết định bước deploy.

## Output

```md
## Pre-deploy Quality Gate

| Check | Command | Kết quả |
|---|---|---|
| Lint | `npm run lint` | ... |
| Build | `npm run build` | ... |
| Test | (không có script) | N/A |
| Git status sạch | `git status` | ... |
| Prisma sync | `npm run prisma:generate` | ... |

## Rủi ro còn lại
- ...

## Kết luận
- Sẵn sàng deploy: Có/Không, vì ...
```
