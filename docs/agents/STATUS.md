# Estado del código

**Verificado:** 2026-10-04 · A1 + F + D + G1 + G2 + H en `main` · prod `vioshi.vercel.app`

> Actualiza **solo este archivo** al cerrar un paquete. Es el único doc que describe estado:
> si otro archivo cuenta qué se mergeó, en dos semanas se contradicen.
> Histórico de sesiones: `sessions.md` en la raíz.

## Qué es hoy

Tienda Next.js 14 + Supabase + Stripe Checkout Sessions, con **Viogi como primera `store`**.  
Mario no es tienda: `products.owner` (`uzziel` | `mario`) es interno. Connect no está.

## Hecho (no rehacer)

| Área | Evidencia |
|---|---|
| Checkout Sessions (tarjeta / OXXO / SPEI) | `app/[locale]/checkout/actions.ts` |
| Reserva atómica | `0012`–`0014` |
| Webhook asíncrono | `app/api/webhooks/stripe/route.ts` |
| IVA no se suma ni se muestra | `tax_mxn = 0` |
| Lookup `guest_token` / `session_id` | `lib/orders.ts` |
| Pickup desde DB | `lib/pickup.ts`, `0015` |
| Envío a domicilio editable | `settings.home_shipping_mxn`, `/admin/settings`, `0017` |
| Marca por env | `lib/brand.ts` |
| Medidas, estado, `owner`, `cost_mxn` | `0010` |
| Brands | `/admin/brands` |
| Visual search + embed al publicar | `lib/embeddings.ts`, `/admin/products` |
| Marcar pedido entregado | `/admin/reservas` (sin Stripe). **Exige `payment_status = 'completed'`** (#8) |
| Inventario interno | `/admin` tablero. Prenda nueva nace con `listed = false`. Entrada por correo (`UZZIEL_ADMIN_*` / `MARIO_ADMIN_*`): Uzziel ve ambos `owner`; Mario solo el suyo |
| Viogi como tienda | `0016`, `/tienda/viogi`, “Vendido por” |
| Inventario interno | `products.listed` (`0018`). Prenda en el panel sin salir al catálogo |
| Acceso separado Uzziel / Mario | `lib/admin/session.ts`, `middleware.ts`. Mario solo ve y edita `owner = mario` |
| Fecha de venta y de compra | `sold_at`, `acquired_on` (`0019`) |
| Merma fuera del capital | `disposition` (`0020`): activa · merma · uso_personal · donada |
| Tablero de ganancia por periodo | `lib/admin/stats.ts`, `/admin` |
| Panel usable en móvil | barra sticky, campos a 16px, tablas como tarjetas |
| `/vender` persiste `pending` | `store_applications`, no auto-aprueba |
| Auth clientes | `app/[locale]/account/**` |

## Paquetes

| Paquete | Carril | Estado |
|---|---|---|
| A1 shipping | L1 | **MERGEADO** (#4) |
| F admin-ops | L5 | **MERGEADO** (#7) |
| D stores | L4 | **MERGEADO** (#6) |
| G1 entregado-pagado | L5 | **MERGEADO** (#8) |
| G2 settings-limpieza | L1 | **MERGEADO** (#9) |
| H inventario + tablero + móvil | L5 | **MERGEADO** (#10) · `0018`–`0020` aplicadas y verificadas en prod |
| E Connect | L7 | **BLOQUEADO** — ver `OPEN.md` y más abajo |
| I front de rail | — | **MERGEADO** (#16) |
| J front de rail: cuenta, pagar y lo demás | — | **MERGEADO** (#17) |
| K social 1 + cierre de inserts | — | **MERGEADO** (#18) · migraciones `0024` y `0025` aplicadas en prod el 2026-10-23 |
| L cobros (Etapa 1) + app instalable | — | **MERGEADO** (#20) · sin migraciones · checklist en `docs/LANZAMIENTO.md` |
| M perfil único (persona = tienda) | — | **EN RAMA** `claude/gifted-fermi-ku1xl3` · migración `0026` por aplicar |

**Paquete I, mergeado en #16.** Tarjeta de la feed, `useWishlist`, grid, `CategoryTabs`, inicio y colecciones, ficha, bolsa sin cantidades, portada collage en `/tienda/[slug]`, búsqueda por marca; borrados `/archive`, `/pages/chapters` y Unsplash.

**Paquete J, mergeado en #17.** El resto de la tienda con la guía (`docs/design/`):

- **Cuenta:** entrar, crear cuenta, recuperar y nueva contraseña sin header. Perfil de persona con pestañas Guardados · Compras · Direcciones; editar perfil (contraseña por enlace al correo, idioma, cerrar sesión). `/wishlist` manda al perfil si hay sesión. Se borró `/account/archivos` (facturas de ejemplo).
- **Pagar:** barra propia, entrega en tarjetas de opción (puntos reales y envío a domicilio), contacto, pago con el umbral de `settings`, resumen y «Continuar al pago · $X». `checkout/actions.ts` sin tocar. Pedido pagado y retorno con `components/order/OrderView.tsx`; «pagado» solo si `payment_status = completed`.
- **Búsqueda** con filtros de categoría, talla, marca y orden; **búsqueda por foto** y **/vender** (tres pasos, la solicitud es el paso 1).
- **Ayuda:** cómo funciona, envíos y pagos (de `settings`, `pickup_points` y `EXPRESS_SHIPPING_COST`), medidas, puntos de entrega (de la tabla), legal y accesibilidad en i18n. 404 y error dentro de `[locale]`.
- **Arreglo:** el carrito expone `isReady`; antes, abrir `/checkout` directo mandaba a `/cart` y el carrito podía volver después de pagar.
- Primitivas en `components/ui/` (`styles.ts`, `Avatar`, `UnderlineTabs`, `EmptyState`). Se borraron `components/common` y los namespaces de mensajes sin uso.
- Verificado: type-check, lint, build y capturas a 390 y 1280 px contra un PostgREST simulado (sin scroll horizontal).

Pendiente: seguir, mensajes, ofertas, «Qué te interesa», portada editable y los pasos 2 y 3 de vender (necesitan base de datos). **Humano:** política de devoluciones (PROYECTO § 8, #14; la página dice «la estamos terminando»), correo y WhatsApp de soporte reales (`NEXT_PUBLIC_BRAND_SUPPORT_EMAIL`, `NEXT_PUBLIC_BRAND_WHATSAPP`; sin el segundo no se muestra WhatsApp).

**Paquete K, mergeado en #18.** Migraciones `0024` y `0025` aplicadas en prod el 2026-10-23.

- **Seguridad (`0024_lock_order_inserts.sql`):** quita `orders_insert_any` y `order_items_insert_any`; la app solo inserta pedidos con service_role. Un trigger impide que una sesión `anon`/`authenticated` cambie `profiles.role` (service_role y el SQL editor sí pueden).
- **Seguir (`0025_follows.sql`):** tabla `follows` (tienda o marca, una por fila, RLS: cada quien lee y borra las suyas) y `follower_count()` para el conteo público. Seguir búsquedas quedó fuera por decisión del humano.
- **Guardados en la cuenta** con `wishlist_items` (ya existe desde `0001`): al entrar se suman los del dispositivo una vez y después manda la cuenta.
- «Seguir» en la prenda (tienda y marca), en la tienda (con seguidores) y en la búsqueda filtrada por marca; la marca de la prenda lleva a sus piezas. Pestaña **Siguiendo** en el perfil.
- Sin `0025` aplicada, los botones no aparecen y Siguiendo dice «llega muy pronto». Nada se rompe.
- Verificado: migraciones aplicadas dos veces en un Postgres 16 local con roles estilo Supabase (RLS, trigger, cascada, conteo); flujo en navegador con y sin tablas; type-check, lint y build.

Aplicadas con `supabase db push` tras respaldo local (`backups/viogi_2026-10-23_2022_*`). Verificado en prod: ya no existen `orders_insert_any` ni `order_items_insert_any`; trigger `profiles_keep_role` en `profiles`; `follows` con RLS y sus 3 policies; `follower_count('store', viogi)` = 0. Con la anon key por REST, insertar en `order_items` da 401 / `42501` (RLS) y `rpc/follower_count` responde 200.

**Paquete M, en rama.** Una persona y una tienda tienen el mismo perfil (FROZEN: todas las cuentas son iguales).

- `components/profile/ProfileHeader.tsx`: portada (foto subida o collage de sus piezas), avatar redondo montado, nombre, «@slug · Se unió en…», números, bio, botones, marcas y pestañas. Lo usan `AccountShell` y `/tienda/[slug]`.
- Tienda: seguidores · vendidas · en venta, «Seguir» + Instagram, compartir, «Marcas principales» (filtran la tienda), pestañas **En venta · Vendidas** y la fila de filtros de la búsqueda (orden, talla, categoría, marca).
- Persona: siguiendo · compras, «Editar perfil» + «Empezar a vender», ajustes (engrane), «Marcas que guardas», pestañas Guardados · Compras · Siguiendo. **Direcciones** pasó a Editar perfil (`/account/addresses` es subpágina).
- Filtros compartidos: `hooks/useCatalogFilters.ts` + `components/CatalogFilterBar.tsx` (la búsqueda ya los usa).
- **Foto y portada (`0026_profile_media.sql`):** `profiles.avatar_url`, `profiles.cover_url`, `stores.cover_url` (con su `grant select` por columna) y bucket público `profile-media` (1 MB, jpg/png/webp). El navegador reduce la foto (avatar 480 px, portada 1800 px) y `lib/profile/actions.ts` la sube con service_role a `<user_id>/`; borra la anterior. Sin `0026`, los botones de foto no aparecen y la tienda se lee sin `cover_url`.
- Portada de Viogi: por ahora con SQL (`update stores set cover_url = '<url pública>' where slug = 'viogi'`); sin ella sale el collage.
- Verificado: `0026` aplicada dos veces en Postgres 16 local (anon lee `cover_url` y no escribe; cada quien cambia solo su perfil); subida, reemplazo y borrado contra el mock; perfiles con y sin `0026` y sin `follows`; type-check, lint, build y capturas a 390 y 1280 px sin scroll horizontal.

E sigue bloqueado: es humano, no código.

Worktrees libres: `../viogi-L1` (`agent/L1-settings`) y `../viogi-L5` (`agent/L5-entregado`),
con `npm ci` hecho. El siguiente agente hace `git fetch` + `checkout -B <rama> origin/main`.

No registro abierto. No reviews. No Skydropx. No Next 16.

## Dónde se opera (sin desplegar código)

| Qué | Dónde |
|---|---|
| Precio de envío a domicilio | `/admin/settings` → "Envío a domicilio (MXN)". Semilla $10 |
| Costo por punto de entrega | `/admin/pickup-points` (por fila, no el setting de domicilio) |
| Ventanas de reserva y umbral solo-tarjeta | `/admin/settings` |
| Tienda Viogi | `/es/tienda/viogi` · "Vendido por Viogi" en cada ficha |
| Solicitudes de vendedor | `/es/vender` → fila `pending` en `store_applications`. **No se aprueba sola** |
| Embedding al publicar | crear/editar en `/admin/products`. Si Gemini falla: banner "Embedding pendiente" |
| Marcar entregado | `/admin/reservas` → "Pedidos por entregar" |

Marcar entregado **no** transfiere dinero. Eso es el paquete E.

## Migraciones

Prod: `0001`–`0025`, aplicadas. `0026_profile_media.sql` en rama, por aplicar. Siguiente libre: **`0027`**.

- `0021` abrió la merma a la tienda · `0023` la volvió a cerrar: el estado final es
  que solo `disposition = 'activa'` puede estar `listed` (verificado contra prod).
- `0022` deja las medidas obligatorias **solo al publicar**. El alta de inventario
  interno guarda tipo, dueño y costo sin cinta métrica.
- Tracking: `supabase_migrations.schema_migrations` coincide con los archivos.
  `0021`–`0023` figuraban como timestamps (`20261004…`) y se repararon el
  2026-10-23 con `supabase migration repair`. Se aplica con
  `supabase db push --db-url …` (primero `--dry-run`): el repo no está ligado.

## Auditoría 2026-09-18

`main` @ `634cecb` auditado contra código y contra prod. Cobro intacto, A1/D/F vivos,
grants correctos (`owner` y `stripe_account_id` dan 401 a anon), 28/28 prendas con
`store_id`, `settings.home_shipping_mxn = 10`. Sin P0. Los dos rotos encontrados son
G1 y G2. Nits no urgentes: prompt de Gemini duplicado en `scripts/generate-embeddings.ts`
vs `lib/embeddings.ts` (canon = `lib/`), `?embed=pending` en productos sin imagen.

## Incidente 2026-10-04 — el proyecto de Supabase se pausó

El plan Free pausa el proyecto por inactividad y **el subdominio deja de resolver**
(`Non-existent domain`). Efecto visible: la tienda responde 200 pero con catálogo
vacío y `/tienda/viogi` da 404, porque las consultas fallan y devuelven lista
vacía. No es un bug del código. Se restaura desde el dashboard; los datos quedan
intactos. **Si la tienda se ve vacía, revisa Supabase antes que el repo.**

## Incidente 2026-09-18

No vaciar `checkout/actions.ts` ni el webhook de Stripe.

## Fuera de este OS

Vault: `C:\Users\uzzie\Documents\Obsidian Vault\70_Trabajo\Viogi`
