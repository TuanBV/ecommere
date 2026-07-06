---
paths:
  - "apps/web/src/components/**"
  - "apps/web/src/app/(site)/**"
---

# Responsive UI

- Storefront (`apps/web/src/app/(site)/**`) phải hoạt động tốt trên mobile, tablet, desktop — đây là kênh bán hàng chính, không phải trang phụ.
- Dùng breakpoint Tailwind (`sm`, `md`, `lg`, `xl`) nhất quán với phần còn lại của project; tránh arbitrary breakpoint riêng lẻ trừ khi cần khớp chính xác template.
- Ảnh sản phẩm/banner đã có 3 biến thể theo thiết bị (`_pc.webp`, `_tablet.webp`, `_mobile.webp`) — dùng `mediaVariantUrl()` trong `src/lib/api.ts` để lấy đúng biến thể, không tự ghép suffix bằng tay.
- Tap target trên mobile tối thiểu 44px chiều cao (đã quy định trong `apps/web/AGENTS.md`); không thu nhỏ nút bấm/checkbox trên mobile để "tiết kiệm không gian".
- Kiểm tra layout ở viewport hẹp (≈360–390px) cho các trang có nhiều thông tin: trang sản phẩm, checkout, giỏ hàng — đây là nơi dễ vỡ layout nhất.
- Không dùng `overflow: hidden` để "ẩn" lỗi responsive; phải sửa nguyên nhân layout.
