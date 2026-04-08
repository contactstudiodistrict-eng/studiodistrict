-- Run this in Supabase Dashboard → SQL Editor
-- After santhos.tgs@gmail.com has signed in at least once via magic link

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the user ID from auth
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'santhos.tgs@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User santhos.tgs@gmail.com not found. They must sign in at least once first.';
  END IF;

  -- Update role in public.users
  UPDATE public.users
  SET role = 'admin'
  WHERE id = v_user_id;

  -- Insert into admin_users (skip if already exists)
  INSERT INTO public.admin_users (id, permissions)
  VALUES (v_user_id, ARRAY['studios','bookings','payments','users'])
  ON CONFLICT (id) DO UPDATE
    SET permissions = ARRAY['studios','bookings','payments','users'];

  RAISE NOTICE 'Admin access granted to santhos.tgs@gmail.com (id: %)', v_user_id;
END $$;
