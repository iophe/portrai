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


-- name: GetCustomerByUserID :one
SELECT 
    id,
    stripe_customer_id,
    email
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
    stripe_customer_id,
    email
FROM payment.customers 
WHERE stripe_customer_id = @stripe_customer_id::text;

-- name: CreateCustomer :exec
INSERT INTO payment.customers (
    id,
    stripe_customer_id,
    email
) VALUES (
    @user_id::uuid,
    @stripe_customer_id::text,
    @email::text
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
   stripe_customer_id,
   price_id,
   amount,
   currency,
   metadata,
   created_at
) VALUES (
   @payment_id::text,
   @user_id::uuid,
   @stripe_customer_id::text,
   @price_id::text,
   @amount::integer,
   @currency::text,
   @metadata::jsonb,
   @created_at::timestamp with time zone
);

-- name: DeletePayment :exec
DELETE FROM payment.payments 
WHERE payment_id = @payment_id::text;

-- name: GetConsumptionCost :one
SELECT
    total_cost_per_payment
FROM payment.usage_analytics 
WHERE user_id = @user_id::uuid;

-- name: AddProductUsage :exec
INSERT INTO payment.usage_history (
   user_id,
   input_token_used,
   price_rate_input_token,
   cached_input_token_used,
   price_rate_cached_input_token_used,
   cached_input_token_created,
   price_rate_cached_input_token_created,
   output_token_used,
   price_rate_output_token,
   model,
   duration,
   valid,
   date
) VALUES (
   @user_id::uuid,
   @input_token_used::bigint,
   @price_rate_input_token::decimal,
   @cached_input_token_used::bigint,
   @price_rate_cached_input_token_used::decimal,
   @cached_input_token_created::bigint,
   @price_rate_cached_input_token_created::decimal,
   @output_token_used::bigint,
   @price_rate_output_token::decimal,
   @model::text,
   @duration::interval,
   @valid::boolean,
   CURRENT_TIMESTAMP
);

-- name: GetPriceForPayment :one
SELECT p.unit_amount
FROM payment.validity v
JOIN payment.prices p ON v.price_id = p.id
WHERE v.user_id = @user_id::uuid
LIMIT 1;

-- name: GetUserValidityStatus :one
SELECT 
    created_at,
    expired_at,
    CASE 
        WHEN expired_at IS NULL THEN false
        WHEN expired_at > current_timestamp THEN true
        ELSE false
    END AS is_valid
FROM payment.validity
WHERE user_id = @user_id::uuid;

-- name: GetUserPaymentHistory :many
SELECT 
    amount,
    currency,
    created_at
FROM payment.payments
WHERE user_id = @user_id::uuid
ORDER BY created_at DESC;