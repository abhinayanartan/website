-- Run in the Supabase SQL Editor using a privileged database session.
-- This is a read-only production policy checklist.

SELECT
  c.relname AS table_name,
  c.relrowsecurity AS row_level_security_enabled,
  c.relforcerowsecurity AS forced_for_table_owner
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('branches', 'profiles', 'batches', 'students', 'attendance', 'payments', 'fee_adjustments')
ORDER BY c.relname;

SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('branches', 'profiles', 'batches', 'students', 'attendance', 'payments', 'fee_adjustments')
ORDER BY tablename, policyname;

SELECT routine_schema, routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_admin',
    'is_teacher',
    'is_admin_for_branch',
    'is_teacher_of_batch',
    'is_teacher_of_student'
  )
ORDER BY routine_name;
