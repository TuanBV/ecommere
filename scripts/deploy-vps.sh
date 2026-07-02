#!/usr/bin/env sh
set -eu

docker compose pull db || true
docker compose up -d db
docker compose exec -T db sh -c 'until mariadb-admin ping -uroot -proot --silent; do sleep 1; done'
docker compose exec -T db mariadb -uroot -proot -e "
CREATE DATABASE IF NOT EXISTS core CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'root' WITH GRANT OPTION;
FLUSH PRIVILEGES;
"

PRODUCTS_COUNT="$(
  docker compose exec -T db mariadb -N -uroot -proot core -e "
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'product';
  "
)"

if [ "$PRODUCTS_COUNT" = "0" ]; then
  sh scripts/restore-db.sh
else
  docker compose exec -T db mariadb -uroot -proot core -e "
  SELECT COUNT(*) AS products FROM product WHERE COALESCE(del_flag, 0) = 0;
  "
fi

docker compose up -d --build api web
docker compose ps
