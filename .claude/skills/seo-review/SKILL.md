---
name: seo-review
description: Review technical SEO, on-page SEO, structured data (Product/Breadcrumb schema). Dùng khi người dùng nói "kiểm tra SEO", "SEO review", "structured data", "meta tag", "sitemap", "robots.txt".
---

# SEO Review

Dựa trên `.claude/rules/web-quality/seo.md`. Vì đây là site e-commerce, ưu tiên đặc biệt cho Product schema và Breadcrumb schema.

## Cách thực hiện

1. Đọc page/route cần review: `page.tsx`, metadata export, `robots.ts`, `sitemap.ts` liên quan.
2. Kiểm tra:
   - Title/meta description có unique, đúng độ dài không.
   - Heading hierarchy: có đúng 1 `<h1>`, thứ tự hợp lý.
   - Canonical URL đúng, không bị nhân bản do query filter.
   - robots.txt/sitemap không chặn nhầm trang quan trọng.
   - Với trang sản phẩm: có Product schema (JSON-LD) đầy đủ `name`, `image`, `offers.price`, `offers.priceCurrency`, `offers.availability` chưa.
   - Với trang có breadcrumb: có BreadcrumbList schema chưa.
   - Internal link text có mô tả rõ không.
   - Route tiếng Việt chính thức có được dùng trong sitemap/link nội bộ không (không dùng alias tiếng Anh đã redirect).
3. Đề xuất fix cụ thể, có ví dụ JSON-LD nếu thiếu.
4. Không tự sửa nếu chỉ được yêu cầu review.

## Output

```md
## SEO Review

### Critical
| Vấn đề | Evidence (file:line) | Fix |
|---|---|---|

### High
...

### Medium
...
```
