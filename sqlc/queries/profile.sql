-- name: GetUserById :one
SELECT 
    full_name,
    email,
    phone,
    location,
    current_resume_version,
    created_at,
    updated_at
FROM public.users
WHERE id = @user_id::uuid;

-- name: UpdateUser :exec
UPDATE public.users
SET
    full_name = COALESCE(sqlc.narg(full_name)::text, full_name),
    email = COALESCE(sqlc.narg(email)::text, email),
    phone = COALESCE(sqlc.narg(phone)::text, phone),
    location = COALESCE(sqlc.narg(location)::text, location)
WHERE id = @user_id::uuid;

-- name: GetProfileByUserId :one
SELECT 
    profile_id,
    linkedin,
    website,
    description,
    metadata,
    created_at,
    updated_at
FROM public.profiles
WHERE user_id = @user_id::uuid
AND version = (SELECT current_resume_version FROM public.users WHERE id = @user_id::uuid);

-- name: UpdateProfile :exec
UPDATE public.profiles
SET
    linkedin = COALESCE(sqlc.narg(linkedin)::text, linkedin),
    description = COALESCE(sqlc.narg(description)::text, description),
    metadata = COALESCE(sqlc.narg(metadata)::jsonb, metadata),
    website = COALESCE(sqlc.narg(website)::text, website)
WHERE user_id = @user_id::uuid AND profile_id = @profile_id::bigint;

-- name: CreateProfile :exec
INSERT INTO public.profiles (
    user_id,
    linkedin,
    website,
    version,
    metadata,
    description
) VALUES (
    @user_id::uuid,
    @linkedin::text,
    @website::text,
    (SELECT current_resume_version FROM public.users WHERE id = @user_id::uuid),
    COALESCE(sqlc.narg(metadata)::jsonb, '{}'::jsonb),
    @description::text
)
RETURNING profile_id;
