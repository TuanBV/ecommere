---
paths:
  - "apps/web/**"
---

# Core Web Vitals

Nguồn gốc: `codex-web-quality-skills/skills/core-web-vitals/SKILL.md`. Google đánh giá theo percentile thứ 75 (75% lượt truy cập phải đạt mức "Good").

| Metric | Đo gì | Good | Cần cải thiện | Kém |
|---|---|---|---|---|
| **LCP** | Tốc độ load | ≤ 2.5s | 2.5s–4s | > 4s |
| **INP** | Độ phản hồi tương tác | ≤ 200ms | 200ms–500ms | > 500ms |
| **CLS** | Ổn định layout | ≤ 0.1 | 0.1–0.25 | > 0.25 |

## LCP checklist

- [ ] Xác định LCP element (thường là ảnh hero, banner, hoặc heading lớn ở trang chủ/trang sản phẩm).
- [ ] Preload/`fetchpriority="high"` nếu là hero image.
- [ ] Giảm CSS/JS render-blocking trong `<head>`.
- [ ] TTFB < 800ms — kiểm tra cache, response backend NestJS, CDN nếu có.
- [ ] Font dùng `font-display: swap` để không chặn hiển thị text.
- [ ] LCP element nằm trong HTML ban đầu (SSR/SSG), không chờ fetch client-side mới render.

## INP checklist

- [ ] Không có long task > 50ms chặn main thread.
- [ ] Event handler xử lý nhanh (< 100ms); việc nặng tách ra chạy sau, ưu tiên phản hồi UI ngay (ví dụ thêm class loading trước khi tính toán).
- [ ] Debounce input handler khi cần (tìm kiếm, filter sản phẩm).
- [ ] Third-party script không block tương tác — load lazy/on-demand.
- [ ] Component React nặng dùng `React.memo`/tách nhỏ để tránh re-render toàn cây khi không cần.

## CLS checklist

- [ ] Mọi `<img>`/`next/image`/video/iframe có `width`/`height` hoặc `aspect-ratio`.
- [ ] Banner, slider, ad, embed có container `min-height`/`aspect-ratio` cố định trước khi asset load.
- [ ] Nội dung dynamic (thông báo, toast, review) không được chèn phía trên nội dung đang hiển thị mà không có transform.
- [ ] Font tránh gây shift: preload font quan trọng, `font-display: swap` hoặc `optional`.
- [ ] Animation dùng `transform`/`opacity`, không animate `width`/`height`/`top`/`left`.

## Áp dụng vào project

- Trang sản phẩm/danh mục (`apps/web/src/app/(site)/san-pham/**`, `apps/web/src/components/product-card.tsx`) là nơi có nhiều ảnh — ưu tiên kiểm tra LCP/CLS khi sửa các file này.
- Trang admin (`apps/web/src/app/(admin)/admin/**`) không public, không cần tối ưu Core Web Vitals nghiêm ngặt như storefront, nhưng vẫn nên tránh long task chặn UI khi thao tác nhiều dữ liệu (bảng sản phẩm, đơn hàng).
