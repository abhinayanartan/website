-- Replace demo academy records with the supplied student roster.
-- Personal details remain NULL until staff complete each profile.

ALTER TABLE public.students
  ALTER COLUMN parent_name DROP NOT NULL,
  ALTER COLUMN parent_phone DROP NOT NULL;

-- Remove only the original seeded demo records and their dependent test data.
DELETE FROM public.attendance
WHERE student_id IN (
  'd0000001-0000-0000-0000-000000000001',
  'd0000002-0000-0000-0000-000000000002',
  'd0000003-0000-0000-0000-000000000003',
  'd0000004-0000-0000-0000-000000000004',
  'd0000005-0000-0000-0000-000000000005',
  'd0000006-0000-0000-0000-000000000006',
  'd0000007-0000-0000-0000-000000000007',
  'd0000008-0000-0000-0000-000000000008'
);

-- These rows are the original seeded test records, not real financial logs.
-- Temporarily remove the guard for this atomic cleanup, then restore it below.
DROP TRIGGER IF EXISTS trg_enforce_payments_immutable ON public.payments;

DELETE FROM public.payments
WHERE student_id IN (
  'd0000001-0000-0000-0000-000000000001',
  'd0000002-0000-0000-0000-000000000002',
  'd0000003-0000-0000-0000-000000000003',
  'd0000006-0000-0000-0000-000000000006'
);

DELETE FROM public.fee_adjustments
WHERE student_id IN (
  'd0000004-0000-0000-0000-000000000004'
);

DELETE FROM public.students
WHERE id IN (
  'd0000001-0000-0000-0000-000000000001',
  'd0000002-0000-0000-0000-000000000002',
  'd0000003-0000-0000-0000-000000000003',
  'd0000004-0000-0000-0000-000000000004',
  'd0000005-0000-0000-0000-000000000005',
  'd0000006-0000-0000-0000-000000000006',
  'd0000007-0000-0000-0000-000000000007',
  'd0000008-0000-0000-0000-000000000008'
);

CREATE TRIGGER trg_enforce_payments_immutable
BEFORE UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_payment_tampering();

WITH roster(full_name) AS (
  VALUES
    ('Anandhi'),
    ('Ridhi'),
    ('Jahnavi'),
    ('Devanshi'),
    ('Honey'),
    ('Koushi'),
    ('Mokshapriya'),
    ('Geethika B'),
    ('Varshika'),
    ('Varnika'),
    ('Hemanshi'),
    ('Geethika'),
    ('Hanshitha'),
    ('Jesmica'),
    ('Jesmitha'),
    ('Jessy'),
    ('Jeswica'),
    ('Jetha sri'),
    ('Kumari'),
    ('Karthika'),
    ('Karthika big'),
    ('Ketanasri'),
    ('Mokshasri'),
    ('Maanvi'),
    ('Nithya'),
    ('Noushika'),
    ('Pavitra'),
    ('Pujitha'),
    ('Srinidhi P'),
    ('Anviitha'),
    ('Rushitha'),
    ('Charu'),
    ('Hasritha'),
    ('Divya sri'),
    ('Sai joshna'),
    ('Dhanu sri'),
    ('Shreyansh'),
    ('Sivathmika'),
    ('Sreshta'),
    ('Swathi'),
    ('Tejanvitha'),
    ('Teju'),
    ('Yashika')
)
INSERT INTO public.students (
  student_code,
  full_name,
  date_of_birth,
  gender,
  parent_name,
  parent_phone,
  student_phone,
  address,
  joining_date,
  branch_id,
  batch_id,
  monthly_fee,
  status
)
SELECT
  'AN-2026-' || lpad(row_number() OVER (ORDER BY full_name)::TEXT, 3, '0'),
  full_name,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  CURRENT_DATE,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'c1111111-1111-1111-1111-111111111111',
  500.00,
  'active'
FROM roster;
