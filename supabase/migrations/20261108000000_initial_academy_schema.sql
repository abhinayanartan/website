-- ==============================================================================
-- ABHINAYA NARTAN DANCE ACADEMY - DATABASE ARCHITECTURE
-- Migration: 20261108000000_initial_academy_schema.sql
-- Description: Core tables, constraints, foreign keys, indexes, and immutability guards.
-- Engine: PostgreSQL 15+ (Supabase Free-Tier Compatible)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- Table 1: Branches
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_name TEXT NOT NULL,
    address TEXT,
    contact_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 2: Profiles (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')) DEFAULT 'teacher',
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 3: Batches
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

-- Table 4: Students
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

-- Table 5: Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave')) DEFAULT 'present',
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Constraint: Prevent duplicate attendance for the same student, batch and date
    CONSTRAINT uq_student_batch_date UNIQUE (student_id, batch_id, attendance_date)
);

-- Table 6: Payments
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

-- Table 7: Fee Adjustments
CREATE TABLE IF NOT EXISTS public.fee_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount <> 0),
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('discount', 'scholarship', 'waiver', 'fine', 'other')),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. HIGH-PERFORMANCE INDEXES
-- ==============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_branch ON public.profiles(branch_id);

-- Batches indexes
CREATE INDEX IF NOT EXISTS idx_batches_branch ON public.batches(branch_id);
CREATE INDEX IF NOT EXISTS idx_batches_teacher ON public.batches(teacher_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);

-- Students indexes
CREATE INDEX IF NOT EXISTS idx_students_branch ON public.students(branch_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON public.students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_code ON public.students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON public.students(parent_phone);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_batch_date ON public.attendance(batch_id, attendance_date);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_period ON public.payments(payment_period);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON public.payments(receipt_number);

-- Fee Adjustments indexes
CREATE INDEX IF NOT EXISTS idx_adjustments_student ON public.fee_adjustments(student_id);

-- ==============================================================================
-- 4. FINANCIAL AUDIT & IMMUTABILITY GUARD
-- Requirement: "Payment records must not be silently deleted or overwritten."
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_payment_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit Violation: Payment records are immutable financial audit logs and cannot be updated or deleted. Issue a fee_adjustment if a correction is necessary.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_payments_immutable ON public.payments;
CREATE TRIGGER trg_enforce_payments_immutable
BEFORE UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_payment_tampering();

-- ==============================================================================
-- 5. AUTOMATED RECEIPT NUMBER GENERATION SEQUENCE
-- Format: AN-YYYY-XXXX (e.g. AN-2026-0001)
-- ==============================================================================

CREATE SEQUENCE IF NOT EXISTS public.receipt_number_seq START 1;

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

-- Trigger to auto-generate receipt_number if not explicitly provided
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
