---
paths:
  - "apps/web/**"
---

# Performance

Nguồn gốc: `codex-web-quality-skills/skills/performance/SKILL.md`. Áp dụng cho frontend Next.js (`apps/web`).

## Performance budget

| Resource | Budget |
|---|---|
| Tổng dung lượng trang | < 1.5 MB |
| JavaScript (đã compress) | < 300 KB |
| CSS (đã compress) | < 100 KB |
| Ảnh above-the-fold | < 500 KB |
| Font | < 100 KB |
| Third-party script | < 200 KB |

## Quy tắc

- Tối ưu critical rendering path: giảm CSS/JS render-blocking, inline critical CSS nếu cần.
- Preload ảnh/font/CSS quan trọng cho LCP (`<link rel="preload">`, `fetchpriority="high"`).
- Lazy-load asset below-the-fold (ảnh, iframe, component nặng): `loading="lazy"`, `next/dynamic`.
- Ưu tiên AVIF/WebP có fallback khi phù hợp với pipeline ảnh hiện có của project (ảnh sản phẩm/banner trong `uploads/` đã có biến thể `_pc.webp`/`_tablet.webp`/`_mobile.webp` — dùng `mediaVariantUrl` từ `src/lib/api.ts`, không tự viết logic chọn ảnh mới).
- Luôn set `width`/`height` hoặc `aspect-ratio` cho ảnh/video/iframe để tránh layout shift.
- Tránh layout thrashing: batch DOM read rồi batch DOM write, không đọc/viết xen kẽ trong loop.
- Debounce/throttle handler tốn kém (scroll, resize, input search).
- Hạn chế thêm third-party script mới; nếu cần, load `async`/`defer` hoặc trì hoãn đến khi tương tác/visible.
- Không dùng `@import` trong CSS nếu gây render-blocking; ưu tiên `<link rel="stylesheet">` song song.
- Với Next.js (`apps/web`): ưu tiên `next/image` cho ảnh, `next/dynamic` cho code-splitting theo route/component, tránh import toàn bộ library lớn khi chỉ cần 1 hàm (tree-shaking, ví dụ import đích danh thay vì `import _ from 'lodash'`).

## Đo lường

| Metric | Mục tiêu |
|---|---|
| LCP | < 2.5s |
| FCP | < 1.8s |
| TBT | < 200ms |
| TTFB | < 800ms |

Công cụ đo: Lighthouse (`npx lighthouse <url>`), Chrome DevTools Performance panel, `web-vitals` library nếu cần theo dõi real-user.
