---
paths:
  - "apps/web/**"
  - "**/*.html"
---

# Web Quality Audit

Dựa trên tinh thần Google Lighthouse (Performance, Accessibility, SEO, Best Practices) — nguồn gốc: `codex-web-quality-skills/skills/web-quality-audit/SKILL.md`.

## 4 nhóm audit

1. **Performance** — xem `.claude/rules/web-quality/performance.md` và `core-web-vitals.md`.
2. **Accessibility** — xem `.claude/rules/web-quality/accessibility.md`.
3. **SEO** — xem `.claude/rules/web-quality/seo.md`.
4. **Best Practices** — xem `.claude/rules/web-quality/best-practices.md`.

## Phân loại mức độ nghiêm trọng

| Mức | Ý nghĩa | Hành động |
|---|---|---|
| **Critical** | Lỗi bảo mật, hỏng hoàn toàn một luồng chính (checkout, thanh toán, đăng nhập) | Phải sửa ngay |
| **High** | Core Web Vitals fail, rào cản accessibility lớn, lỗi SEO chặn index | Sửa trước khi deploy/launch |
| **Medium** | Cơ hội tối ưu performance, cải thiện SEO chưa khẩn cấp | Sửa trong sprint hiện tại |
| **Low** | Tối ưu nhỏ, code quality, cải thiện dần | Sửa khi thuận tiện |

## Output audit chuẩn

```md
# Web Quality Audit

## Tóm tắt
- Điểm/rủi ro tổng quan:
- Khu vực ảnh hưởng:
- Rủi ro production:

## Critical
| Issue | Evidence | Impact | Fix |
|---|---|---|---|

## High
| Issue | Evidence | Impact | Fix |
|---|---|---|---|

## Medium
| Issue | Evidence | Impact | Fix |
|---|---|---|---|

## Low
| Issue | Evidence | Impact | Fix |
|---|---|---|---|

## Verification
- Commands đã chạy:
- Kết quả:
- Rủi ro còn lại:
```

- `Evidence` phải trỏ tới `path/to/file:line` cụ thể trong repo (ví dụ `apps/web/src/components/product-card.tsx:42`), không viết chung chung.
- Nếu chỉ được yêu cầu "audit"/"kiểm tra", **không tự ý sửa code** — chỉ báo cáo. Chỉ implement fix khi được yêu cầu rõ ràng.
- Khi audit rộng, có thể phối hợp các agent chuyên môn trong `.claude/agents/` (performance-cwv-reviewer, accessibility-wcag-reviewer, seo-structured-data-reviewer, security-best-practices-reviewer) thông qua orchestrator `web-quality-orchestrator`.

## Checklist nhanh

**Trước mỗi lần deploy**
- [ ] Core Web Vitals đạt ngưỡng (LCP/INP/CLS)
- [ ] Không có lỗi accessibility nghiêm trọng
- [ ] Không có console error
- [ ] HTTPS hoạt động đúng, không mixed content
- [ ] Meta tag (title, description, viewport) đầy đủ cho trang chính

**Review hằng tuần**
- [ ] Kiểm tra Search Console (nếu có quyền truy cập)
- [ ] Theo dõi xu hướng Core Web Vitals
- [ ] Cập nhật dependency (`npm audit`)
