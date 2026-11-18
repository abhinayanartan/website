-- Keep profile privileges server-controlled. RLS can authorize rows, but it
-- cannot by itself prevent a user from changing sensitive columns on their
-- own permitted profile row.

CREATE OR REPLACE FUNCTION public.enforce_profile_privilege_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- A profile identity is immutable for every caller.
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Profile identity cannot be changed.';
  END IF;

  -- Academy administrators may manage staff roles and branch assignments.
  -- For self-updates, rely on the pre-update role so a teacher cannot make a
  -- new value look administrative during this same statement.
  IF auth.uid() IS NOT NULL
    AND (
      NEW.role IS DISTINCT FROM OLD.role
      OR NEW.branch_id IS DISTINCT FROM OLD.branch_id
    ) THEN
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
FOR EACH ROW
EXECUTE FUNCTION public.enforce_profile_privilege_integrity();

-- Rebuild the profile policies so clients cannot create a profile row for
-- themselves. Auth provisioning runs as SECURITY DEFINER and remains able to
-- create the initial teacher profile; staff management is administrator-only.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Staff can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Never derive authorization or branch scope from signup metadata. Existing
-- profiles are deliberately untouched, so current Academy Directors keep
-- their roles. New auth accounts begin as unassigned teachers and an Academy
-- Director can assign their branch or promote them through an authorized flow.
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

