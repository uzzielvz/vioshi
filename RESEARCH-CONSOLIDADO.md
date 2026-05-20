# Research Consolidado - Viogi

> **Single Source of Truth (SSOT)** — Documento técnico principal del proyecto.
> Roadmap: [`PLAN.md`](./PLAN.md) · Mapa rápido: [`CONTEXT.md`](./CONTEXT.md)

**(Generado 2026-05-19 · rama `feat/visual-search-gemini` · HEAD `d9e79bf` · basado en Fase 1 + lectura profunda Fase 2)**

> **Regla operativa:** Ante contradicción entre este documento y el código, el código gana. Hechos marcados como verificados = leídos en archivos fuente en esta fecha.

---

## 1. Resumen Ejecutivo

Viogi es un e-commerce Next.js 14 (App Router) con catálogo real en Supabase, autenticación de usuarios vía Supabase Auth, panel admin paralelo con cookie `ADMIN_SECRET`, carrito/wishlist en localStorage, checkout **sin backend de pedidos ni pasarela**, y un módulo de **búsqueda visual** funcional (Gemini + pgvector) en rama `feat/visual-search-gemini`.

**Estado general:** demo-able para catálogo, auth, admin CRUD y visual search; **no production-ready** para ventas reales.

**Riesgos principales (verificados):**
1. **Checkout mock** — no persiste pedidos (`setTimeout` + `ORDER123`).
2. **Dual auth admin débil** — cookie contiene el secreto en claro; sin rate limit ni re-validación en Server Actions admin.
3. **Schema drift** — tabla `product_attributes` usada en código **sin migración** en repo.
4. **Visual search público** — endpoint sin auth ni rate limit; costo Gemini + service role server-side.
5. **Embeddings expuestos por RLS** — policy `products_public_read` permite `SELECT` de columna `embedding` con anon key.
6. **Documentación desincronizada** — `RESEARCH.md`, `README.md`, `CONTEXT.md` no reflejan visual search ni segundo Route Handler.

**Prioridad inmediata recomendada:** (1) conectar checkout a `orders`/`order_items` sin pasarela, (2) migración `product_attributes`, (3) hardening admin + rate limit visual search, (4) actualizar docs.

---

## 2. Contexto del Proyecto - Descubierto

*(Resumen de Fase 1 — detalle completo generado 2026-05-19 en conversación de research)*

| Dimensión | Hallazgo verificado |
|-----------|---------------------|
| **Router** | App Router exclusivo; 35 `page.tsx`, 4 `layout.tsx`, 2 `route.ts`, 6 `actions.ts` |
| **Next.js** | Declarado ^14.2.0; lockfile **14.2.35** |
| **Stack** | React 18, TypeScript strict, Tailwind, next-intl (es/en), Supabase SSR + JS, `@google/genai` ^2.4.0 |
| **Auth shoppers** | Supabase Auth + callback OAuth en `app/auth/callback/route.ts` |
| **Auth admin** | Cookie `admin_token === ADMIN_SECRET`; gate en `middleware.ts` |
| **DB** | PostgreSQL Supabase; migraciones 0001, 0002, **0003 pgvector** |
| **API routes** | `/auth/callback` (GET), `/api/visual-search` (POST) |
| **Pagos** | No implementados (Stripe/MP solo en `.env.example` comentado) |
| **Tests** | 0 archivos test; CI solo ESLint + tsc en archivos cambiados de PR |
| **Docs obsoletos** | `README.md` dice visual search "próximamente"; `RESEARCH.md` fecha 2026-05-13 |

**Estructura raíz:** `app/`, `components/`, `lib/`, `store/`, `hooks/`, `types/`, `messages/`, `scripts/`, `supabase/`, `visual-search/`.

**Variables env en código pero no en `.env.example`:** `ADMIN_SECRET`, `GEMINI_API_KEY`.

---

## 3. Mapa de Arquitectura

### 3.1 Tabla de módulos

| Módulo | Tecnología | Estado | Archivos clave |
|--------|------------|--------|----------------|
| Routing i18n | next-intl + `[locale]` | ✅ Completo | `middleware.ts`, `i18n.ts`, `messages/` |
| Catálogo | Supabase + `unstable_cache` | ✅ Completo | `lib/products.ts` |
| Carrito | Context API + localStorage | ✅ Parcial | `store/cartStore.tsx` |
| Wishlist | localStorage | 🟡 Parcial | `WishlistContent.tsx` |
| Auth usuarios | Supabase Auth + Server Actions | ✅ Completo | `account/actions.ts`, `auth/callback` |
| Cuenta (perfil) | Supabase `profiles` | ✅ Completo | `profile/actions.ts` |
| Cuenta (pedidos/direcciones) | Mock client-side | ❌ Pendiente | `orders/page.tsx`, `addresses/page.tsx` |
| Checkout | UI completa, submit mock | ❌ Pendiente | `checkout/page.tsx` |
| Admin productos | Service role + Storage | ✅ Parcial | `admin/products/actions.ts` |
| Admin pickup | Service role | ✅ Completo | `admin/pickup-points/actions.ts` |
| Pickup en checkout | **In-memory** `lib/pickupPoints.ts` | 🟡 Inconsistente | No usa tabla DB en checkout |
| Visual search | Gemini + pgvector RPC | ✅ Demo (rama feature) | `api/visual-search`, scripts CLI |
| Búsqueda texto | Client filter in-memory | 🟡 Parcial | `search/SearchContent.tsx` |
| Pagos | — | ❌ No existe | — |

### 3.2 Diagrama textual de flujos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE (middleware.ts)                        │
│  /admin/*  → cookie admin_token === ADMIN_SECRET (except /admin/login)   │
│  /api/*, /auth/*, /visual-search/* → SKIP middleware                   │
│  resto     → next-intl + updateSession (Supabase JWT refresh)            │
└─────────────────────────────────────────────────────────────────────────┘

AUTH (Supabase)
  LoginForm → signInAction → supabase.auth.signInWithPassword
  Google    → signInWithGoogleAction → OAuth → /auth/callback?code=
  Callback  → exchangeCodeForSession → cookies en redirect response
  Perfil    → updateProfileAction → profiles.update (RLS auth.uid)

TIENDA PÚBLICA
  getProducts() [cache 60s, tag 'products'] → anon Supabase → products+images+attrs
  ProductCard → addItem → cartStore (localStorage viogi_cart)
  /search     → getProducts() server → filter client por q=

CHECKOUT (MOCK)
  useCart() → validación form client → setTimeout(2000) → /success/ORDER123
  pickup    → PICKUP_POINTS from lib/pickupPoints.ts (NOT pickup_points table)

ADMIN
  loginAction → set cookie admin_token = ADMIN_SECRET
  createProduct/updateProduct → service_role → products + storage + product_attributes
  revalidateTag('products')

VISUAL SEARCH
  UI /visual-search → POST /api/visual-search
    → Gemini Flash (describe) → Gemini embed 768d
    → RPC match_products_by_image → hydrate product_images
  Indexación offline: seed-real-images.ts → generate-embeddings.ts
```

---

## 4. Inventario de Features

| Feature | Estado | Observaciones | Criterios de completitud |
|---------|--------|---------------|--------------------------|
| Catálogo productos (listado/detalle) | **Completo** | Supabase real, cache 60s | CRUD admin + SSR pages funcionan |
| Categorías / colecciones | **Completo** | Filtro client-side por slug categoría | `/collections/[category]` muestra productos filtrados |
| i18n es/en | **Completo** | `localePrefix: always` | URLs `/es/`, `/en/` |
| Moneda MXN/USD display | **Completo** | `lib/formatters.ts` + `NEXT_PUBLIC_USD_MXN_RATE` | Precios formateados por locale |
| Carrito | **Parcial** | Context + localStorage; no sync DB | Persiste entre sesiones; no valida stock/precio server |
| Wishlist | **Parcial** | localStorage; tabla `wishlist_items` sin uso | No sync con usuario autenticado |
| Auth email/password | **Completo** | Server Actions + RLS profiles | Login, register, reset, update password |
| OAuth Google | **Completo** | Callback con fix cookies | Flujo documentado en plan-auth |
| Perfil usuario | **Completo** | `profiles` update con RLS | Nombre/teléfono |
| Pedidos (cuenta) | **Pendiente** | `mockOrders` hardcoded | Query real a `orders` |
| Direcciones (cuenta) | **Pendiente** | `mockAddresses` | CRUD `addresses` |
| Checkout | **Pendiente** | UI hecha; submit mock | Insert `orders` + pasarela o confirmación real |
| Pagos Stripe/MP | **Pendiente** | Sin deps ni routes | Webhook + payment_reference |
| Admin productos | **Parcial** | CRUD + imágenes; validación débil | Falta variants UI, validación uploads |
| Admin pickup points | **Completo** | CRUD contra DB | Checkout no consume misma fuente |
| Búsqueda texto | **Parcial** | Filter in-memory sobre catálogo cargado | No FTS ni paginación server |
| **Visual search** | **Parcial** | Funcional en demo; sin integración nav | Endpoint + UI + indexación CLI |
| Vender (consignación) | **Pendiente** | `setTimeout` + TODO | Backend formulario |
| Archive | **Parcial** | Metadata mock; productos reales slice | Drops reales en DB |
| Promo codes | **Pendiente** | Tabla existe; sin UI | Validación en cart |
| Product variants | **Pendiente** | Tabla existe; sin admin UI | Stock por talla/color |
| Tests automatizados | **Pendiente** | 0 tests | — |
| Email transaccional | **Pendiente** | RESEND comentado | — |

---

## 5. Problemas Técnicos y Bugs Detectados

### 5.1 App Router / Server vs Client Components

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| AR-01 | Root `app/layout.tsx` no provee `<html>/<body>`; shells paralelos | `return children` en layout raíz | Baja (patrón intencional; requiere layout por segmento) |
| AR-02 | **0 archivos `loading.tsx`** en todo el repo | Glob vacío | Media — UX sin skeletons por ruta |
| AR-03 | Solo `app/error.tsx` global; sin `error.tsx` por segmento | — | Media |
| AR-04 | `checkout/page.tsx` retorna `null` si cart vacío sin redirect explícito | línea 309 | Baja — pantalla en blanco |
| AR-05 | Header ~1100+ líneas client con muchos `useState`; mitigación hydration vía `mounted` | `Header.tsx` | Media — complejidad/mantenimiento |

### 5.2 Server Actions

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| SA-01 | **Admin actions no re-validan** cookie/sesión admin | `createProduct`, `deleteProduct` solo usan service_role | Alta — defensa en profundidad ausente |
| SA-02 | `deleteProduct(id)` sin manejo de error ni feedback UI | `DeleteButton` no captura fallos | Media |
| SA-03 | `createProduct`/`updateProduct`: casts raw `as string`, `parseFloat` sin validar NaN | `admin/products/actions.ts:17-29` | Media |
| SA-04 | `uploadImages`: errores con `continue` silencioso | línea 130 | Media |
| SA-05 | `signUpAction` upsert manual de `profiles` **redundante** con trigger `0002` | `actions.ts:70-77` | Baja |
| SA-06 | `signInWithGoogleAction` / redirects: sin try/catch si `redirect` falla | — | Baja |

### 5.3 RLS y Supabase

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| RLS-01 | **`product_attributes` sin migración** en repo pero INSERT/SELECT en código | `actions.ts:154`, `lib/products.ts:81` | **Alta** — reset DB rompe app |
| RLS-02 | Policy `products_public_read using (true)` expone **columna `embedding`** vía anon key | migración 0003 + policy 0001 | Media — scraping de vectores |
| RLS-03 | Guest checkout: `orders_insert_any` pero `orders_select` requiere `auth.uid() = user_id` → invitado **no puede releer** su pedido | `0001:333-336` | Alta cuando checkout sea real |
| RLS-04 | `product_attributes` probablemente **sin RLS policy** si tabla creada manualmente | No en migraciones | Media |
| RLS-05 | Visual search API usa **service_role** — bypass total RLS en búsqueda | `createAdminClient()` en route | Aceptable server-side; riesgo si endpoint abusado |

### 5.4 Dual auth (Supabase + ADMIN_SECRET)

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| AUTH-01 | Cookie `admin_token` **valor = ADMIN_SECRET** en texto plano | `login/actions.ts:13` | **Alta** |
| AUTH-02 | Sin rate limiting en `/admin/login` | — | Media |
| AUTH-03 | `ADMIN_SECRET` ausente en `.env.example` | — | Media |
| AUTH-04 | Open redirect parcial en OAuth: `next` sin sanitizar | `auth/callback/route.ts:16-22` | Media — `next=//evil.com` |
| AUTH-05 | Admin no refresca sesión Supabase (no pasa por `updateSession`) | middleware branch admin | Baja (admin no usa Supabase Auth) |

### 5.5 Visual Search (Gemini + embeddings + RPC)

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| VS-01 | Endpoint **público sin auth** ni rate limit | `route.ts` POST sin middleware auth | **Alta** en producción (costo/abuse) |
| VS-02 | Latencia ~15-20s por doble llamada Gemini | medido en demo | Media |
| VS-03 | Pipeline image→text→embed: calidad depende de descripción Flash | arquitectura | Media — no embedding visual directo |
| VS-04 | Prompt distinto entre endpoint y script indexación | route vs `generate-embeddings.ts:59` | Baja — posible drift query/index |
| VS-05 | IVFFlat `lists=100` con ~10 productos | `0003:15-18` | Baja — subóptimo, no incorrecto |
| VS-06 | Indexación no automática al `createProduct` admin | manual CLI | Media para producción |
| VS-07 | `GEMINI_API_KEY` no documentada en `.env.example` | — | Baja |

### 5.6 Imágenes y Storage

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| IMG-01 | Upload sin límite tamaño ni validación MIME real | `uploadImages` solo `file.type` del browser | Media |
| IMG-02 | Bucket `product-images` público | `getPublicUrl` | Media — binarios arbitrarios si admin comprometido |
| IMG-03 | Supabase project ID hardcodeado en `next.config.js` | hostname fijo | Media |

### 5.7 Cart / Checkout

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| CART-01 | Carrito **no valida precios** contra DB al checkout | localStorage prices | Alta en producción |
| CART-02 | Checkout submit mock | ```279:299:app/[locale]/checkout/page.tsx``` | **Crítico** |
| CART-03 | Pickup points en checkout desde **memoria**, admin edita **DB** | import `lib/pickupPoints` | Media — datos divergentes |
| CART-04 | Success page no consulta DB | `checkout/success/[orderId]` client | Alta |

### 5.8 i18n y middleware

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| I18N-01 | `/visual-search` fuera de i18n (intencional) | matcher excluye | Baja — documentar |
| I18N-02 | Cambio locale usa `window.location.href` full reload | `Header.tsx:50` | Baja — workaround hydration |

### 5.9 Performance

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| PERF-01 | Search carga **todo el catálogo** al cliente para filtrar | `getProducts()` + filter | Media a escala |
| PERF-02 | `getProducts` usa cliente anon plano, no connection pooling especial | `lib/products.ts:39-44` | Baja |

### 5.10 Código muerto / duplicado

| ID | Problema | Evidencia | Severidad |
|----|----------|-----------|-----------|
| DEAD-01 | `scripts/seed-visual-search.ts` (Unsplash) coexistiendo con `seed-real-images.ts` | 2 scripts seed | Baja |
| DEAD-02 | `lib/supabase/client.ts` — grep sugiere poco uso directo | — | Baja |
| DEAD-03 | Rama remota `feat/visual-search` (FastAPI) vs `feat/visual-search-gemini` | git history | Baja — confusión |

---

## 6. Deuda Técnica

| Tipo | Ubicación | Severidad | Impacto | Recomendación |
|------|-----------|-----------|---------|---------------|
| Schema drift | `product_attributes` | **Alta** | Admin/product pages fallan en DB limpia | Migración `0004_product_attributes.sql` |
| Checkout mock | `checkout/page.tsx` | **Alta** | Cero revenue real | Server Action `placeOrder` |
| Admin cookie = secret | `admin/login/actions.ts` | **Alta** | Exfiltración = acceso total admin | JWT firmado o sesión opaca |
| Docs desactualizados | RESEARCH, README, CONTEXT | Media | Agentes/devs mal informados | Actualizar post-merge visual search |
| Sin validación schemas | Todas las actions | Media | Datos basura / crashes | Zod en actions críticas |
| Upload images silent fail | `uploadImages` | Media | Productos sin imágenes sin aviso | Reportar errores al UI |
| Pickup dual source | checkout vs admin | Media | Precios/datos incorrectos | Fetch `pickup_points` en checkout |
| Visual search abuse | `/api/visual-search` | Media | Costo Gemini | Rate limit + auth opcional |
| Embeddings públicos RLS | `products` policy | Media | Scraping catálogo semántico | Excluir `embedding` de select anon o view |
| Sin tests | repo entero | Media | Regresiones | Smoke e2e checkout/auth |
| CI sin build | `.github/workflows` | Media | Deploy roto no detectado | `npm run build` en CI |
| ENV incompleto | `.env.example` | Baja | Onboarding | Añadir ADMIN_SECRET, GEMINI_API_KEY |
| IVFFlat tuning | `0003` index | Baja | Latencia a escala | Recrear index al crecer catálogo |

---

## 7. Gaps y Features Pendientes

**Prioridad P0 (bloquean venta real)**
1. Checkout → insertar `orders` + `order_items` con snapshots de precio
2. Política RLS para guest order lookup (email + order_number o token firmado)
3. Migración `product_attributes`

**Prioridad P1 (producción mínima)**
4. Pasarela MercadoPago o Stripe + webhook
5. Historial pedidos real en `/account/orders`
6. Direcciones CRUD en `/account/addresses`
7. Rate limit + hardening `/api/visual-search` y admin login
8. Sincronizar pickup points checkout con DB
9. Validación server-side de carrito vs precios DB

**Prioridad P2 (mejora)**
10. Wishlist → tabla `wishlist_items` para usuarios logueados
11. Variants admin UI + stock
12. Promo codes
13. Indexación automática embeddings en `createProduct`
14. Integrar visual search en `/[locale]/search`
15. `loading.tsx` / error boundaries por rutas críticas
16. Tests + CI build

---

## 8. Recomendaciones Técnicas

1. **Implementar `placeOrderAction`** — eliminar `setTimeout`/`ORDER123`; usar secuencia `order_number_seq` existente.
2. **Crear migración `product_attributes`** — alinear repo con producción; RLS espejo a `product_images`.
3. **Endurecer admin auth** — no almacenar secreto en cookie; añadir rate limit login.
4. **Proteger `/api/visual-search`** — Upstash rate limit o Vercel middleware; cap diario Gemini.
5. **Actualizar `.env.example`** — `ADMIN_SECRET`, `GEMINI_API_KEY` con placeholders seguros.
6. **Unificar pickup points** — reemplazar `lib/pickupPoints.ts` en checkout por query server.
7. **View `products_public`** sin columna `embedding` — o policy column-level si Supabase lo permite.
8. **Sanitizar `next` en auth callback** — regex `^/[^/\\]`.
9. **CI: `npm run build`** en PR workflow.
10. **Consolidar documentación** — reemplazar `RESEARCH.md` por este archivo tras revisión humana.

---

## 9. Preguntas Abiertas

1. ¿Cuál es la **URL de producción Vercel** y qué variables están configuradas allí (`ADMIN_SECRET`, `GEMINI_API_KEY`)?
2. ¿La tabla `product_attributes` fue creada **manualmente** en Supabase? ¿Cuál es el DDL real en producción?
3. ¿Se planea **unificar admin** con Supabase Auth (`profiles.role`) o mantener cookie separada a largo plazo?
4. ¿Pasarela preferida para MX: **MercadoPago** vs Stripe?
5. ¿Los productos seed `[seed]` deben **permanecer** en producción o solo demo?
6. ¿Integrar visual search al **Header/navigation** o mantener ruta oculta `/visual-search`?
7. ¿Existe bucket Storage policy documentada fuera del repo?
8. ¿Rama `feat/visual-search` (FastAPI) se **archiva/elimina** tras merge de `feat/visual-search-gemini`?

---

## Apéndice A — Lecturas profundas verificadas (Fase 2)

### Server Actions (6/6 leídas completas)
- `app/[locale]/account/actions.ts` — signIn, signUp, signOut, reset, updatePassword, Google OAuth
- `app/[locale]/account/profile/actions.ts` — updateProfile con getUser + RLS
- `app/admin/login/actions.ts`, `logout/actions.ts`
- `app/admin/products/actions.ts` — CRUD, uploadImages, saveAttributes
- `app/admin/pickup-points/actions.ts` — update, toggle

### Route Handlers (2/2)
- `app/auth/callback/route.ts` — exchangeCodeForSession con cookies en response pre-built
- `app/api/visual-search/route.ts` — validación MIME/size, Gemini Flash + embed, RPC, hydrate images

### lib/ (claves)
- `lib/products.ts` — anon client, unstable_cache 60s, join product_attributes
- `lib/supabase/{client,server,admin,middleware}.ts` — bridge cookies documentado

### Migraciones (3/3)
- `0001` — schema + RLS + seeds
- `0002` — handle_new_user trigger
- `0003` — pgvector + RPC match_products_by_image

### Componentes críticos
- `store/cartStore.tsx` — Context API (no Zustand), localStorage `viogi_cart`
- `checkout/page.tsx` — mock submit verificado
- `account/orders|addresses` — mocks verificados
- `WishlistContent.tsx` — localStorage only

---

## Auto-chequeo final (Fase 2)

| Pregunta | ✓/✗ |
|----------|-----|
| ¿Leí las 6 Server Actions completas? | ✓ |
| ¿Leí los 2 Route Handlers completos? | ✓ |
| ¿Leí lib/products.ts y los 4 supabase/*? | ✓ |
| ¿Leí middleware.ts y layouts principales? | ✓ |
| ¿Revisé migraciones SQL y policies RLS orders/products? | ✓ |
| ¿Verifiqué checkout mock en código (no solo docs)? | ✓ |
| ¿Verifiqué mocks account orders/addresses? | ✓ |
| ¿Analicé visual search endpoint y scripts? | ✓ |
| ¿Seguí cadena auth callback cookies? | ✓ |
| ¿Revisé cada función de uploadImages/saveAttributes? | ✓ |
| ¿Leí Header completo (~1167 líneas)? | ✗ — muestreado + grep; archivo extenso |
| ¿Leí checkout completo (845 líneas)? | ✗ — submit + imports verificados; no línea por línea |
| ¿Verifiqué runtime en Vercel/producción? | ✗ — no acceso |

**Conclusión del auto-chequeo:** Cobertura alta en cadena auth, admin CRUD, catálogo, checkout submit, visual search y RLS documentado. Pendiente lectura íntegra de `checkout/page.tsx` y `Header.tsx` si se requiere auditoría línea-a-línea.

---

*Fin del Research Consolidado - Viogi*
