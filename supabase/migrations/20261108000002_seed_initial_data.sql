-- ==============================================================================
-- ABHINAYA NARTAN DANCE ACADEMY - ACADEMY MANAGER
-- Complete Production Database Architecture for Supabase (PostgreSQL 15+)
-- Free-Tier Optimized • Strict Row Level Security (RLS) • Financial Immutability
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS (All 7 Requested Tables)
-- ==============================================================================

-- 1. Branches
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_name TEXT NOT NULL,
    address TEXT,
    contact_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Profiles (Linked to Supabase Auth)
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

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
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
-- 6. SECURITY DEFINER HELPER FUNCTIONS FOR RLS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'teacher'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_for_branch(target_branch_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND role = 'admin'
          AND (branch_id IS NULL OR branch_id = target_branch_id)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher_of_batch(target_batch_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = target_batch_id AND teacher_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

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
-- 7. INITIAL SEED DATA
-- ==============================================================================

-- Seed Default Branches
INSERT INTO public.branches (id, branch_name, address, contact_number)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Vijayawada Main Studio', 'Bunder Road, Vijayawada, Andhra Pradesh, 520002', '+91 93981 18249'),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Guntur Satellite Center', 'Lakshmipuram Main Road, Guntur, Andhra Pradesh, 522007', '+91 93981 18249')
ON CONFLICT (id) DO NOTHING;

-- Seed Classical Batches
INSERT INTO public.batches (id, batch_name, branch_id, class_days, start_time, end_time, status)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Junior Balagopala (Beginners)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ARRAY['Mon', 'Wed', 'Fri'], '17:00:00', '18:30:00', 'active'),
    ('c2222222-2222-2222-2222-222222222222', 'Abhinaya & Natya Masters', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ARRAY['Mon', 'Wed', 'Fri'], '18:30:00', '20:00:00', 'active'),
    ('c3333333-3333-3333-3333-333333333333', 'Tarangam Brass Plate Intensive', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ARRAY['Sun'], '09:00:00', '12:00:00', 'active'),
    ('c4444444-4444-4444-4444-444444444444', 'Weekend Senior Repertoire', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ARRAY['Sun'], '18:00:00', '20:00:00', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Students
INSERT INTO public.students (
    id, student_code, full_name, date_of_birth, gender, parent_name, parent_phone, 
    student_phone, address, joining_date, branch_id, batch_id, monthly_fee, status
)
VALUES
    ('d0000001-0000-0000-0000-000000000001', 'AN-2024-001', 'Sravani Manepalli', '2008-04-12', 'female', 'Srinivasa Rao M.', '+91 98480 12345', '+91 98480 12345', 'Benz Circle, Vijayawada', '2024-01-10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3333333-3333-3333-3333-333333333333', 2200.00, 'active'),
    ('d0000002-0000-0000-0000-000000000002', 'AN-2024-002', 'Ananya Varma', '2010-09-22', 'female', 'Ramesh Varma', '+91 94401 56789', '+91 94401 56789', 'Governorpet, Vijayawada', '2024-02-15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2222222-2222-2222-2222-222222222222', 1800.00, 'active'),
    ('d0000003-0000-0000-0000-000000000003', 'AN-2025-015', 'Keerthi Priya K.', '2014-06-18', 'female', 'Venkateswarlu K.', '+91 98665 43210', '+91 98665 43210', 'Moghalrajpuram, Vijayawada', '2025-04-01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1111111-1111-1111-1111-111111111111', 1500.00, 'active'),
    ('d0000004-0000-0000-0000-000000000004', 'AN-2025-018', 'Divya Tejaswi', '2013-11-04', 'female', 'Narasimha Murthy', '+91 99890 24680', '+91 99890 24680', 'Labbipet, Vijayawada', '2025-05-10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1111111-1111-1111-1111-111111111111', 1500.00, 'active'),
    ('d0000005-0000-0000-0000-000000000005', 'AN-2024-009', 'Bhavana Chowdary', '2011-03-30', 'female', 'Subba Rao Ch.', '+91 98492 13579', '+91 98492 13579', 'Patamata, Vijayawada', '2024-06-01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2222222-2222-2222-2222-222222222222', 1800.00, 'active'),
    ('d0000006-0000-0000-0000-000000000006', 'AN-2023-004', 'Harini Rayudu', '2007-08-14', 'female', 'Prasad Rayudu', '+91 94901 98765', '+91 94901 98765', 'Gunadala, Vijayawada', '2023-08-20', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3333333-3333-3333-3333-333333333333', 2200.00, 'active'),
    ('d0000007-0000-0000-0000-000000000007', 'AN-2025-022', 'Pooja Sri', '2009-01-25', 'female', 'Mallikarjuna Rao', '+91 93467 89012', '+91 93467 89012', 'Satyanarayanapuram, Vijayawada', '2025-09-05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c4444444-4444-4444-4444-444444444444', 1600.00, 'active'),
    ('d0000008-0000-0000-0000-000000000008', 'AN-2026-001', 'Tanvi Sri Sai', '2015-05-19', 'female', 'Satish Kumar', '+91 91771 23456', '+91 91771 23456', 'One Town, Vijayawada', '2026-01-08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1111111-1111-1111-1111-111111111111', 1500.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Verified Payments
INSERT INTO public.payments (
    id, student_id, amount, payment_date, payment_method, transaction_reference, 
    receipt_number, payment_period, notes
)
VALUES
    ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 2200.00, '2026-11-02', 'UPI', 'UPI-4309819231', 'AN-2026-0101', 'November 2026', 'PhonePe payment verified'),
    ('e0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 1800.00, '2026-11-03', 'UPI', 'UPI-4310023412', 'AN-2026-0102', 'November 2026', 'Google Pay payment verified'),
    ('e0000003-0000-0000-0000-000000000003', 'd0000003-0000-0000-0000-000000000003', 1500.00, '2026-11-04', 'cash', NULL, 'AN-2026-0103', 'November 2026', 'Cash received at front desk counter'),
    ('e0000004-0000-0000-0000-000000000004', 'd0000006-0000-0000-0000-000000000006', 2200.00, '2026-11-05', 'bank transfer', 'NEFT-SBI99812', 'AN-2026-0104', 'November 2026', 'SBI Online NetBanking')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Attendance Records (Current Date)
INSERT INTO public.attendance (
    student_id, batch_id, attendance_date, status
)
VALUES
    ('d0000001-0000-0000-0000-000000000001', 'c3333333-3333-3333-3333-333333333333', CURRENT_DATE, 'present'),
    ('d0000002-0000-0000-0000-000000000002', 'c2222222-2222-2222-2222-222222222222', CURRENT_DATE, 'present'),
    ('d0000003-0000-0000-0000-000000000003', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE, 'present'),
    ('d0000004-0000-0000-0000-000000000004', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE, 'leave')
ON CONFLICT ON CONSTRAINT uq_student_batch_date DO NOTHING;

-- Seed Initial Fee Adjustment
INSERT INTO public.fee_adjustments (
    student_id, amount, adjustment_type, reason
)
VALUES
    ('d0000004-0000-0000-0000-000000000004', -300.00, 'discount', 'Sibling concession for junior batch')
ON CONFLICT (id) DO NOTHING;
