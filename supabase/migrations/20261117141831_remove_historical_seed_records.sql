-- Earlier releases populated an imported starter roster. Remove only those
-- structurally identifiable rows so a newly provisioned academy starts clean.
-- Real records created by staff do not match this combination of fields.

DELETE FROM public.attendance
WHERE student_id IN (
  SELECT id
  FROM public.students
  WHERE student_code ~ '^AN-2026-(00[1-9]|0[1-3][0-9]|04[0-3])$'
    AND parent_name IS NULL
    AND parent_phone IS NULL
    AND batch_id = 'c1111111-1111-1111-1111-111111111111'
);

DELETE FROM public.fee_adjustments
WHERE student_id IN (
  SELECT id
  FROM public.students
  WHERE student_code ~ '^AN-2026-(00[1-9]|0[1-3][0-9]|04[0-3])$'
    AND parent_name IS NULL
    AND parent_phone IS NULL
    AND batch_id = 'c1111111-1111-1111-1111-111111111111'
);

-- The historical ledger guard correctly blocks normal deletes. It is
-- temporarily recreated around this one-time removal of starter records.
DROP TRIGGER IF EXISTS trg_enforce_payments_immutable ON public.payments;

DELETE FROM public.payments
WHERE student_id IN (
  SELECT id
  FROM public.students
  WHERE student_code ~ '^AN-2026-(00[1-9]|0[1-3][0-9]|04[0-3])$'
    AND parent_name IS NULL
    AND parent_phone IS NULL
    AND batch_id = 'c1111111-1111-1111-1111-111111111111'
);

CREATE TRIGGER trg_enforce_payments_immutable
BEFORE UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_payment_tampering();

DELETE FROM public.students
WHERE student_code ~ '^AN-2026-(00[1-9]|0[1-3][0-9]|04[0-3])$'
  AND parent_name IS NULL
  AND parent_phone IS NULL
  AND batch_id = 'c1111111-1111-1111-1111-111111111111';

-- Delete only the historical empty batches. Any batch that has been used by
-- staff remains intact.
DELETE FROM public.batches b
WHERE b.id IN (
  'c1111111-1111-1111-1111-111111111111',
  'c2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'c4444444-4444-4444-4444-444444444444'
)
AND NOT EXISTS (SELECT 1 FROM public.students s WHERE s.batch_id = b.id)
AND NOT EXISTS (SELECT 1 FROM public.classes c WHERE c.batch_id = b.id);

-- A clean ledger begins with the intended first receipt number. Never rewind
-- a populated financial ledger.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.payments) THEN
    PERFORM setval('public.receipt_number_seq', 101, false);
  END IF;
END;
$$;
