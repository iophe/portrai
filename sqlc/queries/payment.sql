-- name: GetPriceByPlan :one
SELECT 
    id,
    product_id,
    unit_amount,
    currency,
    type,
    interval,
    interval_count
FROM payment.prices 
WHERE plan = @plan::text;

-- name: GetPriceByAmount :one
SELECT id 
FROM payment.prices 
WHERE unit_amount = @unit_amount::int
AND currency = @currency::text
LIMIT 1;

-- name: GetCustomerByUserID :one
SELECT 
    id,
    stripe_customer_id
FROM payment.customers 
WHERE id = @user_id::uuid;

-- name: GetValidityPeroidByProductID :one
SELECT 
    validity_period
FROM payment.products 
WHERE id = @product_id::text;

-- name: GetCustomerByStripeID :one
SELECT 
    id,
    stripe_customer_id
FROM payment.customers 
WHERE stripe_customer_id = @stripe_customer_id::text;

-- name: CreateCustomer :exec
INSERT INTO payment.customers (
    id,
    stripe_customer_id
) VALUES (
    @user_id::uuid,
    @stripe_customer_id::text
);
-- name: UpsertPaymentValidity :exec
INSERT INTO payment.validity (
    user_id,
    payment_id,
    price_id,
    expired_at,
    metadata
) VALUES (
    @user_id::uuid,
    @payment_id::text,
    @price_id::text,
    @expired_at::timestamptz,
    @metadata::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
    payment_id = EXCLUDED.payment_id,
    price_id = EXCLUDED.price_id,
    expired_at = EXCLUDED.expired_at,
    metadata = EXCLUDED.metadata;

-- name: GetPaymentValidity :one
SELECT
    expired_at
FROM payment.validity 
WHERE user_id = @user_id::uuid;

-- name: InsertPayment :exec
INSERT INTO payment.payments (
   payment_id,
   user_id,
   price_id,
   amount,
   currency,
   metadata,
   created_at
) VALUES (
   @payment_id::text,
   @user_id::uuid,
   @price_id::text,
   @amount::integer,
   @currency::text,
   @metadata::jsonb,
   @created_at::timestamp with time zone
);

-- name: DeletePayment :exec
DELETE FROM payment.payments 
WHERE payment_id = @payment_id::text;