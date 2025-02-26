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
  is_visible boolean default true,
  tags text[] not null default ARRAY[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);
-- create a function to handle the priority per user
create or replace function set_experience_priority()
returns trigger as $$
begin
    if new.priority = 0 then
        select coalesce(max(priority), 0) + 1 into new.priority
        from public.experiences
        where user_id = new.user_id;
    end if;
    return new;
end;
$$ language plpgsql;

-- create the trigger
create trigger set_experience_priority
before insert on public.experiences
for each row
execute function set_experience_priority();

CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON public.experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX experiences_user_idx ON public.experiences(user_id);


CREATE TABLE public.experience_notes (
    note_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    experience_id bigint NOT NULL REFERENCES public.experiences ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    note_type text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);
CREATE TRIGGER update_experience_notes_updated_at
    BEFORE UPDATE ON public.experience_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
  is_visible boolean default true,
  tags text[] not null default ARRAY[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

create or replace function set_education_priority()
returns trigger as $$
begin
    if new.priority = 0 then
        select coalesce(max(priority), 0) + 1 into new.priority
        from public.educations
        where user_id = new.user_id;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger set_education_priority
before insert on public.educations
for each row
execute function set_education_priority();

CREATE TRIGGER update_educations_updated_at
    BEFORE UPDATE ON public.educations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX educations_user_idx ON public.educations(user_id);

CREATE TABLE public.education_notes (
    note_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    education_id bigint NOT NULL REFERENCES public.educations ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    note_type text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);
CREATE TRIGGER update_education_notes_updated_at
    BEFORE UPDATE ON public.education_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
/**
* Skills
* 
*/
CREATE TYPE skill_level AS ENUM ('beginner', 'amateur', 'competent', 'proficient', 'expert');

create table public.skills (
  skill_id bigint primary key generated always as identity,
  user_id uuid not null references auth.users on delete cascade,
  skill_name text not null default '',
  optional_skill_type text,
  optional_skill_level skill_level,
  description text not null default '',
  priority integer not null default 0,
  is_visible boolean default true,
  tags text[] not null default ARRAY[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

create or replace function set_skill_priority()
returns trigger as $$
begin
    if new.priority = 0 then
        select coalesce(max(priority), 0) + 1 into new.priority
        from public.skills
        where user_id = new.user_id;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger set_skill_priority
before insert on public.skills
for each row
execute function set_skill_priority();

CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX skills_user_idx ON public.skills(user_id);


CREATE TABLE public.skill_notes (
    note_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    skill_id bigint NOT NULL REFERENCES public.skills ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    note_type text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);
CREATE TRIGGER update_skill_notes_updated_at
    BEFORE UPDATE ON public.skill_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
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
  optional_granted_date date,
  description text not null default '',
  priority integer not null default 0,
  is_visible boolean default true,
  tags text[] not null default ARRAY[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

create or replace function set_certificates_priority()
returns trigger as $$
begin
    if new.priority = 0 then
        select coalesce(max(priority), 0) + 1 into new.priority
        from public.certificates
        where user_id = new.user_id;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger set_certificates_priority
before insert on public.certificates
for each row
execute function set_certificates_priority();

CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX certificates_user_idx ON public.certificates(user_id);

CREATE TABLE public.certificate_notes (
    note_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    certificate_id bigint NOT NULL REFERENCES public.certificates ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    note_type text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);
CREATE TRIGGER update_certificate_notes_updated_at
    BEFORE UPDATE ON public.certificate_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
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
  is_visible boolean default true,
  tags text[] not null default ARRAY[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

create or replace function set_projects_priority()
returns trigger as $$
begin
    if new.priority = 0 then
        select coalesce(max(priority), 0) + 1 into new.priority
        from public.projects
        where user_id = new.user_id;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger set_projects_priority
before insert on public.projects
for each row
execute function set_projects_priority();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX projects_user_idx ON public.projects(user_id);

CREATE TABLE public.project_notes (
    note_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id bigint NOT NULL REFERENCES public.projects ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    note_type text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);
CREATE TRIGGER update_project_notes_updated_at
    BEFORE UPDATE ON public.project_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


/**
* Profile
* 
*/
CREATE TABLE public.profiles (
    profile_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid not null references auth.users on delete cascade,
    name text NOT NULL DEFAULT '',
    email text NOT NULL DEFAULT '',
    phone text NOT NULL DEFAULT '',
    location text NOT NULL DEFAULT '',
    linkedin text NOT NULL DEFAULT '',
    website text NOT NULL DEFAULT '',
    cv_photo_path text NOT NULL DEFAULT '',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp,
    UNIQUE(user_id)
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX profiles_user_idx ON public.profiles(user_id);