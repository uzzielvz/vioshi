# Viogi — Contexto del Repositorio

Generado: 2026-05-19 (actualizado CLN-01)
Rama analizada: `feat/visual-search-gemini`
Último commit: `12f6f77 docs(CLN-02): promote RESEARCH-CONSOLIDADO as SSOT, deprecate RESEARCH.md`

> **Docs vivas:** [`RESEARCH-CONSOLIDADO.md`](./RESEARCH-CONSOLIDADO.md) (SSOT) · [`PLAN.md`](./PLAN.md) (roadmap) · Históricos: [`docs/archive/`](./docs/archive/README.md)

---

## 1. Estructura raíz

Contenido de la raíz (1 nivel, excluyendo `node_modules/`, `.next/`, `.git/`):

**Carpetas**: `.claude/`, `.github/`, `app/`, `components/`, `docs/`, `hooks/`, `lib/`, `messages/`, `public/`, `scripts/`, `store/`, `supabase/`, `types/`, `visual-search/`.

**Archivos clave en raíz**: `.env.example`, `CLAUDE.md`, `CONTEXT.md` (este archivo), `README.md`, `PLAN.md`, `RESEARCH-CONSOLIDADO.md`, `i18n.ts`, `middleware.ts`, `next.config.js`, `package.json`, `tailwind.config.ts`, `tsconfig.json`.

**Documentación histórica**: [`docs/archive/`](./docs/archive/README.md) — research y planes obsoletos (CLN-07).

**Monorepo**: No. No hay `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`, `apps/`, ni `packages/`. Es un proyecto Next.js plano.

**`package.json` raíz**:
- `name`: `viogi-ecommerce`
- `version`: `0.1.0`
- `private`: `true`
- Scripts: `dev`, `build`, `start`, `lint`, `type-check` (todos basados en `next` y `tsc`).
- Dependencias del stack:
  - `next` ^14.2.0
  - `react` ^18.3.0 / `react-dom` ^18.3.0
  - `@supabase/ssr` ^0.10.2
  - `@supabase/supabase-js` ^2.104.1
  - `next-intl` ^4.7.0
  - `clsx` ^2.1.1
  - `@google/genai` ^2.4.0 (búsqueda visual)
- DevDependencies del stack: `typescript` ^5.3.3, `tailwindcss` ^3.4.1, `eslint` ^8.57.1, `eslint-config-next` ^14.2.0, `tsx` ^4.22.2 (scripts CLI), `autoprefixer`, `postcss`, `@types/*`.

---

## 2. Framework y routing

- **Next.js**: ^14.2.0.
- **Router**: App Router (`app/`). No hay carpeta `pages/` en la raíz. (La coincidencia en `app/[locale]/pages/` son rutas estáticas del App Router con la palabra "pages" en la URL, NO Pages Router.)
- **Archivos `page.tsx` totales en `app/`**: 35.
- **`pages/api/`**: No existe.

**Rutas top-level en `app/`**:
- `app/[locale]/` — todas las rutas públicas con i18n (route group dinámico).
- `app/admin/` — panel de administración sin prefijo de locale.
- `app/auth/` — contiene únicamente `callback/route.ts`.
- `app/[locale]/visual-search/` — UI búsqueda visual (dentro del shell `[locale]`, hereda Header/Footer/i18n; VS-10).
- `app/api/visual-search/` — Route Handler POST.
- Archivos sueltos en `app/`: `error.tsx`, `globals.css`, `layout.tsx`, `not-found.tsx`.

**Sub-rutas dentro de `app/[locale]/`** (carpetas directas):
- `(shop)/cart/` (route group con paréntesis)
- `account/` (con sub-rutas: `addresses/`, `archivos/`, `forgot-password/`, `orders/`, `profile/`, `register/`, `reset/`, `_components/`)
- `archive/`
- `checkout/` (con `success/[orderId]/`)
- `collections/[category]/`
- `pages/` (con sub-rutas: `accessibility/`, `chapters/`, `customer-support/`, `legal/`, `locaciones/`, `shipping-payments-returns/`, `size-guide/`)
- `products/[slug]/`
- `search/`
- `vender/`
- `wishlist/`

**Sub-rutas dentro de `app/admin/`**:
- `login/`
- `logout/`
- `pickup-points/` (con `[id]/` y `_components/`)
- `products/` (con `[id]/`, `new/`, `_components/`)
- `_components/`

**Archivos `route.ts` (Route Handlers)**: 2.
- `app/auth/callback/route.ts` — OAuth / magic link callback.
- `app/api/visual-search/route.ts` — POST multipart, Gemini + pgvector RPC.

**Middleware matcher** (`middleware.ts`): excluye `api`, `auth`, `visual-search`, `_next` y assets estáticos.

---

## 3. Capa de datos

**Cliente Supabase en uso**:
- `@supabase/ssr` ^0.10.2 (clientes SSR para browser y server).
- `@supabase/supabase-js` ^2.104.1 (utilizado en `lib/supabase/admin.ts` con `service_role`).

**Archivos cliente**:
- `lib/supabase/client.ts` — `createBrowserClient` para Client Components.
- `lib/supabase/server.ts` — `createServerClient` con manejo de cookies para Server Components / Server Actions / Route Handlers.
- `lib/supabase/admin.ts` — `createClient` plano con `SUPABASE_SERVICE_ROLE_KEY` (admin only).
- `lib/supabase/middleware.ts` — `updateSession` para refrescar JWT en cada request.

**ORM alternativo**: No. No hay `drizzle-orm`, `prisma`, `kysely` ni similares en `package.json`.

**Carpeta `supabase/`**:
- `supabase/migrations/` — 3 archivos:
  - `0001_initial_schema.sql`
  - `0002_handle_new_user.sql`
  - `0003_pgvector_and_embeddings.sql` (pgvector, RPC `match_products_by_image`)
- No hay `supabase/seed.sql`, ni `supabase/functions/`, ni `supabase/config.toml`.

**Scripts CLI** (`scripts/`):
- `seed-real-images.ts` — seed productos demo en Storage + DB (canon).
- `generate-embeddings.ts` — indexación offline con Gemini.
- `legacy/` — scripts obsoletos archivados (ver `scripts/legacy/README.md`).

**Archivos `*.sql` en el repo**: 3 (los listados arriba; sin `*.sql` fuera de `supabase/`).

---

## 4. Pagos

**Dependencias relacionadas en `package.json`**: ninguna. No hay `stripe`, `@stripe/*`, `mercadopago`, `conekta`, `openpay` ni similares.

**Variables de entorno declaradas en `.env.example`** (todas comentadas con `#`, no activas):
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MERCADOPAGO_ACCESS_TOKEN`

**Archivos de pagos (Stripe — activos en `feat/checkout-real`)**:
- `app/[locale]/checkout/page.tsx` — Client; Payment Element + `createPaymentIntentAction`
- `app/[locale]/checkout/actions.ts` — Server Actions: PaymentIntent, validación precios
- `app/[locale]/checkout/return/page.tsx` — Retorno post-`confirmPayment`
- `app/[locale]/checkout/success/[orderId]/page.tsx` — Success + guest token
- `app/api/webhooks/stripe/route.ts` — Webhook `payment_intent.*`
- `lib/stripe.ts`, `lib/stripe/formatPaymentError.ts`
- `app/api/dev/stripe-payment-status/route.ts` — Solo desarrollo (estado PI)

**MercadoPago**: mencionado en `.env.example`; no implementado.

---

## 5. Auth

**Mecanismo**: Supabase Auth (vía `@supabase/ssr`). No hay `next-auth`, `@clerk/*` ni libs equivalentes en `package.json`.

**Middleware**: `middleware.ts` en raíz. Admin gate con cookie `admin_token`; resto pasa por next-intl + `updateSession`. Matcher excluye `api`, `auth`, `visual-search`, `_next` y assets.

**Rutas relacionadas con auth**:
- `app/[locale]/account/` — login, sin sub-ruta `login/` explícita (el login está en `page.tsx` raíz de `account/`).
- `app/[locale]/account/register/`
- `app/[locale]/account/forgot-password/`
- `app/[locale]/account/reset/`
- `app/[locale]/account/profile/`
- `app/[locale]/account/orders/`
- `app/[locale]/account/addresses/`
- `app/[locale]/account/archivos/`
- `app/[locale]/account/_components/` (no es ruta, es carpeta de Client Components)
- `app/[locale]/account/actions.ts` — Server Actions (signIn, signUp, signOut, resetPassword, updatePassword, signInWithGoogle).
- `app/auth/callback/route.ts` — Route Handler para `exchangeCodeForSession` (OAuth, magic link, recovery).

**Lógica de admin separada**:
- `app/admin/` (sin prefijo de locale).
- `app/admin/login/page.tsx` + `app/admin/login/actions.ts` — login propio con cookie `admin_token` validada contra `ADMIN_SECRET` en `middleware.ts`. No usa Supabase Auth.
- `app/admin/logout/actions.ts` — Server Action.

**Roles/claims**: la migración `0001_initial_schema.sql` declara columna `role text` en `public.profiles` con check `(role in ('user', 'admin', 'moderator'))`. No leído código de consumo de ese campo.

---

## 6. Storage e imágenes

**Supabase Storage**: en uso.
- `app/admin/products/actions.ts` contiene llamadas a `supabase.storage.from('product-images')` con `.upload(...)`, `.getPublicUrl(...)` y `.remove([...])` (líneas 85, 128, 134; no leído cuerpo completo de las funciones).
- `next.config.js` permite `remotePatterns` para `https://oilvubxpxxzfxlqhsumk.supabase.co/storage/v1/object/public/**`.

**Otros proveedores**: No. No hay `cloudinary`, `uploadthing`, `@aws-sdk/client-s3` ni similares en `package.json`.

**Archivos relacionados con subida de imágenes**:
- `app/admin/products/_components/ImageUploader.tsx`
- `app/admin/products/_components/ProductForm.tsx`
- `app/admin/products/actions.ts`

**Imágenes externas permitidas en `next.config.js`**: `images.unsplash.com` y el bucket de Supabase Storage.

---

## 7. Background work

- **Cron jobs / Vercel Cron**: no encontrado. No hay `vercel.json` en el repo.
- **Queue libraries**: no encontradas. No hay `@upstash/qstash`, `inngest`, `@trigger.dev/*`, `bullmq`, `node-cron` ni similares en `package.json`.
- **Indexación offline**: scripts CLI en `scripts/` (seed + embeddings); no hay cron automático.
- **Edge functions de Supabase**: no encontradas. No existe `supabase/functions/`.

---

## 8. Webhooks

**Rutas con `/webhook` en el path**: ninguna.

**`route.ts` / `route.js` en carpetas con nombre `webhook`**: ninguna.

**Route Handlers en el repo** (2):

1. `app/auth/callback/route.ts` — **Supabase Auth** callback OAuth/magic link/recovery (`?code=` → `exchangeCodeForSession`).
2. `app/api/visual-search/route.ts` — POST público; Gemini describe imagen → embedding → RPC pgvector. Usa `createAdminClient()` (service role). Sin rate limit (riesgo producción).

**Webhooks de pagos**: no encontrados.

---

## 9. Tipos, validación, calidad

- **`tsconfig.json`**: presente. `strict: true`, `noEmit: true`, `paths` con alias `@/*` a la raíz.
- **Validación de schemas**: ninguna lib instalada. No hay `zod`, `valibot`, `yup`, `joi` ni `@hookform/resolvers` en `package.json`.
- **ESLint**: `.eslintrc.json` extiende `next/core-web-vitals`. No hay reglas custom adicionales.
- **Prettier**: no encontrado. No hay `.prettierrc*`, ni dependencia `prettier`.
- **Husky / lint-staged**: no encontrados. No hay carpeta `.husky/`, ni dependencias.
- **Tests**:
  - Archivos `*.test.*` o `*.spec.*`: 0.
  - Carpetas `e2e/`, `tests/`, `__tests__/`: ninguna.
  - Frameworks (vitest, jest, playwright, cypress) en `package.json`: ninguno.
  - Nota: existe carpeta `.playwright-mcp/` en la raíz (logs/yaml de sesiones MCP, no es suite de tests).

---

## 10. Documentación para agentes

| Documento | Rol | Estado |
|-----------|-----|--------|
| [`RESEARCH-CONSOLIDADO.md`](./RESEARCH-CONSOLIDADO.md) | **SSOT** — hechos técnicos verificados | ✅ Vigente (2026-05-19) |
| [`PLAN.md`](./PLAN.md) | Roadmap vivo y backlog priorizado | ✅ Vigente |
| [`CONTEXT.md`](./CONTEXT.md) | Mapa rápido del repo (este archivo) | ✅ Vigente |
| [`CLAUDE.md`](./CLAUDE.md) | Reglas de estilo y convenciones | ✅ Vigente |
| [`README.md`](./README.md) | Onboarding rápido | ✅ Vigente |
| [`visual-search/README.md`](./visual-search/README.md) | Módulo búsqueda visual | ✅ Vigente |
| [`docs/archive/README.md`](./docs/archive/README.md) | Índice documentos históricos | ✅ Archivo |

**Comandos slash**: `.claude/commands/audit.md`, `.claude/commands/write-tests.md`.

**AGENTS.md / .cursorrules**: no encontrados.

---

## 11. Variables de entorno

Declaradas en `.env.example` (no se leyó `.env.local`):

**Supabase**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Moneda**:
- `NEXT_PUBLIC_USD_MXN_RATE`

**Pagos** (comentadas, marcadas como "Fase 7 — dejar vacío"):
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MERCADOPAGO_ACCESS_TOKEN`

**Facturación** (comentada, marcada "Fase futura"):
- `FACTURAPI_KEY`

**Email transaccional** (comentada, marcada "Fase futura"):
- `RESEND_API_KEY`

**Auth admin** (no declarada en `.env.example` — pendiente CLN-03):
- `ADMIN_SECRET`

**Búsqueda visual** (no declarada en `.env.example` — pendiente CLN-03):
- `GEMINI_API_KEY`

---

## 12. Observaciones crudas

- Existen dos sistemas de autenticación separados: Supabase Auth para `/[locale]/account/*` y cookie `admin_token` validada contra `ADMIN_SECRET` para `/admin/*`.
- `.env.example` declara `SUPABASE_SERVICE_ROLE_KEY` pero no `ADMIN_SECRET`, aunque ambos son usados por código en `lib/supabase/admin.ts` y `app/admin/login/actions.ts` respectivamente.
- Documentación consolidada en `RESEARCH-CONSOLIDADO.md` + `PLAN.md`. Históricos en `docs/archive/` (CLN-07).
- Route Handlers: `app/auth/callback/route.ts` + `app/api/visual-search/route.ts`.
- No hay carpeta `supabase/functions/` (no se usan Edge Functions de Supabase).
- No hay archivos de tests de ninguna clase.
- No hay `prettier`, `husky`, `lint-staged` ni hooks de pre-commit configurados.
- Existen 7 sub-rutas dentro de `app/[locale]/pages/` (accessibility, chapters, customer-support, legal, locaciones, shipping-payments-returns, size-guide). Son páginas informativas estáticas, no Pages Router.
- El bucket de Storage en uso se llama `product-images` (visible en `app/admin/products/actions.ts`).
- `next.config.js` solo permite `remotePatterns` para `images.unsplash.com` y el dominio del proyecto Supabase (`oilvubxpxxzfxlqhsumk.supabase.co`). El ID del proyecto Supabase está hardcodeado en este archivo.
- Existe `documento-secciones-tmpi.html` en raíz (12 KB, no documentado en ningún README).
- Módulo visual search implementado: `app/[locale]/visual-search/`, `app/api/visual-search/`, `components/{VisualSearchAnalyzer,VisualSearchDotField,VisualSearchResults}.tsx`, `scripts/seed-real-images.ts`, `scripts/generate-embeddings.ts`, migración `0003`. Flujo 2-stage `looking → results` con búsqueda automática sobre la foto completa (VS-13, sin crop manual).
- `CLAUDE.md` en raíz tiene 64 líneas y declara reglas de proyecto (Spanish para contenido, English para código, estructura, etc.).
- HEAD actual en rama feature: `12f6f77` (docs CLN-02). Visual search funcional desde commits `155ed14`–`fff3607`.
- `app/[locale]/account/page.tsx` actúa como página de login (cuando no hay sesión) y como dashboard (cuando hay sesión); no existe una ruta `/account/login` separada.
- `app/[locale]/account/orders/page.tsx` y `app/[locale]/account/addresses/page.tsx` existen pero (según commits previos del módulo auth) usan datos mock; no se leyó código aquí para confirmar el estado actual.
- Checkout: `actions.ts` + Stripe + webhook; ver sección Pagos arriba.
- En `docs/archive/plan-auth.md` se indica "Módulo Auth: 100% completado y probado." (referencia histórica).

---

## 13. Decisiones abiertas

Las preguntas abiertas del research original están consolidadas en [`PLAN.md` §4 Decisiones Técnicas Pendientes](./PLAN.md). Temas clave:

- Pasarela MX: MercadoPago vs Stripe
- Admin auth largo plazo: cookie vs Supabase role
- Visual search en navegación vs ruta oculta
- Seeds demo `[seed]` en producción: mantener o borrar
- Archivar rama `feat/visual-search` (FastAPI legacy)

---
