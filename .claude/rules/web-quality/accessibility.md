---
paths:
  - "apps/web/**"
---

# Khả năng tiếp cận (WCAG 2.2)

Nguồn gốc: `codex-web-quality-skills/skills/accessibility/SKILL.md` và `references/WCAG.md`, `references/A11Y-PATTERNS.md`. Mục tiêu tối thiểu: **WCAG 2.2 AA** cho toàn bộ giao diện storefront (`apps/web/src/app/(site)/**`) và admin panel.

## Nguyên tắc POUR

- **Perceivable** (cảm nhận được): alt text, contrast, không chỉ dựa vào màu sắc.
- **Operable** (thao tác được): keyboard navigation, focus visible, không keyboard trap, target size đủ lớn.
- **Understandable** (hiểu được): `lang`, heading hierarchy, label rõ ràng, thông báo lỗi dễ hiểu.
- **Robust** (bền vững): HTML hợp lệ, ARIA dùng đúng, hoạt động tốt với assistive technology.

## Nghiêm trọng — phải sửa ngay khi phát hiện

- [ ] Mọi `<input>`/`<select>`/`<textarea>` có label liên kết qua `for`/`id` (hoặc `aria-label` khi không thể dùng label hiển thị).
- [ ] Mọi `<img>` có `alt` phù hợp; ảnh trang trí dùng `alt=""`.
- [ ] Contrast đạt tối thiểu 4.5:1 (text thường) / 3:1 (text lớn ≥18px hoặc bold ≥14px) theo WCAG AA.
- [ ] Toàn bộ chức năng dùng được bằng keyboard, không có keyboard trap.
- [ ] Focus indicator hiển thị rõ (`:focus-visible`), không `outline: none` mà không thay bằng chỉ báo khác.

## Form

- Label liên kết bằng `for`/`id` hoặc component tương đương (React Hook Form + label thực).
- Lỗi form: gắn `aria-invalid="true"` và `aria-describedby` trỏ tới message lỗi; nếu nhiều lỗi, hiển thị error summary ở đầu form và focus vào đó khi submit lỗi.
- Checkout (`apps/web/src/app/(site)/checkout/checkout-form.tsx`) và contact form (`contact-form.tsx`) là các form quan trọng nhất — luôn kiểm tra accessibility khi sửa các file này.

## Modal / dialog

- Focus trap trong modal khi mở; ưu tiên `<dialog>` native nếu phù hợp.
- `Escape` đóng modal nếu hợp lý với UX; restore focus về phần tử đã mở modal sau khi đóng.

## Dynamic notification

- Dùng `aria-live="polite"` (hoặc `role="alert"` cho lỗi khẩn) để thông báo động (toast thêm vào giỏ hàng, lỗi submit) được screen reader đọc.

## Icon button

- Icon button (nút giỏ hàng, đóng, hamburger menu trong `site-header.tsx`) phải có accessible name qua `aria-label` hoặc text ẩn (`sr-only`), không chỉ có icon.

## Nguyên tắc chung khác

- Không lạm dụng ARIA khi native HTML đã đủ (`<button>` thay `<div role="button">`).
- Component UI library (nếu dùng) vẫn phải kiểm tra lại keyboard/focus/label — không giả định library đã accessible.
- Tôn trọng `prefers-reduced-motion` cho animation không thiết yếu.
- Target size tối thiểu 24×24px (AA), khuyến nghị 44×44px cho nút chạm trên mobile — khớp với quy tắc "chiều cao tối thiểu 40px desktop / 44px mobile" đã có trong `apps/web/AGENTS.md`.
