---
name: best-practices-review
description: Review security/browser/code-quality best practices — HTTPS, CSP, Trusted Types, SRI, security headers, dependency vulnerability, exposed sourcemap. Dùng khi người dùng nói "security review", "best practices review", "kiểm tra bảo mật", "audit dependency".
---

# Rà soát thực hành tốt nhất

Dựa trên `.claude/rules/web-quality/best-practices.md` và `.claude/rules/03-security.md`.

## Cách thực hiện

1. Xác định scope: code frontend (`apps/web`), backend (`apps/api`), hoặc config hạ tầng (Dockerfile, docker-compose, Nginx nếu có).
2. Kiểm tra:
   - HTTPS/mixed content, CSP, security headers.
   - SRI cho script/style third-party.
   - Dependency có lỗ hổng đã biết (`npm audit` nếu được phép chạy).
   - Source map có bị expose ở production build không.
   - API deprecated (`document.write`, XHR sync), event listener không `passive`.
   - HTML hợp lệ, semantic, không duplicate id.
   - Console error khi chạy thử (nếu có thể chạy dev server).
3. Không đọc/in nội dung secret khi kiểm tra file `.env`/config — chỉ xác nhận file đó có tồn tại/có được `.gitignore` đúng cách không.
4. Đề xuất fix cụ thể theo mức độ nghiêm trọng.

## Đầu ra

```md
## Rà soát thực hành tốt nhất / Bảo mật

### Nghiêm trọng (bảo mật)
| Vấn đề | Bằng chứng (tệp:dòng) | Cách sửa |
|---|---|---|

### Khả năng tương thích
...

### Chất lượng code
...
```
