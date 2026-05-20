# PLAN.md - Viogi (Roadmap Vivo)

**Última actualización:** 2026-05-19  
**Rama actual:** `feat/visual-search-gemini` (canónica Gemini — **pendiente merge a `main`**)  
**Estado general:** Fase 0 casi cerrada (docs al día, `.env.example` completo, archive listo). Visual search funcional en rama feature. **No production-ready** — checkout mock y hardening Fase 1 pendientes.  
**Fuente de verdad técnica:** `RESEARCH-CONSOLIDADO.md` (2026-05-19)

---

## 1. Definición de "Proyecto Cerrado"

Viogi se considera **cerrado y listo para vender** cuando se cumplen **todos** estos criterios verificables:

### Comercio y transacciones
- [ ] Un cliente puede completar una compra real: carrito → checkout → pedido persistido en `orders` + `order_items` con snapshots de precio, impuestos y envío.
- [ ] El número de orden (`VIO-YYYY-NNNN` vía secuencia existente) es real, no un literal mock (`ORDER123`).
- [ ] Pasarela de pago conectada (MercadoPago o Stripe) con webhook de confirmación e idempotencia.
- [ ] Invitado y usuario autenticado pueden completar compra; el invitado puede **consultar su pedido** post-compra (RLS o endpoint server-only resuelto).
- [ ] Precios del carrito se validan server-side contra DB al momento del pedido (anti-tampering localStorage).

### Cuenta de usuario
- [ ] `/account/orders` y `/account/orders/[orderId]` leen de Supabase, no mocks.
- [ ] `/account/addresses` CRUD real contra tabla `addresses`.
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

### Fase 0: Limpieza y Saneamiento ← **CASI CERRADA** (CLN-05 en curso)

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
| 0.7 | Auditar `lib/supabase/client.ts` | ⏸ Diferido post-merge |
| 0.8 | Merge `feat/visual-search-gemini` → `main` | 🔄 CLN-05 (checklist OK, push hecho, merge pendiente OK humano) |
| 0.9 | Limpiar productos seed demo (SQL post-demo) | Pendiente |
| 0.10 | Revisar `.gitignore` (`.next/`, `.playwright-mcp/`) | Pendiente |
| 0.11 | Archivar planes obsoletos en `docs/archive/` | ✅ CLN-07 |

**Estado actual:** Docs y scripts saneados. Rama canónica verificada (`build` + `type-check` + `lint` OK). Falta merge a `main` y CLN-06 (archivar rama FastAPI legacy).

#### CLN-05 — Checklist pre-merge (`feat/visual-search-gemini` → `main`)

**Rama canónica:** `feat/visual-search-gemini` (Gemini + pgvector).  
**Rama legacy (no mergear):** `origin/feat/visual-search` (FastAPI + CLIP).

| # | Verificación | Resultado | Notas |
|---|--------------|-----------|-------|
| 1 | `npm run type-check` | ✅ Pass | 2026-05-19 |
| 2 | `npm run lint` | ✅ Pass | Sin warnings |
| 3 | `npm run build` | ✅ Pass | Next.js 14.2.35, 54 páginas estáticas |
| 4 | Migración `0003` aplicada en Supabase | ☐ Manual | Confirmar en dashboard SQL |
| 5 | Env vars Vercel (`GEMINI_API_KEY`, `ADMIN_SECRET`, Supabase) | ☐ Manual | Configurar antes de deploy prod |
| 6 | Push rama a origin | ✅ Hecho | `8745b44` → `origin/feat/visual-search-gemini` |
| 7 | Merge a `main` | ☐ Pendiente OK humano | **No auto-merge** |

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
| 1.1 | Migración `0004_product_attributes.sql` + RLS coherente (SEC-12 / RLS-01) | Pendiente |
| 1.2 | Verificar DDL real de `product_attributes` en Supabase producción vs migración | Pendiente |
| 1.3 | Sanitizar `next` en `app/auth/callback/route.ts` (AUTH-04) | Pendiente |
| 1.4 | Endurecer admin: cookie firmada o sesión opaca; no almacenar `ADMIN_SECRET` en cookie (AUTH-01) | Pendiente |
| 1.5 | Re-validación admin en Server Actions (`createProduct`, `deleteProduct`, etc.) (SA-01) | Pendiente |
| 1.6 | Rate limit `/admin/login` y `/api/visual-search` (AUTH-02, VS-01) | Pendiente |
| 1.7 | Restringir exposición pública de `products.embedding` (RLS-02): view o select sin columna | Pendiente |
| 1.8 | Validación uploads admin: tamaño, MIME, errores visibles (IMG-01, SA-04) | Pendiente |
| 1.9 | Parametrizar Supabase hostname en `next.config.js` desde env (IMG-03) | Pendiente |
| 1.10 | Añadir `npm run build` al workflow CI (`.github/workflows/code-review.yml`) | Pendiente |

**Estado actual:** Riesgos documentados en Research; ninguno cerrado en código salvo visual search demo en rama feature.

---

### Fase 2: Checkout Real y Transacciones

**Objetivo:** Flujo de compra end-to-end persistido en DB; base para pagos.

**Tareas principales:**
| # | Tarea | Estado |
|---|-------|--------|
| 2.1 | Server Action `placeOrderAction`: insert `orders` + `order_items`, usar `order_number_seq` | Pendiente |
| 2.2 | Eliminar `setTimeout` + redirect `ORDER123` en checkout (CART-02) | Pendiente |
| 2.3 | Validación server-side de carrito vs precios actuales en DB (CART-01) | Pendiente |
| 2.4 | RLS/patrón lookup pedido invitado (RLS-03): email + order_number + token o endpoint service | Pendiente |
| 2.5 | Página success lee pedido real por `orderId`/`order_number` (CART-04) | Pendiente |
| 2.6 | Sustituir `lib/pickupPoints.ts` en checkout por fetch `pickup_points` (CART-03) | Pendiente |
| 2.7 | `/account/orders` y detalle: reemplazar mocks por queries Supabase | Pendiente |
| 2.8 | `/account/addresses`: CRUD real | Pendiente |
| 2.9 | Integrar pasarela (MercadoPago o Stripe): preference/checkout session + webhook | Pendiente |
| 2.10 | Actualizar `orders.payment_status` / `payment_reference` vía webhook | Pendiente |

**Estado actual:** UI checkout completa (~845 líneas client); submit 100% mock. Tablas `orders`/`order_items` existen en schema.

---

### Fase 3: Integración y Pulido Visual Search

**Objetivo:** Pasar de demo aislada a feature de producción integrada en la tienda.

**Tareas principales:**
| # | Tarea | Estado |
|---|-------|--------|
| 3.1 | Merge `feat/visual-search-gemini` a `main` | 🔄 CLN-05 en curso |
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
| CLN-05 | Merge `feat/visual-search-gemini` → `main` | 0 | P0 | M | build OK | Push hecho; merge pendiente OK humano | 🔄 |
| CLN-06 | Archivar rama `feat/visual-search` (FastAPI) | 0 | P2 | S | CLN-05 merge | Una sola rama visual search | Pendiente |
| CLN-07 | Archivar planes `.md` obsoletos | 0 | P2 | S | — | Raíz limpia o `docs/archive/` | ✅ |
| SEC-01 | Migración `0004_product_attributes.sql` | 1 | P0 | M | — | Fresh DB + admin attributes OK | Pendiente |
| SEC-02 | Sanitizar OAuth `next` param | 1 | P1 | S | — | Rechaza `//evil.com` | Pendiente |
| SEC-03 | Admin cookie ≠ secreto en claro | 1 | P0 | L | — | Cookie opaca/JWT; secret rotable | Pendiente |
| SEC-04 | Re-validar admin en Server Actions | 1 | P0 | M | SEC-03 | Actions fallan sin sesión admin válida | Pendiente |
| SEC-05 | Rate limit admin login + visual-search API | 1 | P0 | M | — | Abuso bloqueado en demo load | Pendiente |
| SEC-06 | Ocultar `embedding` de SELECT público | 1 | P1 | M | — | Anon key no devuelve vectores | Pendiente |
| SEC-07 | Validación uploads (size, MIME, errores UI) | 1 | P1 | M | — | Admin ve error si upload falla | Pendiente |
| SEC-08 | CI incluye `npm run build` | 1 | P1 | S | — | PR falla si build roto | Pendiente |
| SEC-09 | Parametrizar Supabase URL en next.config | 1 | P2 | S | — | Sin project ID hardcoded | Pendiente |
| CHK-01 | `placeOrderAction` persiste orders + order_items | 2 | P0 | L | SEC-01 | Pedido real en DB post-checkout | Pendiente |
| CHK-02 | Eliminar mock checkout submit | 2 | P0 | S | CHK-01 | No existe ORDER123 en código | Pendiente |
| CHK-03 | Validación precios carrito server-side | 2 | P0 | M | CHK-01 | Totales recalculados desde DB | Pendiente |
| CHK-04 | RLS guest order lookup | 2 | P0 | L | CHK-01 | Invitado ve su pedido post-compra | Pendiente |
| CHK-05 | Success page lee DB | 2 | P0 | M | CHK-01, CHK-04 | Muestra order_number real | Pendiente |
| CHK-06 | Pickup points desde DB en checkout | 2 | P1 | M | — | Mismos datos que admin | Pendiente |
| CHK-07 | Account orders real (list + detail) | 2 | P1 | M | CHK-01 | Sin mockOrders | Pendiente |
| CHK-08 | Account addresses CRUD | 2 | P1 | L | — | Sin mockAddresses | Pendiente |
| CHK-09 | Pasarela MercadoPago o Stripe | 2 | P0 | XL | CHK-01 | Pago confirmado vía webhook | Pendiente |
| CHK-10 | Webhook idempotente actualiza payment_status | 2 | P0 | L | CHK-09 | Doble webhook no duplica | Pendiente |
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
| D-06 | `product_attributes` DDL prod | ¿Existe manualmente? | Auditar Supabase dashboard; alinear migración 0004 con prod | SEC-01 |
| D-07 | Rama FastAPI obsoleta | Delete vs archive | **Archivar** tag `feat/visual-search-legacy` y borrar rama remota tras merge gemini | CLN-06 |
| D-08 | Embeddings públicos | View vs RPC-only vs column revoke | **View `products_catalog`** sin `embedding` para anon; writes/admin vía service role | SEC-06 |
| D-09 | Rate limit stack | Upstash vs Vercel Edge Middleware vs in-memory | **Upstash** si hay cuenta; si no, middleware Vercel con IP throttle básico | SEC-05 |
| D-10 | Validación inputs | Zod vs manual | **Zod** en actions nuevas (checkout, admin); no bloquear Fase 0 | DEB-01 |

---

## 5. Próximos Pasos (Próxima Sesión)

1. **CLN-05 (merge):** Confirmar merge `feat/visual-search-gemini` → `main` (PR o merge local).
2. **CLN-06:** Archivar rama `origin/feat/visual-search` (FastAPI legacy) tras merge.
3. **Fase 1 — SEC-01:** Spike DDL `product_attributes` en Supabase dashboard.
4. **Fase 1 — SEC-03/04:** Endurecer admin auth (cookie ≠ secreto en claro).
5. **Fase 1 — SEC-05:** Rate limit `/api/visual-search` y `/admin/login`.

**No hacer aún:** checkout real, pasarela, migración 0004 sin verificar DDL prod.

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
[Fecha] — 
```

### Cambios al PLAN
| Fecha | Cambio | Motivo |
|-------|--------|--------|
| 2026-05-19 | Creación inicial | Basado en RESEARCH-CONSOLIDADO.md Fase 2 |
| 2026-05-19 | Fase 0 CLN-01..04, CLN-07 completados | Limpieza docs y scripts |
| 2026-05-19 | CLN-05 push a origin | `feat/visual-search-gemini` @ `8745b44` |

---

*Documento vivo. Actualizar "Última actualización" y tabla "Cambios al PLAN" en cada sesión de trabajo significativa.*
