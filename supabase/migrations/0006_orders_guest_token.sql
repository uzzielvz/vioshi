-- =============================================================================
-- Migration 0006: Add guest_token to orders
--
-- Purpose: Allows guest users to look up their own order after checkout.
-- The token is a HMAC-SHA256 of (order_number + ":" + email) signed with
-- ADMIN_SECRET. It is generated server-side in createPaymentIntentAction and
-- stored here so the success page can verify it without exposing service role
-- logic to the client.
--
-- Lookup pattern (success page, Server Component):
--   SELECT * FROM orders
--   WHERE order_number = $1 AND guest_token = $2
--   via createAdminClient() — never via anon key.
-- =============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS guest_token text;

-- Partial index: only rows that actually have a token (most orders won't after
-- users log in and user_id is set, but guests always will).
CREATE INDEX IF NOT EXISTS orders_guest_token_idx
  ON public.orders (guest_token)
  WHERE guest_token IS NOT NULL;
