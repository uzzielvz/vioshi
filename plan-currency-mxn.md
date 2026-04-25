# VIOGI — Plan: Migración de moneda fuente USD → MXN

> Creado: 2026-04-25
> Objetivo: que MXN sea la moneda almacenada en código/DB, y USD se calcule
> al mostrar en el locale `en`. Hoy es al revés.
> Regla: un paso a la vez → type-check + build → verificación → commit → siguiente.

---

## Por qué hacer este cambio

| Situación actual | Problema |
|---|---|
| Precios guardados en USD (`price: 200`) | El negocio opera en MXN; los costos, márgenes y el IVA son MXN |
| Conversión a MXN en el cliente (`× 17.5`) | Da precios extraños: $190 USD → $3,325 MXN |
| Envío estándar: `$10` / express: `$20` | Internamente en USD, dificulta comparar con costos reales de paquetería MX |
| DB futura guardará `price_usd` | Desalineado con la realidad del negocio |

**Después del cambio:**
- `es` (MXN): muestra el precio directo, sin conversión
- `en` (USD): divide entre el tipo de cambio del `.env`
- Todos los cálculos de carrito, IVA y envío operan en MXN

---

## Archivos que cambian

| # | Archivo | Qué cambia |
|---|---|---|
| MXN-01 | `lib/formatters.ts` | Invertir la lógica de conversión |
| MXN-02 | `lib/constants.ts` | Actualizar `CURRENCY`, costos de envío y umbrales |
| MXN-03 | `lib/products.ts` | Actualizar los 13 precios a MXN |
| MXN-04 | `app/[locale]/checkout/page.tsx` | Verificar y corregir strings hardcoded con valores USD |
| MXN-05 | `messages/es.json` + `messages/en.json` | Verificar strings de envío que mencionen precios |

**Archivos que NO cambian** (ya están en MXN o son agnósticos):
- `lib/pickupPoints.ts` — `additionalCost` ya está en MXN (50, 25, 40, 60, 75)
- `store/cartStore.tsx` — opera sobre el precio que recibe; cambia automáticamente
- `types/` — los campos se llaman `price`, `subtotal`, `total` (sin moneda en el nombre)
- `lib/mexico.ts` — solo lookup de CP, sin precios
- `hooks/`, `components/` — usan `formatPrice()` que se actualiza en MXN-01

---

## Paso MXN-01 — `lib/formatters.ts`

**Tiempo estimado:** 10 min

### Antes
```ts
const EXCHANGE_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_MXN_RATE ?? '17.5');

export function formatPrice(
  priceInUSD: number,          // <-- USD como fuente
  locale: Locale,
  showDecimals: boolean = true
): string {
  const currency = locale === 'es' ? 'MXN' : 'USD';
  const price = locale === 'es' ? priceInUSD * EXCHANGE_RATE : priceInUSD;
  // ...
}
```

### Después
```ts
const EXCHANGE_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_MXN_RATE ?? '17.5');

export function formatPrice(
  priceInMXN: number,          // <-- MXN como fuente
  locale: Locale,
  showDecimals: boolean = true
): string {
  const currency = locale === 'es' ? 'MXN' : 'USD';
  const price = locale === 'es' ? priceInMXN : priceInMXN / EXCHANGE_RATE;
  // ...
}
```

> La variable de entorno `NEXT_PUBLIC_USD_MXN_RATE` **se mantiene igual**:
> sigue siendo el tipo de cambio MXN/USD, ahora usado para dividir en lugar de multiplicar.

### Verificación MXN-01
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅

**Commit:** `refactor(MXN-01): invert formatPrice — MXN as source, USD derived`

---

## Paso MXN-02 — `lib/constants.ts`

**Tiempo estimado:** 10 min

### Valores a cambiar

> Los valores marcados con **[CONFIRMAR]** son propuestas basadas en la
> conversión aproximada × 17.5 redondeada. Confirma los valores reales
> antes de implementar este paso.

| Constante | Valor actual (USD) | Propuesta (MXN) | Estado |
|---|---|---|---|
| `CURRENCY` | `"USD"` | `"MXN"` | Cambio directo |
| `MIN_CHECKOUT_AMOUNT` | `10` | `200` | **[CONFIRMAR]** |
| `FREE_SHIPPING_THRESHOLD` | `100` | `2000` | **[CONFIRMAR]** |
| `STANDARD_SHIPPING_COST` | `10` | `150` | **[CONFIRMAR]** |
| `EXPRESS_SHIPPING_COST` | `20` | `350` | **[CONFIRMAR]** |

### Después (con los valores propuestos)
```ts
export const CURRENCY = "MXN";
export const CURRENCY_SYMBOL = "$";

export const MIN_CHECKOUT_AMOUNT = 200;        // MXN
export const FREE_SHIPPING_THRESHOLD = 2000;   // MXN
export const STANDARD_SHIPPING_COST = 150;     // MXN
export const EXPRESS_SHIPPING_COST = 350;      // MXN
```

> `TAX_RATE = 0.16` no cambia — el IVA del 16% aplica igual sobre cualquier moneda.

### Verificación MXN-02
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅
- [ ] En `/es/cart` con productos: el envío muestra "$150.00" o "$350.00" MXN

**Commit:** `refactor(MXN-02): update shipping constants to MXN`

---

## Paso MXN-03 — `lib/products.ts`

**Tiempo estimado:** 15 min

### Tabla de precios — requiere confirmación

> Los precios propuestos son una referencia (USD × 17.5, redondeados).
> **Debes confirmar o ajustar cada precio en MXN antes de implementar.**

| ID | Producto | Precio actual (USD) | Referencia MXN (×17.5) | Precio MXN a usar |
|---|---|---|---|---|
| 1 | TEE STUSSY | $200 | $3,500 | **[CONFIRMAR]** |
| 2 | TEE TACTIC STUSSY | $190 | $3,325 | **[CONFIRMAR]** |
| 3 | BENNIE STUSSY | $200 | $3,500 | **[CONFIRMAR]** |
| 4 | HOODIE PLAYBOY | $400 | $7,000 | **[CONFIRMAR]** |
| 5 | CHAMARRA ADIDAS FB | $500 | $8,750 | **[CONFIRMAR]** |
| 6 | CHAMARRA ARSENAL NIKE | $500 | $8,750 | **[CONFIRMAR]** |
| 7 | CHAMARRA HALPUTT | $400 | $7,000 | **[CONFIRMAR]** |
| 8 | CHAMARRA NIKE SB | $700 | $12,250 | **[CONFIRMAR]** |
| 9 | JERSEY INGLATERRA 2002 NIKE | $350 | $6,125 | **[CONFIRMAR]** |
| 10 | PANTS NIKE FB | $370 | $6,475 | **[CONFIRMAR]** |
| 11 | JEANS WRANGLER | $250 | $4,375 | **[CONFIRMAR]** |
| 12 | GORRA SUPREME | $500 | $8,750 | **[CONFIRMAR]** |
| 13 | TNF BAG | $600 | $10,500 | **[CONFIRMAR]** |

### Ejemplo del cambio (producto 1)
```ts
// Antes
{ id: "1", name: "TEE STUSSY", price: 200, ... }

// Después (precio en MXN confirmado)
{ id: "1", name: "TEE STUSSY", price: 3500, ... }
```

### Verificación MXN-03
- [ ] Home muestra precios en MXN sin decimales extraños en `/es`
- [ ] Switching a `/en` muestra el equivalente en USD (precio / 17.5)
- [ ] El total del carrito con 2 productos coincide con la suma manual
- [ ] IVA = subtotal × 0.16 (verificar en `/es/cart`)
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅

**Commit:** `refactor(MXN-03): update all product prices to MXN`

---

## Paso MXN-04 — `app/[locale]/checkout/page.tsx`

**Tiempo estimado:** 20 min

Este archivo puede tener strings hardcodeados que mencionen valores en USD.
Los pasos son de revisión — si no hay nada hardcodeado, el paso es solo verificación.

### Qué buscar (grep antes de modificar)

```bash
grep -n "10\|20\|USD\|\$[0-9]" app/[locale]/checkout/page.tsx
```

### Caso 1 — Si el RadioCard de envío muestra el precio con `formatPrice`
No hay nada que cambiar. Los precios ya vienen de las constantes actualizadas en MXN-02.

```tsx
// Si dice algo así — ya es correcto tras MXN-01 y MXN-02:
<RadioCard
  label="Estándar"
  description={formatPrice(STANDARD_SHIPPING_COST, locale)}  // $150 MXN
/>
```

### Caso 2 — Si el precio del envío está hardcodeado como string
```tsx
// Antes (hardcodeado)
<span>Estándar — $10 USD</span>
<span>Express — $20 USD</span>

// Después
<span>Estándar — {formatPrice(STANDARD_SHIPPING_COST, locale)}</span>
<span>Express — {formatPrice(EXPRESS_SHIPPING_COST, locale)}</span>
```

### Caso 3 — `MIN_CHECKOUT_AMOUNT` en validación
Si hay alguna validación que compare `cart.total < 10`, actualizar a `< MIN_CHECKOUT_AMOUNT`.

### Verificación MXN-04
- [ ] El resumen de la orden en checkout muestra precios en MXN
- [ ] Subtotal + IVA + envío = total (verificar manualmente)
- [ ] Cambiar a `/en/checkout` muestra los mismos valores en USD
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅

**Commit:** `refactor(MXN-04): fix any hardcoded USD amounts in checkout`

---

## Paso MXN-05 — `messages/es.json` + `messages/en.json`

**Tiempo estimado:** 10 min

### Qué buscar

```bash
grep -n "USD\|\$10\|\$20\|\$100" messages/es.json messages/en.json
```

### Posibles strings a actualizar

Los archivos de mensajes pueden tener descripciones de envío con precios
hardcodeados (ej. en `checkout.shipping_standard_description`).

```json
// Antes (es.json) — si existe algo así
"shipping_standard_description": "Envío estándar — $10 USD, 5-7 días"

// Después
"shipping_standard_description": "Envío estándar — $150 MXN, 5-7 días"
```

```json
// Antes (en.json) — si existe
"shipping_standard_description": "Standard shipping — $10, 5-7 days"

// Después — USD derivado del tipo de cambio, no hardcodeado
"shipping_standard_description": "Standard shipping — ~$9 USD, 5-7 days"
```

> Si los strings de envío usan la clave de traducción sin precio hardcodeado,
> este paso es solo verificación visual. No modificar lo que no está roto.

### Verificación MXN-05
- [ ] Ningún string visible en `/es` menciona "USD" en contexto de precio
- [ ] Ningún string visible en `/en` tiene precios incorrectos post-conversión
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅

**Commit:** `refactor(MXN-05): update any hardcoded USD strings in messages`

---

## Verificación final E2E

Después de completar todos los pasos:

### Locale ES (MXN)
- [ ] Home — precios en MXN con símbolo $, sin conversión rara
- [ ] `/es/collections/hoodie` — filtro y precios correctos
- [ ] `/es/products/hoodie-playboy-m` — precio correcto
- [ ] Quick Add → Cart Drawer — subtotal, IVA y total en MXN
- [ ] `/es/cart` — todos los totales correctos
- [ ] `/es/checkout` — shipping Standard/Express en MXN, total correcto
- [ ] Punto de pickup con costo adicional (ej. Monterrey $50 MXN) — se suma correctamente

### Locale EN (USD)
- [ ] Home — precios en USD (MXN / EXCHANGE_RATE), razonables
- [ ] `/en/cart` — totales en USD coherentes
- [ ] Switching ES ↔ EN conserva el carrito intacto
- [ ] IVA sigue siendo 16% sobre el subtotal (independiente de moneda)

### Build final
```bash
npm run type-check && npm run lint && npm run build
```
- [ ] Sin errores TypeScript
- [ ] Sin warnings de lint nuevos
- [ ] Build exitoso

---

## Orden de ejecución

```
MXN-01 (formatters)  →  MXN-02 (constants)  →  MXN-03 (products*)
  →  MXN-04 (checkout)  →  MXN-05 (messages)  →  verificación E2E
```

> (*) MXN-03 requiere que el usuario confirme los precios en MXN antes
> de ejecutarse. Los pasos MXN-01 y MXN-02 se pueden hacer sin esa confirmación.

---

## Estado

| Paso | Estado | Commit |
|---|---|---|
| MXN-01 — formatters | Pendiente | — |
| MXN-02 — constants | Pendiente (precios a confirmar) | — |
| MXN-03 — products | Pendiente (precios a confirmar) | — |
| MXN-04 — checkout | Pendiente | — |
| MXN-05 — messages | Pendiente | — |
