-- Remove the retired Guntur satellite center from production data.
DELETE FROM public.branches
WHERE branch_name = 'Guntur Satellite Center';
