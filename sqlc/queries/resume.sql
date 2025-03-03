-- name: CreateResumeItem :one
INSERT INTO public.resume_items (
    user_id,
    item_type,
    title,
    subtitle,
    location,
    start_date,
    end_date,
    is_current,
    description,
    priority,
    tags,
    version,
    metadata
) VALUES (
    @user_id::uuid,
    @item_type::text, -- 'experience', 'education', 'skill', 'certificate', 'project'
    @title::text, -- Primary name (job_title, school, skill_name, certificate_name, project_title)
    @subtitle::text, -- Secondary name (company_name, degree, skill_type, issuer, project_subtitle)
    @location::text,
    @start_date::date,
    @end_date::date,
    @is_current::boolean,
    @description::text,
    @priority::integer,
    COALESCE(@tags::text[], ARRAY[]::text[]),
    (SELECT current_resume_version FROM public.users WHERE id = @user_id::uuid),
    COALESCE(@metadata::jsonb, '{}'::jsonb) -- Store type-specific fields in metadata
)
RETURNING item_id;

-- name: UpdateResumeItem :exec
UPDATE public.resume_items
SET
    title = COALESCE(@title::text, title),
    subtitle = COALESCE(@subtitle::text, subtitle),
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
    version = COALESCE(@version::text, version),
    metadata = COALESCE(@metadata::jsonb, metadata)
WHERE 
    item_id = @item_id::bigint 
    AND user_id = @user_id::uuid;

-- Delete a resume item
-- name: DeleteResumeItem :exec
DELETE FROM public.resume_items
WHERE 
    item_id = @item_id::bigint 
    AND user_id = @user_id::uuid;

-- name: GetResumeItemsByType :many
SELECT 
    item_id,
    item_type,
    title,
    subtitle,
    location,
    start_date,
    end_date,
    is_current,
    description,
    priority,
    is_visible,
    tags,
    metadata,
    (
        SELECT array_agg(json_build_object(
                'note_id', note_id,
                'note_type', note_type,
                'content', content,
                'created_at', created_at,
                'updated_at', updated_at
            ) ORDER BY created_at DESC)
        FROM public.resume_item_notes
        WHERE resume_item_notes.item_id = resume_items.item_id
    ) as notes
FROM public.resume_items
WHERE 
    user_id = @user_id::uuid 
    AND item_type = @item_type::text
    AND version = (SELECT current_resume_version FROM public.users WHERE id = @user_id::uuid)
ORDER BY 
    COALESCE(priority, 0) DESC,
    COALESCE(end_date, '9999-12-31'::date) DESC,
    COALESCE(start_date, '1900-01-01'::date) DESC,
    title ASC;

-- name: GetResumeItemById :one
SELECT 
    item_id,
    item_type,
    title,
    subtitle,
    location,
    start_date,
    end_date,
    is_current,
    description,
    priority,
    is_visible,
    tags,
    metadata,
    (
        SELECT array_agg(json_build_object(
                'note_id', note_id,
                'note_type', note_type,
                'content', content,
                'created_at', created_at,
                'updated_at', updated_at
            ) ORDER BY created_at DESC)
        FROM public.resume_item_notes
        WHERE resume_item_notes.item_id = resume_items.item_id
    ) as notes,
    created_at,
    updated_at
FROM public.resume_items
WHERE 
    item_id = @item_id::bigint 
    AND user_id = @user_id::uuid;

-- name: ToggleResumeItemVisibility :one
UPDATE public.resume_items
SET
    is_visible = NOT is_visible
WHERE 
    item_id = @item_id::bigint 
    AND user_id = @user_id::uuid
RETURNING is_visible;

-- name: ReorderResumeItem :exec
WITH moved_item AS (
    -- Get the current priority and type of the item being moved
    SELECT priority as old_priority, item_type
    FROM public.resume_items 
    WHERE item_id = @item_id::bigint
    AND user_id = @user_id::uuid
),
target AS (
    -- Get the priority of the item we're moving after
    SELECT priority as after_priority
    FROM public.resume_items
    WHERE item_id = @after_id::bigint
    AND user_id = @user_id::uuid
),
updates AS (
    -- Update priorities of items between old and new position, within the same item type
    UPDATE public.resume_items
    SET priority = 
        CASE 
            -- Moving down (current priority < target priority)
            WHEN (SELECT old_priority FROM moved_item) < (SELECT after_priority FROM target)
            THEN priority - 1
            -- Moving up (current priority > target priority)
            ELSE priority + 1
        END
    WHERE 
        user_id = @user_id::uuid
        AND item_type = (SELECT item_type FROM moved_item)
        AND CASE 
            -- Moving up: affect items between old position (exclusive) and target position (inclusive)
            WHEN (SELECT old_priority FROM moved_item) < (SELECT after_priority FROM target)
            THEN priority > (SELECT old_priority FROM moved_item) 
                AND priority <= (SELECT after_priority FROM target)
            -- Moving down: affect items between target position (inclusive) and old position (exclusive)
            ELSE priority >= (SELECT after_priority FROM target)
                AND priority < (SELECT old_priority FROM moved_item)
        END
    RETURNING priority
)
-- Finally, update the priority of the moved item
UPDATE public.resume_items
SET priority = (SELECT after_priority FROM target) 
WHERE item_id = @item_id::bigint
AND user_id = @user_id::uuid;

-- Note operations
-- name: CreateNoteOnResumeItem :exec
INSERT INTO public.resume_item_notes (
    note_type,
    content,
    item_id,
    user_id
) VALUES (
    @note_type::text,
    @content::text,
    @item_id::bigint,
    @user_id::uuid
);

-- name: UpdateNote :exec
UPDATE public.resume_item_notes 
SET
    note_type = COALESCE(@note_type::text, note_type),
    content = COALESCE(@content::text, content)
WHERE
    note_id = @note_id::bigint
    AND item_id = @item_id::bigint 
    AND user_id = @user_id::uuid;

-- name: DeleteNote :exec
DELETE FROM public.resume_item_notes
WHERE 
    note_id = @note_id::bigint
    AND item_id = @item_id::bigint 
    AND user_id = @user_id::uuid;

-- name: GetResumeData :one
WITH resume_version AS (
    SELECT current_resume_version
    FROM public.users
    WHERE id = @user_id::uuid
)
SELECT jsonb_build_object(
    'experiences', (
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'item_id', item_id,
                'title', title, -- job_title
                'subtitle', subtitle, -- company_name
                'location', location,
                'start_date', start_date,
                'end_date', end_date,
                'is_current', is_current,
                'description', description,
                'priority', priority,
                'is_visible', is_visible,
                'tags', tags,
                'metadata', metadata,
                'notes', COALESCE((
                    SELECT array_agg(json_build_object(
                        'note_id', note_id,
                        'note_type', note_type,
                        'content', content,
                        'created_at', created_at,
                        'updated_at', updated_at
                    ) ORDER BY created_at DESC)
                    FROM public.resume_item_notes
                    WHERE resume_item_notes.item_id = resume_items.item_id
                ), '{}')
            ) ORDER BY priority DESC
        ), '[]')
        FROM resume_items
        WHERE user_id = @user_id::uuid 
        AND item_type = 'experience'
        AND is_visible = true
        AND version = resume_version.current_resume_version
    ),
    'educations', (
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'item_id', item_id,
                'title', subtitle, -- school
                'subtitle', title, -- degree
                'location', location,
                'start_date', start_date,
                'end_date', end_date,
                'is_current', is_current,
                'description', description,
                'priority', priority,
                'is_visible', is_visible,
                'tags', tags,
                'metadata', metadata,
                'notes', COALESCE((
                    SELECT array_agg(json_build_object(
                        'note_id', note_id,
                        'note_type', note_type,
                        'content', content,
                        'created_at', created_at,
                        'updated_at', updated_at
                    ) ORDER BY created_at DESC)
                    FROM public.resume_item_notes
                    WHERE resume_item_notes.item_id = resume_items.item_id
                ), '{}')
            ) ORDER BY priority DESC
        ), '[]')
        FROM resume_items
        WHERE user_id = @user_id::uuid 
        AND item_type = 'education'
        AND is_visible = true
        AND version = resume_version.current_resume_version
    ),
    'skills', (
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'item_id', item_id,
                'skill_name', title,
                'skill_type', subtitle,
                'skill_level', metadata->>'skill_level',
                'description', description,
                'priority', priority,
                'is_visible', is_visible,
                'tags', tags,
                'notes', COALESCE((
                    SELECT array_agg(json_build_object(
                        'note_id', note_id,
                        'note_type', note_type,
                        'content', content,
                        'created_at', created_at,
                        'updated_at', updated_at
                    ) ORDER BY created_at DESC)
                    FROM public.resume_item_notes
                    WHERE resume_item_notes.item_id = resume_items.item_id
                ), '{}')
            ) ORDER BY priority DESC
        ), '[]')
        FROM resume_items
        WHERE user_id = @user_id::uuid 
        AND item_type = 'skill'
        AND is_visible = true
        AND version = resume_version.current_resume_version
    ),
    'certificates', (
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'item_id', item_id,
                'certificate_name', title,
                'issuer', subtitle,
                'location', location,
                'granted_date', start_date,
                'description', description,
                'priority', priority,
                'is_visible', is_visible,
                'tags', tags,
                'notes', COALESCE((
                    SELECT array_agg(json_build_object(
                        'note_id', note_id,
                        'note_type', note_type,
                        'content', content,
                        'created_at', created_at,
                        'updated_at', updated_at
                    ) ORDER BY created_at DESC)
                    FROM public.resume_item_notes
                    WHERE resume_item_notes.item_id = resume_items.item_id
                ), '{}')
            ) ORDER BY priority DESC
        ), '[]')
        FROM resume_items
        WHERE user_id = @user_id::uuid 
        AND item_type = 'certificate'
        AND is_visible = true
        AND version = resume_version.current_resume_version
    ),
    'projects', (
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'item_id', item_id,
                'project_title', title,
                'project_subtitle', subtitle,
                'start_date', start_date,
                'end_date', end_date,
                'is_current', is_current,
                'description', description,
                'priority', priority,
                'is_visible', is_visible,
                'tags', tags,
                'notes', COALESCE((
                    SELECT array_agg(json_build_object(
                        'note_id', note_id,
                        'note_type', note_type,
                        'content', content,
                        'created_at', created_at,
                        'updated_at', updated_at
                    ) ORDER BY created_at DESC)
                    FROM public.resume_item_notes
                    WHERE resume_item_notes.item_id = resume_items.item_id
                ), '{}')
            ) ORDER BY priority DESC
        ), '[]')
        FROM resume_items
        WHERE user_id = @user_id::uuid 
        AND item_type = 'project'
        AND is_visible = true
        AND version = resume_version.current_resume_version
    )
) as resume_data;