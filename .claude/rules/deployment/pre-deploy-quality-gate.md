---
paths:
  - "docker-compose*.yml"
  - "apps/*/Dockerfile"
  - "database/migrations/**"
  - "scripts/**"
---

# Pre-deploy Quality Gate

Trước khi coi một thay đổi là "sẵn sàng deploy", chạy/liệt kê các bước sau (script nào không tồn tại thì ghi rõ "không có script này" thay vì bỏ qua im lặng):

```bash
npm run lint     # lint api + web
npm run build    # build api + web
```

Không có test runner (`unit`/`e2e`) được cấu hình trong `apps/api` hay `apps/web` hiện tại — ghi rõ điều này trong báo cáo thay vì báo "test passed" khi không có test nào chạy.

## Checklist trước deploy

- [ ] `npm run lint` pass cho cả `apps/api` và `apps/web`.
- [ ] `npm run build` pass cho cả hai app.
- [ ] Không có secret/`.env` bị commit (`git status`, `git diff` trước khi push).
- [ ] Nếu có thay đổi schema Prisma: đã chạy `npm run prisma:generate` và có file SQL migration tương ứng trong `database/migrations/` (project này quản lý schema DB bằng SQL thô qua Docker `db-init`, không dùng `prisma migrate` — xem `CLAUDE.md`).
- [ ] Nếu đổi endpoint API: đã kiểm tra tất cả nơi tiêu thụ trong `apps/web` (list/detail/form) còn khớp field.
- [ ] Đã tự kiểm tra nhanh Core Web Vitals/accessibility/SEO cho các trang bị ảnh hưởng nếu là thay đổi UI/route (xem `.claude/rules/web-quality/*`).
- [ ] Đã review `docker-compose.yml`, Dockerfile, hoặc script deploy nếu có sửa — không đổi port/env mặc định mà không nêu rõ ảnh hưởng.

## An toàn khi đụng tới hạ tầng

- Không tự ý chạy `docker compose down -v`, `scripts/restore-db.sh`, hoặc migration DB trên môi trường có dữ liệu thật mà chưa xác nhận với người dùng.
- Không tự ý deploy lên VPS (`scripts/deploy-vps.sh`) hoặc thay đổi Nginx production — chỉ đề xuất bước và chờ người dùng xác nhận/tự thực hiện.
- Đây là bước kiểm tra sẵn sàng (quality gate), **không phải** hành động deploy — không tự động deploy thay người dùng.
