CREATE TABLE IF NOT EXISTS facebook_post (
  id VARCHAR(36) NOT NULL,
  page_id VARCHAR(100) NOT NULL,
  page_name VARCHAR(255) NULL,
  page_access_token LONGTEXT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(1000) NULL,
  image_url VARCHAR(1000) NULL,
  facebook_post_id VARCHAR(255) NULL,
  graph_version VARCHAR(20) NULL DEFAULT 'v20.0',
  status VARCHAR(30) NULL DEFAULT 'DRAFT',
  last_error TEXT NULL,
  scheduled_at TIMESTAMP(6) NULL,
  published_at TIMESTAMP(6) NULL,
  del_flag INT NULL DEFAULT 0,
  created_date TIMESTAMP(6) NULL,
  updated_date TIMESTAMP(6) NULL,
  PRIMARY KEY (id),
  INDEX idx_facebook_post_page (page_id),
  INDEX idx_facebook_post_status (status),
  INDEX idx_facebook_post_scheduled (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE facebook_post
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP(6) NULL AFTER last_error,
  ADD INDEX IF NOT EXISTS idx_facebook_post_scheduled (scheduled_at);
