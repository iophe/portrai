-- name: GetPriceByID :one
SELECT 
    id,
    unit_amount,
    currency,
    type,
    interval,
    interval_count
FROM payment.prices 
WHERE id = @price_id::text;

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

-- name: UpsertPayment :exec
INSERT INTO payment.payments (
   id,
   user_id,
   status,
   price_id,
   amount,
   currency,
   metadata,
   created,
   updated_at
) VALUES (
   @payment_id::text,
   @user_id::uuid,
   @status::payment_status,
   @price_id::text,
   @amount::integer,
   @currency::text,
   @metadata::jsonb,
   @created_at::timestamp with time zone,
   @updated_at::timestamp with time zone
) ON CONFLICT (id) DO UPDATE SET
   status = EXCLUDED.status,
   amount = EXCLUDED.amount,
   metadata = EXCLUDED.metadata,
   updated_at = CURRENT_TIMESTAMP;

-- name: GetPaymentByID :one
SELECT 
   id,
   user_id,
   status,
   price_id,
   amount,
   currency,
   created
FROM payment.payments
WHERE id = @payment_id::text;

-- name: GetLatestPaymentByUserID :one
SELECT 
   p.id,
   p.status,
   p.price_id,
   p.amount,
   p.currency,
   p.created,
   pr.unit_amount,
   pr.interval,
   pr.interval_count
FROM payment.payments p
JOIN payment.prices pr ON p.price_id = pr.id
WHERE p.user_id = @user_id::uuid
AND p.status = 'completed'
ORDER BY p.created DESC
LIMIT 1;

-- name: UpdatePaymentStatus :exec
UPDATE payment.payments SET
   status = @status::payment_status,
   updated_at = CURRENT_TIMESTAMP
WHERE id = @payment_id::text;

-- name: DeletePayment :exec
DELETE FROM payment.payments 
WHERE id = @payment_id::text;