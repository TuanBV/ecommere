---
name: web-quality-audit
description: Audit tổng thể chất lượng web theo tinh thần Google Lighthouse (Performance, Accessibility, SEO, Best Practices). Dùng khi người dùng nói "audit site", "kiểm tra performance", "kiểm tra website", "tối ưu web", "Lighthouse", "Core Web Vitals", "review web quality".
---

# Web Quality Audit

Skill orchestrate audit toàn diện cho `apps/web`, dựa trên `.claude/rules/web-quality/web-quality-audit.md` và các rule con (performance, core-web-vitals, accessibility, seo, best-practices).

## Khi nào kích hoạt

Khi người dùng yêu cầu audit/kiểm tra tổng thể chất lượng web, không giới hạn ở một khía cạnh cụ thể. Nếu người dùng chỉ hỏi riêng về performance/accessibility/SEO/best-practices, dùng skill chuyên biệt tương ứng thay vì skill này.

## Cách thực hiện

1. Xác định scope: route/file/component cụ thể được audit (nếu người dùng không chỉ rõ, hỏi hoặc suy luận từ context — ví dụ trang đang mở trong IDE).
2. Đọc code liên quan (component, page, layout, metadata, `robots.ts`, `sitemap.ts`).
3. Nếu cần audit sâu và có nhiều khía cạnh, có thể phối hợp các agent chuyên môn (đọc code, không sửa):
   - `performance-cwv-reviewer`
   - `accessibility-wcag-reviewer`
   - `seo-structured-data-reviewer`
   - `security-best-practices-reviewer`
4. Gom kết quả, phân loại theo **Critical / High / Medium / Low** (định nghĩa trong `.claude/rules/web-quality/web-quality-audit.md`).
5. Xuất báo cáo theo format chuẩn dưới đây.
6. **Không tự ý sửa code** nếu người dùng chỉ yêu cầu audit — chỉ báo cáo và đề xuất fix cụ thể. Chỉ implement khi được yêu cầu rõ ràng bước tiếp theo.

## Output format

```md
# Web Quality Audit

## Tóm tắt
- Điểm/rủi ro tổng quan:
- Khu vực ảnh hưởng:
- Rủi ro production:

## Critical
| Issue | Evidence (file:line) | Impact | Fix |
|---|---|---|---|

## High
| Issue | Evidence (file:line) | Impact | Fix |
|---|---|---|---|

## Medium
| Issue | Evidence (file:line) | Impact | Fix |
|---|---|---|---|

## Low
| Issue | Evidence (file:line) | Impact | Fix |
|---|---|---|---|

## Verification
- Commands đã chạy:
- Kết quả:
- Rủi ro còn lại:
```

## Tham khảo thêm

- `.claude/rules/web-quality/*.md` — checklist chi tiết từng khía cạnh.
- `codex-web-quality-skills/skills/*/SKILL.md` — tài liệu gốc (tiếng Anh, chi tiết code example).
- Nếu môi trường có `jq` và target là file HTML tĩnh, có thể chạy `.claude/hooks/web-quality-static-check.sh <path>` để quét nhanh các lỗi cơ bản (thiếu `alt`, thiếu viewport, non-HTTPS URL...).
