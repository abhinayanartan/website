-- ==============================================================================
-- ABHINAYA NARTAN DANCE ACADEMY - DATABASE ARCHITECTURE
-- Migration: 20261108000001_row_level_security.sql
-- Description: Row Level Security (RLS) policies and access control helper functions.
-- Engine: PostgreSQL 15+ (Supabase Free-Tier Compatible)
-- ==============================================================================

-- ==============================================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- Optimized to prevent recursive queries and bypass RLS safely inside policies
-- ==============================================================================

-- Check if authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if authenticated user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'teacher'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if admin has authority over a branch (NULL branch_id in profile = super-admin over all branches)
CREATE OR REPLACE FUNCTION public.is_admin_for_branch(target_branch_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND role = 'admin'
          AND (branch_id IS NULL OR branch_id = target_branch_id)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current teacher is assigned to a specific batch
CREATE OR REPLACE FUNCTION public.is_teacher_of_batch(target_batch_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = target_batch_id AND teacher_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current teacher is assigned to a specific student's batch
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(target_student_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.students s
        JOIN public.batches b ON s.batch_id = b.id
        WHERE s.id = target_student_id AND b.teacher_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS) ON ALL ACADEMY TABLES
-- ==============================================================================

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_adjustments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. RLS POLICIES: BRANCHES
-- ==============================================================================

-- Authenticated staff can view branches
CREATE POLICY "Staff can view branches"
ON public.branches
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert, update, or delete branches
CREATE POLICY "Admins can manage branches"
ON public.branches
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 4. RLS POLICIES: PROFILES
-- ==============================================================================

-- Staff can view profiles of other teachers/admins in their branch
CREATE POLICY "Staff can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    public.is_admin() OR id = auth.uid() OR branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
);

-- Users can update their own profile name / phone
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can manage all profiles
CREATE POLICY "Admins can manage profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. RLS POLICIES: BATCHES
-- ==============================================================================

-- Admins can view all batches in their authorized branches; teachers can view assigned batches
CREATE POLICY "View batches policy"
ON public.batches
FOR SELECT
TO authenticated
USING (
    public.is_admin_for_branch(branch_id)
    OR teacher_id = auth.uid()
);

-- Admins can create, update, and manage batches
CREATE POLICY "Admins manage batches"
ON public.batches
FOR ALL
TO authenticated
USING (public.is_admin_for_branch(branch_id))
WITH CHECK (public.is_admin_for_branch(branch_id));

-- ==============================================================================
-- 6. RLS POLICIES: STUDENTS
-- ==============================================================================

-- Admins can view all students in their branch; teachers can view students in their assigned batches
CREATE POLICY "View students policy"
ON public.students
FOR SELECT
TO authenticated
USING (
    public.is_admin_for_branch(branch_id)
    OR public.is_teacher_of_batch(batch_id)
);

-- Admins can insert students
CREATE POLICY "Admins can insert students"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_for_branch(branch_id));

-- Admins can update students
CREATE POLICY "Admins can update students"
ON public.students
FOR UPDATE
TO authenticated
USING (public.is_admin_for_branch(branch_id))
WITH CHECK (public.is_admin_for_branch(branch_id));

-- Admins can delete student records (soft-delete status change preferred)
CREATE POLICY "Admins can delete students"
ON public.students
FOR DELETE
TO authenticated
USING (public.is_admin_for_branch(branch_id));

-- ==============================================================================
-- 7. RLS POLICIES: ATTENDANCE
-- ==============================================================================

-- Admins view branch attendance; teachers view their batch attendance
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

-- Admins and assigned teachers can record attendance
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

-- Admins and assigned teachers can update attendance for corrections
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

-- Only admins can delete an erroneous attendance row
CREATE POLICY "Admins can delete attendance"
ON public.attendance
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.batches b 
        WHERE b.id = attendance.batch_id AND public.is_admin_for_branch(b.branch_id)
    )
);

-- ==============================================================================
-- 8. RLS POLICIES: PAYMENTS (IMMUTABLE FINANCIAL LEDGER)
-- Requirement: "Payment records must not be silently deleted or overwritten."
-- ==============================================================================

-- Admins can view branch payments; teachers can view payment status for their students
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

-- Only authorized branch admins can record fee payments
CREATE POLICY "Admins can record payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.id = payments.student_id AND public.is_admin_for_branch(s.branch_id)
    )
);

-- NOTE: No UPDATE or DELETE policies are granted on public.payments.
-- Any UPDATE or DELETE attempt will be rejected by both RLS and the PostgreSQL trigger.

-- ==============================================================================
-- 9. RLS POLICIES: FEE ADJUSTMENTS
-- ==============================================================================

-- Admins view branch adjustments; teachers view adjustments for their students
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

-- Admins can grant discounts, waivers, or scholarships
CREATE POLICY "Admins can manage fee adjustments"
ON public.fee_adjustments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.id = fee_adjustments.student_id AND public.is_admin_for_branch(s.branch_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.id = fee_adjustments.student_id AND public.is_admin_for_branch(s.branch_id)
    )
);
