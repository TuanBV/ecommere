---
name: github-issue-implement
description: Triển khai kế hoạch GitHub Issue đã chấp nhận bằng một workspace writer; không dùng khi chưa triage sẵn sàng, thiếu approval hoặc thiếu kế hoạch theo file.
---

# Triển khai GitHub Issue

## Điều kiện tiên quyết và đầu vào

Cần triage sẵn sàng, kế hoạch theo file đã chấp nhận, context base/working branch, approval label,
`AGENTS.md` áp dụng và hiểu rõ thay đổi có sẵn trong worktree.

## Quy trình

1. Đọc lại file trong kế hoạch và giữ nguyên thay đổi của người dùng.
2. Dùng một write agent và tạo thay đổi nhỏ nhất đáp ứng tiêu chí.
3. Thêm test trung thực khi đã có runner; không sửa test để che giấu lỗi sản phẩm.
4. Chạy kiểm tra mục tiêu, xem diff theo phạm vi rồi bàn giao cho `$quality-gate` và `$security-review`.

## Ranh giới an toàn và đầu ra

Chỉ ghi trong workspace. Không commit, push, ghi GitHub API, deployment, truy cập secret, force,
thay đổi dependency/migration/control-plane chưa được duyệt hoặc sửa lỗi không liên quan. Trả về file
đã đổi, ánh xạ tiêu chí, command/bằng chứng và sai lệch. Khi xung đột kế hoạch, dừng với `blocked`;
khi thiếu dữ kiện, trả `needs_info`; giữ diagnostic khi command lỗi.
