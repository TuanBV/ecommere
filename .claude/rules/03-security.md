# Bảo mật

- Không đọc, in ra, log, hoặc commit nội dung secret: `.env`, `.env.*`, API key, JWT secret (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`), private key, certificate, token, connection string chứa password (`DATABASE_URL`).
- Không hardcode secret/credential vào source code. Secret luôn đọc qua `ConfigService`/environment variable, đúng convention hiện có trong `apps/api`.
- Không chạy command phá hủy dữ liệu (`rm -rf`, `git reset --hard`, `git clean -fdx`, `docker compose down -v`, DROP TABLE/DATABASE) nếu chưa có yêu cầu rõ ràng và xác nhận từ người dùng — `docker compose down -v` xoá volume database, `scripts/restore-db.sh` ghi đè dữ liệu.
- Với migration database (`database/migrations/**`), deploy, Docker production, Nginx production: luôn hỏi xác nhận trước khi thực thi, vì các thay đổi này ảnh hưởng hệ thống đang chạy.
- Không expose source map production, không log thông tin nhạy cảm (password, token, số thẻ) ra console/log server.
- Không thêm third-party script/style từ CDN không kiểm soát mà chưa đánh giá CSP, Subresource Integrity (SRI), ảnh hưởng performance và privacy.
- Với các module `auth`, `checkout`, `admin`, endpoint liên quan order/payment/user: mọi thay đổi phải được review dưới góc độ bảo mật (JWT guard, role guard, input validation qua DTO, không trả password/secret trong response).
- Không tự ý thay đổi cấu hình security header, CORS (`app.enableCors`), CSP nếu chưa hiểu rõ tác động — tham khảo `.claude/rules/web-quality/best-practices.md`.
