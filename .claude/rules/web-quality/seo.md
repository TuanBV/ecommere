---
paths:
  - "apps/web/**"
---

# SEO

Nguồn gốc: `codex-web-quality-skills/skills/seo/SKILL.md`. Áp dụng cho storefront (`apps/web/src/app/(site)/**`) — đây là site e-commerce nên ưu tiên Product schema và Breadcrumb schema.

## Crawlability

- [ ] `robots.txt` (`apps/web/src/app/robots.ts`) không block asset cần render (JS/CSS), chỉ chặn route admin/API nội bộ nếu cần.
- [ ] `sitemap.xml` (`apps/web/src/app/sitemap.ts`) chỉ chứa URL canonical, có thể index — dùng route tiếng Việt chính thức (`/san-pham`, `/tin-tuc`, `/ve-chung-toi`, `/lien-he`), không đưa alias tiếng Anh đã redirect vào sitemap.
- [ ] Không `noindex` nhầm trang quan trọng (trang chủ, danh mục, sản phẩm, tin tức).
- [ ] Có canonical URL cho mỗi trang, đặc biệt trang có query filter (`?danh-muc=...`, `?thuong-hieu=...`) — canonical nên trỏ về URL không filter hoặc URL chuẩn hoá.

## On-page SEO

- [ ] Mỗi trang quan trọng có `<title>` unique, mô tả rõ nội dung, khoảng 50–60 ký tự.
- [ ] Có `meta description` unique, khoảng 150–160 ký tự.
- [ ] Một `<h1>` chính mỗi trang, heading hierarchy hợp lý (không nhảy cấp `h1 -> h4`).
- [ ] Link text mô tả rõ nội dung đích, không dùng "xem thêm"/"click here" chung chung khi có thể cụ thể hơn.
- [ ] Ảnh có `alt` mô tả nội dung, tên file có ý nghĩa khi có thể.

## Structured data (JSON-LD)

Với e-commerce, ưu tiên:

- **Product schema** cho trang chi tiết sản phẩm (`apps/web/src/app/(site)/san-pham/[slug]/**`): `name`, `image`, `description`, `brand`, `offers.price`, `offers.priceCurrency`, `offers.availability`.
- **BreadcrumbList schema** cho mọi trang có breadcrumb (danh mục, sản phẩm, tin tức).
- **Organization** schema ở layout gốc nếu chưa có, gồm `name`, `url`, `logo`, `contactPoint`.
- Validate structured data bằng [Google Rich Results Test](https://search.google.com/test/rich-results) trước khi coi là hoàn tất — không chỉ dựa vào việc JSON-LD render ra HTML.

## Mobile SEO

- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` có trong `layout.tsx`.
- [ ] Tap target ≥ 48px — khớp với quy tắc chiều cao control tối thiểu đã có trong `apps/web/AGENTS.md`.
- [ ] Font size đọc được không cần zoom (đã có quy tắc typography riêng trong `apps/web/AGENTS.md`, áp dụng đồng thời).

## Khi sửa route/redirect

- `apps/web/src/middleware.ts` quản lý redirect 308 từ route tiếng Anh sang tiếng Việt — khi thêm route mới, cân nhắc có cần redirect tương tự không, và không tạo vòng redirect hoặc chuỗi redirect dài (ảnh hưởng cả SEO và performance).
