# PLAN.md - Viogi (Roadmap Vivo)

**Última actualización:** 2026-05-22
**Rama actual:** `feat/checkout-real` (base `main` @ `f846b77`) — **sin merge a `main`**
**Estado general:** Fases 0 y 1 **cerradas** ✅. Fase 2 **código completo** en rama; **CHK-09 E2E en depuración** (Pay no redirige a success aún).
**Fuente de verdad técnica:** `RESEARCH-CONSOLIDADO.md` (2026-05-19)

---

## 1. Definición de "Proyecto Cerrado"

Viogi se considera **cerrado y listo para vender** cuando se cumplen **todos** estos criterios verificables:

### Comercio y transacciones
- [x] Un cliente puede completar una compra real: carrito → checkout → pedido persistido en `orders` + `order_items` con snapshots de precio, impuestos y envío.
- [x] El número de orden (`VIO-YYYY-NNNN` vía secuencia existente) es real, no un literal mock (`ORDER123`).
- [ ] Pasarela de pago conectada (Stripe) con webhook de confirmación e idempotencia. ← código listo; keys en `.env.local` ✅; **flujo Pay → success pendiente de validar** (mañana)
- [x] Invitado y usuario autenticado pueden completar compra; el invitado puede **consultar su pedido** post-compra (HMAC token en URL success).
- [x] Precios del carrito se validan server-side contra DB al momento del pedido (anti-tampering localStorage).

### Cuenta de usuario
- [x] `/account/orders` y `/account/orders/[orderId]` leen de Supabase, no mocks.
- [x] `/account/addresses` CRUD real contra tabla `addresses`.
- [ ] Wishlist sincronizada con `wishlist_items` para usuarios autenticados (merge al login).

### Admin y catálogo
- [ ] Admin CRUD productos con validación de inputs, uploads con feedback de errores, y schema reproducible desde migraciones (incl. `product_attributes`).
- [ ] Pickup points en checkout provienen de la misma fuente que el panel admin (`pickup_points` en DB).
- [ ] Variantes de producto administrables (tabla `product_variants` ya existe).

### Búsqueda visual (integración producción)
- [ ] Visual search accesible desde flujo de tienda (no solo ruta oculta `/visual-search`).
- [ ] Embeddings se generan automáticamente al crear/actualizar producto en admin.
- [ ] Endpoint protegido contra abuso (rate limit) y costos Gemini acotados.
- [ ] Columna `embedding` no expuesta públicamente vía anon key.

### Seguridad y operaciones
- [ ] Admin auth endurecido (cookie no contiene secreto en claro; rate limit login).
- [ ] OAuth callback sanitiza parámetro `next` (anti open-redirect).
- [ ] `.env.example` completo (`ADMIN_SECRET`, `GEMINI_API_KEY`, etc.).
- [ ] CI ejecuta `npm run build` en PRs.
- [ ] Variables de entorno configuradas en Vercel producción.

### Documentación
- [ ] `RESEARCH-CONSOLIDADO.md` (o sucesor) y `PLAN.md` reflejan el estado real del código.
- [ ] `README.md`, `CONTEXT.md`, `visual-search/README.md` actualizados.
- [ ] Planes históricos obsoletos archivados o referenciados explícitamente como históricos.

### Fuera de alcance para "cerrado v1" (post-launch)
- Promo codes UI, email transaccional (Resend), CFDI (Facturapi), tests E2E completos, archive drops reales en DB, formulario vender con backend.

---

## 2. Fases del Proyecto (con estado actual)

### Fase 0: Limpieza y Saneamiento ← **CERRADA** ✅

**Objetivo:** Eliminar ruido, alinear documentación con código, reducir confusión para desarrollo posterior. Sin cambios funcionales de negocio.

**Tareas principales:**
| # | Tarea | Estado |
|---|-------|--------|
| 0.1 | Consolidar documentación: promover `RESEARCH-CONSOLIDADO.md` como SSOT | ✅ CLN-02 |
| 0.2 | Actualizar `README.md` | ✅ CLN-01 |
| 0.3 | Actualizar `CONTEXT.md` | ✅ CLN-01 |
| 0.4 | Actualizar `visual-search/README.md` | ✅ CLN-01 |
| 0.5 | Completar `.env.example` (`ADMIN_SECRET`, `GEMINI_API_KEY`) | ✅ CLN-03 |
| 0.6 | Archivar `scripts/seed-visual-search.ts` → `scripts/legacy/` | ✅ CLN-04 |
| 0.7 | Auditar `lib/supabase/client.ts` | ⏸ Diferido (post Fase 0) |
| 0.8 | Merge `feat/visual-search-gemini` → `main` | ✅ CLN-05 |
| 0.9 | Limpiar productos seed demo (SQL post-demo) | 📋 **Listo para ejecutar manualmente** | SQL abajo; correr en Supabase SQL Editor antes de launch público |
| 0.10 | Revisar `.gitignore` (`.next/`, `.playwright-mcp/`) | ⏸ Diferido (post Fase 0) |
| 0.11 | Archivar planes obsoletos en `docs/archive/` | ✅ CLN-07 |
| — | Archivar rama `feat/visual-search` (FastAPI) como tag | ✅ CLN-06 |

**Estado actual:** Fase 0 cerrada. Rama de trabajo: `main`. Rama canónica visual search: Gemini en `main`. Legacy FastAPI preservada en tag `archive/feat-visual-search-fastapi` (`dd349ef`).

#### CLN-05 — Checklist pre-merge (`feat/visual-search-gemini` → `main`)

**Rama canónica:** `feat/visual-search-gemini` (Gemini + pgvector).  
**Rama legacy (no mergear):** `origin/feat/visual-search` (FastAPI + CLIP).

| # | Verificación | Resultado | Notas |
|---|--------------|-----------|-------|
| 1 | `npm run type-check` | ✅ Pass | 2026-05-19 |
| 2 | `npm run lint` | ✅ Pass | Sin warnings |
| 3 | `npm run build` | ✅ Pass | Next.js 14.2.35, 54 páginas estáticas |
| 4 | Migración `0003` aplicada en Supabase | ⚠️ CLI bloqueada | Aplicada manualmente en sesión previa (SQL Editor). `supabase db push` requiere `supabase login` (2026-05-19) |

#### Supabase migrations — intento CLI (2026-05-19)

Migraciones en repo: `0001_initial_schema`, `0002_handle_new_user`, `0003_pgvector_and_embeddings`, `0004_product_attributes`, `0005_hide_product_embedding_from_public`.

| Comando | Resultado |
|---------|-----------|
| `npx supabase link --project-ref oilvubxpxxzfxlqhsumk` | ❌ `Access token not provided. Supply an access token by running supabase login or setting SUPABASE_ACCESS_TOKEN` |
| `npx supabase migration list` | ❌ `Cannot find project ref. Have you run supabase link?` |
| `npx supabase db push` | ❌ `Cannot find project ref. Have you run supabase link?` |

**Desbloqueo:** ejecutar `npx supabase login` (browser) o exportar `SUPABASE_ACCESS_TOKEN`, luego repetir link → migration list → db push.

**Alternativa:** pegar `0003_pgvector_and_embeddings.sql` en Supabase Dashboard → SQL Editor (ya hecho en demo).

#### Tarea 0.9 — SQL limpieza seeds (manual, pre-launch)

```sql
-- Borrar productos demo de visual search (description prefix [seed])
DELETE FROM product_images
WHERE product_id IN (SELECT id FROM products WHERE description LIKE '[seed]%');

DELETE FROM products WHERE description LIKE '[seed]%';
```

Ejecutar en Supabase SQL Editor cuando el catálogo real esté listo.
| 5 | Env vars Vercel (`GEMINI_API_KEY`, `ADMIN_SECRET`, Supabase) | ☐ Manual | Configurar antes de deploy prod |
| 6 | Push rama a origin | ✅ Hecho | `8745b44` → `origin/feat/visual-search-gemini` |
| 7 | Merge a `main` | ✅ Hecho | Fast-forward local + push `origin/main` @ `4dd10ed` |

**Pruebas manuales recomendadas post-merge / pre-deploy:**

| Flujo | Ruta | Qué verificar |
|-------|------|---------------|
| Catálogo | `/es/` | Productos cargan desde Supabase |
| Visual search | `/visual-search` | Upload imagen → top-3 + descripción IA (~15–20s) |
| Admin login | `/admin/login` | Cookie `admin_token` con `ADMIN_SECRET` |
| Admin CRUD | `/admin/products` | Crear/editar producto + imagen |
| Auth | `/es/account` | Login email + Google OAuth |
| Checkout | `/es/checkout` | UI OK; submit sigue mock (esperado) |

**Commits en rama vs `main`:** 11 (5× Fase 0 docs + 6× visual search feature desde `155ed14`).

---

### Fase 1: Bugs Críticos y Seguridad

**Objetivo:** Corregir riesgos que impiden deploy seguro o reproducibilidad del schema.

**Tareas principales:**
| # | Tarea | Estado |
|---|-------|--------|
| 1.1 | Migración `0004_product_attributes.sql` + RLS coherente (RLS-01) | ✅ Migración creada (pendiente `db push`) |
| 1.2 | Verificar DDL real de `product_attributes` en Supabase producción vs migración | ✅ Spike 2026-05-19 |
| 1.3 | Sanitizar `next` en `app/auth/callback/route.ts` (AUTH-04) | ✅ SEC-02 |
| 1.4 | Endurecer admin: cookie firmada o sesión opaca; no almacenar `ADMIN_SECRET` en cookie (AUTH-01) | ✅ SEC-03 |
| 1.5 | Re-validación admin en Server Actions (`createProduct`, `deleteProduct`, etc.) (SA-01) | ✅ SEC-03/04 |
| 1.6 | Rate limit `/admin/login` y `/api/visual-search` (AUTH-02, VS-01) | ✅ SEC-05 |
| 1.7 | Restringir exposición pública de `products.embedding` (RLS-02) | ✅ SEC-06 (migración 0005) |
| 1.8 | Validación uploads admin: tamaño, MIME, errores visibles (IMG-01, SA-04) | ✅ SEC-07 |
| 1.9 | Parametrizar Supabase hostname en `next.config.js` desde env (IMG-03) | ✅ SEC-09 |
| 1.10 | Añadir `npm run build` al workflow CI (`.github/workflows/ci.yml`) | ✅ SEC-08 |

**Estado actual:** Fase 1 **100% cerrada** ✅. Migraciones `0004`/`0005` aplicadas en Supabase prod (manualmente). Deploy en Vercel funcionando. Rama mergeada a `main` @ `f846b77`.

---

### Fase 2: Checkout Real y Transacciones ← **EN CURSO** (E2E pago mañana) 🚧

**Objetivo:** Flujo de compra end-to-end persistido en DB; base para pagos.

**Tareas principales:**
| # | Tarea | Estado |
|---|-------|--------|
| 2.1 | Server Action `createPaymentIntentAction`: validar precios, insert `orders`+`order_items`, crear Stripe PaymentIntent | ✅ `app/[locale]/checkout/actions.ts` |
| 2.2 | Eliminar `setTimeout` + redirect `ORDER123` en checkout (CART-02) | ✅ `checkout/page.tsx` reemplazado |
| 2.3 | Validación server-side de carrito vs precios actuales en DB (CART-01) | ✅ En `createPaymentIntentAction` |
| 2.4 | Guest lookup: HMAC token en `orders.guest_token` (migración 0006) | ✅ Migración + generación en action |
| 2.5 | Página success lee pedido real por `order_number` (CART-04) | ✅ Server Component + ClearCartOnMount |
| 2.6 | Pickup points validados desde DB en `createPaymentIntentAction` (CART-03) | ✅ Validación server-side en action |
| 2.7 | `/account/orders` y detalle: reemplazar mocks por queries Supabase | ✅ Server Components + `lib/orders.ts` |
| 2.8 | `/account/addresses`: CRUD real | ✅ Server Component + AddressesClient (useOptimistic) |
| 2.9 | Integrar Stripe: PaymentIntent + Payment Element | ✅ + `/checkout/return`, `elements.submit`, reconcile carrito |
| 2.10 | Webhook idempotente actualiza `payment_status` | ✅ `app/api/webhooks/stripe/route.ts` |

**Decisión D-01 (pasarela):** Stripe elegido para Fase 2 (Payment Element). MercadoPago sigue recomendado para audiencia MX a futuro.
**Decisión D-04 (guest lookup):** HMAC `guest_token` + fallback `payment_intent` en success page.

**Estado actual (2026-05-22):** CHK-01..08 y CHK-10 en rama. CHK-09: keys test en `.env.local` (orden `sk_`/`pk_` corregido); `stripe listen` local OK para `created`; **`payment_intent.succeeded` y redirect a success aún no verificados** — depurar mañana (un solo Continue, pestaña Card, Fast Refresh).

---

### Fase 3: Integración y Pulido Visual Search

**Objetivo:** Pasar de demo aislada a feature de producción integrada en la tienda.

**Tareas principales:**
| # | Tarea | Estado |
|---|-------|--------|
| 3.1 | Merge `feat/visual-search-gemini` a `main` | ✅ CLN-05 |
| 3.2 | Unificar prompts Gemini entre endpoint y `generate-embeddings.ts` (VS-04) | Pendiente |
| 3.3 | Indexación automática de embedding en `createProduct` / `updateProduct` (VS-06) | Pendiente |
| 3.4 | Integrar UI en `/[locale]/search` o componente reutilizable en catálogo (decisión pendiente) | Pendiente |
| 3.5 | Opcional: captura cámara móvil (`capture="environment"`) | Pendiente |
| 3.6 | Retunar índice IVFFlat cuando catálogo >100 productos (VS-05) | Pendiente |
| 3.7 | Evaluar latencia: cache por hash de imagen, loading UX dedicado | Pendiente |
| 3.8 | Decidir visibilidad nav: link en Header vs ruta oculta (pregunta abierta #6) | Pendiente |
| 3.9 | Limpieza seeds `[seed]` en producción si aplica | Pendiente |

**Estado actual:** Funcional en rama feature — endpoint, UI `/visual-search`, scripts CLI, migración 0003, 10 productos indexados demo.

---

### Fase 4: Preparación Producción y Lanzamiento

**Objetivo:** Deploy estable en Vercel, monitoreo mínimo, UX pulida.

**Tareas principales:**
| # | Tarea | Estado |
|---|-------|--------|
| 4.1 | Configurar todas las env vars en Vercel (Supabase, ADMIN_SECRET, GEMINI_API_KEY, pasarela) | Pendiente |
| 4.2 | Smoke tests manuales checklist pre-launch (auth, checkout, admin, visual search) | Pendiente |
| 4.3 | `loading.tsx` / `error.tsx` en rutas críticas: checkout, product, search, account (AR-02, AR-03) | Pendiente |
| 4.4 | Headers seguridad en `next.config.js` (CSP, HSTS) — referencia SEC-09 Research anterior | Pendiente |
| 4.5 | Wishlist sync DB para usuarios logueados | Pendiente |
| 4.6 | Variants admin UI + stock | Pendiente |
| 4.7 | Email confirmación pedido (Resend) — opcional v1.1 | Pendiente |
| 4.8 | Documentar runbook: seed catálogo, regenerar embeddings, rollback migraciones | Pendiente |

**Estado actual:** No iniciada. Depende de Fases 1–3.

---

## 3. Backlog Priorizado (tabla principal)

| ID | Tarea | Fase | Prioridad | Esfuerzo | Dependencias | Criterio de Done | Estado |
|----|-------|------|-----------|----------|--------------|------------------|--------|
| CLN-01 | Actualizar README, CONTEXT, visual-search/README | 0 | P0 | S | — | Docs reflejan stack y rutas actuales | ✅ |
| CLN-02 | Promover RESEARCH-CONSOLIDADO como SSOT; deprecar research.md | 0 | P0 | S | — | Un solo doc referenciado en CLAUDE.md | ✅ |
| CLN-03 | Completar `.env.example` (ADMIN_SECRET, GEMINI_API_KEY) | 0 | P0 | S | — | Nuevo dev sabe todas las vars | ✅ |
| CLN-04 | Archivar `scripts/seed-visual-search.ts` | 0 | P1 | S | — | Solo un script seed canon documentado | ✅ |
| CLN-05 | Merge `feat/visual-search-gemini` → `main` | 0 | P0 | M | build OK | `main` contiene visual search | ✅ |
| CLN-06 | Archivar rama `feat/visual-search` (FastAPI) | 0 | P2 | S | CLN-05 merge | Tag `archive/feat-visual-search-fastapi`; rama remota borrada | ✅ |
| CLN-07 | Archivar planes `.md` obsoletos | 0 | P2 | S | — | Raíz limpia o `docs/archive/` | ✅ |
| SEC-01 | Migración `0004_product_attributes.sql` | 1 | P0 | M | — | Fresh DB + admin attributes OK | ✅ Migración creada |
| SEC-02 | Sanitizar OAuth `next` param | 1 | P1 | S | — | Rechaza `//evil.com` | ✅ |
| SEC-03 | Admin cookie ≠ secreto en claro | 1 | P0 | L | — | Cookie opaca/JWT; secret rotable | ✅ |
| SEC-04 | Re-validar admin en Server Actions | 1 | P0 | M | SEC-03 | Actions fallan sin sesión admin válida | ✅ |
| SEC-05 | Rate limit admin login + visual-search API | 1 | P0 | M | — | Abuso bloqueado en demo load | ✅ |
| SEC-06 | Ocultar `embedding` de SELECT público | 1 | P1 | M | — | Anon key no devuelve vectores | ✅ Migración 0005 |
| SEC-07 | Validación uploads (size, MIME, errores UI) | 1 | P1 | M | — | Admin ve error si upload falla | ✅ |
| SEC-08 | CI incluye `npm run build` | 1 | P1 | S | — | PR falla si build roto | ✅ `.github/workflows/ci.yml` |
| SEC-09 | Parametrizar Supabase URL en next.config | 1 | P2 | S | — | Sin project ID hardcoded | ✅ |
| CHK-01 | `createPaymentIntentAction` persiste orders + order_items + crea PaymentIntent | 2 | P0 | L | SEC-01 | Pedido real en DB post-checkout | ✅ |
| CHK-02 | Eliminar mock checkout submit | 2 | P0 | S | CHK-01 | No existe ORDER123 en código | ✅ |
| CHK-03 | Validación precios carrito server-side | 2 | P0 | M | CHK-01 | Totales recalculados desde DB | ✅ |
| CHK-04 | RLS guest order lookup (migración 0006 + HMAC token) | 2 | P0 | L | CHK-01 | Invitado ve su pedido post-compra | ✅ |
| CHK-05 | Success page lee DB | 2 | P0 | M | CHK-01, CHK-04 | Muestra order_number real | ✅ |
| CHK-06 | Pickup points validados desde DB en checkout | 2 | P1 | M | — | Mismos datos que admin | ✅ |
| CHK-07 | Account orders real (list + detail) | 2 | P1 | M | CHK-01 | Sin mockOrders | ✅ |
| CHK-08 | Account addresses CRUD | 2 | P1 | L | — | Sin mockAddresses | ✅ |
| CHK-09 | Stripe: keys + E2E pago (Pay → return → success → webhook) | 2 | P0 | XL | CHK-01 | Pago confirmado vía webhook | ⏳ Keys local ✅; E2E mañana |
| CHK-10 | Webhook idempotente actualiza payment_status | 2 | P0 | L | CHK-09 | Doble webhook no duplica | ✅ |
| VS-01 | Unificar prompts indexación vs query | 3 | P1 | S | CLN-05 | Mismo prompt en route + script | Pendiente |
| VS-02 | Auto-embed en createProduct/updateProduct | 3 | P1 | L | SEC-05, SEC-06 | Nuevo producto buscable sin CLI | Pendiente |
| VS-03 | Integrar en `/[locale]/search` | 3 | P1 | L | Decisión nav | Usuario encuentra VS desde tienda | Pendiente |
| VS-04 | Loading/error UX visual search | 3 | P2 | M | — | Sin pantalla congelada 20s | Pendiente |
| VS-05 | Retunar IVFFlat al escalar catálogo | 3 | P2 | S | >100 products | Index recreado con lists adecuado | Pendiente |
| VS-06 | Cámara móvil en UI | 3 | P2 | M | VS-03 | input capture funciona en móvil | Pendiente |
| PRO-01 | Wishlist sync `wishlist_items` | 4 | P2 | L | Auth | Login merge localStorage → DB | Pendiente |
| PRO-02 | Variants admin UI | 4 | P2 | L | SEC-01 | Stock por talla en admin | Pendiente |
| PRO-03 | loading.tsx rutas críticas | 4 | P2 | M | — | Skeleton en checkout/product/search | Pendiente |
| PRO-04 | Headers seguridad next.config | 4 | P2 | M | — | CSP básico emitido | Pendiente |
| PRO-05 | Vercel env vars producción | 4 | P0 | S | SEC-03, CHK-09 | Deploy funcional end-to-end | Pendiente |
| PRO-06 | Smoke test checklist documentado | 4 | P1 | S | CHK-09, VS-02 | Checklist en PLAN o README | Pendiente |
| PRO-07 | Email confirmación (Resend) | 4 | P2 | L | CHK-09 | Email post-compra | Pendiente |
| PRO-08 | Promo codes UI + cart validation | 4 | P2 | L | CHK-01 | Código descuento aplicable | Pendiente |
| PRO-09 | Formulario vender backend | 4 | P2 | M | — | POST persiste aplicación | Pendiente |
| PRO-10 | Tests smoke (auth, checkout) | 4 | P2 | XL | CHK-01 | Al menos 1 e2e Playwright | Pendiente |
| PRO-11 | Búsqueda texto FTS/paginación server | 4 | P2 | L | — | No carga catálogo completo client | Pendiente |
| DEB-01 | Zod en Server Actions críticas | 1 | P2 | L | — | Inputs invalidos rechazados tipados | Pendiente |
| DEB-02 | Eliminar upsert redundante signUpAction profiles | 1 | P2 | S | — | Solo trigger 0002 crea profile | Pendiente |
| DEB-03 | Refactor Header (1100+ líneas) | 4 | P2 | XL | — | Componentes extraídos | Pendiente |

**Leyenda esfuerzo:** S = horas, M = 1–2 días, L = 3–5 días, XL = 1–2 semanas (estimación relativa, 1 dev).

---

## 4. Decisiones Técnicas Pendientes

| # | Pregunta | Opciones | Recomendación (basada en Research) | Impacto |
|---|----------|----------|-----------------------------------|---------|
| D-01 | Pasarela MX | MercadoPago vs Stripe | **MercadoPago** primero (audiencia MX, `.env.example` ya menciona MP; checkout UI tiene flujo PayPal manual hoy) | CHK-09 |
| D-02 | Admin auth largo plazo | Cookie ADMIN_SECRET vs Supabase Auth + `profiles.role` | **Corto plazo:** cookie firmada (SEC-03). **Largo plazo:** migrar a Supabase role check | SEC-03, SEC-04 |
| D-03 | Visual search en nav | Link Header vs ruta oculta `/visual-search` | **Demo:** oculta. **Producción:** integrar en `/[locale]/search` como tab/modo (VS-03) | VS-03, I18N-01 |
| D-04 | Guest order lookup | RLS extra vs Server Action con service role + token | **Server Action** con `order_number` + email + HMAC token en URL success (evita RLS complejo) | CHK-04 |
| D-05 | Seeds `[seed]` en prod | Mantener vs borrar post-demo | **Borrar** antes de launch público; catálogo real solo | VS-09 |
| D-06 | `product_attributes` DDL prod | ¿Existe manualmente? | ✅ Verificado; migración `0004` alineada con prod | SEC-01 |
| D-07 | Rama FastAPI obsoleta | Delete vs archive | **Archivar** tag `feat/visual-search-legacy` y borrar rama remota tras merge gemini | CLN-06 |
| D-08 | Embeddings públicos | View vs RPC-only vs column revoke | **Column REVOKE** en migración `0005` (anon/authenticated) | SEC-06 |
| D-09 | Rate limit stack | Upstash vs Vercel Edge Middleware vs in-memory | **Upstash** si hay cuenta; si no, middleware Vercel con IP throttle básico | SEC-05 |
| D-10 | Validación inputs | Zod vs manual | **Zod** en actions nuevas (checkout, admin); no bloquear Fase 0 | DEB-01 |

---

## 5. Próximos Pasos (Próxima Sesión — mañana)

**Rama:** seguir en `feat/checkout-real` hasta cerrar CHK-09; luego merge a `main`.

**CHK-09 — Cerrar pago E2E (prioridad):**
1. `stripe listen --forward-to localhost:3000/api/webhooks/stripe` + `npm run dev`.
2. Un solo **Continue to payment**; pestaña **Card**; `4242 4242 4242 4242`.
3. Verificar URL: `/en/checkout/return` → `/en/checkout/success/VIO-…` y `payment_intent.succeeded` en CLI.
4. F12 Network: si falla, capturar error de `confirmPayment` / `elements.submit`.
5. Vercel: `sk_` en `STRIPE_SECRET_KEY`, `pk_` en `NEXT_PUBLIC_*`, `STRIPE_WEBHOOK_SECRET` prod, redeploy.

**Después de CHK-09:** merge `feat/checkout-real` → `main`; M-4 OAuth (`vioshi.vercel.app`); Fase 3 VS polish o Fase 4 deploy.

**Fase 3 — Visual Search (VS-01..VS-06)** — ya en `main`; pulido opcional
1. **VS-01:** Pipeline de embeddings con Gemini (batch o incremental).
2. **VS-02:** Función RPC `match_products` en Supabase (pgvector).
3. **VS-03:** Route Handler `/api/visual-search` — upload imagen → embed → match.
4. **VS-04:** UI de búsqueda visual en `/visual-search`.
5. **VS-05:** Integración en header/nav.
6. **VS-06:** Tests y tuning de threshold.

**Diferido:** DEB-01 (Zod en actions), DEB-02 (signUp profiles trigger), tareas Fase 4 (CSP headers PRO-04).

---

## 6. Convenciones del Proyecto a Respetar

Extraídas del Research Consolidado y `CLAUDE.md`:

### Arquitectura
- **App Router exclusivo** — no introducir Pages Router.
- **Server-first:** páginas catálogo, collections, product detail como Server Components; `"use client"` solo para interactividad (cart, forms, visual search UI).
- **Server Actions** para mutaciones (auth, admin, futuro checkout) — preferir sobre nuevos Route Handlers salvo webhooks o APIs públicas específicas.
- **Dos shells HTML:** `[locale]/layout.tsx`, `admin/layout.tsx`, `visual-search/layout.tsx` — root layout es passthrough.
- **Route groups** `(shop)` no afectan URL.

### Datos
- **Supabase** como única DB; catálogo lectura pública vía anon key + RLS.
- **`createAdminClient()`** (service role) solo en Server Actions / Route Handlers server — nunca importar en Client Components.
- **Cache catálogo:** `unstable_cache` + tag `'products'`; invalidar con `revalidateTag('products')` en mutaciones admin.
- **Carrito/wishlist:** Context API + localStorage (`viogi_cart`, `viogi_wishlist`) hasta sync DB en Fase 4.

### i18n
- **next-intl** con `localePrefix: 'always'` — URLs siempre `/es/...` o `/en/...`.
- Contenido producto en español; código y comentarios en inglés (convención CLAUDE.md).
- Rutas fuera de i18n (`/admin`, `/visual-search`, `/api`) deben excluirse en middleware matcher.

### Estilo
- **TypeScript strict** — sin `any` nuevo; validar tipos en actions.
- **Alias `@/`** para imports absolutos.
- **Tailwind CSS** — diseño minimalista black/white, `font-logo` Bebas, header fixed → `pt-16` en main pages locale.
- **clsx** para clases condicionales.

### Visual Search (módulo actual)
- Modelos: `gemini-2.5-flash` + `gemini-embedding-001` con `outputDimensionality: 768`.
- SDK: `@google/genai` (no `@google/generative-ai` deprecado).
- Indexación offline vía `npx tsx scripts/seed-real-images.ts` + `generate-embeddings.ts` hasta auto-embed en admin (VS-02).

### Git y docs
- **`RESEARCH-CONSOLIDADO.md`** = hechos verificados; **`PLAN.md`** = roadmap vivo (este archivo).
- Ante contradicción doc vs código, **gana el código** — actualizar docs en Fase 0.
- Commits atómicos por fase/ticket ID cuando sea posible (ej. `fix(SEC-02): sanitize oauth next param`).

### Prohibiciones explícitas (Research)
- No modificar `app/[locale]/account/**` ni `checkout/**` en Fase 0 salvo bugs críticos de seguridad.
- No force-push `main`.
- No commitear `.env.local` ni secrets.

---

## 7. Notas para Anotación

*(Espacios para que el equipo humano agregue decisiones, fechas y responsables)*

### Decisiones tomadas
| Fecha | Decisión | Responsable | Notas |
|-------|----------|-------------|-------|
| | Pasarela: MP / Stripe / otro: _______ | | |
| | Visual search en nav: sí / no / solo search: _______ | | |
| | Admin auth: cookie firmada / Supabase role: _______ | | |
| | Seeds demo en prod: mantener / borrar: _______ | | |

### Bloqueadores externos
| Item | Estado | Contacto |
|------|--------|----------|
| Vercel env vars configuradas | ☐ | |
| Migración 0003 pgvector aplicada en Supabase prod | ☐ | |
| GEMINI_API_KEY tier / billing | ☐ | |
| DDL `product_attributes` verificado en dashboard | ☐ | |

### Notas de sesión
```
2026-05-22 — feat/checkout-real: Stripe keys corregidas (sk/pk invertidos). Payment Element abre; Pay vuelve a /checkout sin succeeded. Añadidos: /checkout/return, lib/cart/reconcile, elements.submit, sessionStorage viogi_pending_order. Pendiente E2E mañana.
```

### Cambios al PLAN
| Fecha | Cambio | Motivo |
|-------|--------|--------|
| 2026-05-19 | Creación inicial | Basado en RESEARCH-CONSOLIDADO.md Fase 2 |
| 2026-05-19 | Fase 0 CLN-01..04, CLN-07 completados | Limpieza docs y scripts |
| 2026-05-19 | Supabase CLI migrations | Link falló sin access token; 0003 ya aplicada manualmente en demo |
| 2026-05-19 | SEC-06 hide embedding | Migración 0005: REVOKE SELECT embedding para anon/authenticated |
| 2026-05-21 | Fase 1 cerrada 100% | Deploy prod funcionando; migraciones 0004/0005 aplicadas manualmente |
| 2026-05-21 | Rama feat/checkout-real iniciada | Fase 2 comienza: placeOrderAction + pickup desde DB + success real |
| 2026-05-22 | Checkout Stripe hardening WIP | return page, cart reconcile, elements.submit; CHK-09 E2E pendiente |

---

*Documento vivo. Actualizar "Última actualización" y tabla "Cambios al PLAN" en cada sesión de trabajo significativa.*
