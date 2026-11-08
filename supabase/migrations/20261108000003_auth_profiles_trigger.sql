-- ==============================================================================
-- ABHINAYA NARTAN DANCE ACADEMY - DATABASE ARCHITECTURE
-- Migration: 20261108000003_auth_profiles_trigger.sql
-- Description: Automated trigger linking Supabase auth.users to public.profiles.
-- Engine: PostgreSQL 15+ (Supabase Free-Tier Compatible)
-- ==============================================================================

-- 1. Trigger Function: Sync new Auth Users to Academy Staff Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
    assigned_name TEXT;
    assigned_branch UUID;
BEGIN
    -- Extract role from metadata, default to 'teacher' for safety
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'teacher');
    IF assigned_role NOT IN ('admin', 'teacher') THEN
        assigned_role := 'teacher';
    END IF;

    -- Extract full name from metadata, fallback to email local part
    assigned_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- Extract optional branch_id
    IF (NEW.raw_user_meta_data->>'branch_id') IS NOT NULL AND (NEW.raw_user_meta_data->>'branch_id') ~ '^[0-9a-fA-F-]{36}$' THEN
        assigned_branch := (NEW.raw_user_meta_data->>'branch_id')::UUID;
    ELSE
        assigned_branch := NULL;
    END IF;

    -- Insert or update staff profile
    INSERT INTO public.profiles (id, full_name, role, branch_id)
    VALUES (NEW.id, assigned_name, assigned_role, assigned_branch)
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        branch_id = COALESCE(EXCLUDED.branch_id, public.profiles.branch_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. HELPER PROCEDURE: Authorized Admin Creation of Academy Staff
-- Requirement: "No public signup. Admin accounts must be created through an authorized process."
-- ==============================================================================

-- This function allows an authenticated Admin to create or provision a staff profile
CREATE OR REPLACE FUNCTION public.provision_staff_member(
    target_user_id UUID,
    staff_name TEXT,
    staff_role TEXT,
    target_branch_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Only existing admins can provision other staff members
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only Academy Administrators can provision staff accounts.';
    END IF;

    IF staff_role NOT IN ('admin', 'teacher') THEN
        RAISE EXCEPTION 'Invalid role: must be admin or teacher.';
    END IF;

    INSERT INTO public.profiles (id, full_name, role, branch_id)
    VALUES (target_user_id, staff_name, staff_role, target_branch_id)
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        branch_id = EXCLUDED.branch_id;

    SELECT json_build_object(
        'status', 'success',
        'id', target_user_id,
        'full_name', staff_name,
        'role', staff_role
    )::jsonb INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
