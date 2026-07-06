---
paths:
  - "apps/api/**"
  - "apps/web/**"
---

# Best Practices (Security & Modern Standards)

Nguồn gốc: `codex-web-quality-skills/skills/best-practices/SKILL.md`.

## Security

- [ ] HTTPS everywhere ở môi trường production, không mixed content (không load resource `http://` từ trang `https://`).
- [ ] CSP (Content-Security-Policy) cấu hình hợp lý; nếu thêm domain third-party mới vào `script-src`/`img-src`/`connect-src`, phải nêu rõ lý do.
- [ ] Trusted Types (`require-trusted-types-for 'script'`) — cân nhắc áp dụng nếu project có nhiều điểm gán `innerHTML` (ví dụ nội dung SunEditor/HTML từ CMS: `normalizeMediaHtml` trong `src/lib/api.ts`), rollout qua `Content-Security-Policy-Report-Only` trước khi enforce.
- [ ] Third-party `<script>`/`<link rel="stylesheet">` từ CDN không kiểm soát phải có `integrity` (SRI) + `crossorigin`.
- [ ] Security headers cơ bản: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors` (qua CSP, thay cho `X-Frame-Options`). **Không** dùng `X-XSS-Protection` như cơ chế bảo vệ chính (đã bị deprecated/removed khỏi browser hiện đại).
- [ ] Chạy `npm audit` định kỳ, không dùng dependency có lỗ hổng đã biết mà không có kế hoạch nâng cấp.
- [ ] Không expose source map production nếu không kiểm soát được ai truy cập; nếu upload lên error tracker, loại bỏ `sourcesContent`.
- [ ] Không dùng deep-merge/`Object.assign` không kiểm soát với input từ user (rủi ro prototype pollution qua `__proto__`).

## Modern standards / compatibility

- [ ] HTML hợp lệ: `<!DOCTYPE html>`, `<meta charset="UTF-8">` là phần tử đầu trong `<head>`, `<meta name="viewport">`, `lang` trên `<html>`.
- [ ] Không dùng API deprecated: `document.write`, XHR đồng bộ (`xhr.open(..., false)`), Application Cache.
- [ ] Event listener cho `touchstart`/`wheel`/`scroll` nên là `passive: true` trừ khi cần `preventDefault`.
- [ ] Không polyfill từ CDN bên thứ ba không kiểm soát (rủi ro supply-chain attack như vụ `polyfill.io`); nếu cần polyfill, bundle ở build time hoặc self-host.

## Code quality / console

- [ ] Không có console error khi chạy app ở chế độ dev/preview trước khi coi task là hoàn tất.
- [ ] Có error handling hợp lý (try/catch ở nơi có thể lỗi thực sự — network, parsing), không nuốt lỗi im lặng.
- [ ] HTML hợp lệ: không duplicate `id`, không nesting sai (`<a><button>` lồng nhau, `<div>` trực tiếp trong `<ul>`).
- [ ] Semantic HTML: `header`, `nav`, `main`, `section`, `article`, `footer` thay cho `<div>` chung khi phù hợp — đã là quy tắc sẵn có trong `apps/web/AGENTS.md`.

## UX patterns

- [ ] Không hiển thị interstitial/popup che nội dung chính ngay khi vào trang, đặc biệt trên mobile.
- [ ] Chỉ request permission (geolocation, notification, camera) khi có ngữ cảnh rõ ràng, sau hành động của user.
- [ ] Button/CTA phải làm đúng điều nó mô tả, không gây hiểu nhầm.
