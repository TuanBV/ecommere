# Core Ecommerce

Project ecommerce fullstack da duoc dong goi Docker. Chi can Docker Desktop la co the chay database, backend va frontend.

## 1. Yeu Cau

Can cai san:

- Docker Desktop

Khong bat buoc cai Node.js, npm, MySQL client neu chi chay bang Docker.

## 2. Chay Project

Mo PowerShell tai thu muc project va chay:

```powershell
docker compose up --build
```

Sau khi cac container chay xong, mo:

- Web: `http://localhost:3000`
- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/docs`
- Database host port: `localhost:3307`

## 3. Lan Chay Dau Tien

Docker se tu dong:

1. Tao MariaDB database `core`.
2. Import file `dump-core-202606100141.sql` vao database.
3. Build backend NestJS trong `apps/api`.
4. Build frontend Next.js trong `apps/web`.
5. Chay 3 service: `db`, `api`, `web`.

Ban khong can chay lenh import MySQL thu cong.

## 4. Chay Nen Background

Neu muon chay ngam:

```powershell
docker compose up --build -d
```

Xem container:

```powershell
docker compose ps
```

Xem log tat ca service:

```powershell
docker compose logs -f
```

Xem log rieng backend:

```powershell
docker compose logs -f api
```

Xem log rieng frontend:

```powershell
docker compose logs -f web
```

Xem log rieng database:

```powershell
docker compose logs -f db
```

## 5. Dung Project

Dung container nhung giu database volume:

```powershell
docker compose down
```

Lan sau chay lai:

```powershell
docker compose up -d
```

## 6. Reset Database Va Import Lai Dump

MariaDB chi tu import dump o lan dau tien khi volume database chua ton tai.

Neu muon xoa database cu va import lai dump tu dau:

```powershell
docker compose down -v
docker compose up --build
```

Can than: lenh `docker compose down -v` se xoa volume database hien tai.

## 7. Kiem Tra Database

Vao MariaDB shell trong container:

```powershell
docker exec -it ecommere-db-1 mariadb -uroot -proot core
```

Kiem tra bang:

```sql
SHOW TABLES;
SELECT COUNT(*) FROM product;
SELECT COUNT(*) FROM category;
SELECT COUNT(*) FROM brand;
```

Thoat:

```sql
exit;
```

## 8. Kiem Tra API

PowerShell:

```powershell
Invoke-RestMethod "http://localhost:3001/api/products?limit=2"
```

Hoac mo Swagger:

```text
http://localhost:3001/docs
```

## 9. Dang Nhap Quan Tri

Mo trang admin:

```text
http://localhost:3000/admin
```

Tai khoan admin local:

```text
Username: demo
Password: Admin@123
```

Sau khi dang nhap co cac luong:

- Xem dashboard don hang/doanh thu.
- Quan ly tai khoan: tao, sua, xoa mem, doi mat khau, phan quyen.
- Quan ly setting tu bang `sys_param`.
- Dang xuat, xoa token khoi trinh duyet.

Quy uoc role hien tai:

- `0`: Admin
- `1`: Nhan vien
- `2`: Khach hang

## 10. Cau Hinh Docker

File chinh:

```text
docker-compose.yml
```

Services:

- `db`: MariaDB 10.11, tu import `dump-core-202606100141.sql`
- `api`: NestJS backend, chay port `3001`
- `web`: Next.js frontend, chay port `3000`

Database trong Docker network:

```text
mysql://root:root@db:3306/core
```

Database tu may host:

```text
mysql://root:root@localhost:3307/core
```

## 11. Port Dang Dung

Mac dinh:

- `3000`: Next.js web
- `3001`: NestJS API
- `3307`: MariaDB exposed ra may host

Neu may ban da dung port `3307`, co the doi bang bien moi truong khi chay:

```powershell
$env:DB_PORT="3308"
docker compose up --build
```

Sau do database host port se la `localhost:3308`. API trong Docker van tu ket noi qua `db:3306`, khong can sua gi them.

## 12. Loi Thuong Gap

### Loi: port `3000`, `3001` hoac `3307` da duoc dung

Kiem tra process dang giu port:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
Get-NetTCPConnection -LocalPort 3001 -State Listen
Get-NetTCPConnection -LocalPort 3307 -State Listen
```

Tat process theo `OwningProcess`:

```powershell
Stop-Process -Id <PID> -Force
```

Hoac doi DB port nhu muc 10.

### Web len nhung khong co data

Kiem tra API:

```powershell
Invoke-RestMethod "http://localhost:3001/api/products?limit=2"
```

Neu API loi, xem log:

```powershell
docker compose logs -f api
docker compose logs -f db
```

### Database khong co bang

Co the volume database da duoc tao truoc do nhung chua import dump. Reset database:

```powershell
docker compose down -v
docker compose up --build
```

### Docker build loi do cache cu

Build lai khong dung cache:

```powershell
docker compose build --no-cache
docker compose up
```

## 13. Thu Muc Uploads Local

Du lieu trong dump luu anh dang path:

```text
/uploads/...
```

Project da tao san thu muc local:

```text
uploads/
uploads/banners/
uploads/brands/
uploads/categories/
uploads/news/
uploads/products/
uploads/reviews/
uploads/sliders/
uploads/users/
```

Ban chi can copy anh vao dung duong dan tuong ung voi database. Vi du database co:

```text
/uploads/products/robot-hut-bui-demo
```

Thi file local can nam o:

```text
uploads/products/robot-hut-bui-demo
```

API serve static file tai:

```text
http://localhost:3001/uploads/...
```

Docker Compose bind mount thu muc local:

```text
./uploads:/app/uploads
```

Vi vay neu ban them/xoa anh trong `uploads/`, container API se doc truc tiep tu thu muc nay.

## 14. Ghi Chu Ve Anh San Pham

Mac dinh media base cua project dang la:

```text
http://localhost:3001
```

Nen anh trong frontend se load theo dang:

```text
http://localhost:3001/uploads/products/...
```

## 15. Development Khong Dung Docker

Neu muon dev local bang Node.js thi xem Docker config de lay env. Cach khuyen nghi hien tai van la:

```powershell
docker compose up --build
```
