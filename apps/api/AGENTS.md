# Chỉ dẫn Codex — API NestJS Prisma

Các chỉ dẫn này áp dụng cho API. Tuân theo chúng mỗi khi Codex thêm hoặc thay đổi code backend.

## Stack dự án

- Framework: NestJS với adapter Express.
- Truy cập database: chỉ dùng Prisma qua `src/prisma/prisma.service.ts`.
- Validation: class DTO trong `src/modules/<module>/dto/` dùng `class-validator` và `class-transformer`.
- Dạng response: controller trả về `ok(data, meta?)` từ `src/common/api-response.ts`.
- Gốc module: `src/modules/<module>/`.

## Luồng module bắt buộc

Chỉ dùng hướng sau:

```txt
controller -> service -> repository -> Prisma
repository -> projector -> public response shape, when mapping is needed
```

Controller và service không bao giờ được inject hoặc gọi trực tiếp `PrismaService`.

## Quy ước thư mục

```txt
src/modules/<module>/
  <module>.module.ts
  <module>.controller.ts
  <module>.service.ts
  <module>.repo.ts
  <module>.projector.ts        # optional, use for mapped responses
  dto/
    *.dto.ts
```

## Quy tắc Prisma

- Sửa `prisma/schema.prisma` khi thay đổi model.
- Giữ datasource provider hiện tại trừ khi toàn bộ dự án được migrate.
- Dùng `@map`, `@@map`, `@relation` và `@@index` nhất quán với các bảng hiện có.
- Sau khi thay đổi schema, chạy `npm run prisma:generate` và tạo/áp dụng migration bằng workflow dự án.

## Quy tắc DTO và validation

- Mọi request body/query nhận dữ liệu có cấu trúc phải có một class DTO.
- Không dùng `Record<string, unknown>` trong controller hoặc service cho API body.
- Dùng `@IsString`, `@IsOptional`, `@IsInt`, `@Min`, `@Max`, `@IsEmail`, `@IsBoolean`, `@IsEnum`,
  `@Type(() => Number)` và các decorator tương tự.
- Giá trị mặc định cho trường phân trang/sắp xếp/trạng thái tùy chọn phải nằm trong class DTO.
- Giữ DTO đồng bộ với form frontend.

## Quy tắc repository

- Repository là layer duy nhất được phép truy cập Prisma.
- Constructor nên inject `PrismaService`.
- Dùng `select`/`include` có chủ đích và không bao giờ lộ trường nhạy cảm như mật khẩu người dùng.
- Repository có thể throw Nest HTTP exception cho lỗi nghiệp vụ dựa trên database.
- Không catch rồi throw lại lỗi Prisma chỉ để log.

## Quy tắc service

- Service nhận DTO đã validate từ controller.
- Service điều phối quy tắc nghiệp vụ và gọi repository.
- Service không bọc dữ liệu bằng `ok()`; controller thực hiện việc đó.
- Service không import kiểu Prisma trừ khi chỉ cần cho kiểu enum public không liên quan database.

## Quy tắc controller

- Controller chỉ nhận DTO/param, gọi service và trả về `ok(...)`.
- Route admin được bảo vệ phải dùng `JwtAuthGuard` và `AdminRoleGuard`.
- Không đặt quy tắc nghiệp vụ hoặc truy vấn Prisma trong controller.

## Quy tắc projector

Dùng `<module>.projector.ts` khi trả về row Prisma phức tạp.

- Projector phải là hàm ánh xạ thuần túy.
- Chuyển Decimal thành number/string nhất quán.
- Chuyển BigInt thành string.
- Loại bỏ trường nhạy cảm.
- Không gọi database và không chứa logic nghiệp vụ trong projector.

## Checklist sẵn sàng cho frontend

Sau khi thay đổi endpoint, kiểm tra các màn hình frontend/admin sử dụng endpoint đó:

- Endpoint danh sách trả về mọi trường cho bảng/card và metadata phân trang/lọc khi cần.
- Endpoint chi tiết trả về các trường lồng nhau được UI hiển thị.
- DTO tạo/sửa gồm mọi trường trong form.
- Endpoint admin không bao giờ trả về mật khẩu.
