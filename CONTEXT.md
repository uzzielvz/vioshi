# Viogi — Contexto del Repositorio

Generado: 2026-05-12
Rama analizada: `main`
Último commit: `2b0decb docs: close auth module (AU-07 verified) and document OAuth secret bug`

---

## 1. Estructura raíz

Contenido de la raíz (1 nivel, excluyendo `node_modules/`, `.next/`, `.git/`):

**Carpetas**: `.claude/`, `.github/`, `.playwright-mcp/`, `app/`, `components/`, `hooks/`, `lib/`, `messages/`, `public/`, `store/`, `supabase/`, `types/`, `visual-search/`.

**Archivos**: `.env.example`, `.env.local`, `.eslintrc.json`, `.gitignore`, `CLAUDE.md`, `CONTEXT.md` (este archivo), `README.md`, `documento-secciones-tmpi.html`, `i18n.ts`, `middleware.ts`, `next-env.d.ts`, `next.config.js`, `package.json`, `package-lock.json`, `plan.md`, `plan-admin.md`, `plan-auth.md`, `plan-cursor.md`, `plan-currency-mxn.md`, `plan-preflight.md`, `plan-supabase-connect.md`, `plancheckout.md`, `postcss.config.js`, `research-checkout.md`, `researchbycursor.md`, `tailwind.config.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`.

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
- DevDependencies del stack: `typescript` ^5.3.3, `tailwindcss` ^3.4.1, `eslint` ^8.57.1, `eslint-config-next` ^14.2.0, `autoprefixer`, `postcss`, `@types/*`.

---

## 2. Framework y routing

- **Next.js**: ^14.2.0.
- **Router**: App Router (`app/`). No hay carpeta `pages/` en la raíz. (La coincidencia en `app/[locale]/pages/` son rutas estáticas del App Router con la palabra "pages" en la URL, NO Pages Router.)
- **Archivos `page.tsx` totales en `app/`**: 34.
- **`pages/api/`**: No existe.

**Rutas top-level en `app/`**:
- `app/[locale]/` — todas las rutas públicas con i18n (route group dinámico).
- `app/admin/` — panel de administración sin prefijo de locale.
- `app/auth/` — contiene únicamente `callback/route.ts`.
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

**Archivos `route.ts` (Route Handlers)**: 1.
- `app/auth/callback/route.ts`.

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
- `supabase/migrations/` — 2 archivos:
  - `0001_initial_schema.sql`
  - `0002_handle_new_user.sql`
- No hay `supabase/seed.sql`, ni `supabase/functions/`, ni `supabase/config.toml`.

**Archivos `*.sql` en el repo**: 2 (los listados arriba; sin `*.sql` fuera de `supabase/`).

---

## 4. Pagos

**Dependencias relacionadas en `package.json`**: ninguna. No hay `stripe`, `@stripe/*`, `mercadopago`, `conekta`, `openpay` ni similares.

**Variables de entorno declaradas en `.env.example`** (todas comentadas con `#`, no activas):
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MERCADOPAGO_ACCESS_TOKEN`

**Archivos en el repo con `stripe`, `mercadopago`, `mp-`, `payment`, `checkout`, `webhook` en la ruta o nombre**:
- `app/[locale]/checkout/page.tsx` — Server Component (no leído cuerpo).
- `app/[locale]/checkout/success/[orderId]/page.tsx` — Server Component.
- `app/[locale]/pages/shipping-payments-returns/page.tsx` — página informativa.
- (No hay archivos con `stripe`, `mercadopago`, `mp-`, `webhook` en nombre ni ruta.)

**Stubs vs activos**: el directorio `app/[locale]/checkout/` tiene contenido (no leído en detalle). No existen archivos `payment*`, `stripe*`, `mercadopago*` ni carpetas `webhooks/`. La integración de pasarela de pagos en código es **no encontrada**.

---

## 5. Auth

**Mecanismo**: Supabase Auth (vía `@supabase/ssr`). No hay `next-auth`, `@clerk/*` ni libs equivalentes en `package.json`.

**Middleware**: `middleware.ts` en raíz (no en `src/`). Tamaño: 32 líneas (no leído cuerpo completo). El matcher excluye `api`, `auth`, `_next` y assets.

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
- **API routes con `cron/`**: no encontradas. No existe `app/api/`.
- **Edge functions de Supabase**: no encontradas. No existe `supabase/functions/`.

---

## 8. Webhooks

**Rutas con `/webhook` en el path**: ninguna.

**`route.ts` / `route.js` en carpetas con nombre `webhook`**: ninguna.

**Único Route Handler en el repo**: `app/auth/callback/route.ts`.
- Origen aparente: **Supabase Auth** (no es webhook; es el callback de OAuth/magic link/recovery, recibe `?code=` y llama `exchangeCodeForSession`).
- Verificación de firma: no aplica (el endpoint valida un `code` con `exchangeCodeForSession`, no una firma HMAC).

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

## 10. Documentación previa para agentes

Listado completo de archivos `.md` en el repo (excluyendo `node_modules/`, `.next/`):

| Ruta | Líneas | Primera línea (título) |
|---|---|---|
| `CLAUDE.md` | 64 | `# CLAUDE.md` |
| `README.md` | 46 | `# VIOGI` |
| `plan.md` | 552 | `# VIOGI — Plan de Desarrollo: Fase 1 y Fase 2` |
| `plan-cursor.md` | 650 | `# VIOGI — Plan Consolidado de Mejoras` |
| `plan-auth.md` | 453 | `# VIOGI — Plan: Autenticación de usuarios (Supabase Auth)` |
| `plan-admin.md` | 426 | `# VIOGI — Plan: Panel de Administración` |
| `plan-currency-mxn.md` | 318 | `# VIOGI — Plan: Migración de moneda fuente USD → MXN` |
| `plan-preflight.md` | 143 | `# VIOGI — Pre-flight: Bugs y Deuda Técnica Antes del Backend` |
| `plan-supabase-connect.md` | 272 | `# VIOGI — Plan: Conexión Supabase al código Next.js` |
| `plancheckout.md` | 513 | `# Plan: Checkout + Login — Legibilidad, UX y Auditoría` |
| `research-checkout.md` | 467 | `# Research: Checkout — Bugs, GUI, CP Lookup y Estrategia de Pagos` |
| `researchbycursor.md` | 763 | `# VIOGI — Investigación Completa del Proyecto` |
| `.claude/commands/audit.md` | 30 | `Your goal is to audit the codebase for potential issues. Review the following areas:` |
| `.claude/commands/write-tests.md` | 54 | `Your goal is to write comprehensive tests for the specified code. Follow these guidelines:` |
| `visual-search/README.md` | 18 | `# VIOGI — Visual Search` |

**Clasificación**:
- **Research**: `research-checkout.md`, `researchbycursor.md`.
- **Plan**: `plan.md`, `plan-cursor.md`, `plan-auth.md`, `plan-admin.md`, `plan-currency-mxn.md`, `plan-preflight.md`, `plan-supabase-connect.md`, `plancheckout.md`.
- **Reglas/contexto para agentes**: `CLAUDE.md` (raíz), comandos slash en `.claude/commands/` (`audit.md`, `write-tests.md`).
- **AGENTS.md / .cursorrules / .cursor/rules**: no encontrados.
- **Notas/specs sueltos**: `README.md`, `visual-search/README.md`.

Otro material no-markdown que puede ser relevante:
- `documento-secciones-tmpi.html` en raíz (no es Markdown, no se cuenta arriba).
- `visual-search/VIOGI-Visual-Search-Modelo.docx`.

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

**Auth admin** (no declarada en `.env.example`, pero referenciada en `middleware.ts` y `app/admin/login/actions.ts`):
- `ADMIN_SECRET`

---

## 12. Observaciones crudas

- Existen dos sistemas de autenticación separados: Supabase Auth para `/[locale]/account/*` y cookie `admin_token` validada contra `ADMIN_SECRET` para `/admin/*`.
- `.env.example` declara `SUPABASE_SERVICE_ROLE_KEY` pero no `ADMIN_SECRET`, aunque ambos son usados por código en `lib/supabase/admin.ts` y `app/admin/login/actions.ts` respectivamente.
- Existen 8 archivos `plan-*.md` en raíz; algunos parecen cubrir temas solapados (ej. `plan.md` + `plan-cursor.md` + `plan-preflight.md`).
- Existen 2 archivos de research (`researchbycursor.md` 763 líneas, `research-checkout.md` 467 líneas).
- No hay `app/api/` en absoluto. El único Route Handler del proyecto es `app/auth/callback/route.ts`.
- No hay carpeta `supabase/functions/` (no se usan Edge Functions de Supabase).
- No hay archivos de tests de ninguna clase.
- No hay `prettier`, `husky`, `lint-staged` ni hooks de pre-commit configurados.
- Existen 7 sub-rutas dentro de `app/[locale]/pages/` (accessibility, chapters, customer-support, legal, locaciones, shipping-payments-returns, size-guide). Son páginas informativas estáticas, no Pages Router.
- El bucket de Storage en uso se llama `product-images` (visible en `app/admin/products/actions.ts`).
- `next.config.js` solo permite `remotePatterns` para `images.unsplash.com` y el dominio del proyecto Supabase (`oilvubxpxxzfxlqhsumk.supabase.co`). El ID del proyecto Supabase está hardcodeado en este archivo.
- Existe `documento-secciones-tmpi.html` en raíz (12 KB, no documentado en ningún README).
- Existe carpeta `visual-search/` con un README de 18 líneas y un `.docx`; no hay código.
- `CLAUDE.md` en raíz tiene 64 líneas y declara reglas de proyecto (Spanish para contenido, English para código, estructura, etc.).
- El commit `2b0decb` (HEAD actual) es de documentación; el último cambio funcional es `73ae18d feat(AU-07): wire Google OAuth button in login and register forms`.
- `app/[locale]/account/page.tsx` actúa como página de login (cuando no hay sesión) y como dashboard (cuando hay sesión); no existe una ruta `/account/login` separada.
- `app/[locale]/account/orders/page.tsx` y `app/[locale]/account/addresses/page.tsx` existen pero (según commits previos del módulo auth) usan datos mock; no se leyó código aquí para confirmar el estado actual.
- `app/[locale]/checkout/page.tsx` existe pero no hay archivos `actions.ts` ni `route.ts` asociados a checkout que indiquen integración con pasarela de pagos.
- En `plan-auth.md` línea 453 se indica "Módulo Auth: 100% completado y probado." (referenciado solo por título; no leído contenido completo).

---

## 13. Preguntas para el humano

1. **Plans solapados** — Hay 8 archivos `plan-*.md` y 2 `research-*.md`. ¿Cuáles son la fuente actual de verdad y cuáles están obsoletos? Específicamente:
   - ¿`plan.md` (552 líneas) es el plan vigente o quedó superado por `plan-cursor.md` (650 líneas)?
   - ¿`plan-preflight.md`, `plan-supabase-connect.md`, `plan-currency-mxn.md` están **completados** o son aún roadmap activo?
   - ¿`plancheckout.md` (513 líneas) y `research-checkout.md` (467 líneas) son fase actual o histórico?

2. **`researchbycursor.md`** — 763 líneas, título "Investigación Completa del Proyecto". ¿Es la base para todo nuevo trabajo, o quedó superado por los plan-*.md más recientes?

3. **Pasarela de pagos** — En código no hay ningún archivo Stripe/MercadoPago. En `.env.example` están comentados como "Fase 7". ¿La pasarela está oficialmente **pendiente desde cero**, o existe trabajo en otra rama no listada?

4. **`documento-secciones-tmpi.html`** en raíz — 12 KB, no documentado. ¿Es referencia, asset, o residual?

5. **`visual-search/`** — Carpeta con un README de 18 líneas y un `.docx`. ¿Es feature planificada, exploración descartada, o material de marketing?

6. **Dos sistemas de auth coexistentes** — `/admin/*` usa cookie `admin_token` con `ADMIN_SECRET`, no Supabase Auth. ¿La intención a largo plazo es **unificar** el admin con Supabase Auth (vía role check en `profiles.role`) o mantener los dos separados?

7. **ID de proyecto Supabase hardcodeado** en `next.config.js`. ¿Es intencional (un solo proyecto para siempre) o debería parametrizarse antes de cualquier despliegue a producción?

8. **`ADMIN_SECRET` no declarado en `.env.example`** pero usado en código. ¿Es una omisión a corregir o intencional para evitar pistas sobre la existencia del admin?

9. **`app/api/` ausente** — todo el trabajo asíncrono parece quedarse en Server Actions. ¿Hay alguna razón explícita para no introducir `app/api/` (ej. para webhooks de Stripe/MP cuando lleguen)?

10. **Carpeta `.playwright-mcp/`** — contiene logs de sesiones MCP de Playwright. ¿Conviene gitignorearla y borrarla del repo, o se considera bitácora útil?

---
