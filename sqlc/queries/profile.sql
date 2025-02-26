-- name: GetProfileByUserId :one
SELECT 
    profile_id,
    name,
    email,
    phone,
    location,
    linkedin,
    website,
    cv_photo_path,
    metadata,
    created_at,
    updated_at
FROM public.profiles
WHERE user_id = @user_id::uuid;

-- name: UpdateProfile :exec
UPDATE public.profiles
SET
    name = @name::text,
    email = @email::text,
    phone = @phone::text,
    location = @location::text,
    linkedin = @linkedin::text,
    website = @website::text,
    cv_photo_path = @cv_photo_path::text
WHERE user_id = @user_id::uuid;

-- name: CreateProfile :exec
INSERT INTO public.profiles (
    user_id,
    name,
    email,
    phone,
    location,
    linkedin,
    website
) VALUES (
    @user_id::uuid,
    @name::text,
    @email::text,
    @phone::text,
    @location::text,
    @linkedin::text,
    @website::text
);