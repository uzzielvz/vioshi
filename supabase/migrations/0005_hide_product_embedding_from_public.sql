-- =============================================================================
-- VIOGI — SEC-06: Hide products.embedding from public API roles
--
-- lib/products.ts already omits embedding in explicit selects; this migration
-- blocks REST scraping (e.g. ?select=*) via anon/authenticated keys.
--
-- service_role, RPC match_products_by_image, and admin scripts retain access.
-- =============================================================================

revoke select (embedding) on table public.products from anon;
revoke select (embedding) on table public.products from authenticated;
