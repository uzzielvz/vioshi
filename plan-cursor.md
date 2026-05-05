# VIOGI — Plan Consolidado de Mejoras

> Autor: Cursor (Claude Opus 4.7)
> Fecha: 2026-04-21
> Base: `researchbycursor.md`, `plan.md`, `plancheckout.md`, `research.md`

Este plan agrupa todas las mejoras detectadas en la auditoría en un solo
roadmap dividido en **7 fases**, cada una con sus **iteraciones atómicas**,
criterios de aceptación y **puntos de control (🛑)** donde necesito tu
confirmación antes de continuar.

---

## Reglas del plan

1. **Una iteración a la vez**. Ninguna iteración arranca sin haber cerrado la
   anterior (type-check + lint + build + tu OK en los checkpoints).
2. **Commit atómico por iteración** con mensaje descriptivo y referencia a la
   iteración (ej. `feat(I1.1): wire header search to /search`).
3. **Post-checks obligatorios tras cada iteración**:
   ```bash
   npm run type-check && npm run lint && npm run build
   ```
4. **Dos tipos de checkpoint**:
   - ✅ **Quality gate**: yo verifico que todo pasa y sigo.
   - 🛑 **Decision gate**: requiere tu input (stack, diseño, alcance).
5. **Scope cerrado por iteración**. Si encuentro bugs fuera de scope, los
   apunto en un `TODO-cursor.md` y sigo.
6. **Rollback trivial**: si una iteración rompe algo, `git reset --hard` al
   commit anterior y replanifico.

---

## Estrategia de ramas

```
main                 ←  nunca se toca directamente
  └─ feat/consolidacion-v2   ←  rama larga de integración de TODO el plan
        └─ feat/I1.1-header-search
        └─ feat/I1.2-wishlist-persist
        └─ feat/I1.3-cleanup-deps
        └─ feat/I2.1-nav-components
        └─ ... (una subrama por iteración)
```

Cada iteración vive en su propia subrama (`feat/I{X.Y}-slug`) y se mergea a
`feat/consolidacion-v2` con squash tras el OK del checkpoint. Al final del
plan, `feat/consolidacion-v2` se mergea a `main` con `--no-ff` para preservar
la historia.

### 🛑 CHECKPOINT 0 — Bootstrap

Antes de escribir una sola línea necesito tu confirmación de:

1. **Nombre de la rama base** (propongo `feat/consolidacion-v2`).
2. **Política de merge**: ¿squash por iteración o merge commits?
3. **Alcance total**: ¿hago TODAS las fases o quieres cortar en alguna?
4. **Ambiente de preview**: ¿hay Vercel/Netlify configurado o corro solo
   `npm run build` local?

---

## FASE 1 — Quick wins y deuda técnica baja

> **Duración estimada**: 1 día
> **Riesgo**: muy bajo
> **Meta**: arreglar los bugs visibles y limpiar código muerto antes de
> abordar cambios grandes.

### Iteración 1.1 — Cablear la búsqueda del Header a `/search`

**Archivos**: `components/Header.tsx`
**Tiempo**: 30 min

**Pasos**:
1. Importar `useRouter` de `next/navigation`.
2. Envolver el `<input>` de búsqueda (línea ~637) en un `<form>` con
   `onSubmit` que:
   - Previene default.
   - Navega a `/${locale}/search?q=${encodeURIComponent(searchQuery)}` si el
     query tiene ≥ 1 caracter no-whitespace.
   - Cierra el modal (`setSearchOpen(false)`) y limpia el input.
3. Mantener el comportamiento actual de cerrar con ESC y con el overlay.

**Verificación**:
- [ ] Escribir "hoodie" + Enter navega a `/es/search?q=hoodie` y muestra el
      hoodie Playboy.
- [ ] Escribir string vacío + Enter no hace nada.
- [ ] ESC y overlay siguen cerrando sin navegar.

**Commit**: `feat(I1.1): wire header search input to /search page`

**✅ Quality gate** tras type-check/lint/build.

---

### Iteración 1.2 — Persistir wishlist en localStorage

**Archivos**: `app/[locale]/wishlist/page.tsx`, `lib/constants.ts` (ya tiene
`STORAGE_KEYS.WISHLIST`).

**Tiempo**: 45 min

**Pasos**:
1. Leer de `localStorage[STORAGE_KEYS.WISHLIST]` al montar, con fallback al
   mock actual (`['1','2','3']`) solo si está vacío.
2. Guardar en cada cambio (patrón idéntico al de `cartStore.tsx`).
3. Añadir botón "Add to Wishlist" (corazón) en `components/ProductCard.tsx`
   (opt-in — lo dejo como TODO si quieres mantener scope mínimo).

**Verificación**:
- [ ] Quitar un item y recargar → el item sigue fuera.
- [ ] Vaciar wishlist + recargar → sigue vacía.
- [ ] Sin `localStorage` disponible (modo incógnito privado) → no rompe.

**Commit**: `feat(I1.2): persist wishlist to localStorage`

**✅ Quality gate.**

---

### Iteración 1.3 — Limpieza de dependencias y estilos repetidos

**Archivos**: `package.json`, `globals.css`, ~20 archivos que declaran
`fontStyle`.

**Tiempo**: 1 h

**Pasos**:
1. Ejecutar `rg "framer-motion"` — si no aparece en `/components`, `/app`,
   `/lib`, `/hooks`, `/store`, eliminarlo de `dependencies`.
2. Añadir en `globals.css`:
   ```css
   .font-viogi {
     font-family: 'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif;
   }
   ```
3. Buscar `fontFamily: "'Helvetica Neue', 'Inter'...` y reemplazar por la
   clase utility en los archivos donde no haya otros `style` inline
   conflictivos. Archivos con `style={...fontStyle, fontSize: ...}` los dejo
   como están en esta iteración (los ataco en I2.3).
4. Correr `npm install` para regenerar lockfile si se quitó framer-motion.

**Verificación**:
- [ ] Build pasa sin errores.
- [ ] Grep del nombre de la clase confirma su uso en ≥ 3 archivos.
- [ ] Visualmente idéntico.

**Commit**: `chore(I1.3): remove unused framer-motion + add font-viogi utility`

**🛑 CHECKPOINT 1** — Fin de Fase 1. Necesito tu OK para continuar con el
refactor del Header (Fase 2).

---

## FASE 2 — Refactor del Header y adopción del design system

> **Duración estimada**: 2 días
> **Riesgo**: medio (mucha superficie visual)
> **Meta**: `Header.tsx` debajo de 300 líneas; `components/common/*` usado en
> ≥ 3 páginas.

### Iteración 2.1 — Extraer `NavLink` y `LocaleSwitcher`

**Archivos nuevos**:
- `components/header/NavLink.tsx`
- `components/header/LocaleSwitcher.tsx`

**Archivos modificados**: `components/Header.tsx`

**Tiempo**: 2 h

**Pasos**:
1. Crear `NavLink` que encapsule:
   - `<Link>` con el `style` tipográfico VIOGI (tamaño 11px, weight 500,
     uppercase, tracking 0.02em, textShadow).
   - Props: `href`, `active?`, `withChevron?`, `chevronRotated?`, `onClick?`.
2. Crear `LocaleSwitcher` que contenga:
   - Botón `{lang} / {currency}` con chevron rotante.
   - Dropdown desktop + modal mobile (extraídos literalmente del Header).
   - `switchLocale(newLocale)` con `window.location.href`.
3. Reemplazar las ~15 repeticiones inline en `Header.tsx` por el nuevo
   `NavLink`.

**Verificación**:
- [ ] Navegación visualmente idéntica.
- [ ] Estados activos (shop/support/collections) siguen funcionando.
- [ ] Cambio de idioma funciona (full page reload).
- [ ] `Header.tsx` < 800 líneas tras este paso.

**Commit**: `refactor(I2.1): extract NavLink and LocaleSwitcher from Header`

**✅ Quality gate.**

---

### Iteración 2.2 — Extraer `SearchBar` y `MobileMenu`

**Archivos nuevos**:
- `components/header/SearchBar.tsx` (incluye overlay + cursor custom).
- `components/header/MobileMenu.tsx` (acordeón fullscreen).
- `components/header/SubmenuRow.tsx` (fila de categorías / soporte).

**Archivos modificados**: `components/Header.tsx`

**Tiempo**: 3 h

**Pasos**:
1. Mover los bloques `{searchOpen && (...)}` y `{mobileMenuOpen && (...)}` del
   Header a componentes propios con su estado interno cuando aplique.
2. `SearchBar` recibe `onClose` y el `locale` como props. Internamente maneja
   su propio `searchQuery` y dispara el `router.push` de I1.1.
3. `MobileMenu` recibe `onClose` + `onLocaleChange` + `onAccount`.
4. `SubmenuRow` es un pequeño presentacional que toma una lista de links.

**Verificación**:
- [ ] Búsqueda sigue navegando a `/search` (no regresión de I1.1).
- [ ] Mobile menu abre/cierra con los dos acordeones intactos.
- [ ] `Header.tsx` < 300 líneas.
- [ ] Screenshots comparativos mobile/desktop OK.

**Commit**: `refactor(I2.2): split Header into SearchBar, MobileMenu, SubmenuRow`

**🛑 CHECKPOINT 2.2** — Este cambio toca la UI principal. Quiero que
verifiques visualmente antes de continuar:
- Home en desktop y mobile.
- `/collections/hoodie` con submenú activo.
- Modal de búsqueda + cambio de idioma desde mobile.

---

### Iteración 2.3 — Adoptar `components/common/*` en páginas seleccionadas

**Archivos**: `app/[locale]/account/*` (perfil, register, forgot-password),
`app/[locale]/vender/page.tsx`.

**Tiempo**: 2 h

**Pasos**:
1. Reemplazar los `<input>` manuales de estas páginas por `<Input>` de
   `components/common/Input.tsx` (extendiendo props si falta algún estilo).
2. Reemplazar los `<button>` manuales por `<Button variant="primary|secondary">`.
3. Si falta un variant (ej. outline con border negro), añadirlo al `Button`.

**Verificación**:
- [ ] Visualmente idéntico (tolerancia 2 px).
- [ ] Funcionalidad idéntica (submit, errores).
- [ ] No romper páginas fuera de alcance.

**Commit**: `refactor(I2.3): adopt common/Input and common/Button in account and vender`

**✅ Quality gate.**

**🛑 CHECKPOINT 2** — Fin de Fase 2. Confirma antes de i18n.

---

## FASE 3 — i18n faltante

> **Duración estimada**: 1 día
> **Riesgo**: bajo
> **Meta**: cero strings visibles en español dentro de código cuando el
> locale es `en`.

### Iteración 3.1 — i18n en `/vender`, `/archive`, `/account/*` mocks

**Archivos**:
- `app/[locale]/vender/page.tsx`
- `app/[locale]/archive/page.tsx`
- `app/[locale]/archive/[slug]/page.tsx`
- `app/[locale]/account/profile/page.tsx`
- `app/[locale]/account/orders/page.tsx`
- `app/[locale]/account/orders/[orderId]/page.tsx`
- `app/[locale]/account/addresses/page.tsx`
- `messages/es.json`, `messages/en.json`

**Tiempo**: 3 h

**Pasos**:
1. Añadir namespaces `vender`, `archive_entries`, `orders`, `profile`,
   `addresses` en ambos `messages/*.json`.
2. Reemplazar strings hardcoded en cada página por `useTranslations`/
   `getTranslations`.
3. Los status de pedidos (`"Entregado"`, `"En tránsito"`, `"Procesando"`) se
   meten en `orders.status.*`.
4. Nombres de drops en `archive` (`WINTER ESSENTIALS`, etc.) → `archive.drops.*`.

**Verificación**:
- [ ] Cambiar a `/en` y navegar por las páginas — todos los textos en inglés.
- [ ] Plurales ICU siguen funcionando.

**Commit**: `feat(I3.1): i18n vender, archive and account mock pages`

**✅ Quality gate.**

---

### Iteración 3.2 — i18n en `/pages/legal`

**Archivos**: `app/[locale]/pages/legal/page.tsx`, `messages/*.json`.
**Tiempo**: 1 h

**Pasos**:
1. Mover los ~5 bloques de texto legal a `messages/*.json` bajo `legal.*`.
2. Si los textos son muy largos, dividir en arrays en JSON e iterar con
   `.map`.

**Verificación**:
- [ ] `/es/pages/legal` y `/en/pages/legal` muestran contenido correcto.

**Commit**: `feat(I3.2): i18n legal page content`

**🛑 CHECKPOINT 3** — Fin de Fase 3. Tras este punto entramos a backend.
Necesito tu input en el siguiente checkpoint.

---

## FASE 4 — Backend de productos (la fase grande)

> **Duración estimada**: 5–7 días
> **Riesgo**: alto (estructural)
> **Meta**: `lib/products.ts` reemplazado por llamadas a DB real sin romper
> ninguna página.

### 🛑 CHECKPOINT 4.0 — Decisión de stack

**Necesito tu decisión en 3 dimensiones:**

1. **Base de datos / CMS**:
   - **A) Supabase** (Postgres gestionado + Auth + Storage): mi recomendación
     por simplicidad y porque nos sirve para Fase 6 también.
   - **B) Prisma + Neon** (Postgres serverless): más flexibilidad, más código.
   - **C) Sanity / Contentful / Payload CMS**: mejor UX editorial para marketing,
     peor para stock/variantes.
   - **D) Airtable / Notion API**: sólo para demos, no recomendado en prod.

2. **Hosting de imágenes**:
   - Actualmente en `public/products/*.png` (bundle).
   - Opciones: Supabase Storage, Cloudinary, S3, Vercel Blob. Depende de (1).

3. **Admin panel**:
   - **A)** Usar el Studio/Dashboard propio del stack elegido (más rápido).
   - **B)** Construir `/admin` dentro del repo (más trabajo, más control).
   - **C)** Sin admin, edita devs via migraciones (más simple pero limitado).

**No avanzo a las siguientes iteraciones hasta tener tu respuesta.**

---

### Iteración 4.1 — Setup del stack

_Los pasos concretos dependen del resultado del checkpoint 4.0. Asumo
**Supabase** para llenar el ejemplo; lo reescribo si eliges otro._

**Archivos nuevos**:
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `supabase/migrations/0001_products.sql`
- `.env.local` (local only) + `.env.example`

**Tiempo**: 3 h

**Pasos**:
1. `npm install @supabase/supabase-js @supabase/ssr`.
2. Crear proyecto en supabase.com y exportar URL + anon key a `.env.local`.
3. SQL migration con tabla `products`:
   ```sql
   create table products (
     id uuid primary key default gen_random_uuid(),
     slug text unique not null,
     name text not null,
     description text,
     price_usd numeric not null,
     category text not null,
     size text,
     sold_out boolean default false,
     is_new boolean default false,
     image_url text not null,
     image_urls text[] default array[]::text[],
     created_at timestamptz default now()
   );
   ```
4. Clientes server/client siguiendo el patrón `@supabase/ssr` para App Router.

**Verificación**:
- [ ] `npm run build` pasa.
- [ ] Conexión probada con un `select * from products` desde un script.

**Commit**: `feat(I4.1): setup Supabase client and products schema`

**✅ Quality gate.**

---

### Iteración 4.2 — Migrar imágenes y hacer seed

**Tiempo**: 2 h

**Pasos**:
1. Subir los 13 PNGs de `public/products/` a Supabase Storage (bucket
   `product-images` público).
2. Escribir `scripts/seed-products.ts` que inserte los 13 productos del mock
   actual en la tabla, con URL pública de Storage.
3. Documentar el script en `CLAUDE.md`.

**Verificación**:
- [ ] `select count(*) from products` devuelve 13.
- [ ] Las URLs de imagen devuelven 200.

**Commit**: `feat(I4.2): seed products from mock to Supabase Storage`

**✅ Quality gate.**

---

### Iteración 4.3 — Reemplazar `lib/products.ts`

**Archivos**: `lib/products.ts`, todos los consumidores (home, collections,
products/[slug], search, archive/[slug], wishlist).

**Tiempo**: 3 h

**Pasos**:
1. Mantener la firma:
   ```ts
   export async function getProducts(category?: string): Promise<ProductData[]>
   export async function getProductBySlug(slug: string): Promise<ProductData | null>
   ```
2. Internamente usar el cliente Supabase server (`createClient` de
   `@supabase/ssr`).
3. Mapear el row de DB a `ProductData` (mantener snake_case → camelCase).
4. Añadir caché de Next.js con `fetch` + tags o `unstable_cache` con TTL 60 s.

**Verificación**:
- [ ] Home carga los 13 productos (mismos de antes).
- [ ] `/collections/hoodie` filtra correctamente.
- [ ] `/products/tee-stussy-s` renderiza.
- [ ] Añadir al carrito + checkout siguen funcionando.
- [ ] `/search?q=nike` sigue filtrando.

**Commit**: `feat(I4.3): migrate getProducts to Supabase (same API)`

**🛑 CHECKPOINT 4.3** — Este es el punto de no-retorno del backend. Tras
merge a la rama de integración, `lib/products.ts` depende de Supabase.
Necesito tu OK después de verificar en tu navegador que todo sigue igual.

---

### Iteración 4.4 — Admin / edición de productos

_Depende del checkpoint 4.0._

**Tiempo**: 4–8 h según opción elegida.

**Opción A (Supabase Studio)**: Solo documento en `CLAUDE.md` cómo crear
productos desde Studio. 0 código.

**Opción B (`/admin` propio)**:
1. Ruta `/admin` protegida por password env (`ADMIN_PASSWORD`).
2. Tabla de productos con botones "editar" / "nuevo".
3. Formulario con upload de imagen a Supabase Storage.
4. `revalidateTag('products')` al guardar.

**Verificación**:
- [ ] Crear producto desde admin → aparece en `/collections/all` sin deploy.
- [ ] Editar precio → cambio visible en home.

**Commit**: `feat(I4.4): admin panel for products`

**✅ Quality gate.**

**🛑 CHECKPOINT 4** — Fin de Fase 4. Backend de productos completo. Confirma
antes de continuar con tests.

---

## FASE 5 — Testing

> **Duración estimada**: 2 días
> **Riesgo**: bajo
> **Meta**: cobertura crítica de unit tests + smoke tests de páginas clave.

### Iteración 5.1 — Setup Jest + RTL

**Archivos nuevos**:
- `jest.config.ts`, `jest.setup.ts`
- Scripts en `package.json`: `test`, `test:watch`, `test:ci`

**Tiempo**: 1 h

**Pasos**:
1. `npm install -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`.
2. Config estándar Next.js (`next/jest`).
3. Setup con mocks de `next/navigation`, `next/image`, `next-intl`.

**Commit**: `chore(I5.1): setup Jest + React Testing Library`

**✅ Quality gate.**

---

### Iteración 5.2 — Tests unitarios del cart + utils + formatters

**Archivos nuevos**:
- `store/__tests__/cartStore.test.tsx`
- `lib/__tests__/formatters.test.ts`
- `lib/__tests__/utils.test.ts`

**Tiempo**: 3 h

**Tests clave**:
- `calculateTotals`: items vacío → shipping 0; tax = 16 % del subtotal;
  total correcto.
- `addItem`: merge por (productId, color, size); crea nuevo si no existe.
- `removeItem` / `updateQuantity(0)` / `clearCart`.
- Persistencia en localStorage (hidratación + guardado).
- `formatPrice`: locale es → MXN + 17.5x; locale en → USD; showDecimals false.
- `generateId`: único en 1000 llamadas.

**Commit**: `test(I5.2): unit tests for cartStore, formatters, utils`

**✅ Quality gate** (cobertura ≥ 90 % en los tres archivos).

---

### Iteración 5.3 — Tests de componentes

**Archivos nuevos**:
- `components/__tests__/ProductCard.test.tsx`
- `components/__tests__/CartDrawer.test.tsx`
- `app/[locale]/checkout/__tests__/page.test.tsx`

**Tiempo**: 4 h

**Tests clave**:
- `ProductCard`: render con `isNew`, `soldOut`, `quickAdd` dispara `addItem`.
- `CartDrawer`: abre/cierra, renderiza items, botón checkout navega.
- Checkout: validación de terms obligatoria, dirección incompleta bloquea
  submit, CP lookup dispara fetch (mockeado).

**Commit**: `test(I5.3): component and integration tests`

**🛑 CHECKPOINT 5** — Fin de Fase 5. Tests corren en CI. ¿Sigues con auth
(Fase 6) o paramos aquí?

---

## FASE 6 — Auth real (opcional)

> **Duración estimada**: 3–4 días
> **Riesgo**: alto (seguridad)
> **Meta**: `/account/*` funcional con usuarios reales.

### 🛑 CHECKPOINT 6.0 — Decisión de auth

1. **Proveedor**:
   - **A)** Supabase Auth (si elegiste Supabase en 4.0) — más simple.
   - **B)** NextAuth v5 / Auth.js — más control, más código.
   - **C)** Clerk — más UX, pago.

2. **Métodos**: email+password + Google OAuth ¿otros?

3. **Datos de perfil**: ¿guardamos address default en DB?

### Iteración 6.1 — Tabla `users` + login real

### Iteración 6.2 — Registro + recuperación de contraseña real

### Iteración 6.3 — Proteger rutas `/account/*` con middleware

### Iteración 6.4 — Migrar mocks de `orders/addresses/archivos` a datos reales

**🛑 CHECKPOINT 6** — Fin de Fase 6.

---

## FASE 7 — Pagos reales (opcional)

> **Duración estimada**: 5 días
> **Riesgo**: muy alto (dinero real, webhooks, PCI)
> **Meta**: checkout procesa cobros reales.

### 🛑 CHECKPOINT 7.0 — Decisión de pagos

1. **Proveedor**:
   - **A)** Stripe (USD/EUR, fácil internacional).
   - **B)** Mercado Pago (mejor para México, MSI nativo).
   - **C)** PayPal (ya tienes `paypal.me/viogi` manual — podríamos integrar
     PayPal Checkout).

2. **Métodos**: tarjeta + OXXO (si MP) + PayPal + MSI ¿cuáles?

### Iteración 7.1 — Integración del proveedor

### Iteración 7.2 — Webhook + tabla `orders` persistida

### Iteración 7.3 — Email de confirmación transaccional (Resend/SES)

### Iteración 7.4 — Admin de pedidos + tracking

**🛑 CHECKPOINT 7** — Fin de Fase 7. Ya sería un sistema vendible real.

---

## Resumen de checkpoints

| # | Tipo | Qué necesito de ti |
|---|------|--------------------|
| 0 | 🛑 | Nombre de rama, política merge, alcance total, preview env |
| 1 | 🛑 | OK visual de quick wins antes de refactor |
| 2.2 | 🛑 | Verificación visual del Header refactorizado (mobile + desktop) |
| 2 | 🛑 | OK Fase 2 completa |
| 3 | 🛑 | OK i18n — tras esto empieza backend |
| 4.0 | 🛑 | Decisión stack DB + imágenes + admin |
| 4.3 | 🛑 | Verificar que el swap a Supabase no rompe UX |
| 4 | 🛑 | OK Fase 4 (backend listo) |
| 5 | 🛑 | ¿Paramos en tests o seguimos con auth? |
| 6.0 | 🛑 | Decisión stack auth |
| 6 | 🛑 | OK Fase 6 |
| 7.0 | 🛑 | Decisión proveedor de pagos |
| 7 | 🛑 | OK Fase 7 (sistema completo) |

---

## Estimación total

| Fase | Iteraciones | Duración | Acumulado |
|------|-------------|----------|-----------|
| 1 | 3 | 1d | 1d |
| 2 | 3 | 2d | 3d |
| 3 | 2 | 1d | 4d |
| 4 | 4 | 5–7d | 9–11d |
| 5 | 3 | 2d | 11–13d |
| 6 *(opcional)* | 4 | 3–4d | 14–17d |
| 7 *(opcional)* | 4 | 5d | 19–22d |

**Ruta mínima sin backend** (Fases 1–3 + 5): ~6 días.
**Ruta con backend de productos** (1–5): ~13 días.
**Ruta completa**: ~3 semanas.

---

## Mi recomendación de alcance inicial

Si tengo que comprometerme a un bloque sin preguntar, **Fases 1 + 2 + 3 + 5**
(sin backend). Son ~6 días, riesgo bajo, sitio queda limpio y con tests, y
luego tú decides si invertir en backend cuando tengas SKUs reales / marca
afiliada pidiéndolo.

Pero la decisión es tuya — por eso el checkpoint 0.
