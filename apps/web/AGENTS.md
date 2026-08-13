# Quy tắc Codex cho frontend

Các quy tắc này áp dụng cho frontend ecommerce. Tuân theo chúng mỗi khi thêm hoặc thay đổi code UI.

## Stack và cấu trúc

- Mặc định dùng Next.js App Router, TypeScript và React Server Components.
- Chỉ thêm `use client` khi component dùng state, browser API, event handler, Zustand hoặc router navigation.
- Giữ UI tái sử dụng trong `src/components/` và UI riêng cho route ở gần route đó.
- Dùng API helper hiện có từ `src/lib/api.ts`; không tạo fetch utility trùng lặp.
- Dùng cart state hiện có từ `src/store/cart.ts` cho thao tác giỏ hàng.

## Typography và khả năng đọc theo Merchant Center

Các đánh giá của Google Merchant Center và Google UX yêu cầu trải nghiệm mua sắm đáng tin cậy, dễ
đọc. Không làm nội dung ecommerce trông quá nhỏ.

### Nền tảng chung

- Chữ nội dung: tối thiểu `16px` trên desktop, tối thiểu `15px` trên mobile.
- Line-height nội dung: từ `1.6` đến `1.75`.
- Ưu tiên `font-medium` và `font-semibold`; tránh `font-bold` trừ khi phần tử là badge, brand mark hoặc CTA mạnh.
- Không dùng `text-gray-400` cho văn bản quan trọng trên nền trắng. Ưu tiên `text-gray-600`, `text-gray-700` hoặc `text-gray-800`.

### Không dùng chữ quá nhỏ cho nội dung ecommerce quan trọng

Không bao giờ dùng `text-xs`, `text-[10px]`, `text-[11px]`, `text-[12px]` hoặc `text-[13px]` cho:

- Tên sản phẩm
- Giá sản phẩm
- Trường form checkout
- Tổng tiền checkout
- Nút thêm vào giỏ hàng / mua ngay
- Nhãn menu điều hướng
- Nội dung chính sách
- Mô tả sản phẩm
- Thông số sản phẩm
- Thông tin liên hệ

Chữ nhỏ chỉ được phép cho badge, nhãn giảm giá, metadata hỗ trợ hoặc văn bản trang trí.

## Mục tiêu typography theo component

### Header

- Ô tìm kiếm: `text-base`, chiều cao ít nhất `44px`.
- Menu desktop: `text-[15px]` hoặc `text-base`, `font-medium` hoặc `font-semibold`.
- Nút giỏ hàng: chiều cao ít nhất `44px`.

### Card sản phẩm

- Nhãn thương hiệu/danh mục: tối thiểu `text-xs`.
- Tên sản phẩm: `text-sm md:text-[15px]`, `font-semibold`, line-height dễ đọc.
- Giá: `text-lg md:text-xl`, `font-semibold`.
- Giá cũ: tối thiểu `text-sm`.
- Nút thêm vào giỏ: chiều cao ít nhất `40px`, `text-sm`, `font-semibold`.

### Chi tiết sản phẩm

- H1: `text-2xl md:text-3xl`, `font-semibold`.
- Giá chính: `text-3xl md:text-4xl`, `font-semibold`.
- Nội dung/thông số: `text-base`, `leading-8` trên desktop.
- Nút CTA: chiều cao ít nhất `52px`, `text-base`, `font-semibold`.

### Checkout

- Nhãn form: `text-sm`, `font-semibold`.
- Input và textarea: `text-base`, chiều cao ít nhất `48px`.
- Tên sản phẩm trong đơn: `text-sm md:text-base`.
- Tổng tiền: `text-2xl md:text-3xl`, `font-semibold`.
- Nút submit: `text-base`, chiều cao ít nhất `52px`.

### Footer

- Văn bản thường: `text-base` cho khối công ty/liên hệ khi đủ không gian.
- Liên kết: `text-sm md:text-base`.
- Hotline: `text-lg`, `font-semibold`.

## Accessibility và độ tin cậy

- Mọi control có thể click phải cao ít nhất `40px` trên desktop và `44px` trên mobile khi khả thi.
- Dùng đúng ngữ nghĩa cho `button`, `a`, `nav`, `main`, `section`, `article`, `aside` và heading.
- Mọi ảnh phải có nội dung `alt` hữu ích.
- Giữ thông tin giá, tồn kho, bảo hành, vận chuyển, đổi trả, liên hệ và doanh nghiệp hiển thị rõ, dễ đọc.

## Quy ước Tailwind

- Ưu tiên utility Tailwind hơn CSS tùy chỉnh.
- Chỉ dùng kích thước arbitrary tùy chỉnh khi cần khớp chính xác template.
- Tránh JSX một dòng dày đặc cho UI phức tạp.
- Giữ class dễ đọc và nhóm theo: layout → spacing → border/background → typography → states.
