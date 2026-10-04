# Paquete H — Tablero: inversión, ganancia y qué falta por vender (L5)

**Estado:** LISTO · migración **`0019`** (`0018` ya la usó el inventario)
**Carril:** L5
**Pedido del humano (4 oct):** ver la ganancia, cuánto se invierte y cuánto se gana **por periodo**,
cuántas prendas se compraron, qué falta por vender. **Mario ve solo lo suyo; Uzziel ve lo de ambos.**
**No hagas:** Connect, cambiar el login, reviews, gráficas con librería nueva.

## Por qué hace falta una migración antes del tablero

La base no sabe **cuándo** se vendió una prenda:

| Dato | Qué hay hoy | Por qué no sirve |
|---|---|---|
| `sold_out` | booleano | No dice cuándo |
| `sold_order_id` | uuid del pedido | Solo si la venta fue por la web. Las de Instagram/DM son null |
| `updated_at` | trigger | Se mueve al editar la prenda: miente como fecha de venta |

Sin fecha de venta **no existe "la ganancia de septiembre"**. Eso es lo primero.

## Archivos permitidos

- `supabase/migrations/0019_sold_at.sql` **(número fijo: 0019)**
- `app/admin/reservas/actions.ts` — solo `toggleSoldAction`: escribir/limpiar `sold_at`
- `lib/admin/stats.ts` — **nuevo**
- `app/admin/page.tsx` + `app/admin/_components/**` — el tablero
- `lib/admin/inventory.ts` — solo si hace falta exportar un tipo
- `docs/agents/STATUS.md`

## Archivos prohibidos

`app/[locale]/**`, `app/api/webhooks/**`, `lib/products.ts`, `lib/settings.ts`, `middleware.ts`,
`lib/admin/session.ts`, `package.json`. Nada de `recharts` ni librerías de gráficas: números y
barras con CSS.

## 1. Migración `0019`

```sql
alter table public.products
  add column if not exists sold_at timestamptz;

alter table public.products
  add column if not exists acquired_on date;
```

- **Backfill honesto:** `sold_at = o.created_at` para las que tengan `sold_order_id`. Las vendidas
  a mano **se quedan en null**: no se inventa una fecha. El tablero las cuenta aparte como
  "vendidas sin fecha registrada".
- `acquired_on` es opcional; cuando es null se usa `created_at` (cuándo se registró en el panel).
  Sirve para capturar un drop comprado semanas antes.
- **Ambas son internas** (patrón `0011`): `revoke select (sold_at)` y `(acquired_on)` de `anon` y
  `authenticated`. No se conceden. Nunca salen al cliente.
- `mark_order_sold` (ver `0013`): añadir `sold_at = now()` al `update` de la venta web, sin tocar el
  resto del RPC ni el manejo de `outcome = 'conflict'`.
- Índice: `products (owner, sold_at)`.

## 2. `toggleSoldAction` (venta presencial)

En el mismo `update` que ya existe, sin un `select` previo:

- al marcar vendida → `sold_at: new Date().toISOString()`
- al desmarcar → `sold_at: null`
- **No quitar** `.eq('owner','mario')` cuando el actor es Mario. Ese filtro es la separación de
  capital, no un detalle de estilo.

## 3. `lib/admin/stats.ts`

Una función, `getInventoryStats(actor, period)`. Service role. Si `actor === 'mario'`, filtra
`owner = 'mario'` **en la consulta**, no después en JS.

Periodos: `mes_actual` · `mes_pasado` · `90_dias` · `anio` · `todo`.

Métricas, todas por persona y con total solo para Uzziel:

| Métrica | Cómo |
|---|---|
| Invertido parado | Σ `cost_mxn` de `sold_out = false` |
| Comprado en el periodo | piezas y Σ `cost_mxn` por `coalesce(acquired_on, created_at)` |
| Vendido en el periodo | piezas, Σ `price_mxn`, Σ `cost_mxn` por `sold_at` |
| **Ganancia del periodo** | Σ (`price_mxn` − `cost_mxn`) de lo vendido en el rango |
| Falta por vender | piezas `sold_out = false`, partidas en **publicadas** (`listed = true`) y **solo inventario** |
| Canal de venta | `sold_order_id is not null` → web · null y `sold_out` → Instagram/DM |
| Vendidas sin fecha | `sold_out = true and sold_at is null` — las históricas |

`cost_mxn` puede ser null (no se capturó): cuenta la pieza, pero **no sumes null como 0 en el
margen**; repórtalo como "N piezas sin costo capturado" para que el número no mienta.

## 4. Tablero en `/admin`

- Tarjetas con los números de arriba y un selector de periodo. Estética B/N, uppercase,
  `tracking-wide`, igual que el resto del admin. Sin color de acento.
- Uzziel: total + columna por persona. Mario: solo sus números, sin ver los de Uzziel ni el total.
- Debajo, lo accionable: **lo más viejo sin vender** (días desde `coalesce(acquired_on, created_at)`,
  top 10 de `sold_out = false`), que es lo que decide qué mover.
- Si una métrica no se puede calcular (p. ej. ganancia con piezas sin costo), se dice en pantalla.
  Un cero inventado es peor que un "faltan datos".

## DoD

- [ ] `0019` aplicada; `sold_at` y `acquired_on` **no** concedidas a `anon`
- [ ] Venta web y venta a mano escriben `sold_at`; desmarcar lo limpia
- [ ] Mario entra a `/admin` y **no** ve una sola cifra de Uzziel (probar con su sesión)
- [ ] Ganancia del periodo = Σ(precio − costo) de lo vendido en el rango, con las piezas sin costo
      reportadas aparte
- [ ] "Vendidas sin fecha" visible, sin inventar fechas
- [ ] `npm run type-check` y `npm run lint` limpios
- [ ] Commit: `feat(admin): tablero de inversion y ganancia por periodo`

## BLOQUEO explícito

El histórico **no se puede reconstruir**: de las ventas por Instagram anteriores a `0019` solo se
sabe que ocurrieron, no cuándo. La ganancia por periodo es exacta **a partir del despliegue**. Si el
humano quiere el histórico, lo captura a mano en `sold_at` — no se estima con `updated_at`.
