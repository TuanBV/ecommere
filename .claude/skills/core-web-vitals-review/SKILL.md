---
name: core-web-vitals-review
description: Review tập trung LCP, INP, CLS. Dùng khi người dùng nói "fix LCP", "giảm CLS", "tối ưu INP", "cải thiện Core Web Vitals", "layout bị nhảy/giật".
---

# Rà soát Core Web Vitals

Dựa trên `.claude/rules/web-quality/core-web-vitals.md`. Mục tiêu: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.

## Cách thực hiện

1. **Xác định LCP candidate**: phần tử lớn nhất render đầu tiên trên trang được review (thường là ảnh hero/sản phẩm chính hoặc heading lớn). Kiểm tra: có preload không, có SSR/SSG sẵn trong HTML không, hay đang chờ fetch client-side.
2. **Tìm nguyên nhân CLS**: rà các ảnh/banner/iframe/embed thiếu `width`/`height`/`aspect-ratio`; nội dung động (toast, review, banner) được chèn ở đâu; font có gây shift không.
3. **Tìm nguyên nhân INP**: long task (>50ms) trong event handler, việc nặng chạy đồng bộ trong click/submit, third-party script chặn tương tác, re-render thừa ở component React lớn.
4. Với mỗi vấn đề, chỉ rõ file:line, mô tả cơ chế gây ảnh hưởng đến metric nào, và fix cụ thể (ưu tiên fix bằng cách chỉnh code hiện có, không redesign UI).
5. Không tự ý sửa nếu chưa được yêu cầu — trừ khi task rõ ràng là "fix Core Web Vitals cho file X".

## Đầu ra

```md
## Rà soát Core Web Vitals

### LCP
- Element: ...
- Vấn đề: ...
- Fix: ...

### INP
- Vấn đề: ...
- Fix: ...

### CLS
- Vấn đề: ...
- Fix: ...
```
