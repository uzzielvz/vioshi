# Paquete E — Stripe Connect mínimo (L7)

**Estado:** BLOQUEADO  
**Carril:** L7  

No escribas este paquete hasta que `STATUS.md` diga `L7 desbloqueado` y el humano confirme las dos casillas de abajo.

## Casillas humanas (no las marques tú)

- [ ] Contador: régimen / retenciones / si Connect en MX para persona física aguanta el piloto
- [ ] Dashboard Stripe: Express (o Accounts v2) disponible para cuentas MX del tipo que usará Mario
- [ ] L4 mergeado: existe `stores.stripe_account_id` (aunque Mario no sea store)

## Cuando se desbloquee — alcance mínimo

Leer **antes** `.claude/skills/stripe-best-practices/SKILL.md` y su reference de Connect.

- Titular: Uzziel (cuenta plataforma).
- `application_fee`: **0** en Fase 1.
- Cargos a la plataforma; transferencia al vendedor **al marcar entregado** (engancha el botón de F).
- Mario: payout por `products.owner = 'mario'` hacia su Express. Uzziel se queda en la cuenta plataforma.
- Onboarding Express desde **admin**, no público.
- Sin dashboard propio. El vendedor usa el de Stripe.

## Archivos (solo al desbloquear)

Se listarán entonces. Anticipado: `lib/stripe.ts`, admin onboarding, webhook Connect, `markOrderDelivered` de L5. **No** reabrir IVA ni Sessions.

## Fuera de alcance aunque se desbloquee

Comisión 8–10 %, registro abierto, 1099/CFDI automático, destination charges si el skill dice separate charges + transfers.
