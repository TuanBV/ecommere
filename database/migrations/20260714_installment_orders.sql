ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS installment_term INT NULL AFTER payment_method,
  ADD COLUMN IF NOT EXISTS installment_down_payment DECIMAL(15, 2) NULL AFTER installment_term,
  ADD COLUMN IF NOT EXISTS installment_monthly_amount DECIMAL(15, 2) NULL
    AFTER installment_down_payment;
