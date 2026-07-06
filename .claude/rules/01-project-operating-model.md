# Operating model của project

Mọi task code đều đi theo quy trình:

```text
Explore → Plan → Implement → Verify → Review → Report
```

- **Explore**: đọc file liên quan trước khi sửa. Không sửa code khi chưa hiểu luồng hiện tại (đặc biệt với backend NestJS theo layer `controller -> service -> repository -> Prisma` và admin panel theo `apps/web/src/app/(admin)/admin/AGENTS.md`).
- **Plan**: liệt kê file dự kiến thay đổi và cách thay đổi trước khi implement, đặc biệt với task ảnh hưởng nhiều file hoặc nhiều module.
- **Implement**: chỉ sửa trong phạm vi task được giao. Ưu tiên minimal diff, ưu tiên reuse component/helper/service đã có (ví dụ `src/lib/api.ts`, `src/store/cart.ts`, `admin/common/*`) thay vì viết lại.
- **Verify**: chạy lint/typecheck/build/audit script phù hợp với phần vừa sửa (xem `.claude/rules/deployment/pre-deploy-quality-gate.md`).
- **Review**: tự đọc lại git diff, đối chiếu với scope ban đầu.
- **Report**: báo cáo ngắn gọn file đã sửa, command đã chạy, kết quả, rủi ro còn lại.

## Nguyên tắc thay đổi kiến trúc

- Không thay đổi architecture (cấu trúc module, layer, routing convention) nếu task chỉ là bugfix.
- Không tự ý thêm dependency mới. Nếu bắt buộc phải thêm, phải nêu rõ: lý do, alternative đã xem xét, ảnh hưởng tới bundle size (frontend) hoặc attack surface/bảo trì (backend).
- Không tự ý redesign UI hoặc đổi UX flow khi task không yêu cầu.
- Nếu phát hiện việc cần làm ngoài scope (bug khác, tech debt), ghi nhận và báo cáo riêng, không tự tiện sửa luôn trong cùng diff.
