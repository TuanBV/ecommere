#!/usr/bin/env sh
set -eu

docker compose exec -T db mariadb -uroot -proot -e "
CREATE DATABASE IF NOT EXISTS core CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'root' WITH GRANT OPTION;
FLUSH PRIVILEGES;
"

PRODUCTS_TABLE="$(
  docker compose exec -T db mariadb -N -uroot -proot core -e "
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'product';
  "
)"

if [ "$PRODUCTS_TABLE" = "0" ]; then
  echo "Missing table product. Run: sh scripts/restore-db.sh"
  exit 1
fi

docker compose exec -T db mariadb -uroot -proot core -e "
SELECT COUNT(*) AS products FROM product WHERE COALESCE(del_flag, 0) = 0;
SELECT COUNT(*) AS categories FROM category WHERE COALESCE(del_flag, 0) = 0;
SELECT COUNT(*) AS brands FROM brand WHERE COALESCE(del_flag, 0) = 0;
"
