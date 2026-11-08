-- ==============================================================================
-- ABHINAYA NARTAN ACADEMY MANAGER - MIGRATION 004
-- Fee Collection Transactions, Audit Immutability & Balance Helpers
-- Zero-cost PostgreSQL stored procedures for atomic financial recording
-- ==============================================================================

-- 1. Helper Function: Get Student Fee Status for a given payment period
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
) AS $$
DECLARE
    v_monthly_fee NUMERIC(10, 2);
    v_total_paid NUMERIC(10, 2);
    v_total_adjustments NUMERIC(10, 2);
    v_effective_fee NUMERIC(10, 2);
BEGIN
    -- 1. Fetch student's assigned monthly fee (or fallback to batch fee)
    SELECT COALESCE(s.monthly_fee, b.monthly_fee, 1500.00)
    INTO v_monthly_fee
    FROM public.students s
    LEFT JOIN public.batches b ON b.id = s.batch_id
    WHERE s.id = p_student_id;

    IF v_monthly_fee IS NULL THEN
        v_monthly_fee := 1500.00;
    END IF;

    -- 2. Fetch total payments for this specific student and period
    SELECT COALESCE(SUM(p.amount), 0.00), COUNT(p.id)
    INTO v_total_paid, payment_count
    FROM public.payments p
    WHERE p.student_id = p_student_id
      AND p.payment_period = p_payment_period;

    -- 3. Fetch adjustments (discounts/scholarships reduce fee, fines increase fee)
    -- Positive adjustment_type ('fine') increases fee; others ('discount','scholarship','waiver') reduce fee
    SELECT COALESCE(SUM(
        CASE 
            WHEN a.adjustment_type IN ('discount', 'scholarship', 'waiver') THEN -abs(a.amount)
            ELSE abs(a.amount)
        END
    ), 0.00)
    INTO v_total_adjustments
    FROM public.fee_adjustments a
    WHERE a.student_id = p_student_id;

    v_effective_fee := GREATEST(0.00, v_monthly_fee + v_total_adjustments);
    outstanding_balance := GREATEST(0.00, v_effective_fee - v_total_paid);
    monthly_fee := v_monthly_fee;
    total_paid := v_total_paid;
    total_adjustments := v_total_adjustments;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Stored Procedure: Record Fee Payment Transaction
-- Enforces atomicity, validation, auto-receipt generation, and audit logging
CREATE OR REPLACE FUNCTION public.record_fee_payment_tx(
    p_student_id UUID,
    p_amount NUMERIC(10, 2),
    p_payment_date DATE,
    p_payment_method TEXT,
    p_payment_period TEXT,
    p_transaction_reference TEXT DEFAULT NULL,
    p_recorded_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_adjustment_amount NUMERIC(10, 2) DEFAULT NULL,
    p_adjustment_type TEXT DEFAULT NULL,
    p_adjustment_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
    payment_id UUID,
    receipt_number TEXT,
    amount_paid NUMERIC(10, 2),
    payment_date DATE,
    payment_method TEXT,
    payment_period TEXT,
    outstanding_balance NUMERIC(10, 2)
) AS $$
DECLARE
    v_receipt_number TEXT;
    v_payment_id UUID;
    v_status RECORD;
BEGIN
    -- Validate amount
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Accounting Error: Payment amount must be greater than zero. Received: %', p_amount;
    END IF;

    -- Validate payment method
    IF p_payment_method NOT IN ('cash', 'UPI', 'bank transfer') THEN
        RAISE EXCEPTION 'Accounting Error: Invalid payment method. Must be cash, UPI, or bank transfer. Received: %', p_payment_method;
    END IF;

    -- Verify student exists
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id) THEN
        RAISE EXCEPTION 'Accounting Error: Student with ID % does not exist.', p_student_id;
    END IF;

    -- Generate unique receipt number
    v_receipt_number := public.generate_receipt_number();

    -- Insert payment record into immutable ledger
    INSERT INTO public.payments (
        student_id,
        amount,
        payment_date,
        payment_method,
        transaction_reference,
        receipt_number,
        payment_period,
        recorded_by,
        notes
    ) VALUES (
        p_student_id,
        p_amount,
        COALESCE(p_payment_date, CURRENT_DATE),
        p_payment_method,
        NULLIF(trim(p_transaction_reference), ''),
        v_receipt_number,
        p_payment_period,
        p_recorded_by,
        p_notes
    )
    RETURNING id INTO v_payment_id;

    -- If an adjustment is specified in the transaction, record it in fee_adjustments
    IF p_adjustment_amount IS NOT NULL AND p_adjustment_amount <> 0 THEN
        INSERT INTO public.fee_adjustments (
            student_id,
            amount,
            adjustment_type,
            reason
        ) VALUES (
            p_student_id,
            p_adjustment_amount,
            COALESCE(p_adjustment_type, 'discount'),
            COALESCE(p_adjustment_reason, 'Applied during payment ' || v_receipt_number)
        );
    END IF;

    -- Calculate remaining balance
    SELECT * INTO v_status FROM public.get_student_fee_status(p_student_id, p_payment_period);

    payment_id := v_payment_id;
    receipt_number := v_receipt_number;
    amount_paid := p_amount;
    payment_date := COALESCE(p_payment_date, CURRENT_DATE);
    payment_method := p_payment_method;
    payment_period := p_payment_period;
    outstanding_balance := v_status.outstanding_balance;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_student_fee_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_fee_payment_tx(UUID, NUMERIC, DATE, TEXT, TEXT, TEXT, UUID, TEXT, NUMERIC, TEXT, TEXT) TO authenticated;
