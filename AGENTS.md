# AGENTS.md — Parallel work without collisions

Canonical playbook also lives in the Obsidian vault: `Divide and Conquer.md`.

## Golden rule

**One agent = one lane = non-overlapping files.** If two agents need the same file, run them in series.

## Lanes

| Lane | Touch only | Do not touch |
|------|------------|--------------|
| L1 Money | `app/[locale]/checkout/**`, `lib/orders.ts`, `lib/constants.ts`, `store/cartStore.tsx`, `app/api/webhooks/stripe/**` | admin product forms, visual-search |
| L2 Pickup | `supabase/migrations/0015_*` (or next free number), `lib/pickup.ts` (new), `app/admin/pickup-points/**` | checkout payment logic |
| L3 Brand | `lib/brand.ts`, layouts metadata, `products/[slug]` `generateMetadata` only | checkout, migrations |
| L4 Stores | `0016_stores*`, `app/[locale]/tienda/**`, product `store_id` wiring | stripe webhooks |
| L5 Admin | `app/admin/products/**`, embed-on-publish | checkout |
| L6 Visual | `visual-search/**`, `api/visual-search/**` | checkout |

**Serialized forever:** `middleware.ts`, `package.json`, `package-lock.json`, `.env*`, migration number assignment (human picks the number in the prompt).

## Prefer git worktrees

```bash
git worktree add ../viogi-L1 -b agent/L1-dinero
git worktree add ../viogi-L2 -b agent/L2-pickup
```

Merge to `main` only after `npm run type-check` and `npm run lint`.

## Prompt must include

1. Lane id  
2. Allowed file list  
3. Forbidden list  
4. Definition of Done (type-check, lint, one atomic commit)

## Product decisions (2026-09-17)

- Platform Stripe account owner: **Uzziel**
- Platform fee at start: **0%**
- Mario sells **inside** Viogi store (`owner` column for payouts)
- Pickup price: **per row** in `pickup_points.additional_cost_mxn`
- Display prices: **IVA included** in `price_mxn`. Do **not** add 16% at checkout. Do **not** show an IVA line in cart, order summary, or Stripe line items. Persist `tax_mxn = 0`.
- Platform display name: **`lib/brand.ts`** + `NEXT_PUBLIC_BRAND_*` (do not hardcode platform shell as "VIOGI"; store-facing Viogi copy is separate).
