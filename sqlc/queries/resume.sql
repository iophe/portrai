
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
    is_visible,
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
    @is_visible::boolean,
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
    is_visible = COALESCE(@is_visible::boolean, priority),
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
    is_visible,
    priority,
    description,
    tags,
    notes
FROM public.experiences
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 0) DESC,
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
    is_visible,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.experiences
WHERE 
    experience_id = @experience_id::bigint 
    AND user_id = @user_id::uuid;


-- name: ToggleExperienceVisibility :one
UPDATE public.experiences
SET
    is_visible = NOT is_visible
WHERE 
    experience_id = @experience_id::bigint 
    AND user_id = @user_id::uuid
RETURNING is_visible;

-- name: ReorderExperience :exec
WITH moved_experience AS (
    -- Get the current priority of the experience being moved
    SELECT priority as old_priority
    FROM public.experiences 
    WHERE experience_id = @experience_id::bigint
    AND user_id = @user_id::uuid
),
target AS (
    -- Get the priority of the experience we're moving after
    SELECT priority as after_priority
    FROM public.experiences
    WHERE experience_id = @after_id::bigint
    AND user_id = @user_id::uuid
),
updates AS (
    -- Update priorities of experiences between old and new position
    UPDATE public.experiences
    SET priority = 
        CASE 
            -- Moving down (current priority < target priority)
            WHEN (SELECT old_priority FROM moved_experience) < (SELECT after_priority FROM target)
            THEN priority - 1
            -- Moving up (current priority > target priority)
            ELSE priority + 1
        END
    WHERE user_id = @user_id::uuid
    AND CASE 
        -- Moving up: affect items between old position (exclusive) and target position (inclusive)
        WHEN (SELECT old_priority FROM moved_experience) < (SELECT after_priority FROM target)
        THEN priority > (SELECT old_priority FROM moved_experience) 
            AND priority <= (SELECT after_priority FROM target)
        -- Moving down: affect items between target position (inclusive) and old position (exclusive)
        ELSE priority >= (SELECT after_priority FROM target)
            AND priority < (SELECT old_priority FROM moved_experience)
    END
    RETURNING priority
)
-- Finally, update the priority of the moved experience
UPDATE public.experiences
SET priority = (SELECT after_priority FROM target) 
WHERE experience_id = @experience_id::bigint
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
    is_visible,
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
    @is_visible::boolean,
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
    is_visible = COALESCE(@is_visible::boolean, priority),
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
    priority,
    is_visible,
    description,
    tags,
    notes
FROM public.educations
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 0) DESC,
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
    is_visible,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.educations
WHERE 
    education_id = @education_id::bigint 
    AND user_id = @user_id::uuid;

-- name: ToggleEducationVisibility :one
UPDATE public.educations
SET
    is_visible = NOT is_visible
WHERE 
    education_id = @education_id::bigint 
    AND user_id = @user_id::uuid
RETURNING is_visible;


-- name: ReorderEducation :exec
WITH moved_education AS (
    -- Get the current priority of the education being moved
    SELECT priority as old_priority
    FROM public.educations 
    WHERE education_id = @education_id::bigint
    AND user_id = @user_id::uuid
),
target AS (
    -- Get the priority of the education we're moving after
    SELECT priority as after_priority
    FROM public.educations
    WHERE education_id = @after_id::bigint
    AND user_id = @user_id::uuid
),
updates AS (
    -- Update priorities of educations between old and new position
    UPDATE public.educations
    SET priority = 
        CASE 
            -- Moving down (current priority < target priority)
            WHEN (SELECT old_priority FROM moved_education) < (SELECT after_priority FROM target)
            THEN priority - 1
            -- Moving up (current priority > target priority)
            ELSE priority + 1
        END
    WHERE user_id = @user_id::uuid
    AND CASE 
        -- Moving up: affect items between old position (exclusive) and target position (inclusive)
        WHEN (SELECT old_priority FROM moved_education) < (SELECT after_priority FROM target)
        THEN priority > (SELECT old_priority FROM moved_education) 
            AND priority <= (SELECT after_priority FROM target)
        -- Moving down: affect items between target position (inclusive) and old position (exclusive)
        ELSE priority >= (SELECT after_priority FROM target)
            AND priority < (SELECT old_priority FROM moved_education)
    END
    RETURNING priority
)
UPDATE public.educations
SET priority = (SELECT after_priority FROM target) 
WHERE education_id = @education_id::bigint
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
    is_visible,
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
    @is_visible::boolean,
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
    is_visible = COALESCE(@is_visible::boolean, priority),
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
    is_visible,
    tags,
    notes
FROM public.skills
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 0) DESC,
    skill_name ASC;

-- name: GetSkillById :one
SELECT 
    skill_id,
    skill_name,
    optional_skill_type,
    optional_skill_level,
    description,
    priority,
    is_visible,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.skills
WHERE 
    skill_id = @skill_id::bigint 
    AND user_id = @user_id::uuid;

-- name: ToggleSkillVisibility :one
UPDATE public.skills
SET
    is_visible = NOT is_visible
WHERE 
    skill_id = @skill_id::bigint 
    AND user_id = @user_id::uuid
RETURNING is_visible;


-- name: ReorderSkill :exec
WITH moved_skill AS (
    -- Get the current priority of the skill being moved
    SELECT priority as old_priority
    FROM public.skills 
    WHERE skill_id = @skill_id::bigint
    AND user_id = @user_id::uuid
),
target AS (
    -- Get the priority of the skill we're moving after
    SELECT priority as after_priority
    FROM public.skills
    WHERE skill_id = @after_id::bigint
    AND user_id = @user_id::uuid
),
updates AS (
    -- Update priorities of skills between old and new position
    UPDATE public.skills
    SET priority = 
        CASE 
            -- Moving down (current priority < target priority)
            WHEN (SELECT old_priority FROM moved_skill) < (SELECT after_priority FROM target)
            THEN priority - 1
            -- Moving up (current priority > target priority)
            ELSE priority + 1
        END
    WHERE user_id = @user_id::uuid
    AND CASE 
        -- Moving up: affect items between old position (exclusive) and target position (inclusive)
        WHEN (SELECT old_priority FROM moved_skill) < (SELECT after_priority FROM target)
        THEN priority > (SELECT old_priority FROM moved_skill) 
            AND priority <= (SELECT after_priority FROM target)
        -- Moving down: affect items between target position (inclusive) and old position (exclusive)
        ELSE priority >= (SELECT after_priority FROM target)
            AND priority < (SELECT old_priority FROM moved_skill)
    END
    RETURNING priority
)
UPDATE public.skills
SET priority = (SELECT after_priority FROM target) 
WHERE skill_id = @skill_id::bigint
AND user_id = @user_id::uuid;

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
    is_visible,
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
    @is_visible::boolean,
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
    is_visible = COALESCE(@is_visible::boolean, priority),
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
    is_visible,
    tags,
    notes
FROM public.certificates
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 0) DESC,
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
    is_visible,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.certificates
WHERE 
    certificate_id = @certificate_id::bigint 
    AND user_id = @user_id::uuid;

-- name: ToggleCertificateVisibility :one
UPDATE public.certificates
SET
    is_visible = NOT is_visible
WHERE 
    certificate_id = @certificate_id::bigint 
    AND user_id = @user_id::uuid
RETURNING is_visible;


-- name: ReorderCertificate :exec
WITH moved_certificate AS (
    -- Get the current priority of the certificate being moved
    SELECT priority as old_priority
    FROM public.certificates 
    WHERE certificate_id = @certificate_id::bigint
    AND user_id = @user_id::uuid
),
target AS (
    -- Get the priority of the certificate we're moving after
    SELECT priority as after_priority
    FROM public.certificates
    WHERE certificate_id = @after_id::bigint
    AND user_id = @user_id::uuid
),
updates AS (
    -- Update priorities of certificates between old and new position
    UPDATE public.certificates
    SET priority = 
        CASE 
            -- Moving down (current priority < target priority)
            WHEN (SELECT old_priority FROM moved_certificate) < (SELECT after_priority FROM target)
            THEN priority - 1
            -- Moving up (current priority > target priority)
            ELSE priority + 1
        END
    WHERE user_id = @user_id::uuid
    AND CASE 
        -- Moving up: affect items between old position (exclusive) and target position (inclusive)
        WHEN (SELECT old_priority FROM moved_certificate) < (SELECT after_priority FROM target)
        THEN priority > (SELECT old_priority FROM moved_certificate) 
            AND priority <= (SELECT after_priority FROM target)
        -- Moving down: affect items between target position (inclusive) and old position (exclusive)
        ELSE priority >= (SELECT after_priority FROM target)
            AND priority < (SELECT old_priority FROM moved_certificate)
    END
    RETURNING priority
)
UPDATE public.certificates
SET priority = (SELECT after_priority FROM target) 
WHERE certificate_id = @certificate_id::bigint
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
    is_visible,
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
    @is_visible::boolean,
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
    is_visible = COALESCE(@is_visible::boolean, priority),
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
    is_visible,
    tags,
    notes
FROM public.projects
WHERE user_id = @user_id::uuid
ORDER BY 
    COALESCE(priority, 0) DESC,
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
    is_visible,
    tags,
    notes,
    metadata,
    created_at,
    updated_at
FROM public.projects
WHERE 
    project_id = @project_id::bigint 
    AND user_id = @user_id::uuid;

-- name: ToggleProjectVisibility :one
UPDATE public.projects
SET
    is_visible = NOT is_visible
WHERE 
    project_id = @project_id::bigint 
    AND user_id = @user_id::uuid
RETURNING is_visible;


-- name: ReorderProject :exec
WITH moved_project AS (
    -- Get the current priority of the project being moved
    SELECT priority as old_priority
    FROM public.projects 
    WHERE project_id = @project_id::bigint
    AND user_id = @user_id::uuid
),
target AS (
    -- Get the priority of the project we're moving after
    SELECT priority as after_priority
    FROM public.projects
    WHERE project_id = @after_id::bigint
    AND user_id = @user_id::uuid
),
updates AS (
    -- Update priorities of projects between old and new position
    UPDATE public.projects
    SET priority = 
        CASE 
            -- Moving down (current priority < target priority)
            WHEN (SELECT old_priority FROM moved_project) < (SELECT after_priority FROM target)
            THEN priority - 1
            -- Moving up (current priority > target priority)
            ELSE priority + 1
        END
    WHERE user_id = @user_id::uuid
    AND CASE 
        -- Moving up: affect items between old position (exclusive) and target position (inclusive)
        WHEN (SELECT old_priority FROM moved_project) < (SELECT after_priority FROM target)
        THEN priority > (SELECT old_priority FROM moved_project) 
            AND priority <= (SELECT after_priority FROM target)
        -- Moving down: affect items between target position (inclusive) and old position (exclusive)
        ELSE priority >= (SELECT after_priority FROM target)
            AND priority < (SELECT old_priority FROM moved_project)
    END
    RETURNING priority
)
UPDATE public.projects
SET priority = (SELECT after_priority FROM target) 
WHERE project_id = @project_id::bigint
AND user_id = @user_id::uuid;
