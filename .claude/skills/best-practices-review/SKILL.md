---
name: best-practices-review
description: Review security/browser/code-quality best practices — HTTPS, CSP, Trusted Types, SRI, security headers, dependency vulnerability, exposed sourcemap. Dùng khi người dùng nói "security review", "best practices review", "kiểm tra bảo mật", "audit dependency".
---

# Best Practices Review

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

## Output

```md
## Best Practices / Security Review

### Critical (bảo mật)
| Vấn đề | Evidence (file:line) | Fix |
|---|---|---|

### Compatibility
...

### Code quality
...
```
