---
name: performance-review
description: Review tốc độ tải trang, resource loading, ảnh, font, cache, JS/CSS, third-party script, runtime performance. Dùng khi người dùng nói "tối ưu tốc độ", "site chạy chậm", "giảm bundle size", "performance review".
---

# Performance Review

Dựa trên `.claude/rules/web-quality/performance.md`.

## Cách thực hiện

1. Xác định file/route cần review (component, page, layout, config Next.js/Tailwind liên quan).
2. Kiểm tra theo checklist:
   - Resource loading: preload/preconnect cho asset quan trọng, lazy-load asset below-the-fold.
   - Ảnh: dùng `next/image`/`mediaVariantUrl`, có kích thước/`aspect-ratio` cố định, đúng biến thể responsive.
   - Font: `font-display: swap`, preload font quan trọng.
   - JS/CSS: tránh import thừa, tránh library nặng không cần thiết, code-splitting theo route/component nặng (`next/dynamic`).
   - Third-party script: có bị block main thread không, có thể trì hoãn đến khi cần không.
   - Cache: header cache hợp lý cho static asset (nếu review code phía server/Nginx).
3. Ước lượng impact lên LCP/INP/CLS cho mỗi finding — mỗi vấn đề performance nên nêu rõ nó ảnh hưởng tới Core Web Vitals nào.
4. Đưa ra fix cụ thể, có thể kèm code diff mẫu.

## Output

```md
## Performance Review

| Vấn đề | Evidence (file:line) | Ảnh hưởng CWV | Fix đề xuất |
|---|---|---|---|

## Ưu tiên xử lý
1. ...
2. ...
```

Không tự sửa code nếu chỉ được yêu cầu review; đề xuất fix rõ ràng để người dùng hoặc bước implement tiếp theo xử lý.
