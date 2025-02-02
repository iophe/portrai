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

-- name: UpsertSubscription :exec
INSERT INTO payment.subscriptions (
    id,
    user_id,
    status,
    price_id,
    quantity,
    cancel_at_period_end,
    current_period_start,
    current_period_end,
    created,
    ended_at,
    cancel_at,
    canceled_at,
    trial_start,
    trial_end
) VALUES (
    @subscription_id::text,
    @user_id::uuid,
    @status::subscription_status,
    @price_id::text,
    @quantity::integer,
    @cancel_at_period_end::boolean,
    @current_period_start::timestamp with time zone,
    @current_period_end::timestamp with time zone,
    @created_at::timestamp with time zone,
    NULLIF(@ended_at::timestamp with time zone, '1970-01-01T00:00:00Z'),
    NULLIF(@cancel_at::timestamp with time zone, '1970-01-01T00:00:00Z'),
    NULLIF(@canceled_at::timestamp with time zone, '1970-01-01T00:00:00Z'),
    NULLIF(@trial_start::timestamp with time zone, '1970-01-01T00:00:00Z'),
    NULLIF(@trial_end::timestamp with time zone, '1970-01-01T00:00:00Z')
) ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    quantity = EXCLUDED.quantity,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    ended_at = EXCLUDED.ended_at,
    cancel_at = EXCLUDED.cancel_at,
    canceled_at = EXCLUDED.canceled_at,
    trial_start = EXCLUDED.trial_start,
    trial_end = EXCLUDED.trial_end;

-- name: DeleteSubscription :exec
DELETE FROM payment.subscriptions 
WHERE id = @subscription_id::text;

-- name: GetSubscriptionByID :one
SELECT 
    id,
    user_id,
    status,
    price_id,
    cancel_at_period_end
FROM payment.subscriptions 
WHERE id = @subscription_id::text;

-- name: GetActiveSubscriptionByUserID :one
SELECT 
    s.id,
    s.status,
    s.price_id,
    s.current_period_end,
    p.unit_amount,
    p.currency,
    p.interval,
    p.interval_count
FROM payment.subscriptions s
JOIN payment.prices p ON s.price_id = p.id
WHERE s.user_id = @user_id::uuid 
AND s.status IN ('active', 'trialing')
ORDER BY s.created DESC
LIMIT 1;

-- name: UpdateSubscriptionStatus :exec
UPDATE payment.subscriptions
SET 
    status = @status::subscription_status,
    canceled_at = CASE 
        WHEN @status::subscription_status = 'canceled' THEN CURRENT_TIMESTAMP
        ELSE canceled_at
    END
WHERE id = @subscription_id::text;