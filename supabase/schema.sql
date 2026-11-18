-- ==============================================================================
-- ABHINAYA NARTAN DANCE ACADEMY - ACADEMY MANAGER MASTER SCHEMA
-- File: supabase/schema.sql
-- Description: Complete production schema uniting tables, immutability triggers,
--              Row Level Security (RLS) policies and helper functions.
-- Engine: PostgreSQL 15+ (Supabase Free-Tier Compatible, AWS ap-south-1 Mumbai)
-- Budget: ₹0 / Month
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS (All 7 Tables)
-- ==============================================================================

-- 1. Branches
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_name TEXT NOT NULL,
    address TEXT,
    contact_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. User Profiles (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')) DEFAULT 'teacher',
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Batches
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name TEXT NOT NULL,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    class_days TEXT[] NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    level TEXT NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    max_capacity INTEGER NOT NULL DEFAULT 20 CHECK (max_capacity > 0),
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 500.00 CHECK (monthly_fee >= 0),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_batch_time_order CHECK (end_time > start_time)
);

-- 4. Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('female', 'male', 'other')),
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    student_phone TEXT,
    address TEXT,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE RESTRICT,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (monthly_fee >= 0),
    level TEXT NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave')) DEFAULT 'present',
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Unique constraint preventing duplicate attendance for same student, batch, and date
    CONSTRAINT uq_student_batch_date UNIQUE (student_id, batch_id, attendance_date)
);

-- 6. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'UPI', 'bank transfer')),
    transaction_reference TEXT,
    receipt_number TEXT NOT NULL UNIQUE,
    payment_period TEXT NOT NULL,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Fee Adjustments
CREATE TABLE IF NOT EXISTS public.fee_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount <> 0),
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('discount', 'scholarship', 'waiver', 'fine', 'other')),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Classes (Individual Scheduled Classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name TEXT NOT NULL,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_class_time_order CHECK (end_time > start_time),
    CONSTRAINT uq_class_batch_date_time UNIQUE (batch_id, class_date, start_time)
);

-- ==============================================================================
-- 3. HIGH-PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_branch ON public.profiles(branch_id);

CREATE INDEX IF NOT EXISTS idx_batches_branch ON public.batches(branch_id);
CREATE INDEX IF NOT EXISTS idx_batches_teacher ON public.batches(teacher_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);

CREATE INDEX IF NOT EXISTS idx_students_branch ON public.students(branch_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON public.students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_code ON public.students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON public.students(parent_phone);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_batch_date ON public.attendance(batch_id, attendance_date);

CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_period ON public.payments(payment_period);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON public.payments(receipt_number);

CREATE INDEX IF NOT EXISTS idx_adjustments_student ON public.fee_adjustments(student_id);

CREATE INDEX IF NOT EXISTS idx_classes_branch ON public.classes(branch_id);
CREATE INDEX IF NOT EXISTS idx_classes_batch ON public.classes(batch_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_date ON public.classes(class_date);
CREATE INDEX IF NOT EXISTS idx_classes_status ON public.classes(status);

-- ==============================================================================
-- 4. FINANCIAL AUDIT & IMMUTABILITY GUARD
-- Requirement: "Payment records must not be silently deleted or overwritten."
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_payment_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit Violation: Payment records are immutable financial logs and cannot be updated or deleted. Issue a fee_adjustment if a correction is necessary.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_payments_immutable ON public.payments;
CREATE TRIGGER trg_enforce_payments_immutable
BEFORE UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_payment_tampering();

-- ==============================================================================
-- 5. RECEIPT NUMBER GENERATION SEQUENCE (AN-YYYY-XXXX)
-- ==============================================================================

CREATE SEQUENCE IF NOT EXISTS public.receipt_number_seq START 101;

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    next_val BIGINT;
    year_prefix TEXT;
BEGIN
    next_val := nextval('public.receipt_number_seq');
    year_prefix := to_char(CURRENT_DATE, 'YYYY');
    RETURN 'AN-' || year_prefix || '-' || lpad(next_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.trg_set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL OR trim(NEW.receipt_number) = '' THEN
        NEW.receipt_number := public.generate_receipt_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_receipt_number ON public.payments;
CREATE TRIGGER trg_auto_receipt_number
BEFORE INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.trg_set_receipt_number();

-- ==============================================================================
-- 6. SECURITY DEFINER HELPER FUNCTIONS FOR RLS (NON-RECURSIVE, PLPGSQL)
-- ==============================================================================

-- Reads authenticated user's role directly as table owner, bypassing RLS to prevent recursion
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

-- Reads authenticated user's branch_id directly as table owner
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
        IF user_branch_id IS NULL OR target_branch_id IS NULL OR user_branch_id = target_branch_id THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$;

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

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Branches Policies
DROP POLICY IF EXISTS "Staff can view branches" ON public.branches;
CREATE POLICY "Staff can view branches" ON public.branches FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage branches" ON public.branches;
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Profiles Policies (NON-RECURSIVE)
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;
CREATE POLICY "Staff can view profiles" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.get_current_user_role() IN ('admin', 'teacher'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can update profiles" ON public.profiles;
CREATE POLICY "Staff can update profiles" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated
USING (public.is_admin());

-- RLS authorizes profile rows, while this trigger keeps role and branch
-- assignment server-controlled even when a user updates their own row.
CREATE OR REPLACE FUNCTION public.enforce_profile_privilege_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Profile identity cannot be changed.';
    END IF;

    IF auth.uid() IS NOT NULL
      AND (
        NEW.role IS DISTINCT FROM OLD.role
        OR NEW.branch_id IS DISTINCT FROM OLD.branch_id
      ) THEN
        -- For self-updates, compare the saved role before this UPDATE. This
        -- prevents a teacher from making a new value look administrative.
        IF OLD.id = auth.uid() THEN
            IF OLD.role <> 'admin' THEN
                RAISE EXCEPTION 'Only Academy Directors can change a staff role or branch assignment.';
            END IF;
        ELSIF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Only Academy Directors can change a staff role or branch assignment.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_privilege_integrity ON public.profiles;
CREATE TRIGGER trg_enforce_profile_privilege_integrity
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_privilege_integrity();

-- Batches Policies
DROP POLICY IF EXISTS "View batches policy" ON public.batches;
CREATE POLICY "View batches policy" ON public.batches FOR SELECT TO authenticated
USING (public.is_admin_for_branch(branch_id) OR teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage batches" ON public.batches;
CREATE POLICY "Admins manage batches" ON public.batches FOR ALL TO authenticated
USING (public.is_admin_for_branch(branch_id)) WITH CHECK (public.is_admin_for_branch(branch_id));

-- Students Policies
DROP POLICY IF EXISTS "View students policy" ON public.students;
CREATE POLICY "View students policy" ON public.students FOR SELECT TO authenticated
USING (public.is_admin_for_branch(branch_id) OR public.is_teacher_of_batch(batch_id));

DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
CREATE POLICY "Admins can insert students" ON public.students FOR INSERT TO authenticated WITH CHECK (public.is_admin_for_branch(branch_id));

DROP POLICY IF EXISTS "Admins can update students" ON public.students;
CREATE POLICY "Admins can update students" ON public.students FOR UPDATE TO authenticated USING (public.is_admin_for_branch(branch_id)) WITH CHECK (public.is_admin_for_branch(branch_id));

DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
CREATE POLICY "Admins can delete students" ON public.students FOR DELETE TO authenticated USING (public.is_admin_for_branch(branch_id));

-- Attendance Policies
DROP POLICY IF EXISTS "View attendance policy" ON public.attendance;
CREATE POLICY "View attendance policy" ON public.attendance FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.batches b WHERE b.id = attendance.batch_id AND (public.is_admin_for_branch(b.branch_id) OR b.teacher_id = auth.uid())));

DROP POLICY IF EXISTS "Insert attendance policy" ON public.attendance;
CREATE POLICY "Insert attendance policy" ON public.attendance FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.batches b WHERE b.id = attendance.batch_id AND (public.is_admin_for_branch(b.branch_id) OR b.teacher_id = auth.uid())));

DROP POLICY IF EXISTS "Update attendance policy" ON public.attendance;
CREATE POLICY "Update attendance policy" ON public.attendance FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.batches b WHERE b.id = attendance.batch_id AND (public.is_admin_for_branch(b.branch_id) OR b.teacher_id = auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.batches b WHERE b.id = attendance.batch_id AND (public.is_admin_for_branch(b.branch_id) OR b.teacher_id = auth.uid())));

DROP POLICY IF EXISTS "Admins can delete attendance" ON public.attendance;
CREATE POLICY "Admins can delete attendance" ON public.attendance FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.batches b WHERE b.id = attendance.batch_id AND public.is_admin_for_branch(b.branch_id)));

-- Payments Policies (IMMUTABLE: Only SELECT and INSERT, No UPDATE, No DELETE)
DROP POLICY IF EXISTS "View payments policy" ON public.payments;
CREATE POLICY "View payments policy" ON public.payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = payments.student_id AND (public.is_admin_for_branch(s.branch_id) OR public.is_teacher_of_student(s.id))));

DROP POLICY IF EXISTS "Admins can record payments" ON public.payments;
CREATE POLICY "Admins can record payments" ON public.payments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = payments.student_id AND public.is_admin_for_branch(s.branch_id)));

-- Fee Adjustments Policies
DROP POLICY IF EXISTS "View fee adjustments policy" ON public.fee_adjustments;
CREATE POLICY "View fee adjustments policy" ON public.fee_adjustments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = fee_adjustments.student_id AND (public.is_admin_for_branch(s.branch_id) OR public.is_teacher_of_student(s.id))));

DROP POLICY IF EXISTS "Admins can manage fee adjustments" ON public.fee_adjustments;
CREATE POLICY "Admins can manage fee adjustments" ON public.fee_adjustments FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = fee_adjustments.student_id AND public.is_admin_for_branch(s.branch_id)))
WITH CHECK (EXISTS (SELECT 1 FROM public.students s WHERE s.id = fee_adjustments.student_id AND public.is_admin_for_branch(s.branch_id)));

-- Classes Policies
DROP POLICY IF EXISTS "View classes policy" ON public.classes;
CREATE POLICY "View classes policy" ON public.classes FOR SELECT TO authenticated
USING (
    public.is_admin_for_branch(branch_id)
    OR teacher_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.batches b
        WHERE b.id = classes.batch_id AND b.teacher_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins can insert classes" ON public.classes;
CREATE POLICY "Admins can insert classes" ON public.classes FOR INSERT TO authenticated
WITH CHECK (public.is_admin_for_branch(branch_id));

DROP POLICY IF EXISTS "Staff can update classes" ON public.classes;
CREATE POLICY "Staff can update classes" ON public.classes FOR UPDATE TO authenticated
USING (public.is_admin_for_branch(branch_id) OR teacher_id = auth.uid())
WITH CHECK (public.is_admin_for_branch(branch_id) OR teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete classes" ON public.classes;
CREATE POLICY "Admins can delete classes" ON public.classes FOR DELETE TO authenticated
USING (public.is_admin_for_branch(branch_id));

-- ==============================================================================
-- 8. INITIAL ACADEMY CONFIGURATION
-- ==============================================================================

-- Provision the academy's primary branch. Operational data remains empty.
INSERT INTO public.branches (id, branch_name, address, contact_number)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Vijayawada Main Studio', 'Bunder Road, Vijayawada, Andhra Pradesh, 520002', '+91 93981 18249')
ON CONFLICT (id) DO NOTHING;

-- Batches, students, attendance, payments, and adjustments are intentionally
-- left empty. Staff create all operational records from the dashboard.

-- ==============================================================================
-- 9. AUTH USER SYNC TRIGGER & PROVISIONING
-- Automatically links Supabase auth.users to public.profiles
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    assigned_name TEXT;
BEGIN
    assigned_name := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');
    assigned_name := COALESCE(
        NULLIF(left(assigned_name, 120), ''),
        NULLIF(left(split_part(COALESCE(NEW.email, ''), '@', 1), 120), ''),
        'Academy staff'
    );

    INSERT INTO public.profiles (id, full_name, role, branch_id)
    VALUES (NEW.id, assigned_name, 'teacher', NULL)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
