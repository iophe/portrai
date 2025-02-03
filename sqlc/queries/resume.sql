
/**
* Experiences
* 
*/

-- name: CreateExperience :one
INSERT INTO public.experiences (
    user_id,
    company_name,
    job_title,
    location,
    start_date,
    optional_end_date,
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
    @optional_end_date::date,
    @is_current::boolean,
    @description::text,
    @priority::integer,
    COALESCE(@tags::text[], ARRAY[]::text[]),
    COALESCE(@notes::jsonb[], ARRAY[]::jsonb[]),
    COALESCE(@metadata::jsonb, '{}'::jsonb)
)
RETURNING experience_id;

-- name: UpdateExperience :exec
UPDATE public.experiences
SET
    company_name = COALESCE(@company_name::text, company_name),
    job_title = COALESCE(@job_title::text, job_title),
    location = COALESCE(@location::text, location),
    start_date = COALESCE(@start_date::date, start_date),
    optional_end_date = COALESCE(@optional_end_date::date, optional_end_date),
    is_current = CASE 
        WHEN @optional_end_date::date IS NOT NULL THEN false 
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
    optional_end_date,
    is_current,
    description,
    tags,
    notes
FROM public.experiences
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 999999) ASC,
    COALESCE(optional_end_date, '9999-12-31'::date) DESC,
    start_date DESC;

-- name: GetExperienceById :one
SELECT 
    experience_id,
    company_name,
    job_title,
    location,
    start_date,
    optional_end_date,
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

/**
* Educations
* 
*/
-- name: CreateEducation :one
INSERT INTO public.educations (
    user_id,
    school,
    degree,
    location,
    start_date,
    optional_end_date,
    is_current,
    description,
    priority,
    tags,
    notes,
    metadata
) VALUES (
    @user_id::uuid,
    @school::text,
    @degree::text,
    @location::text,
    @start_date::date,
    @optional_end_date::date,
    @is_current::boolean,
    @description::text,
    @priority::integer,
    COALESCE(@tags::text[], ARRAY[]::text[]),
    COALESCE(@notes::jsonb[], ARRAY[]::jsonb[]),
    COALESCE(@metadata::jsonb, '{}'::jsonb)
)
RETURNING education_id;

-- name: UpdateEducation :exec
UPDATE public.educations
SET
    school = COALESCE(@school::text, school),
    degree = COALESCE(@degree::text, degree),
    location = COALESCE(@location::text, location),
    start_date = COALESCE(@start_date::date, start_date),
    optional_end_date = COALESCE(@optional_end_date::date, optional_end_date),
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
    education_id = @education_id::bigint 
    AND user_id = @user_id::uuid;

-- name: DeleteEducation :exec
DELETE FROM public.educations
WHERE 
    education_id = @education_id::bigint 
    AND user_id = @user_id::uuid;

-- name: GetEducationsByUserId :many
SELECT 
    education_id,
    school,
    degree,
    location,
    start_date,
    optional_end_date,
    is_current,
    description,
    tags,
    notes
FROM public.educations
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 999999) ASC,
    COALESCE(optional_end_date, '9999-12-31'::date) DESC,
    start_date DESC;

-- name: GetEducationById :one
SELECT 
    education_id,
    school,
    degree,
    location,
    start_date,
    optional_end_date,
    is_current,
    description,
    priority,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.educations
WHERE 
    education_id = @education_id::bigint 
    AND user_id = @user_id::uuid;


/**
* Skills
* 
*/
-- name: CreateSkill :one
INSERT INTO public.skills (
    user_id,
    skill_name,
    optional_skill_type,
    optional_skill_level,
    description,
    priority,
    tags,
    notes,
    metadata
) VALUES (
    @user_id::uuid,
    @skill_name::text,
    @optional_skill_type::skill_type,
    @optional_skill_level::skill_level,
    @description::text,
    @priority::integer,
    COALESCE(@tags::text[], ARRAY[]::text[]),
    COALESCE(@notes::jsonb[], ARRAY[]::jsonb[]),
    COALESCE(@metadata::jsonb, '{}'::jsonb)
)
RETURNING skill_id;

-- name: UpdateSkill :exec
UPDATE public.skills
SET
    skill_name = COALESCE(@skill_name::text, skill_name),
    optional_skill_type = COALESCE(@optional_skill_type::skill_type, optional_skill_type),
    optional_skill_level = COALESCE(@optional_skill_level::skill_level, optional_skill_level),
    description = COALESCE(@description::text, description),
    priority = COALESCE(@priority::integer, priority),
    tags = COALESCE(@tags::text[], tags),
    notes = COALESCE(@notes::jsonb[], notes),
    metadata = COALESCE(@metadata::jsonb, metadata)
WHERE 
    skill_id = @skill_id::bigint 
    AND user_id = @user_id::uuid;

-- name: DeleteSkill :exec
DELETE FROM public.skills
WHERE 
    skill_id = @skill_id::bigint 
    AND user_id = @user_id::uuid;

-- name: GetSkillsByUserId :many
SELECT 
    skill_id,
    skill_name,
    optional_skill_type,
    optional_skill_level,
    description,
    priority,
    tags,
    notes
FROM public.skills
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 999999) ASC,
    skill_name ASC;

-- name: GetSkillById :one
SELECT 
    skill_id,
    skill_name,
    optional_skill_type,
    optional_skill_level,
    description,
    priority,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.skills
WHERE 
    skill_id = @skill_id::bigint 
    AND user_id = @user_id::uuid;

-- name: GetSkillsByType :many
SELECT 
    skill_id,
    skill_name,
    optional_skill_type,
    optional_skill_level,
    description,
    priority,
    tags,
    notes
FROM public.skills
WHERE 
    user_id = @user_id::uuid
    AND optional_skill_type = @skill_type::skill_type
ORDER BY 
    COALESCE(priority, 999999) ASC,
    skill_name ASC;

/**
* Certificates
* 
*/
-- name: CreateCertificate :one
INSERT INTO public.certificates (
    user_id,
    certificate_name,
    optional_issuer,
    optional_location,
    optional_granted_date,
    description,
    priority,
    tags,
    notes,
    metadata
) VALUES (
    @user_id::uuid,
    @certificate_name::text,
    @optional_issuer::text,
    @optional_location::text,
    @optional_granted_date::date,
    @description::text,
    @priority::integer,
    COALESCE(@tags::text[], ARRAY[]::text[]),
    COALESCE(@notes::jsonb[], ARRAY[]::jsonb[]),
    COALESCE(@metadata::jsonb, '{}'::jsonb)
)
RETURNING certificate_id;

-- name: UpdateCertificate :exec
UPDATE public.certificates
SET
    certificate_name = COALESCE(@certificate_name::text, certificate_name),
    optional_issuer = COALESCE(@optional_issuer::text, optional_issuer),
    optional_location = COALESCE(@optional_location::text, optional_location),
    optional_granted_date = COALESCE(@optional_granted_date::date, optional_granted_date),
    description = COALESCE(@description::text, description),
    priority = COALESCE(@priority::integer, priority),
    tags = COALESCE(@tags::text[], tags),
    notes = COALESCE(@notes::jsonb[], notes),
    metadata = COALESCE(@metadata::jsonb, metadata)
WHERE 
    certificate_id = @certificate_id::bigint 
    AND user_id = @user_id::uuid;

-- name: DeleteCertificate :exec
DELETE FROM public.certificates
WHERE 
    certificate_id = @certificate_id::bigint 
    AND user_id = @user_id::uuid;

-- name: GetCertificatesByUserId :many
SELECT 
    certificate_id,
    certificate_name,
    optional_issuer,
    optional_location,
    optional_granted_date,
    description,
    priority,
    tags,
    notes
FROM public.certificates
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 999999) ASC,
    COALESCE(optional_granted_date, '1900-01-01'::date) DESC,
    certificate_name ASC;

-- name: GetCertificateById :one
SELECT 
    certificate_id,
    certificate_name,
    optional_issuer,
    optional_location,
    optional_granted_date,
    description,
    priority,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.certificates
WHERE 
    certificate_id = @certificate_id::bigint 
    AND user_id = @user_id::uuid;

/**
* Projects
* 
*/
-- name: CreateProject :one
INSERT INTO public.projects (
    user_id,
    project_title,
    optional_project_subtitle,
    optional_start_date,
    optional_end_date,
    is_current,
    description,
    priority,
    tags,
    notes,
    metadata
) VALUES (
    @user_id::uuid,
    @project_title::text,
    @optional_project_subtitle::text,
    @optional_start_date::date,
    @optional_end_date::date,
    @is_current::boolean,
    @description::text,
    @priority::integer,
    COALESCE(@tags::text[], ARRAY[]::text[]),
    COALESCE(@notes::jsonb[], ARRAY[]::jsonb[]),
    COALESCE(@metadata::jsonb, '{}'::jsonb)
)
RETURNING project_id;

-- name: UpdateProject :exec
UPDATE public.projects
SET
    project_title = COALESCE(@project_title::text, project_title),
    optional_project_subtitle = COALESCE(@optional_project_subtitle::text, optional_project_subtitle),
    optional_start_date = COALESCE(@optional_start_date::date, optional_start_date),
    optional_end_date = COALESCE(@optional_end_date::date, optional_end_date),
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
    project_id = @project_id::bigint 
    AND user_id = @user_id::uuid;

-- name: DeleteProject :exec
DELETE FROM public.projects
WHERE 
    project_id = @project_id::bigint 
    AND user_id = @user_id::uuid;

-- name: GetProjectsByUserId :many
SELECT 
    project_id,
    project_title,
    optional_project_subtitle,
    optional_start_date,
    optional_end_date,
    is_current,
    description,
    priority,
    tags,
    notes
FROM public.projects
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 999999) ASC,
    COALESCE(optional_end_date, '9999-12-31'::date) DESC,
    COALESCE(optional_start_date, '9999-12-31'::date) DESC,
    project_title ASC;

-- name: GetProjectById :one
SELECT 
    project_id,
    project_title,
    optional_project_subtitle,
    optional_start_date,
    optional_end_date,
    is_current,
    description,
    priority,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.projects
WHERE 
    project_id = @project_id::bigint 
    AND user_id = @user_id::uuid;