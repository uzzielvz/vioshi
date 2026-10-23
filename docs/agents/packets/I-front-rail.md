# Paquete I — Front de rail sobre lo que ya existe

**Estado:** LISTO · **Rama:** `claude/gifted-fermi-ku1xl3` (continuar aquí, no crear otra) · **No mergear a `main`.**

## Lee primero

1. `docs/PROYECTO.md` (§ 2 destino y § 6 Etapa 2)
2. `docs/design/TOKENS.md`: colores, letra y componentes aprobados
3. `docs/design/prototipo-rail.html`: ábrelo en el navegador. Es el diseño objetivo.

## Ya hecho (commit `a302186`): no rehacer

- Tokens en `tailwind.config.ts`: `ink`, `paper`, `carton`, `line`, `muted`, `accent` (`accent-press`, `accent-wash`) y `rounded-btn`.
- Inter con `next/font` (`lib/fonts.ts`), aplicada en `app/[locale]/layout.tsx` y `app/admin/layout.tsx`. Las fuentes inline usan `var(--font-sans)`.
- `components/ui/Wordmark.tsx` (logo desde `lib/brand.ts`) y `components/ui/icons.tsx`.
- `components/Header.tsx`, `components/BottomNav.tsx`, `components/Footer.tsx` y `components/ClientLayout.tsx` nuevos.
- `lib/categories.ts` (`STORE_CATEGORIES`) y `GARMENT_TYPE_LABELS_EN` en `lib/garments.ts`.
- Textos nuevos en `messages/*.json` bajo `ui.*` (`nav`, `cats`, `home`, `card`, `product`, `bag`, `footer`, `store`). Úsalos; ya existen en es y en.

## Tareas (en orden, un commit por tarea)

1. **Tarjeta de la feed y grid**
   - `components/ProductCard.tsx`:
     - Foto 3:4 sobre `bg-carton` con `mix-blend-multiply` en la imagen.
     - Fila 1: **marca + tipo** (`brand.name` + `GARMENT_TYPE_LABELS[_EN][garmentType]`; si no hay, `name`) en una línea con «…», y la **talla** a la derecha.
     - Fila 2: **precio** (700, `tabular-nums`) y **corazón**.
     - Badge `ui.card.reserved` (blanco, borde `ink`) o `ui.card.sold` (`ink`). La foto vendida va en gris.
     - **Quitar el "quick add".** **Nada de medidas ni estado en la tarjeta.**
   - Nuevo hook `hooks/useWishlist.ts`:
     - Guarda un arreglo de ids en `localStorage` con `STORAGE_KEYS.WISHLIST`, el mismo formato que lee `app/[locale]/wishlist/WishlistContent.tsx`.
     - Envuelve cada lectura y escritura en `try/catch`.
     - El corazón lo usa (`aria-pressed`, `ui.card.save` / `ui.card.unsave`); el guardado se rellena de `accent`.
   - `components/ProductGrid.tsx`:
     - Móvil: 2 columnas de borde a borde con 2 px entre columnas y 22–24 px entre filas.
     - `md`: 3 columnas; `lg`: 4. Separación de 14 px.
     - Estado vacío con `ui.card.empty`.
     - Extiende la interfaz con `brand?` y `garmentType?` opcionales: `VisualSearchResults.tsx` también la usa.

2. **Inicio y colecciones**
   - Nuevo `components/CategoryTabs.tsx`: links con `STORE_CATEGORIES` + `ui.cats.*`; la activa va subrayada (2 px `ink`), sin píldoras.
   - `app/[locale]/page.tsx`:
     - Quitar el hero «SHOP NOW».
     - Título `ui.home.title` (17 px, 700) con el conteo `ui.home.count`.
     - Luego `CategoryTabs` y el grid.
   - `app/[locale]/collections/[category]/page.tsx`: mismo layout. La pestaña activa es la categoría. Borrar el mapa `categoryNames` hardcodeado y usar `ui.cats`.
   - El contenedor del grid no lleva padding lateral en móvil (`px-0 md:px-8`).

3. **Prenda** (`app/[locale]/products/[slug]/ProductContent.tsx` y `page.tsx`)
   - Conservar:
     - La lógica de `availability` (vendida, apartada y disponible se ven distinto a propósito) y los textos `product.sold_note` / `product.reserved_note`.
     - `handleAddToCart`.
     - El carrusel móvil.
   - Orden:
     1. Marca (11 px, mayúsculas, `muted`).
     2. Título (20–28 px, 700).
     3. «Talla X · Estado».
     4. Precio (24 px).
     5. Botón azul `ui.product.add_to_bag` y corazón «Guardar».
     6. Fila «Vende» con avatar redondo y link a `/tienda/[slug]`, **sin** botón Seguir (no existe todavía).
     7. Acordeones: **Medidas** (abierto, con `product.measurement_note`), **Estado de la prenda** y **Detalles** (descripción y atributos).
     8. **Entrega y pago**: `ui.product.delivery_body` + `ui.product.pay_threshold`.
   - Si la prenda es `con_detalles`, las notas del defecto se ven **sin abrir nada**.
   - El umbral **no se hardcodea**: `page.tsx` (servidor) llama `getSettings()` de `lib/settings.ts` y pasa el umbral formateado. Revisa el nombre exacto del campo en `BusinessSettings`.
   - Borrar el texto `free_shipping_note` (promete envío gratis que no existe).
   - `page.tsx`:
     - Ya no pasa `allProducts` (mandaba todo el catálogo al cliente).
     - Pasa `more`: hasta 4 piezas de la misma tienda, sin la actual.
     - Abajo va la sección `ui.product.more_from` con `ProductGrid`.
   - Escritorio: galería a la izquierda en 2 columnas y la info a la derecha, como «Web · prenda» en el prototipo.

4. **Bolsa**
   - `components/CartDrawer.tsx`:
     - Título `ui.bag.title` y conteo.
     - Filas con foto, nombre, talla, precio y «Quitar» (`removeItem`).
     - **Sin botones de cantidad.**
     - Subtotal, `ui.bag.delivery_note`, `ui.bag.unique_note` y el botón azul `ui.bag.checkout` → `/{locale}/checkout`.
     - Estado vacío con `ui.bag.empty_cta`.
   - `store/cartStore.tsx`, en `addItem`: si el `productId` ya está, **no** lo agregues ni sumes cantidad (pieza única).
   - `app/[locale]/(shop)/cart/page.tsx`:
     - Quitar los controles de cantidad.
     - Quitar el `<Header/>` y el `<Footer/>` duplicados (ya los pone `ClientLayout`).

5. **Perfil de tienda** (`app/[locale]/tienda/[slug]/page.tsx`)
   - **Portada automática:**
     - La base no tiene columna de portada.
     - Arma un collage 16:7 con las 3 primeras fotos de sus piezas sobre `bg-carton`.
   - Avatar **redondo** de 68 px montado sobre la portada (`logo_url` o la inicial).
   - Nombre, `ui.store.pieces`, bio y link a Instagram (ícono).
   - Pestaña `ui.store.on_sale` y luego `ProductGrid`.
   - Sin «Seguir».

6. **Búsqueda:** en `app/[locale]/search/SearchContent.tsx`, el filtro también busca en `p.brand?.name`.

7. **Limpieza aprobada**
   - Borrar `app/[locale]/archive/` y `app/[locale]/pages/chapters/`.
   - Quitar `images.unsplash.com` de `next.config.js`.
   - `grep` que no queden links a esas rutas.

## Reglas

- **No tocar:** `app/[locale]/checkout/actions.ts`, `app/api/webhooks/**`, `supabase/migrations/**`, `middleware.ts`, `package.json` / `package-lock.json` ni `.env*`. Tampoco agregues dependencias.
- **Estilo:**
  - Solo tokens de Tailwind (`ink`, `paper`, `carton`, `line`, `muted`, `accent`, `rounded-btn`).
  - Sin `style={{ fontFamily }}` nuevos.
  - `clsx` para clases condicionales.
- **Textos:**
  - Todo el copy va en `messages/es.json` y `en.json` con las mismas claves.
  - Código y comentarios en inglés.
- **Componentes:**
  - Botones rectos y en tipo oración, nunca mayúsculas espaciadas.
  - Un solo botón azul por pantalla.
  - Avatares redondos para todos.
  - `"use client"` solo donde hay interactividad.
- **Catálogo:** no cambies `lib/products.ts` (lista blanca de columnas). Si te falta un dato, anótalo como BLOQUEO.
- **Fuera de alcance:** checkout, cuenta/login, seguir, mensajes, ofertas y vender. Necesitan base de datos y van en otro paquete.

## Definición de terminado

- `npm run type-check` y `npm run lint` limpios después de cada tarea. `npm run build` al final; si falla por variables de entorno faltantes, anótalo.
- Revisar en el navegador a 375 px y a 1280 px: inicio, una colección, una prenda, la bolsa y `/tienda/viogi`. Sin scroll horizontal.
- Un commit por tarea (`feat(ui): …`) y push a `claude/gifted-fermi-ku1xl3`.
- Al terminar, agrega una fila «Paquete I» en `docs/agents/STATUS.md` con lo hecho y lo pendiente.
