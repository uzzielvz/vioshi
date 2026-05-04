# VIOGI — Plan: Panel de Administración

> Creado: 2026-04-28
> Prerequisito: Supabase conectado, schema aplicado, .env.local con ADMIN_SECRET y SUPABASE_SERVICE_ROLE_KEY.
> Objetivo: ruta /admin protegida con diseño VIOGI premium para gestionar productos.
> Regla: una iteración a la vez → type-check + build → verificación → commit + push.

---

## Arquitectura general

```
/admin                     → redirige a /admin/products
/admin/login               → formulario de password (única ruta pública)
/admin/products            → tabla de todos los productos
/admin/products/new        → formulario crear producto
/admin/products/[id]       → formulario editar + eliminar producto
```

- **Sin Supabase Auth por ahora**: protección con `ADMIN_SECRET` en cookie httpOnly.
  Se reemplaza solo el middleware cuando llegue la Fase de Auth.
- **Server Actions** para todas las escrituras. Usan `SUPABASE_SERVICE_ROLE_KEY` — nunca al cliente.
- **`revalidateTag('products')`** en cada mutación para refrescar el catálogo público sin redeploy.

---

## Sistema de diseño del admin

El admin usa la misma identidad visual de VIOGI pero adaptada a una interfaz de gestión.
Todos los estilos se aplican con Tailwind (ya instalado) + `style={{}}` solo donde Tailwind no alcanza.

### Tokens de diseño

| Token | Valor | Uso |
|---|---|---|
| Font | `'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif` | Todo el body |
| Font logo | Bebas Neue (`font-logo`) | Nombre "VIOGI ADMIN" en sidebar |
| Tamaño base | 11px | Labels, table cells, inputs |
| Tamaño secundario | 10px | Placeholders, hints, meta |
| Peso normal | 400 | Valores en tabla |
| Peso medio | 500 | Labels, headers de tabla |
| Tracking | `tracking-widest` | Uppercase labels y headers |
| Color texto | `#000` / `#666` / `#999` | Primary / secondary / disabled |
| Color fondo main | `#fafafa` | Área de contenido |
| Color sidebar | `#000` (bg) + `#fff` (text) | Navegación lateral |
| Border | `border-gray-100` / `border-gray-200` | Separadores sutiles |
| Hover row | `bg-gray-50` | Filas de tabla |
| Input style | `border-b border-gray-200 bg-transparent` | Igual que el checkout |
| Button primario | `bg-black text-white` | Guardar, crear |
| Button secundario | `border border-black text-black bg-white` | Cancelar, editar |
| Button destructivo | `text-red-500 hover:text-red-700` | Eliminar |

### Anatomía del layout

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR (240px, bg #000)  │  MAIN (flex-1)      │
│                            │                      │
│  VIOGI                     │  [Page header]       │
│  ADMIN                     │  Title    [CTA btn]  │
│                            │  ─────────────────── │
│  ─────────────────         │                      │
│  PRODUCTS          ←activo │  [Content]           │
│  (órdenes, future)         │                      │
│                            │                      │
│                            │                      │
│  ─────────────────         │                      │
│  LOGOUT                    │                      │
└─────────────────────────────────────────────────┘
```

---

## Variables de entorno

Ya en `.env.local`. Agregar también a `.env.example` sin valores:
```bash
ADMIN_SECRET=              # password para acceder al panel
SUPABASE_SERVICE_ROLE_KEY= # service_role key de Supabase (bypasa RLS)
```

---

## Iteraciones

---

### ADMIN-01 — Middleware de protección + página de login

**Archivos:**
- `middleware.ts` — modificar para interceptar `/admin/*`
- `app/admin/login/page.tsx` — formulario de password
- `app/admin/login/actions.ts` — Server Action: valida y setea cookie

**Lógica del middleware:**
```ts
import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

const intlMiddleware = createIntlMiddleware({ locales, defaultLocale, localePrefix: 'always', localeDetection: true })

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const token = request.cookies.get('admin_token')?.value
    if (token !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] }
```

**GUI de la página de login:**

```
┌───────────────────────────────────┐
│                                   │
│          VIOGI                    │  ← Bebas Neue 28px, centrado
│          ADMIN                    │
│                                   │
│  ─────────────────────────────    │  ← border-b, sin etiqueta
│  Password                         │  ← placeholder 11px gris
│                                   │
│  [     ENTER ADMIN     ]          │  ← bg-black text-white, full width
│                                   │
│  Incorrect password.              │  ← solo si error, text-red-500 11px
│                                   │
└───────────────────────────────────┘
```

- Fondo página: `bg-white`
- Card centrada: `max-w-xs mx-auto`, `mt-[20vh]`
- Sin bordes de card, solo los elementos flotando en blanco
- Logo VIOGI clickeable navega a `/es` (tienda)

**Server Action:**
```ts
'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string
  if (password !== process.env.ADMIN_SECRET) {
    return { error: 'Incorrect password.' }
  }
  cookies().set('admin_token', process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  redirect('/admin/products')
}
```

> El login usa `useActionState` (React 19 / Next.js 14) para mostrar el error
> inline sin recargar la página.

**Verificación:**
- [ ] `/admin` → redirige a `/admin/login`
- [ ] Password incorrecta → "Incorrect password." visible debajo del botón
- [ ] Password correcta → redirige a `/admin/products` (404 por ahora, OK)
- [ ] Cookie `admin_token` en DevTools → Application → Cookies
- [ ] Recargar `/admin/products` autenticado → no vuelve al login
- [ ] `npm run type-check` ✅ `npm run build` ✅

**Commit:** `feat(ADMIN-01): admin middleware protection and login page`
**Push:** sí

---

### ADMIN-02 — Layout con sidebar + logout

**Archivos:**
- `app/admin/layout.tsx` — layout raíz del admin (propio `<html>/<body>`)
- `app/admin/page.tsx` — redirige a `/admin/products`
- `app/admin/_components/Sidebar.tsx` — sidebar client component (para active links)
- `app/admin/_components/LogoutButton.tsx` — client component, llama Server Action
- `app/admin/logout/actions.ts` — Server Action que borra cookie

**GUI del sidebar:**

```
┌─────────────────────┐
│                     │
│  VIOGI              │  ← font-logo (Bebas Neue), 18px, tracking-widest
│  ADMIN              │  ← text-white/40, 10px, tracking-widest
│                     │
│  ───────────────    │  ← border-white/10
│                     │
│  PRODUCTS     ●     │  ← active: text-white | inactive: text-white/40
│                     │  ← 11px uppercase tracking-widest
│  ORDERS       —     │  ← deshabilitado, future (text-white/20)
│                     │
│                     │
│                     │
│                     │
│  ───────────────    │  ← mt-auto, border-white/10
│  LOGOUT             │  ← 10px text-white/40 hover:text-white
└─────────────────────┘
```

- Sidebar: `w-60 bg-black flex flex-col min-h-screen px-6 py-8`
- Link activo detectado con `usePathname()` — por eso es Client Component
- Hover en links: `text-white` (de `text-white/40`)
- Transición: `transition-colors duration-150`

**GUI del main area:**
- `flex-1 bg-[#fafafa] min-h-screen`
- Padding: `px-10 py-8`
- Sin bordes ni sombras — el contraste negro/gris claro separa visualmente

**Verificación:**
- [ ] Sidebar negro con "VIOGI ADMIN" visible
- [ ] Link "PRODUCTS" resaltado cuando estás en `/admin/products`
- [ ] "ORDERS" visible pero claramente deshabilitado
- [ ] Logout borra cookie → redirige a `/admin/login`
- [ ] Layout responsive: en mobile el sidebar colapsa (solo para desktop por ahora, OK)
- [ ] `npm run type-check` ✅ `npm run build` ✅

**Commit:** `feat(ADMIN-02): admin layout with sidebar and logout`
**Push:** sí

---

### ADMIN-03 — Supabase Storage + cliente admin

**Archivos (código):**
- `lib/supabase/admin.ts` — cliente con service_role key

**SQL a correr en Supabase SQL Editor (una sola vez):**
```sql
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');
```

**`lib/supabase/admin.ts`:**
```ts
import { createClient } from '@supabase/supabase-js'

// Solo para Server Actions — NUNCA importar en client components ni exponer al browser
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

**Verificación:**
- [ ] Bucket `product-images` visible en Supabase → Storage
- [ ] Subir imagen de prueba manualmente en Storage → URL pública accesible en el navegador
- [ ] `npm run type-check` ✅

**Commit:** `feat(ADMIN-03): Supabase Storage bucket and admin client`
**Push:** sí

---

### ADMIN-04 — Lista de productos

**Archivos:**
- `app/admin/products/page.tsx` — Server Component
- `app/admin/products/DeleteButton.tsx` — Client Component
- `app/admin/products/actions.ts` — `deleteProduct` Server Action

**GUI de la tabla:**

```
Products (13)                              [+ NEW PRODUCT]
──────────────────────────────────────────────────────────
IMAGE  NAME                  CATEGORY   PRICE      NEW  S.OUT  ACTIONS
──────────────────────────────────────────────────────────
[img]  TEE STUSSY            Playeras   $3,500      ●    —     [Edit] [×]
[img]  HOODIE PLAYBOY        Hoodies    $7,000      ●    —     [Edit] [×]
[img]  CHAMARRA NIKE SB      Chamarras  $12,500     —    —     [Edit] [×]
──────────────────────────────────────────────────────────
```

Detalles visuales:
- Header de tabla: `text-[10px] uppercase tracking-widest text-gray-400`, `border-b border-gray-200`
- Filas: `text-[11px]`, `border-b border-gray-100`, `hover:bg-gray-50 transition-colors`
- Thumbnail: `w-10 h-12 object-cover bg-gray-100` (aspect 3/4 mini)
- Precio: `font-mono` o alineado a la derecha
- Badge NEW: punto negro `w-1.5 h-1.5 bg-black rounded-full` centrado
- Badge SOLD OUT: `—` gris si false, punto negro si true
- Botón Edit: `text-[10px] uppercase tracking-widest border-b border-black hover:opacity-50`
- Botón ×: `text-[10px] text-gray-400 hover:text-red-500 transition-colors`
- Botón "+ NEW PRODUCT": `bg-black text-white text-[10px] uppercase tracking-widest px-4 py-2`
- Estado vacío: `text-[11px] text-gray-400 text-center py-24 uppercase tracking-widest`

**Verificación:**
- [ ] Tabla vacía muestra estado "No products yet" centrado
- [ ] Agregar producto desde Supabase Studio → aparece en la tabla con thumbnail
- [ ] Hover en fila cambia a `bg-gray-50`
- [ ] Click × → `confirm()` → producto eliminado de tabla Y del catálogo público
- [ ] `npm run type-check` ✅ `npm run build` ✅

**Commit:** `feat(ADMIN-04): product list table with delete`
**Push:** sí

---

### ADMIN-05 — Formulario crear / editar producto

**Archivos:**
- `app/admin/products/new/page.tsx` — Server Component (carga categorías, renderiza form vacío)
- `app/admin/products/[id]/page.tsx` — Server Component (carga producto + categorías, renderiza form con datos)
- `app/admin/products/_components/ProductForm.tsx` — Client Component del formulario
- `app/admin/products/_components/ImageUploader.tsx` — Client Component para preview de imágenes
- `app/admin/products/actions.ts` — ampliar con `createProduct`, `updateProduct`

**GUI del formulario:**

```
← Back to products

NEW PRODUCT
──────────────────────────────────────────────────────────

  IMAGES                               DETAILS
  ┌─────────────────────┐              NAME ──────────────────────────
  │   +  DROP IMAGE     │              SLUG ──────────────────────────
  │      OR CLICK       │              CATEGORY ──────── ▾
  └─────────────────────┘              PRICE MXN ──────────────────────
  [img1] [img2] [+ add] ←thumbnails    ORIGINAL PRICE MXN (opcional) ──
                                       SKU ─────────────────────────────
                                       MATERIAL ────────────────────────
                                       MADE IN ─────────────────────────

                                       DESCRIPTION
                                       ─────────────────────────────────
                                       ─────────────────────────────────

                                       ☐  IS NEW
                                       ☐  IS FEATURED
                                       ☐  SOLD OUT

──────────────────────────────────────────────────────────
                              [CANCEL]  [SAVE PRODUCT]
```

Detalles visuales:
- Layout de 2 columnas en desktop (`grid grid-cols-[320px_1fr] gap-12`), 1 columna en mobile
- Labels: `text-[10px] uppercase tracking-widest text-gray-400 mb-1`
- Inputs: `w-full border-b border-gray-200 bg-transparent py-2.5 text-[11px] focus:outline-none focus:border-black transition-colors` (idéntico al checkout)
- Select categoría: mismo estilo que `CustomSelect` del checkout
- Checkboxes: cuadrado 14×14px, borde negro, check negro al activar
- ImageUploader:
  - Zona de drop: `border border-dashed border-gray-300 rounded-none`, `hover:border-black`
  - Preview thumbnails: `w-16 h-20 object-cover bg-gray-100 relative group`
  - Botón eliminar thumbnail: `×` absoluto top-right, visible en hover
  - Primera imagen = primary (indicador "MAIN" en el thumbnail)
- Auto-slug: `useEffect` que convierte `name` a kebab-case mientras el campo slug no haya sido editado manualmente
- Botón Save: `bg-black text-white text-[10px] uppercase tracking-widest px-8 py-3`
- Botón Cancel: `border border-black text-[10px] uppercase tracking-widest px-6 py-3 hover:bg-black hover:text-white transition-colors`
- Estado loading del submit: texto del botón cambia a "SAVING..." y se deshabilita
- Error de servidor: banner rojo sutil (`bg-red-50 border border-red-200 text-red-600 text-[11px] px-4 py-3`) sobre los botones

**Flujo de imagen:**
1. `ImageUploader` mantiene estado local de archivos (`File[]`) y previews (`ObjectURL[]`)
2. Al submit, los archivos se incluyen en el `FormData` con `append('images', file)`
3. Server Action sube cada file a `storage/product-images/{productId}/{timestamp}-{i}.{ext}`
4. Inserta URLs en `product_images` con `is_primary: i === 0`
5. Al editar: se muestran imágenes existentes (de DB) + nuevas (del input). Las existentes se pueden eliminar con `×` (llama `deleteProductImage` Server Action)

**Verificación:**
- [ ] Crear producto con 2 imágenes → aparece en `/admin/products` con thumbnail
- [ ] El mismo producto aparece en `/es` y `/es/collections/{category}`
- [ ] Imagen carga desde Supabase Storage URL en `next/image`
- [ ] Editar precio → cambio visible en catálogo sin redeploy
- [ ] Slug auto-generado desde name, editable manualmente
- [ ] `is_new: true` → badge NEW en ProductCard del storefront
- [ ] `sold_out: true` → overlay SOLD OUT en ProductCard
- [ ] Eliminar imagen en edición → desaparece de la galería del producto
- [ ] `npm run type-check` ✅ `npm run build` ✅

**Commit:** `feat(ADMIN-05): product create/edit form with image upload`
**Push:** sí

---

## Orden de ejecución

```
ADMIN-01 → ADMIN-02 → ADMIN-03 → ADMIN-04 → ADMIN-05
```

---

## Fuera de scope (futuro)

| Feature | Cuándo |
|---|---|
| `/admin/orders` — gestión de pedidos | Tras conectar checkout real |
| `/admin/promo-codes` | Fase pagos |
| Reemplazar password con Supabase Auth | Fase auth |
| Variantes de producto (tallas/colores) | Cuando el catálogo crezca |
| Dark mode del admin | Nunca (ya es negro el sidebar, suficiente) |

---

## Estado

| Iteración | Estado | Commit |
|---|---|---|
| ADMIN-01 — middleware + login | Pendiente | — |
| ADMIN-02 — layout + sidebar | Pendiente | — |
| ADMIN-03 — Storage bucket + admin client | Pendiente | — |
| ADMIN-04 — lista de productos | Pendiente | — |
| ADMIN-05 — formulario crear/editar + imágenes | Pendiente | — |
