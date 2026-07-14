---
name: accessibility-review
description: Review accessibility theo WCAG 2.2 AA — keyboard, focus, label, contrast, ARIA, modal, form error, live region. Dùng khi người dùng nói "kiểm tra accessibility", "a11y review", "WCAG", "screen reader", "keyboard navigation".
---

# Rà soát khả năng tiếp cận

Dựa trên `.claude/rules/web-quality/accessibility.md`. Mục tiêu tối thiểu: WCAG 2.2 AA.

## Cách thực hiện

1. Đọc component/page cần review.
2. Kiểm tra theo nhóm:
   - **Keyboard & focus**: mọi phần tử tương tác focus được bằng Tab, focus indicator rõ, không keyboard trap, thứ tự tab hợp lý.
   - **Label & form**: input có label đúng cách, lỗi form có `aria-invalid`/`aria-describedby`.
   - **Contrast**: ước lượng contrast text/background, cảnh báo nếu dùng màu nhạt (`text-gray-400` trên nền trắng) cho nội dung quan trọng.
   - **Alt text**: ảnh có `alt` phù hợp, ảnh trang trí dùng `alt=""`.
   - **ARIA**: chỉ dùng khi cần, roles/states đúng; ưu tiên native HTML.
   - **Modal/dialog**: focus trap, restore focus khi đóng.
   - **Live region**: thông báo động có `aria-live`/`role="alert"` phù hợp.
3. Phân loại theo mức Critical/Serious/Moderate/Low (tương ứng Critical/High/Medium/Low của audit tổng).
4. Không tự sửa nếu chỉ được yêu cầu review.

## Đầu ra

```md
## Rà soát khả năng tiếp cận (WCAG 2.2 AA)

### Nghiêm trọng
| Vấn đề | WCAG criterion | Evidence (file:line) | Fix |
|---|---|---|---|

### Serious
...

### Moderate
...

### Thấp
...
```
