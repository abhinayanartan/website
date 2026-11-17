-- Keep the application contract and the production schema in sync.
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS remarks TEXT;

ALTER TABLE public.batches
  ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Beginner'
    CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER NOT NULL DEFAULT 20
    CHECK (max_capacity > 0),
  ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 500.00
    CHECK (monthly_fee >= 0);

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Beginner'
    CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- SECURITY DEFINER functions must enforce authorization themselves because they
-- intentionally bypass the calling user's table RLS policies.
CREATE OR REPLACE FUNCTION public.get_student_fee_status(
  p_student_id UUID,
  p_payment_period TEXT
)
RETURNS TABLE (
  monthly_fee NUMERIC(10, 2),
  total_paid NUMERIC(10, 2),
  total_adjustments NUMERIC(10, 2),
  outstanding_balance NUMERIC(10, 2),
  payment_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_monthly_fee NUMERIC(10, 2);
  v_total_paid NUMERIC(10, 2);
  v_total_adjustments NUMERIC(10, 2);
  v_effective_fee NUMERIC(10, 2);
  v_branch_id UUID;
BEGIN
  SELECT s.branch_id, COALESCE(s.monthly_fee, b.monthly_fee, 500.00)
    INTO v_branch_id, v_monthly_fee
    FROM public.students s
    LEFT JOIN public.batches b ON b.id = s.batch_id
   WHERE s.id = p_student_id;

  IF v_branch_id IS NULL THEN
    RAISE EXCEPTION 'Student % does not exist.', p_student_id;
  END IF;

  IF NOT (public.is_admin_for_branch(v_branch_id) OR public.is_teacher_of_student(p_student_id)) THEN
    RAISE EXCEPTION 'Not authorized to view this student''s fee status.';
  END IF;

  SELECT COALESCE(SUM(p.amount), 0.00), COUNT(p.id)
    INTO v_total_paid, payment_count
    FROM public.payments p
   WHERE p.student_id = p_student_id AND p.payment_period = p_payment_period;

  SELECT COALESCE(SUM(CASE
    WHEN a.adjustment_type IN ('discount', 'scholarship', 'waiver') THEN -abs(a.amount)
    ELSE abs(a.amount)
  END), 0.00)
    INTO v_total_adjustments
    FROM public.fee_adjustments a
   WHERE a.student_id = p_student_id;

  v_effective_fee := GREATEST(0.00, v_monthly_fee + v_total_adjustments);
  outstanding_balance := GREATEST(0.00, v_effective_fee - v_total_paid);
  monthly_fee := v_monthly_fee;
  total_adjustments := v_total_adjustments;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_fee_payment_tx(
  p_student_id UUID, p_amount NUMERIC(10, 2), p_payment_date DATE,
  p_payment_method TEXT, p_payment_period TEXT,
  p_transaction_reference TEXT DEFAULT NULL, p_recorded_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL, p_adjustment_amount NUMERIC(10, 2) DEFAULT NULL,
  p_adjustment_type TEXT DEFAULT NULL, p_adjustment_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
  payment_id UUID, receipt_number TEXT, amount_paid NUMERIC(10, 2),
  payment_date DATE, payment_method TEXT, payment_period TEXT,
  outstanding_balance NUMERIC(10, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_receipt_number TEXT;
  v_payment_id UUID;
  v_status RECORD;
  v_branch_id UUID;
BEGIN
  SELECT branch_id INTO v_branch_id FROM public.students WHERE id = p_student_id;
  IF v_branch_id IS NULL THEN RAISE EXCEPTION 'Student % does not exist.', p_student_id; END IF;
  IF NOT public.is_admin_for_branch(v_branch_id) THEN
    RAISE EXCEPTION 'Not authorized to record payments for this branch.';
  END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Payment amount must be greater than zero.'; END IF;
  IF p_payment_method NOT IN ('cash', 'UPI', 'bank transfer') THEN
    RAISE EXCEPTION 'Invalid payment method.';
  END IF;

  v_receipt_number := public.generate_receipt_number();
  INSERT INTO public.payments (student_id, amount, payment_date, payment_method,
    transaction_reference, receipt_number, payment_period, recorded_by, notes)
  VALUES (p_student_id, p_amount, COALESCE(p_payment_date, CURRENT_DATE), p_payment_method,
    NULLIF(trim(p_transaction_reference), ''), v_receipt_number, p_payment_period,
    auth.uid(), p_notes)
  RETURNING id INTO v_payment_id;

  IF p_adjustment_amount IS NOT NULL AND p_adjustment_amount <> 0 THEN
    INSERT INTO public.fee_adjustments (student_id, amount, adjustment_type, reason)
    VALUES (p_student_id, p_adjustment_amount, COALESCE(p_adjustment_type, 'discount'),
      COALESCE(p_adjustment_reason, 'Applied during payment ' || v_receipt_number));
  END IF;

  SELECT * INTO v_status FROM public.get_student_fee_status(p_student_id, p_payment_period);
  payment_id := v_payment_id; receipt_number := v_receipt_number; amount_paid := p_amount;
  payment_date := COALESCE(p_payment_date, CURRENT_DATE); payment_method := p_payment_method;
  payment_period := p_payment_period; outstanding_balance := v_status.outstanding_balance;
  RETURN NEXT;
END;
$$;
