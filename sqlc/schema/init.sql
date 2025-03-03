CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS payment;

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

/******************************************************************************************/
/******************************** SECTION : USER ******************************************/
/******************************************************************************************/
/**
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
create table public.users (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,

  full_name text,

  current_resume_version text not null default 'main',

  -- The customer's billing address, stored in JSON format.
  billing_address jsonb,
  -- Stores your customer's payment instruments.
  payment_method jsonb,

  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE SCHEMA IF NOT EXISTS payment;
/**
* CUSTOMERS
* Note: this is a private table that contains a mapping of user IDs to Stripe customer IDs.
*/
create table payment.customers (
  -- UUID from auth.users
  id uuid primary key not null references auth.users on delete cascade,
  -- The user's customer ID in Stripe. User must not be able to update this.
  stripe_customer_id text
);

/******************************************************************************************/
/******************************** SECTION : PAYMENT ***************************************/
/******************************************************************************************/

/**
* PRODUCTS
* Note: products are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create table payment.products (
  -- Product ID from Stripe, e.g. prod_1234.
  id text primary key,
  -- Whether the product is currently available for purchase.
  active boolean,
  -- The product's name, meant to be displayable to the customer. Whenever this product is sold via a subscription, name will show up on associated invoice line item descriptions.
  name text,
  validity_period interval,
  -- The product's description, meant to be displayable to the customer. Use this field to optionally store a long form explanation of the product being sold for your own rendering purposes.
  description text,
  -- A URL of the product image in Stripe, meant to be displayable to the customer.
  image text,
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb
);


/**
* PRICES
* Note: prices are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create type pricing_type as enum ('one_time', 'recurring');
create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');
create table payment.prices (
  -- Price ID from Stripe, e.g. price_1234.
  id text primary key,
  -- The ID of the prduct that this price belongs to.
  product_id text references payment.products,
  -- Whether the price can be used for new purchases.
  active boolean,
  -- Plan type.
  plan text,
  -- A brief description of the price.
  description text,
  -- The unit amount as a positive integer in the smallest currency unit (e.g., 100 cents for US$1.00 or 100 for ¥100, a zero-decimal currency).
  unit_amount bigint,
  -- Three-letter ISO currency code, in lowercase.
  currency text check (char_length(currency) = 3),
  -- One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or a recurring (subscription) purchase.
  type pricing_type,
  -- The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.
  interval pricing_plan_interval,
  -- The number of intervals (specified in the `interval` attribute) between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months.
  interval_count integer,
  -- Default number of trial days when subscribing a customer to this price using [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
  trial_period_days integer,
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb
);


/**
 * PAYMENTS
 * Note: payments are created and managed in Stripe and synced to our DB via Stripe webhooks.
 */
 create table payment.validity (
    user_id uuid not null references auth.users on delete cascade unique,
    -- Payment ID from Stripe, e.g. pi_1234.
    payment_id text primary key,
    -- ID of the price that created this payment.
    price_id text references payment.prices,
    -- Time at which the payment was created.
    created_at timestamp with time zone default current_timestamp,
    -- User payment validity, once expired the user loses access to paying features
    expired_at timestamp with time zone,
    -- Set of key-value pairs, used to store additional information about the object in a structured format.
    metadata jsonb
);

create table payment.payments (
    -- Payment ID from Stripe, e.g. pi_1234.
    payment_id text primary key,

    user_id uuid not null references auth.users on delete cascade,

    -- Set of key-value pairs, used to store additional information about the object in a structured format.
    metadata jsonb,
    -- ID of the price that created this payment.
    price_id text references payment.prices,
    -- Amount paid in cents/pence
    amount integer,
    -- Currency of the payment
    currency text not null,
    -- Time at which the payment was created.
    created_at timestamp with time zone default current_timestamp
);

/******************************************************************************************/
/******************************** SECTION : RESUME ****************************************/
/******************************************************************************************/

CREATE TABLE public.resume_items (
  item_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  item_type text NOT NULL, -- 'experience', 'education', 'skill', 'certificate', 'project'
  
  -- Common fields
  title text NOT NULL DEFAULT '', -- job_title, degree, skill_name, certificate_name, project_title
  subtitle text DEFAULT '', -- company_name, school, skill_type, issuer, project_subtitle
  location text DEFAULT '',
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  description text DEFAULT '',
  priority integer NOT NULL DEFAULT 0,
  is_visible boolean DEFAULT true,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  version text NOT NULL DEFAULT 'main',
  
  -- Type-specific fields stored in JSONB
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT current_timestamp,
  updated_at timestamp with time zone DEFAULT current_timestamp
);

-- Notes for all resume items
CREATE TABLE public.resume_item_notes (
  note_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  item_id bigint NOT NULL REFERENCES public.resume_items ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  note_type text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT current_timestamp,
  updated_at timestamp with time zone DEFAULT current_timestamp
);

-- Set priority based on item type and user
CREATE OR REPLACE FUNCTION set_resume_item_priority()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.priority = 0 THEN
        SELECT COALESCE(MAX(priority), 0) + 1 INTO NEW.priority
        FROM public.resume_items
        WHERE user_id = NEW.user_id AND item_type = NEW.item_type;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_resume_item_priority
BEFORE INSERT ON public.resume_items
FOR EACH ROW
EXECUTE FUNCTION set_resume_item_priority();

-- Update timestamp trigger
CREATE TRIGGER update_resume_items_updated_at
BEFORE UPDATE ON public.resume_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Notes timestamp trigger
CREATE TRIGGER update_resume_item_notes_updated_at
BEFORE UPDATE ON public.resume_item_notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX resume_items_user_idx ON public.resume_items(user_id);
CREATE INDEX resume_items_type_idx ON public.resume_items(item_type);
CREATE INDEX resume_items_user_type_idx ON public.resume_items(user_id, item_type);