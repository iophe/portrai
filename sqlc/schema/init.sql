CREATE SCHEMA IF NOT EXISTS public;

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
* SUBSCRIPTIONS
* Note: subscriptions are created and managed in Stripe and synced to our DB via Stripe webhooks.
*/
create type subscription_status as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
create table payment.subscriptions (
  -- Subscription ID from Stripe, e.g. sub_1234.
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  -- The status of the subscription object, one of subscription_status type above.
  status subscription_status,
  -- Set of key-value pairs, used to store additional information about the object in a structured format.
  metadata jsonb,
  -- ID of the price that created this subscription.
  price_id text references payment.prices,
  -- Quantity multiplied by the unit amount of the price creates the amount of the subscription. Can be used to charge multiple seats.
  quantity integer,
  -- If true the subscription has been canceled by the user and will be deleted at the end of the billing period.
  cancel_at_period_end boolean,
  -- Time at which the subscription was created.
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Start of the current period that the subscription has been invoiced for.
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  -- End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
  -- If the subscription has ended, the timestamp of the date the subscription ended.
  ended_at timestamp with time zone default timezone('utc'::text, now()),
  -- A date in the future at which the subscription will automatically get canceled.
  cancel_at timestamp with time zone default timezone('utc'::text, now()),
  -- If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.
  canceled_at timestamp with time zone default timezone('utc'::text, now()),
  -- If the subscription has a trial, the beginning of that trial.
  trial_start timestamp with time zone default timezone('utc'::text, now()),
  -- If the subscription has a trial, the end of that trial.
  trial_end timestamp with time zone default timezone('utc'::text, now())
);

/******************************************************************************************/
/******************************** SECTION : RESUME ****************************************/
/******************************************************************************************/


/**
* Experiences
* 
*/
create table public.experiences (
  experience_id bigint primary key generated always as identity,
  user_id uuid not null references auth.users on delete cascade,
  company_name text not null default '',
  job_title text not null default '',
  location text not null default '',
  start_date date not null default current_date,
  optional_end_date date,
  is_current boolean default false,
  description text not null default '',
  priority integer not null default 0,
  tags text[] not null default ARRAY[]::text[],
  notes jsonb[] not null default ARRAY[]::jsonb[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON public.experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX experiences_user_idx ON public.experiences(user_id);

/**
* Educations
* 
*/
create table public.educations (
  education_id bigint primary key generated always as identity,
  user_id uuid not null references auth.users on delete cascade,
  school text not null default '',
  degree text not null default '',
  location text not null default '',
  start_date date not null default current_date,
  optional_end_date date,
  is_current boolean default false,
  description text not null default '',
  priority integer not null default 0,
  tags text[] not null default ARRAY[]::text[],
  notes jsonb[] not null default ARRAY[]::jsonb[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

CREATE TRIGGER update_educations_updated_at
    BEFORE UPDATE ON public.educations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX educations_user_idx ON public.educations(user_id);

/**
* Skills
* 
*/
CREATE TYPE skill_type AS ENUM ('soft', 'technical', 'language');
CREATE TYPE skill_level AS ENUM ('beginner', 'amateur', 'competent', 'proficient', 'expert');

create table public.skills (
  skill_id bigint primary key generated always as identity,
  user_id uuid not null references auth.users on delete cascade,
  skill_name text not null default '',
  optional_skill_type skill_type,
  optional_skill_level skill_level,
  description text not null default '',
  priority integer not null default 0,
  tags text[] not null default ARRAY[]::text[],
  notes jsonb[] not null default ARRAY[]::jsonb[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX skills_user_idx ON public.skills(user_id);


/**
* Certificates
* 
*/
create table public.certificates (
  certificate_id bigint primary key generated always as identity,
  user_id uuid not null references auth.users on delete cascade,
  certificate_name text not null default '',
  optional_issuer text,
  optional_location text,
  optional_granted_date date not null default current_date,
  description text not null default '',
  priority integer not null default 0,
  tags text[] not null default ARRAY[]::text[],
  notes jsonb[] not null default ARRAY[]::jsonb[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX certificates_user_idx ON public.certificates(user_id);

/**
* Projects
* 
*/
create table public.projects (
  project_id bigint primary key generated always as identity,
  user_id uuid not null references auth.users on delete cascade,
  project_title text not null default '',
  optional_project_subtitle text,
  optional_start_date date,
  optional_end_date date,
  is_current boolean default false,
  description text not null default '',
  priority integer not null default 0,
  tags text[] not null default ARRAY[]::text[],
  notes jsonb[] not null default ARRAY[]::jsonb[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX projects_user_idx ON public.projects(user_id);