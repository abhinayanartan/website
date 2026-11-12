-- ==============================================================================
-- ABHINAYA NARTAN DANCE ACADEMY - DATABASE ARCHITECTURE
-- Migration: 20261108000008_fix_rls_recursion_and_admin_reshma.sql
-- Description:
--   1. Fixes critical "infinite recursion detected in policy for relation profiles".
--   2. Replaces recursive queries and inlinable SQL functions with robust,
--      SECURITY DEFINER plpgsql functions with safe search_path.
--   3. Eliminates all self-referencing subqueries on public.profiles inside RLS policies.
--   4. Reconfigures public.profiles RLS to use public.get_current_user_role().
--   5. Verifies and updates all RLS policies on branches, batches, students, classes,
--      attendance, and payments.
--   6. Configures "G RESHMA" as Faculty Teacher and her email "reshmagujjala249@gmail.com"
--      as Academy Administrator.
-- ==============================================================================

-- ==============================================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS (NON-RECURSIVE, PLPGSQL)
-- ==============================================================================

-- Core Role Extractor: Reads authenticated user's role directly as table owner
-- Bypasses RLS on public.profiles to permanently break circular policy loops
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;

    RETURN user_role;
END;
$$;

-- Core Branch Extractor: Reads authenticated user's branch_id directly as table owner
CREATE OR REPLACE FUNCTION public.get_current_user_branch_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_branch UUID;
BEGIN
    SELECT branch_id INTO user_branch
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;

    RETURN user_branch;
END;
$$;

-- Admin check: Non-recursive, plpgsql, SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;

    RETURN (user_role = 'admin');
END;
$$;

-- Teacher check: Non-recursive, plpgsql, SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;

    RETURN (user_role = 'teacher');
END;
$$;

-- Branch Admin Authority check: Non-recursive, plpgsql, SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin_for_branch(target_branch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_role TEXT;
    user_branch_id UUID;
BEGIN
    SELECT role, branch_id INTO user_role, user_branch_id
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;

    IF user_role = 'admin' THEN
        -- NULL branch_id indicates global academy super-admin
        IF user_branch_id IS NULL OR target_branch_id IS NULL OR user_branch_id = target_branch_id THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$;

-- Teacher Batch Assignment check: Non-recursive, plpgsql, SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_teacher_of_batch(target_batch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = target_batch_id AND teacher_id = auth.uid()
    );
END;
$$;

-- Teacher Student Assignment check: Non-recursive, plpgsql, SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(target_student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.students s
        JOIN public.batches b ON s.batch_id = b.id
        WHERE s.id = target_student_id AND b.teacher_id = auth.uid()
    );
END;
$$;

-- Revoke public execution and restrict strictly to authenticated and service_role
REVOKE ALL ON FUNCTION public.get_current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_current_user_branch_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_user_branch_id() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_teacher() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_teacher() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin_for_branch(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_for_branch(UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_teacher_of_batch(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_teacher_of_batch(UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_teacher_of_student(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_teacher_of_student(UUID) TO authenticated, service_role;

-- ==============================================================================
-- 2. REBUILD ROW LEVEL SECURITY (RLS) POLICIES ON public.profiles
-- ==============================================================================

-- Drop all legacy, recursive policies on public.profiles
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;

-- Policy 1: SELECT
-- Authenticated users can view their own profile;
-- Staff (admins and teachers) can view staff profiles for batch/class guru assignments.
-- Uses non-recursive get_current_user_role() and id = auth.uid()
CREATE POLICY "Staff can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    id = auth.uid()
    OR public.get_current_user_role() IN ('admin', 'teacher')
);

-- Policy 2: UPDATE
-- Users can update their own personal profile details (full name, etc.),
-- and Administrators can update all staff profiles.
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    id = auth.uid()
    OR public.is_admin()
)
WITH CHECK (
    id = auth.uid()
    OR public.is_admin()
);

-- Policy 3: INSERT
-- Admins can create staff profiles, or the user trigger provisions own profile.
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin()
    OR id = auth.uid()
);

-- Policy 4: DELETE
-- Strictly administrators only
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- 3. REBUILD RLS POLICIES ON RELATED ACADEMY TABLES
-- ==============================================================================

-- Table: public.branches
DROP POLICY IF EXISTS "Staff can view branches" ON public.branches;
CREATE POLICY "Staff can view branches"
ON public.branches
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;
CREATE POLICY "Admins can manage branches"
ON public.branches
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Table: public.batches
DROP POLICY IF EXISTS "View batches policy" ON public.batches;
CREATE POLICY "View batches policy"
ON public.batches
FOR SELECT
TO authenticated
USING (
    public.is_admin_for_branch(branch_id)
    OR teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "Admins manage batches" ON public.batches;
CREATE POLICY "Admins manage batches"
ON public.batches
FOR ALL
TO authenticated
USING (public.is_admin_for_branch(branch_id))
WITH CHECK (public.is_admin_for_branch(branch_id));

-- Table: public.students
DROP POLICY IF EXISTS "View students policy" ON public.students;
CREATE POLICY "View students policy"
ON public.students
FOR SELECT
TO authenticated
USING (
    public.is_admin_for_branch(branch_id)
    OR public.is_teacher_of_batch(batch_id)
);

DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
CREATE POLICY "Admins can insert students"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_for_branch(branch_id));

DROP POLICY IF EXISTS "Admins can update students" ON public.students;
CREATE POLICY "Admins can update students"
ON public.students
FOR UPDATE
TO authenticated
USING (public.is_admin_for_branch(branch_id))
WITH CHECK (public.is_admin_for_branch(branch_id));

DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
CREATE POLICY "Admins can delete students"
ON public.students
FOR DELETE
TO authenticated
USING (public.is_admin_for_branch(branch_id));

-- Table: public.classes
DROP POLICY IF EXISTS "View classes policy" ON public.classes;
CREATE POLICY "View classes policy"
ON public.classes
FOR SELECT
TO authenticated
USING (
    public.is_admin_for_branch(branch_id)
    OR teacher_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.batches b
        WHERE b.id = classes.batch_id AND b.teacher_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins can insert classes" ON public.classes;
CREATE POLICY "Admins can insert classes"
ON public.classes
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_for_branch(branch_id));

DROP POLICY IF EXISTS "Staff can update classes" ON public.classes;
CREATE POLICY "Staff can update classes"
ON public.classes
FOR UPDATE
TO authenticated
USING (
    public.is_admin_for_branch(branch_id)
    OR teacher_id = auth.uid()
)
WITH CHECK (
    public.is_admin_for_branch(branch_id)
    OR teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "Admins can delete classes" ON public.classes;
CREATE POLICY "Admins can delete classes"
ON public.classes
FOR DELETE
TO authenticated
USING (public.is_admin_for_branch(branch_id));

-- Table: public.attendance
DROP POLICY IF EXISTS "View attendance policy" ON public.attendance;
CREATE POLICY "View attendance policy"
ON public.attendance
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.batches b
        WHERE b.id = attendance.batch_id
          AND (public.is_admin_for_branch(b.branch_id) OR b.teacher_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Insert attendance policy" ON public.attendance;
CREATE POLICY "Insert attendance policy"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.batches b
        WHERE b.id = attendance.batch_id
          AND (public.is_admin_for_branch(b.branch_id) OR b.teacher_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Update attendance policy" ON public.attendance;
CREATE POLICY "Update attendance policy"
ON public.attendance
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.batches b
        WHERE b.id = attendance.batch_id
          AND (public.is_admin_for_branch(b.branch_id) OR b.teacher_id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.batches b
        WHERE b.id = attendance.batch_id
          AND (public.is_admin_for_branch(b.branch_id) OR b.teacher_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Admins can delete attendance" ON public.attendance;
CREATE POLICY "Admins can delete attendance"
ON public.attendance
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.batches b
        WHERE b.id = attendance.batch_id
          AND public.is_admin_for_branch(b.branch_id)
    )
);

-- Table: public.payments (IMMUTABLE: Only SELECT and INSERT, strictly no UPDATE / DELETE)
DROP POLICY IF EXISTS "View payments policy" ON public.payments;
CREATE POLICY "View payments policy"
ON public.payments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = payments.student_id
          AND (public.is_admin_for_branch(s.branch_id) OR public.is_teacher_of_student(s.id))
    )
);

DROP POLICY IF EXISTS "Admins can record payments" ON public.payments;
CREATE POLICY "Admins can record payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = payments.student_id
          AND public.is_admin_for_branch(s.branch_id)
    )
);

-- Table: public.fee_adjustments
DROP POLICY IF EXISTS "View fee adjustments policy" ON public.fee_adjustments;
CREATE POLICY "View fee adjustments policy"
ON public.fee_adjustments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = fee_adjustments.student_id
          AND (public.is_admin_for_branch(s.branch_id) OR public.is_teacher_of_student(s.id))
    )
);

DROP POLICY IF EXISTS "Admins can manage fee adjustments" ON public.fee_adjustments;
CREATE POLICY "Admins can manage fee adjustments"
ON public.fee_adjustments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = fee_adjustments.student_id
          AND public.is_admin_for_branch(s.branch_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = fee_adjustments.student_id
          AND public.is_admin_for_branch(s.branch_id)
    )
);

-- ==============================================================================
-- 4. CONFIGURE G RESHMA (reshmagujjala249@gmail.com) AS ADMIN & FACULTY TEACHER
-- ==============================================================================

-- Update trigger function to automatically provision reshmagujjala249@gmail.com as ADMIN
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
    assigned_name TEXT;
    assigned_branch UUID;
BEGIN
    -- Check if user is the designated Academy Administrator
    IF lower(NEW.email) = 'reshmagujjala249@gmail.com' THEN
        assigned_role := 'admin';
        assigned_name := 'G RESHMA';
    ELSE
        assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'teacher');
        IF assigned_role NOT IN ('admin', 'teacher') THEN
            assigned_role := 'teacher';
        END IF;

        assigned_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        );
    END IF;

    -- Extract optional branch_id
    IF (NEW.raw_user_meta_data->>'branch_id') IS NOT NULL AND (NEW.raw_user_meta_data->>'branch_id') ~ '^[0-9a-fA-F-]{36}$' THEN
        assigned_branch := (NEW.raw_user_meta_data->>'branch_id')::UUID;
    ELSE
        assigned_branch := NULL;
    END IF;

    -- Upsert profile record
    INSERT INTO public.profiles (id, full_name, role, branch_id)
    VALUES (NEW.id, assigned_name, assigned_role, assigned_branch)
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        branch_id = COALESCE(EXCLUDED.branch_id, public.profiles.branch_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- If reshmagujjala249@gmail.com already exists in auth.users, promote to admin immediately
DO $$
DECLARE
    target_user_id UUID;
    vja_branch_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE lower(email) = 'reshmagujjala249@gmail.com'
    LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, full_name, role, branch_id)
        VALUES (target_user_id, 'G RESHMA', 'admin', vja_branch_id)
        ON CONFLICT (id) DO UPDATE
        SET full_name = 'G RESHMA',
            role = 'admin',
            branch_id = COALESCE(public.profiles.branch_id, vja_branch_id);
    END IF;
END $$;
