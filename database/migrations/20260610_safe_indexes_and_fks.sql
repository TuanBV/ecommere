ALTER TABLE product
  ADD INDEX idx_product_category_id (category_id),
  ADD INDEX idx_product_brand_id (brand_id),
  ADD INDEX idx_product_policy_id (policy_id),
  ADD INDEX idx_product_status_del (status, del_flag),
  ADD INDEX idx_product_sold_count (sold_count),
  ADD INDEX idx_product_created_date (created_date),
  ADD INDEX idx_product_sku (sku),
  ADD INDEX idx_product_slug (slug(191));

ALTER TABLE product_image
  ADD INDEX idx_product_image_product_sort (product_id, sort_order, del_flag);

ALTER TABLE order_detail
  ADD INDEX idx_order_detail_order_id (order_id),
  ADD INDEX idx_order_detail_product_id (product_id);

ALTER TABLE orders
  ADD INDEX idx_orders_status (status),
  ADD INDEX idx_orders_customer_phone (customer_phone),
  ADD INDEX idx_orders_created_date (created_date);

ALTER TABLE review
  ADD INDEX idx_review_product_id (product_id);

ALTER TABLE review_image
  ADD INDEX idx_review_image_review_id (review_id);

ALTER TABLE news
  ADD INDEX idx_news_brand_id (brand_id),
  ADD INDEX idx_news_author_id (author_id),
  ADD INDEX idx_news_public (status, del_flag, created_date);

ALTER TABLE banner
  ADD INDEX idx_banner_public (is_active, del_flag, position);

ALTER TABLE slider
  ADD INDEX idx_slider_public (is_active, del_flag, position);

ALTER TABLE user_image
  ADD INDEX idx_user_image_user_id (user_id);

-- Add foreign keys only after validating orphan rows.
-- ALTER TABLE product ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES category(id);
-- ALTER TABLE product ADD CONSTRAINT fk_product_brand FOREIGN KEY (brand_id) REFERENCES brand(id);
-- ALTER TABLE product ADD CONSTRAINT fk_product_policy FOREIGN KEY (policy_id) REFERENCES policy(id);
-- ALTER TABLE product_image ADD CONSTRAINT fk_product_image_product FOREIGN KEY (product_id) REFERENCES product(id);
-- ALTER TABLE order_detail ADD CONSTRAINT fk_order_detail_order FOREIGN KEY (order_id) REFERENCES orders(id);
-- ALTER TABLE order_detail ADD CONSTRAINT fk_order_detail_product FOREIGN KEY (product_id) REFERENCES product(id);
-- ALTER TABLE review ADD CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES product(id);
-- ALTER TABLE review_image ADD CONSTRAINT fk_review_image_review FOREIGN KEY (review_id) REFERENCES review(id);
