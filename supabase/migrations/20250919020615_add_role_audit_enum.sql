-- Add 'audit' to the user_role enum type
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'audit' AFTER 'givaudan_audit';

