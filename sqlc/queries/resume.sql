-- name: CreateExperience :one
INSERT INTO public.experiences (
    user_id,
    company_name,
    job_title,
    location,
    start_date,
    end_date,
    is_current,
    description,
    priority,
    tags,
    notes,
    metadata
) VALUES (
    @user_id::uuid,
    @company_name::text,
    @job_title::text,
    @location::text,
    @start_date::date,
    @end_date::date,
    @is_current::boolean,
    @description::text,
    @priority::integer,
    @tags::text[],
    @notes::jsonb[],
    @metadata::jsonb
)
RETURNING experience_id;

-- name: UpdateExperience :exec
UPDATE public.experiences
SET
    company_name = COALESCE(@company_name::text, company_name),
    job_title = COALESCE(@job_title::text, job_title),
    location = COALESCE(@location::text, location),
    start_date = COALESCE(@start_date::date, start_date),
    end_date = COALESCE(@end_date::date, end_date),
    is_current = CASE 
        WHEN @end_date::date IS NOT NULL THEN false 
        ELSE COALESCE(@is_current::boolean, is_current)
    END,
    description = COALESCE(@description::text, description),
    priority = COALESCE(@priority::integer, priority),
    tags = COALESCE(@tags::text[], tags),
    notes = COALESCE(@notes::jsonb[], notes),
    metadata = COALESCE(@metadata::jsonb, metadata)
WHERE 
    experience_id = @experience_id::bigint 
    AND user_id = @user_id::uuid;

-- name: DeleteExperience :exec
DELETE FROM public.experiences
WHERE 
    experience_id = @experience_id::bigint 
    AND user_id = @user_id::uuid;

-- name: GetExperiencesByUserId :many
SELECT 
    experience_id,
    company_name,
    job_title,
    location,
    start_date,
    end_date,
    is_current,
    description,
    tags,
    notes
FROM public.experiences
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 999999) ASC,
    COALESCE(end_date, '9999-12-31'::date) DESC,
    start_date DESC;

-- name: GetExperienceById :one
SELECT 
    experience_id,
    company_name,
    job_title,
    location,
    start_date,
    end_date,
    is_current,
    description,
    priority,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.experiences
WHERE 
    experience_id = @experience_id::bigint 
    AND user_id = @user_id::uuid;