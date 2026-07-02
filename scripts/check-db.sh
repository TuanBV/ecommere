#!/usr/bin/env sh
set -eu

docker compose exec -T db mariadb -uroot -proot -e "
CREATE DATABASE IF NOT EXISTS core CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

docker compose exec -T db mariadb -uroot -proot core -e "
SELECT COUNT(*) AS products FROM product WHERE COALESCE(del_flag, 0) = 0;
SELECT COUNT(*) AS categories FROM category WHERE COALESCE(del_flag, 0) = 0;
SELECT COUNT(*) AS brands FROM brand WHERE COALESCE(del_flag, 0) = 0;
"
