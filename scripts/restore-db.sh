#!/usr/bin/env sh
set -eu

if [ ! -f scripts/dump-core.sql ]; then
  echo "Missing scripts/dump-core.sql"
  exit 1
fi

docker compose up -d db
docker compose exec -T db sh -c 'until mariadb-admin ping -uroot -proot --silent; do sleep 1; done'
docker compose exec -T db mariadb -uroot -proot -e "
CREATE DATABASE IF NOT EXISTS core CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'root' WITH GRANT OPTION;
FLUSH PRIVILEGES;
"
docker compose exec -T db mariadb -uroot -proot core < scripts/dump-core.sql
docker compose exec -T db mariadb -uroot -proot core < database/init/02-admin-dev.sql
docker compose exec -T db mariadb -uroot -proot core < database/migrations/20260702_facebook_posts.sql
docker compose exec -T db mariadb -uroot -proot core -e "
SELECT COUNT(*) AS products FROM product WHERE COALESCE(del_flag, 0) = 0;
SELECT COUNT(*) AS categories FROM category WHERE COALESCE(del_flag, 0) = 0;
SELECT COUNT(*) AS brands FROM brand WHERE COALESCE(del_flag, 0) = 0;
"
