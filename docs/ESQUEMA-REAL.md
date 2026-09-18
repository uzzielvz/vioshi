# Estado real del esquema vs. migraciones

**Verificado:** 2026-09-08 contra el proyecto de producción `oilvubxpxxzfxlqhsumk` (`viogi`, plan Free, us-east-1).
**Método:** `supabase migration list` + `db dump` + pruebas funcionales con las llaves `anon` y `service_role`.

> **Tope de esta foto:** `0011`. Relistado 2026-09-18: prod tiene `0001`–`0015` (`0015` aplicada hoy). Estado: [`docs/agents/STATUS.md`](../agents/STATUS.md).

> **Regla:** este documento describe lo que la base **tiene**, no lo que las migraciones **dicen**. Cuando difieran, gana la base.

---

## 1. Resumen

Antes del 2026-09-08 el historial de migraciones de Supabase estaba prácticamente vacío: las migraciones `0001`–`0007` se habían aplicado a mano en el SQL editor, sin registro. Solo `0008` y `0009` estaban registradas, y con nombre de timestamp en vez de su número local.

Eso se reparó. Hoy el historial refleja la realidad:

| Migración | Registrada | Aplicada de verdad | Nota |
|---|---|---|---|
| 0001 initial_schema | ✅ | ✅ | 11 tablas + RLS + seed |
| 0002 handle_new_user | ✅ | ✅ | trigger sobre `auth.users` |
| 0003 pgvector_and_embeddings | ✅ | ✅ | `embedding vector(768)` + RPC |
| 0004 product_attributes | ✅ | ✅ | |
| **0005 hide_product_embedding** | ✅ | ⚠️ **inefectiva** | ver §2 |
| 0006 orders_guest_token | ✅ | ✅ | |
| **0007 brands** | ✅ | ⚠️ **parcial** | ver §3 |
| 0008 studio | ✅ | ✅ | estaba como `20260821225624` |
| 0009 studio_generation_kinds | ✅ | ✅ | estaba como `20260822211300` |
| 0010 business_fields | ✅ | ✅ | 2026-09-08 |
| 0011 column_grants | ✅ | ✅ | 2026-09-08 |

Las dos entradas huérfanas con nombre de timestamp se marcaron como `reverted` — solo se borraron esos renglones del historial; **su SQL ya estaba aplicado y sigue aplicado**, ahora registrado bajo `0008` y `0009`.

---

## 2. ⚠️ 0005 nunca funcionó (SEC-06)

`0005_hide_product_embedding_from_public.sql` intentaba ocultar `products.embedding` así:

```sql
revoke select (embedding) on table public.products from anon;
```

**Es un no-op.** Supabase concede por defecto:

```sql
GRANT ALL ON TABLE public.products TO anon;
```

En PostgreSQL un privilegio a nivel **tabla** cubre todas las columnas, y un `REVOKE` a nivel **columna** no lo retira. Es como quitarle la llave de un cuarto a quien tiene la llave maestra del edificio.

Evidencia recogida en producción antes del arreglo:

```
anon → GET /rest/v1/products?select=id,embedding   => HTTP 200, vectores no nulos
anon → GET /rest/v1/products?select=*              => 30 columnas, embedding incluido
```

La anon key viaja en el bundle del navegador, así que los embeddings del buscador visual eran descargables por cualquiera desde que se creó la columna en mayo de 2026.

`RESEARCH-CONSOLIDADO.md` y `PLAN.md` daban SEC-06 por cerrado desde el 2026-05-19. **Era falso.** Ambos documentos quedaron corregidos.

**Corregido en `0011`** con el patrón correcto:

```sql
revoke select on table public.products from anon;          -- quitar privilegio de tabla
grant  select (id, slug, name, ...) on table public.products to anon;  -- lista blanca
```

### Consecuencia permanente

A partir de `0011`, **toda columna nueva en `products` nace invisible** para `anon` y `authenticated` hasta que se le conceda `grant select` explícito. Es un default más seguro, pero hay que recordarlo: si agregas una columna pública y la tienda no la muestra, falta su `GRANT`.

Columnas **excluidas** de la lista blanca (5): `embedding`, `owner`, `cost_mxn`, `reserved_order_id`, `reserved_at`.

### Nota sobre la RPC del buscador

`match_products_by_image` es `language sql stable` y por defecto corría con los privilegios de quien la llama. Al quitarle `embedding` a `anon`, una llamada desde el navegador habría fallado. Hoy la app siempre la invoca desde el servidor con `service_role` (`app/api/visual-search/route.ts`), pero `0011` la marcó `security definer` para que siga funcionando si algún día se llama desde el cliente, sin reexponer la columna.

---

## 3. ⚠️ 0007 quedó a medias

`0007_brands.sql` contiene:

```sql
create trigger if not exists brands_updated_at
  before update on public.brands
  for each row execute function handle_updated_at();
```

**PostgreSQL no soporta `IF NOT EXISTS` en `CREATE TRIGGER`.** Esa sentencia es un error de sintaxis.

Sin embargo, `products.brand_id` sí existe, y esa columna se agrega *después* del trigger en el archivo. Si el script se hubiera ejecutado completo y atómico, el error habría abortado todo y `brand_id` no existiría. Conclusión: **0007 se aplicó por partes, o con esa línea editada a mano.**

**Estado real:**

| Objeto de 0007 | Existe |
|---|---|
| tabla `brands` | ✅ |
| `products.brand_id` + índice | ✅ |
| RLS `brands_public_read` | ✅ |
| índices `brands_name_idx`, `brands_slug_idx` | ✅ |
| **trigger `brands_updated_at`** | ❌ **falta** |

No se pudo confirmar por comportamiento porque ninguna de las 2 marcas existentes se ha actualizado nunca. El trigger equivalente sobre `products` sí funciona (12 de 28 filas tienen `updated_at > created_at`).

**Efecto práctico:** `brands.updated_at` se queda congelado en la fecha de creación. Nada del código lo lee hoy, así que es inocuo.

**Pendiente:** un `0012` con la sintaxis correcta (`create or replace trigger`, disponible desde PG 14). No se hizo en esta pasada para no ampliar el alcance.

---

## 4. Estado de `products` tras 0010

30 columnas. Las 13 que agregó `0010`:

| Columna | Tipo | Visible al público |
|---|---|---|
| `owner` | `text NOT NULL` check in (uzziel, mario) | ❌ **interno** |
| `cost_mxn` | `numeric(10,2)` check >= 0 | ❌ **interno** |
| `reserved_order_id` | `uuid` | ❌ interno |
| `reserved_at` | `timestamptz` | ❌ interno |
| `garment_type` | `text` check in (playera, hoodie, sudadera, chamarra, pants, jeans, shorts, otro) | ✅ |
| `chest_cm` `length_cm` `sleeve_cm` `waist_cm` `rise_cm` `inseam_cm` | `smallint` check 20–200 | ✅ |
| `condition` | `text` check in (impecable, buen_estado, con_detalles) | ✅ |
| `defect_notes` | `text` | ✅ |

**Backfill:** las 28 filas preexistentes recibieron `owner = 'uzziel'`. Son datos de ejemplo; si alguna es de Mario, corregir desde el admin.

**Constraints de integridad verificadas en producción** (todas rechazan correctamente):

- `products_owner_check` — owner fuera del enum
- `NOT NULL` en owner
- `products_garment_type_check` / `products_condition_check`
- `products_defect_notes_required_check` — `con_detalles` sin notas, y con notas en blanco
- `products_measurements_by_type_check` — playera sin medidas, chamarra sin manga, jeans sin tiro
- rangos 20–200 cm
- `cost_mxn` negativo

Los borradores del Studio (`garment_type is null`) están exentos del check de medidas a propósito: se crean antes de conocer el tipo de prenda.

**Fuente de verdad de la talla:** `product_attributes` con key `'Talla'`, leída por `extractSize()` en `lib/products.ts`. Se descartó `product_variants` — tiene 0 filas y 0 referencias en el código, y su columna `stock` compite con el modelo de reserva.

---

## 5. Otros hallazgos del esquema real

- **`product_variants`** (0 filas) y **`promo_codes`** (0 filas): tablas sin uso. No estorban.
- **`wishlist_items`** usa clave compuesta `(user_id, product_id)`, sin columna `id`.
- **`orders_insert_any` / `order_items_insert_any`** tienen `with check (true)`: cualquiera con la anon key puede insertar pedidos. Hoy la app solo escribe con `service_role`, así que el riesgo es basura en la tabla, no fuga.
- **`order_items.product_id`** referencia `products(id)` **sin `ON DELETE`** → `NO ACTION`. Borrar un producto referenciado por un pedido **falla**. Ver §6.
- **15 de 28 productos no tienen `category_id`.** Preexistente.
- El plan **Free no hace respaldos automáticos**. El único respaldo existente es el de `backups/` (gitignoreado por contener PII).

---

## 6. PENDIENTE — Limpieza de datos de ejemplo

**No ejecutado.** Se hace después del lanzamiento, en un trabajo aparte.

Conteos al 2026-09-08: `products 28` · `product_images 16` · `product_attributes 6` · `studio_generations 60` · `studio_raw_photos 44` · `orders 19` · `order_items 29`.

Orden obligatorio por las llaves foráneas:

```
1. order_items
2. orders
3. studio_generations
4. studio_raw_photos
5. product_images
6. product_attributes
7. products
```

Advertencias:

- **`order_items` va primero o el borrado de `products` falla**: 11 productos están referenciados por pedidos y la FK es `NO ACTION`.
- Los pasos 3–6 son técnicamente redundantes (`products` cascadea a los cuatro), pero se listan explícitos para hacer visible qué se lleva por delante: **104 filas de trabajo del Studio**.
- **Borrar filas no borra los archivos de Storage.** Hay 116 objetos en `storage.objects`; los buckets `product-images` y `studio-private` hay que limpiarlos aparte.
- Sacar un `db dump` inmediatamente antes.

---

## 7. Pendientes derivados

| # | Qué | Por qué |
|---|---|---|
| 1 | `0012`: crear `brands_updated_at` con `create or replace trigger` | §3 |
| 2 | Rotar la contraseña de Postgres | Quedó escrita en el historial de una sesión de trabajo |
| 3 | Limpieza de datos de ejemplo | §6 |
| 4 | Revisar `GRANT ALL` en las demás tablas | El mismo patrón de §2 aplica a `orders`, `profiles`, etc. Sus RLS sí filtran filas, pero el privilegio de columna está igual de abierto |
| 5 | Actualizar `CLAUDE.md` | Describe un proyecto sin i18n, Stripe, auth ni Studio |
