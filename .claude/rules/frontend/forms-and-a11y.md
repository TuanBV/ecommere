---
paths:
  - "apps/web/src/app/(site)/checkout/**"
  - "apps/web/src/app/(site)/contact/**"
  - "apps/web/src/app/(admin)/**"
---

# Biểu mẫu và khả năng tiếp cận

Áp dụng cho các form quan trọng: checkout, contact, và toàn bộ form trong admin panel (product, order, user, settings...).

- Mọi field bắt buộc phải có label liên kết đúng (`for`/`id`, hoặc `<label>` bao input).
- Validate bằng `react-hook-form` + `zod` (đã là stack sẵn có trong `apps/web`) — không tự viết validation logic riêng lẻ song song.
- Khi submit lỗi: hiển thị message lỗi gắn với field qua `aria-describedby`, đặt `aria-invalid="true"` trên input lỗi; nếu nhiều lỗi cùng lúc, hiển thị tóm tắt lỗi ở đầu form.
- Nút submit (đặt hàng, gửi liên hệ, lưu sản phẩm) phải có trạng thái loading rõ ràng, tránh double-submit, và không nhỏ hơn kích thước tối thiểu đã quy định (≥52px height cho CTA checkout theo `apps/web/AGENTS.md`).
- Input tiền tệ, số điện thoại, email trong form phải dùng `type` HTML phù hợp (`type="email"`, `type="tel"`, `inputmode="numeric"`) để hỗ trợ bàn phím mobile đúng loại.
- Không disable paste trên field password/OTP — cản trở password manager và giảm accessibility (WCAG 3.3.8).
- Với form admin thao tác dữ liệu nhạy cảm (user, order, settings): xác nhận (confirm dialog) trước hành động phá hủy như xoá/đổi trạng thái quan trọng.
