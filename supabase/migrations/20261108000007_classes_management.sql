-- ==============================================================================
-- ABHINAYA NARTAN DANCE ACADEMY - ACADEMY MANAGER
-- Migration: 20261108000007_classes_management.sql
-- Description: Class Management & Scheduling Architecture
-- ==============================================================================

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_classes_branch ON public.classes(branch_id);
CREATE INDEX IF NOT EXISTS idx_classes_batch ON public.classes(batch_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_date ON public.classes(class_date);
CREATE INDEX IF NOT EXISTS idx_classes_status ON public.classes(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy: Admins can view branch classes; Teachers can view their assigned classes or batch classes
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

-- 2. INSERT Policy: Only authorized branch administrators can schedule classes
DROP POLICY IF EXISTS "Admins can insert classes" ON public.classes;
CREATE POLICY "Admins can insert classes"
ON public.classes
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_for_branch(branch_id));

-- 3. UPDATE Policy: Admins and assigned teachers can update class status and notes
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

-- 4. DELETE Policy: Only administrators can cancel/delete a scheduled class record
DROP POLICY IF EXISTS "Admins can delete classes" ON public.classes;
CREATE POLICY "Admins can delete classes"
ON public.classes
FOR DELETE
TO authenticated
USING (public.is_admin_for_branch(branch_id));
