---
paths:
  - "apps/web/src/**/*.{ts,tsx,js,jsx}"
---

# Frontend Quality Rules

Áp dụng cho toàn bộ code trong `apps/web/src/`.

- Không tự ý redesign UI hoặc đổi UX flow khi task không yêu cầu — chỉ sửa đúng phần được giao.
- Giữ nguyên responsive behavior hiện có (breakpoint Tailwind hiện tại) khi sửa component; nếu thay đổi layout, kiểm tra lại trên cả mobile/tablet/desktop.
- Không phá accessibility đã có (label, alt, focus, keyboard) khi refactor.
- Component interactive mới (button, tab, dropdown, accordion) phải có keyboard support và focus state rõ ràng — xem `.claude/rules/web-quality/accessibility.md`.
- Ảnh phải có `width`/`height` hoặc `aspect-ratio` ổn định để tránh CLS — xem `.claude/rules/web-quality/core-web-vitals.md`.
- Không thêm JavaScript/dependency lớn nếu không thực sự cần thiết; ưu tiên giải pháp CSS/Tailwind hoặc component nhỏ tự viết trước khi thêm library mới.
- Tái sử dụng helper/state đã có: `src/lib/api.ts` (fetch, media URL), `src/store/cart.ts` (Zustand cart state), `apps/web/src/app/(admin)/admin/common/*` (API/session/UI helper cho admin) — không viết lại logic tương tự ở nơi khác.
- React Server Component là default; chỉ thêm `use client` khi thực sự cần state/browser API/event handler/Zustand/router navigation, theo quy tắc đã có trong `apps/web/AGENTS.md`.
