---
name: repository-audit
description: Kiểm tra kiến trúc, lệnh, cơ chế phân phối, ranh giới bảo mật và kiểm soát agent của repository; dùng để lập đường cơ sở hoặc phát hiện sai lệch, không dùng để triển khai tính năng.
---

# Kiểm tra repository

## Điều kiện tiên quyết và đầu vào

Có quyền đọc worktree, đang ở root repository và có phạm vi kiểm tra nếu được chỉ định. Đọc mọi
`AGENTS.md` áp dụng, README/tài liệu kiến trúc, manifest, lockfile, cấu hình build/lint/test/deploy,
workflow, schema/migration database và các file agent/rule/skill hiện có. Không bao giờ đọc giá trị secret.

## Quy trình

1. Kiểm kê file tracked và file ẩn liên quan, branch/remote HEAD, module workspace và công cụ.
2. Xác định kiến trúc, ranh giới dependency, lệnh, vòng đời database, CI/CD và deployment.
3. Xác định đường dẫn nhạy cảm về bảo mật/control-plane cùng các kiểm tra bị thiếu hoặc không khả dụng.
4. Tạo hoặc cập nhật `docs/codex-agent/repository-analysis.md` với bằng chứng và giả định rõ ràng.

## Ranh giới an toàn và đầu ra

Giữ chế độ chỉ đọc, ngoại trừ tài liệu phân tích. Không kiểm tra `.env*`, credential, dump hoặc dữ
liệu production. Trả về đường dẫn phân tích, nguồn bằng chứng, giả định và khoảng trống chưa giải
quyết. Nếu không đọc được file bắt buộc, báo `blocked`; nếu thiếu command, báo `unavailable`.
