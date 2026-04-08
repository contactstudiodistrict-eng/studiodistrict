-- Migration 011: Auto-cancel bookings stuck in awaiting_payment after 30 minutes
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable pg_cron extension (may already be enabled)
create extension if not exists pg_cron;

-- 2. Function: cancel expired awaiting_payment bookings
create or replace function expire_awaiting_payment_bookings()
returns void
language plpgsql
security definer
as $$
declare
  expired_count int;
begin
  update bookings
  set
    status     = 'cancelled',
    -- reuse completed_at column as a "cancelled_at" marker isn't in schema,
    -- so we log it via the updated_at timestamp below
    updated_at = now()
  where
    status = 'awaiting_payment'
    and wa_payment_sent_at is not null
    and wa_payment_sent_at < now() - interval '30 minutes';

  get diagnostics expired_count = row_count;

  if expired_count > 0 then
    raise log 'expire_awaiting_payment_bookings: cancelled % booking(s)', expired_count;
  end if;
end;
$$;

-- 3. Schedule it to run every 5 minutes
--    (checks frequently so no booking waits more than ~35 min total)
select cron.schedule(
  'expire-awaiting-payment',   -- job name (unique)
  '*/5 * * * *',               -- every 5 minutes
  'select expire_awaiting_payment_bookings()'
);

-- ─── To verify it's scheduled ──────────────────────────────────────────────
-- select * from cron.job where jobname = 'expire-awaiting-payment';

-- ─── To check run history ──────────────────────────────────────────────────
-- select * from cron.job_run_details where jobid = (
--   select jobid from cron.job where jobname = 'expire-awaiting-payment'
-- ) order by start_time desc limit 20;

-- ─── To unschedule (if needed) ─────────────────────────────────────────────
-- select cron.unschedule('expire-awaiting-payment');
