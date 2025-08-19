-- Drop unreliable RPC function; logic moved to backend TypeScript (ApplicationService.promoteCandidateToCadet)
-- This migration is idempotent and safe in case the function was already removed

DO $$
BEGIN
  -- Attempt to drop function with a single UUID argument
  BEGIN
    EXECUTE 'DROP FUNCTION IF EXISTS public.promote_candidate_to_cadet(uuid)';
  EXCEPTION WHEN undefined_function THEN
    -- Ignore if signature doesn't exist
    NULL;
  END;
END $$;


