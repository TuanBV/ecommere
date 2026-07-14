# Quy tắc refactor Admin Panel

## Cấu trúc thư mục

- `admin/admin-panel.tsx`: chỉ là shell cấp route. File này xử lý session guard, logout và chọn view đang hoạt động.
- `admin/common/`: chỉ chứa code admin dùng chung.
  - `types.ts`: định nghĩa DTO/type admin dùng chung.
  - `api.ts`: helper request có xác thực và xử lý lỗi.
  - `session.ts`: key localStorage và helper session/role.
  - `ui.tsx`: primitive UI dùng chung cho form/danh sách/thông báo.
- `admin/auth/`: màn hình đăng nhập và UI xác thực.
- `admin/dashboard/`: source dashboard.
- `admin/products/`: source quản trị sản phẩm.
- `admin/orders/`: source quản trị đơn hàng.
- `admin/media/`: source quản trị banner/slider dùng chung.
- `admin/news/`: source quản trị tin tức.
- `admin/contacts/`: source quản trị liên hệ.
- `admin/users/`: source quản trị người dùng.
- `admin/settings/`: source cài đặt.

## Quy tắc Codex

Khi thêm tính năng admin, không thêm logic tính năng mới vào `admin-panel.tsx`.
Tạo thư mục source cho tính năng và giữ UI/API/type dùng chung trong `admin/common`.
