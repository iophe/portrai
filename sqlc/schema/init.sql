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
-- versions created by the user
CREATE TABLE public.resume_versions (
  version_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  version text NOT NULL DEFAULT 'main',
  resume_uid uuid,
  CONSTRAINT unique_user_version_id UNIQUE (user_id, version_id),
  CONSTRAINT unique_user_version UNIQUE (user_id, version)
);

/**
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
create table public.users (
  -- UUID from auth.users
  id uuid primary key not null references auth.users on delete cascade,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  current_resume_version bigint not null,

  -- The customer's billing address, stored in JSON format.
  billing_address jsonb,
  -- Stores your customer's payment instruments.
  payment_method jsonb,

  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,

  
  -- Composite foreign key to ensure current_resume_version belongs to the user
  CONSTRAINT users_current_resume_version_fkey FOREIGN KEY (current_resume_version, id) 
    REFERENCES public.resume_versions(version_id, user_id)
);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE SCHEMA IF NOT EXISTS payment;

-- Function to handle resume version deletion
CREATE OR REPLACE FUNCTION public.handle_resume_version_deletion()
RETURNS TRIGGER AS $$
DECLARE
  next_version_id bigint;
  user_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = OLD.user_id) INTO user_exists;
  -- Check if the deleted version was the current version for any user
  IF user_exists THEN
    IF EXISTS (SELECT 1 FROM public.users WHERE current_resume_version = OLD.version_id) THEN
      -- Find another version for this user if available
      SELECT version_id INTO next_version_id
      FROM public.resume_versions
      WHERE user_id = OLD.user_id AND version_id <> OLD.version_id
      ORDER BY version_id DESC
      LIMIT 1;
      
      IF next_version_id IS NOT NULL THEN
        -- Update the user's current_resume_version
        UPDATE public.users
        SET current_resume_version = next_version_id
        WHERE id = OLD.user_id AND current_resume_version = OLD.version_id;
      ELSE
        -- If no other versions exist, prevent deletion
        RAISE EXCEPTION 'Cannot delete the last resume version for a user';
      END IF;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle resume version deletion
CREATE TRIGGER on_resume_version_deleted
  BEFORE DELETE ON public.resume_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_resume_version_deletion();


-- Function to create a new resume version and return its ID
CREATE OR REPLACE FUNCTION public.create_initial_resume_version(user_uuid uuid)
RETURNS bigint AS $$
DECLARE
  new_version_id bigint;
BEGIN
  INSERT INTO public.resume_versions (user_id)
  VALUES (user_uuid)
  RETURNING version_id INTO new_version_id;
  
  RETURN new_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user creation with resume version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_version_id bigint;
BEGIN
  -- Create a resume version first and get its ID
  new_version_id := public.create_initial_resume_version(NEW.id);
  
  -- Then create the user with the proper resume version ID
  INSERT INTO public.users (id, email, current_resume_version)
  VALUES (NEW.id, COALESCE(NEW.email,''), new_version_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire when a user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

/**
* Profile
* 
*/
CREATE TABLE public.profiles (
    profile_id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid not null references auth.users on delete cascade,
    linkedin text NOT NULL DEFAULT '',
    website text NOT NULL DEFAULT '',
    version_id bigint NOT NULL references public.resume_versions on delete cascade,
    description text NOT NULL DEFAULT '',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT current_timestamp,
    updated_at timestamp with time zone DEFAULT current_timestamp
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX profiles_user_idx ON public.profiles(user_id);

-- Add avatar bucket for the profile picture
insert into storage.buckets
  (id, name)
values
  ('avatars', 'avatars');

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_profile_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id,version_id)
  VALUES (NEW.user_id,NEW.version_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_version_created
  AFTER INSERT ON public.resume_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_version();

/**
* CUSTOMERS
* Note: this is a private table that contains a mapping of user IDs to Stripe customer IDs.
*/
create table payment.customers (
  -- UUID from auth.users
  id uuid references auth.users on delete set null,
  -- The user's customer ID in Stripe. User must not be able to update this.
  stripe_customer_id text,
  email text
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
  metadata jsonb,
  -- Usage limit of this product per features
  usage jsonb
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
    metadata jsonb,
    -- Set of key-value pairs, used to store additional information about the object in a structured format.
    usage jsonb not null default '{}'
);

create table payment.payments (
    -- Payment ID from Stripe, e.g. pi_1234.
    payment_id text primary key,

    user_id uuid references auth.users on delete set null,
    stripe_customer_id text not null,

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

create table payment.usage_analytics (
  user_id uuid references auth.users on delete set null,
  total_cost_per_payment decimal not null default 0,
  all_time_cost decimal not null default 0
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_usage_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment.usage_analytics (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_for_usage_analytics
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_usage_analytics();

CREATE OR REPLACE FUNCTION public.handle_refill_usage_analytics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE payment.usage_analytics
    SET 
        total_cost_per_payment = 0
    WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_payment_creation
  AFTER INSERT ON payment.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_refill_usage_analytics();


create table payment.usage_history (
  user_id uuid not null references auth.users on delete cascade,
  input_token_used bigint not null default 0,
  cached_input_token_used bigint not null default 0,
  cached_input_token_created bigint not null default 0,
  price_rate_input_token decimal not null,
  price_rate_cached_input_token_created decimal not null,
  price_rate_cached_input_token_used decimal not null,
  output_token_used bigint not null default 0,
  price_rate_output_token decimal not null,
  model text not null,
  duration interval not null,
  valid boolean not null,
  date timestamp with time zone default current_timestamp
);

CREATE OR REPLACE FUNCTION payment.update_usage_analytics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE payment.usage_analytics
    SET 
        total_cost_per_payment = total_cost_per_payment 
          + (NEW.input_token_used * NEW.price_rate_input_token)
          + (NEW.output_token_used * NEW.price_rate_output_token)
          + (NEW.cached_input_token_used * NEW.price_rate_cached_input_token_used)
          + (NEW.cached_input_token_created * NEW.price_rate_cached_input_token_created),
        all_time_cost = all_time_cost
          + (NEW.input_token_used * NEW.price_rate_input_token)
          + (NEW.output_token_used * NEW.price_rate_output_token)
          + (NEW.cached_input_token_used * NEW.price_rate_cached_input_token_used)
          + (NEW.cached_input_token_created * NEW.price_rate_cached_input_token_created)
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_usage_analytics_trigger
AFTER INSERT ON payment.usage_history
FOR EACH ROW
EXECUTE FUNCTION payment.update_usage_analytics();

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
  version_id bigint NOT NULL references public.resume_versions on delete cascade,
  
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


-- STORED RESUME

-- Function for profiles table
CREATE OR REPLACE FUNCTION public.update_resume_uid_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the resume_uid in resume_versions with a new UUID
    UPDATE public.resume_versions
    SET resume_uid = gen_random_uuid()::uuid
    WHERE version_id = NEW.version_id
    AND user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for resume_items table
CREATE OR REPLACE FUNCTION public.update_resume_uid_on_resume_item_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the resume_uid in resume_versions with a new UUID
    UPDATE public.resume_versions
    SET resume_uid = gen_random_uuid()::uuid
    WHERE version_id = NEW.version_id
    AND user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for resume_item_notes table
CREATE OR REPLACE FUNCTION public.update_resume_uid_on_resume_note_change()
RETURNS TRIGGER AS $$
DECLARE
    item_version_id bigint;
BEGIN
    -- Get the version_id from the parent resume_item
    SELECT version_id INTO item_version_id
    FROM public.resume_items 
    WHERE item_id = NEW.item_id;
    
    -- Update the resume_uid in resume_versions with a new UUID
    UPDATE public.resume_versions
    SET resume_uid = gen_random_uuid()::uuid
    WHERE version_id = item_version_id
    AND user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profiles table
CREATE OR REPLACE TRIGGER update_resume_uid_on_profile_change
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_resume_uid_on_profile_change();

-- Trigger for resume_items table
CREATE OR REPLACE TRIGGER update_resume_uid_on_resume_item_change
AFTER INSERT OR UPDATE ON public.resume_items
FOR EACH ROW
EXECUTE FUNCTION public.update_resume_uid_on_resume_item_change();

-- Trigger for resume_item_notes table
CREATE OR REPLACE TRIGGER update_resume_uid_on_resume_note_change
AFTER INSERT OR UPDATE ON public.resume_item_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_resume_uid_on_resume_note_change();


CREATE TABLE public.generated_resume(
  resume_file_id uuid PRIMARY KEY not null,
  filename text not null default '',
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  resume_uid uuid,
  template_name text not null,

  -- resume_title text,
  -- job_description text,
  -- cover_letter text,

  created_at timestamp with time zone DEFAULT current_timestamp
);
CREATE INDEX generated_resume_resume_uid ON public.generated_resume(resume_uid);
CREATE INDEX generated_resume_user_id ON public.generated_resume(user_id);

-- Add latex bucket for the pdf resume
insert into storage.buckets
  (id, name)
values
  ('latex', 'latex');