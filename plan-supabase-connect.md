# VIOGI — Plan: Conexión Supabase al código Next.js

> Creado: 2026-04-26
> Prerequisito: proyecto Supabase creado, schema aplicado, .env.local completo.
> Objetivo: que lib/products.ts lea de Supabase en lugar del array mock,
>           sin romper ninguna página ni tipo existente.
> Regla: un paso a la vez → type-check + build → verificación → commit → siguiente.

---

## Resumen de pasos

| # | Paso | Archivos | Riesgo |
|---|---|---|---|
| SB-01 | Instalar paquetes npm | `package.json` | Ninguno |
| SB-02 | Crear clientes Supabase | `lib/supabase/client.ts`, `lib/supabase/server.ts` | Bajo |
| SB-03 | Actualizar next.config.js para imágenes de Storage | `next.config.js` | Bajo |
| SB-04 | Migrar `lib/products.ts` a Supabase | `lib/products.ts` | Medio |
| SB-05 | Verificación E2E y commit final | — | — |

---

## SB-01 — Instalar paquetes

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- `@supabase/supabase-js` — cliente base de Supabase
- `@supabase/ssr` — wrapper para Next.js App Router con manejo de cookies
  (necesario para que Auth funcione correctamente en Fase 6)

**Verificación:**
- [ ] Ambos paquetes aparecen en `package.json` → `dependencies`
- [ ] `npm run type-check` ✅

**Commit:** `feat(SB-01): install @supabase/supabase-js and @supabase/ssr`

---

## SB-02 — Crear clientes Supabase

Dos archivos: uno para el **navegador** (Client Components) y otro para el
**servidor** (Server Components, Server Actions, Route Handlers).

### `lib/supabase/client.ts`
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `lib/supabase/server.ts`
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // En Server Components el set de cookies es no-op (esperado)
          }
        },
      },
    }
  )
}
```

> El cliente de servidor usa cookies porque Supabase Auth las necesita.
> Para queries de solo lectura (catálogo de productos) ambos clientes
> funcionan igual; para Auth hay que usar el de servidor.

**Verificación:**
- [ ] `npm run type-check` ✅ (sin errores de tipos en los dos archivos)
- [ ] `npm run build` ✅

**Commit:** `feat(SB-02): add Supabase browser and server clients`

---

## SB-03 — Actualizar next.config.js para imágenes de Storage

Los productos que subas desde el admin tendrán imágenes en Supabase Storage.
Next.js bloquea imágenes externas no autorizadas en `next/image`.

### Cambio en `next.config.js`
```js
// Agregar el hostname de Supabase Storage a remotePatterns
{
  protocol: 'https',
  hostname: 'oilvubxpxxzfxlqhsumk.supabase.co',
  pathname: '/storage/v1/object/public/**',
}
```

**Verificación:**
- [ ] Una imagen de Supabase Storage cargada con `<Image>` no da error 400
- [ ] `npm run build` ✅

**Commit:** `feat(SB-03): allow Supabase Storage images in next/image`

---

## SB-04 — Migrar `lib/products.ts` a Supabase

Este es el paso principal. La firma pública de las funciones **no cambia**
para que ninguna página necesite modificarse.

### Qué cambia
```ts
// Antes — array hardcodeado
export async function getProducts(category?: string): Promise<ProductData[]> {
  const products: ProductData[] = [ /* 13 objetos mock */ ]
  // ...filtra y retorna
}

// Después — query a Supabase
export async function getProducts(category?: string): Promise<ProductData[]> {
  const supabase = createClient()   // cliente de servidor
  let query = supabase
    .from('products')
    .select(`*, product_images(url, is_primary, sort_order), categories(slug)`)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    if (category === 'new') {
      query = query.eq('is_new', true)
    } else {
      query = query.eq('categories.slug', category)  // join por slug
    }
  }

  const { data, error } = await query
  if (error || !data) return []

  return data.map(rowToProductData)
}
```

### Mapper: fila de DB → ProductData
```ts
function rowToProductData(row: any): ProductData {
  const images = (row.product_images ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((img: any) => img.url)

  const primaryImage = row.product_images?.find((img: any) => img.is_primary)
  const image = primaryImage?.url ?? images[0] ?? ''

  return {
    id:          row.id,
    name:        row.name,
    price:       parseFloat(row.price_mxn),
    image,
    images:      images.length > 1 ? images : undefined,
    slug:        row.slug,
    description: row.description ?? undefined,
    category:    row.categories?.slug ?? undefined,
    soldOut:     row.sold_out,
    isNew:       row.is_new,
    size:        undefined,   // se gestiona por variants en Fase futura
  }
}
```

### Caché de Next.js
Para evitar un query por cada render de Server Component:
```ts
import { unstable_cache } from 'next/cache'

export const getProducts = unstable_cache(
  async (category?: string): Promise<ProductData[]> => { /* ... */ },
  ['products'],
  { revalidate: 60, tags: ['products'] }  // 60 s de caché, invalidable por tag
)
```

Cuando el admin edite un producto desde el panel se llamará a
`revalidateTag('products')` para invalidar el caché.

### Impacto en páginas
Ninguna página cambia — todas llaman a `getProducts()` o `getProductBySlug()`.
La diferencia es que, hasta que agregues productos reales desde el admin de
Supabase, las páginas mostrarán el estado vacío (grid sin productos).
El estado vacío ya existe y funciona en `ProductGrid`.

**Verificación:**
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅
- [ ] `/es` carga sin error (puede estar vacío si no hay productos en DB)
- [ ] `/es/collections/hoodie` filtra correctamente (vacío es válido)
- [ ] `/es/products/slug-que-no-existe` retorna 404 correctamente
- [ ] Agregar un producto desde Supabase Studio → aparece en `/es` sin redeploy
      (si revalidate: 60, esperar hasta 60 s o forzar con `revalidatePath`)

**Commit:** `feat(SB-04): migrate lib/products.ts to Supabase`

---

## SB-05 — Verificación E2E final

```bash
npm run type-check && npm run lint && npm run build
```

### Flujo completo a verificar
1. [ ] Abrir `/es` → sin error de runtime
2. [ ] Abrir `/es/collections/all` → grid vacío o con productos si los hay
3. [ ] Abrir `/es/search?q=hoodie` → sin error
4. [ ] Abrir `/es/cart` y checkout → sin error (no dependen de Supabase aún)
5. [ ] Cambiar a `/en` → mismas páginas sin error, precios en USD

### Probar con un producto real
Desde Supabase Studio → Table Editor → `products`:
1. Insertar una fila con: `slug`, `name`, `price_mxn`, `is_new: false`, `sold_out: false`
2. Insertar una fila en `product_images` con el `product_id` y una URL de imagen
3. Recargar `/es` → el producto debe aparecer

---

## Qué NO cambia en esta fase

| Cosa | Estado |
|---|---|
| `store/cartStore.tsx` | Sin cambios — carrito sigue en localStorage |
| `lib/pickupPoints.ts` | Sin cambios — sigue leyendo del archivo local (los datos ya están en la DB para cuando se migre Auth) |
| `lib/mexico.ts` | Sin cambios — SEPOMEX sigue igual |
| `app/[locale]/checkout/page.tsx` | Sin cambios — submit sigue siendo mock |
| `/account/*` | Sin cambios — sigue siendo mock (se migra en Fase Auth) |

---

## Orden de ejecución

```
SB-01 (npm install)
  → SB-02 (clientes)
  → SB-03 (next.config.js)
  → SB-04 (products.ts)
  → SB-05 (verificación)
```

---

## Estado

| Paso | Estado | Commit |
|---|---|---|
| SB-01 — instalar paquetes | Pendiente | — |
| SB-02 — clientes supabase | Pendiente | — |
| SB-03 — next.config.js imágenes | Pendiente | — |
| SB-04 — migrar products.ts | Pendiente | — |
| SB-05 — verificación E2E | Pendiente | — |
