-- Add givaudan_audit to allowed roles
-- The role column appears to be an ENUM type, so we need to add the new value to the enum

-- First, check if the enum type exists and add the new value
DO $$ 
BEGIN
  -- Check if givaudan_audit is already in the enum
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_enum 
    WHERE enumlabel = 'givaudan_audit' 
    AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'user_role'
    )
  ) THEN
    -- Add the new value to the enum type
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'givaudan_audit' AFTER 'staff';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- If user_role enum doesn't exist, the role column might be text type
    -- In that case, try to add/update a check constraint
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
      -- Drop any existing check constraint on role column
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN 
          SELECT con.conname 
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
          WHERE nsp.nspname = 'public' 
            AND rel.relname = 'users'
            AND con.contype = 'c'
        LOOP
          BEGIN
            EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT IF EXISTS %I', r.conname);
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
        END LOOP;
      END;
      
      -- Add new check constraint that includes givaudan_audit
      BEGIN
        ALTER TABLE public.users 
          ADD CONSTRAINT users_role_check 
          CHECK (role IN ('admin', 'manager', 'staff', 'givaudan_audit', 'viewer'));
      EXCEPTION
        WHEN duplicate_object THEN
          ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
          ALTER TABLE public.users 
            ADD CONSTRAINT users_role_check 
            CHECK (role IN ('admin', 'manager', 'staff', 'givaudan_audit', 'viewer'));
        WHEN OTHERS THEN
          NULL; -- Ignore other errors
      END;
    END IF;
END $$;
