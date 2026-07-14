---
name: github-issue-plan
description: Lập kế hoạch triển khai tối thiểu theo file, kiểm thử, rủi ro và rollback sau khi phân loại Issue thành công; không dùng để triển khai code.
---

# Lập kế hoạch GitHub Issue

## Điều kiện tiên quyết và đầu vào

Cần trạng thái triage `ready`, phân tích repository, source file liên quan, tiêu chí đã chấp nhận,
approval label và base branch. Nếu phạm vi hoặc approval chưa rõ, dừng trước khi lập kế hoạch rủi ro.

## Quy trình

1. Truy vết call path và consumer bị ảnh hưởng.
2. Liệt kê từng file cần thêm/sửa, mục đích và file bị loại trừ rõ ràng.
3. Ánh xạ từng tiêu chí với bằng chứng tự động hoặc thủ công.
4. Xác định kiểm tra liên quan nhỏ nhất, sau đó là kiểm tra bắt buộc toàn repository.
5. Ghi lại cân nhắc bảo mật, failure mode và rollback.

## Ranh giới an toàn và đầu ra

Chỉ đọc. Không triển khai, cài đặt, commit, push hoặc ghi lên GitHub. Trả về kế hoạch có thứ tự, ma
trận kiểm thử, rủi ro, rollback và ranh giới bàn giao rõ ràng. Trả `needs_info` nếu không thể tạo kế
hoạch deterministic an toàn.
