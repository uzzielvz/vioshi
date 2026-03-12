# Research: Checkout — Bugs, GUI y Estrategia de Pagos

> Auditoría realizada el 2026-03-12 sobre `app/[locale]/checkout/page.tsx`,
> `app/[locale]/(shop)/cart/page.tsx`, `components/CartDrawer.tsx`,
> `store/cartStore.tsx`, `lib/formatters.ts`, `lib/constants.ts`, `lib/pickupPoints.ts`.

---

## 1. Bugs Detectados

### B-01 — CRÍTICO: Precios hardcodeados en dólares (el bug que reportaste)

**Archivos:** `app/[locale]/checkout/page.tsx` líneas 849, 879, 909, 922, 926, 938

El checkout importa `formatPrice` y `useLocaleContext`, los usa para algunos elementos,
pero la mayoría de las cifras se renderizan con template literals `$${amount.toFixed(2)}`.
Esto hace que en `/es/checkout` el usuario siempre vea dólares sin conversión a MXN.

```tsx
// ❌ Lo que hay hoy (múltiples líneas)
<span>${total.toFixed(2)}</span>
<div>${(item.price * item.quantity).toFixed(2)}</div>
<span>${subtotal.toFixed(2)}</span>
`$${shipping.toFixed(2)}`
`$${selectedPickupPoint.additionalCost.toFixed(2)}`

// ✅ Lo que debe ser
<span>{formatPrice(total, locale)}</span>
<div>{formatPrice(item.price * item.quantity, locale)}</div>
<span>{formatPrice(subtotal, locale)}</span>
{formatPrice(shipping, locale)}
{formatPrice(selectedPickupPoint.additionalCost, locale)}
```

**Impacto:** Usuario en `/es/` ve `$1,200.00` en lugar de `MX$21,000.00`.
El precio almacenado en cart siempre es USD; `formatPrice` aplica la tasa de cambio
(`NEXT_PUBLIC_USD_MXN_RATE`, default 17.5) y usa `Intl.NumberFormat` con locale correcto.

---

### B-02 — ALTO: Doble símbolo de moneda en el total

**Archivo:** `app/[locale]/checkout/page.tsx` líneas 936–938

```tsx
// ❌ Resultado renderizado en /es/: "MXN $450.00"
<span className="text-[10px] text-gray-500">{currency}</span>   {/* → "MXN" */}
<span className="text-2xl font-bold">${total.toFixed(2)}</span>  {/* → "$450.00" */}
```

`{currency}` viene de `useLocaleContext()` → `currencyMap[locale]` → `"MXN"`.
El `$` literal en el siguiente span lo duplica.

**Fix:** Eliminar el `<span>{currency}</span>` y usar `formatPrice(total, locale)` directamente.

---

### B-03 — ALTO: Costos de envío hardcodeados e inconsistentes

**Archivo:** `app/[locale]/checkout/page.tsx` líneas 653 y 669

```tsx
// ❌ Hardcoded — no respeta locale ni usa las constantes
<span className="text-xs font-medium">$10.00</span>   {/* Standard */}
<span className="text-xs font-medium">$25.00</span>   {/* Express */}
```

Doble problema:
1. No usan `STANDARD_SHIPPING_COST` / `EXPRESS_SHIPPING_COST` de `lib/constants.ts`
2. **Inconsistencia numérica:** `EXPRESS_SHIPPING_COST = 20` en constants, pero UI muestra `$25.00`

**Fix:**
```tsx
import { STANDARD_SHIPPING_COST, EXPRESS_SHIPPING_COST } from '@/lib/constants';

{formatPrice(STANDARD_SHIPPING_COST, locale)}  {/* $10 → MX$175 en /es/ */}
{formatPrice(EXPRESS_SHIPPING_COST, locale)}   {/* $20 → MX$350 en /es/ */}
```

---

### B-04 — MEDIO: Costo adicional de pickup hardcodeado

**Archivo:** `app/[locale]/checkout/page.tsx` línea 577

```tsx
// ❌
{t('cost')} ${selectedPickupPoint.additionalCost.toFixed(2)}

// ✅
{t('cost')} {formatPrice(selectedPickupPoint.additionalCost, locale)}
```

Los puntos de pickup en `lib/pickupPoints.ts` tienen `additionalCost` en USD
(ej. flagship = 0, retail = 50). Deben convertirse igual que todo lo demás.

---

### B-05 — MEDIO: Submit falso — sin procesamiento real

**Archivo:** `app/[locale]/checkout/page.tsx` líneas 183–195

```tsx
// TODO: Send order to backend
await new Promise((resolve) => setTimeout(resolve, 2000)); // fake delay
router.push(`/${locale}/checkout/success/ORDER123`);       // hardcoded order ID
```

El checkout completo es una maqueta. No llama a ningún API, no valida la tarjeta,
no crea orden en base de datos, no envía email. El ID `ORDER123` está hardcodeado.

---

### B-06 — BAJO: PayPal referenciado para mercado mexicano

**Archivo:** `app/[locale]/checkout/page.tsx` línea 35

```tsx
paymentMethod: 'card' | 'paypal';
```

PayPal tiene muy baja adopción en México (<5% del mercado). El método alternativo
correcto para VIOGI es **Mercado Pago** (cubre OXXO, QR, wallet, tarjetas bancarias MX).
Ver Sección 3 para la estrategia completa.

---

## 2. Mejoras de GUI

### GUI-01 — Validación inline vs alert()

Actualmente los errores de validación usan `alert()` nativo del browser:
```tsx
alert(t('alert_terms'));
alert(t('alert_address'));
alert(t('alert_pickup'));
```

Esto es UX regresivo: bloquea el thread, no tiene estilo de VIOGI, y en móvil
el alert se ve como sistema operativo. Reemplazar con mensajes de error inline
debajo de cada campo (estilo Shopify: borde rojo + texto de error pequeño).

---

### GUI-02 — Campos de tarjeta sin masking

Los campos `cardNumber`, `expirationDate`, `securityCode` son `<input type="text">`
sin ninguna restricción. El usuario puede escribir cualquier cosa.

**Mejora:** Aplicar formatting automático:
- Número de tarjeta: grupos de 4 con espacios `4242 4242 4242 4242`
- Expiración: auto-slash `12/27`
- CVV: max 3–4 chars, solo números
- Detectar tipo de tarjeta (Visa/Mastercard) por prefijo y mostrar ícono

Librería sugerida: `react-payment-inputs` o implementar con `onInput` handlers.

---

### GUI-03 — CTA sticky en móvil

En mobile el resumen del pedido está colapsado y el botón "Complete Order" queda
debajo de un form largo. El usuario tiene que hacer scroll hasta el fondo.

**Mejora:** Footer sticky con total + botón en móvil:
```tsx
// Solo visible en mobile, siempre al fondo del viewport
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
  <div className="flex justify-between items-center mb-3">
    <span>Total</span>
    <span>{formatPrice(total, locale)}</span>
  </div>
  <button type="submit" className="w-full bg-black text-white py-4">
    {t('complete_order')}
  </button>
</div>
```

---

### GUI-04 — Página de éxito inexistente

`router.push(`/${locale}/checkout/success/ORDER123`)` → la ruta
`app/[locale]/checkout/success/[orderId]/page.tsx` no existe todavía.
El usuario ve error 404 después de "completar" la compra.

**Crear:** página mínima de éxito con:
- Número de orden (cuando sea real)
- Resumen de artículos comprados
- Botón "Continue Shopping"
- Limpieza del carrito (`clearCart()`)

---

### GUI-05 — Sin skeleton/loading state en cart del checkout

Cuando el usuario llega al checkout con el carrito vacío (navegación directa),
el componente hace su primer render con `cart = []` antes de que el store
de localStorage se hidrate. Aparece el form de checkout vacío brevemente.

**Mejora:** Agregar `isInitialized` guard (igual que en wishlist):
```tsx
const { isInitialized } = useCart();
if (!isInitialized) return <CheckoutSkeleton />;
```

---

### GUI-06 — Botón de Express Checkout sin funcionalidad

```tsx
// Línea 266
onClick={() => handleExpressCheckout('paypal')}
```

`handleExpressCheckout` no existe — causa error en runtime al hacer click.
Ocultar los botones de express checkout hasta que haya integración real.

---

## 3. Estrategia de Pagos: Stripe + Mercado Pago

### Por qué dos procesadores

| Criterio | Stripe | Mercado Pago |
|---|---|---|
| Tarjetas internacionales | ✅ Visa/MC/Amex global | ⚠️ Principalmente MX/LATAM |
| OXXO (efectivo MX) | ❌ No | ✅ Nativo |
| Mercado Pago Wallet | ❌ No | ✅ |
| Apple Pay / Google Pay | ✅ | ⚠️ Limitado |
| Comisión MX (aprox.) | 2.9% + $0.30 USD | 3.29% + $3.00 MXN |
| Adopción México | Startups tech | E-commerce mainstream |

**Conclusión:** Para VIOGI México, Mercado Pago es el procesador primario
(cubre OXXO que es crítico para ventas fuera de CDMX), Stripe es el secundario
para clientes con tarjetas internacionales o que prefieren Apple/Google Pay.

---

### Arquitectura propuesta

```
checkout form
    │
    ├── paymentMethod === 'card_stripe'
    │       └── POST /api/checkout/stripe/create-intent
    │               └── stripe.paymentIntents.create()
    │                       └── confirmar en client con @stripe/react-stripe-js
    │
    ├── paymentMethod === 'card_mp' | 'oxxo' | 'mp_wallet'
    │       └── POST /api/checkout/mercadopago/create-preference
    │               └── MP SDK → preference.create()
    │                       └── redirect a checkout.mercadopago.com.mx
    │                           o renderizar Brick en modal
    │
    └── (ambos) → webhook → /api/webhooks/stripe o /api/webhooks/mercadopago
                                └── crear Order en DB
                                └── enviar email (Resend)
                                └── redirect → /checkout/success/[orderId]
```

---

### Opciones de UX para Mercado Pago

**Opción A — Redirect (más simple, menos branded)**
```
usuario hace click → backend crea preference → redirect a mercadopago.com.mx → regresa a /success
```
Pro: cero código de UI. Contra: rompe el flow, usuario sale del sitio.

**Opción B — MP Bricks (recomendado para VIOGI)**
```
usuario elige MP → modal se abre → Brick de MP renderiza dentro → confirma → cierra modal → /success
```
MP Bricks es el SDK embebible oficial de Mercado Pago. Mantiene el look del sitio.
```tsx
// npm install @mercadopago/sdk-react
import { Payment } from '@mercadopago/sdk-react';

<Payment
  initialization={{ amount: total, preferenceId }}
  customization={{ paymentMethods: { creditCard: 'all', debitCard: 'all', ticket: 'all' } }}
  onSubmit={async ({ selectedPaymentMethod, formData }) => {
    // llamar /api/checkout/mercadopago/process
  }}
/>
```

---

### Opciones de UX para Stripe

**Stripe Payment Element** — un componente que muestra todos los métodos disponibles
(tarjeta, Apple Pay, Google Pay) de forma adaptativa según el dispositivo:

```tsx
// npm install @stripe/react-stripe-js @stripe/stripe-js
import { PaymentElement } from '@stripe/react-stripe-js';

// 1. Backend: crear PaymentIntent y retornar clientSecret
// 2. Frontend: renderizar dentro de <Elements stripe={stripePromise} options={{ clientSecret }}>
<PaymentElement />
```

---

### Variables de entorno necesarias

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-...
MP_ACCESS_TOKEN=APP_USR-...
MP_WEBHOOK_SECRET=...

# Tipo de cambio
NEXT_PUBLIC_USD_MXN_RATE=17.5
```

---

### Secuencia de implementación (dentro de la iteración 2.3 del plan)

```
2.3-A  Instalar SDKs: @stripe/react-stripe-js, @mercadopago/sdk-react
2.3-B  API Routes:
         /api/checkout/stripe/create-intent   → stripe.paymentIntents.create
         /api/checkout/mp/create-preference   → MP SDK preference.create
         /api/webhooks/stripe                 → verificar firma, crear Order
         /api/webhooks/mercadopago            → verificar firma, crear Order
2.3-C  UI Checkout: reemplazar form de tarjeta falso con Stripe PaymentElement
                    agregar sección "Pagar con Mercado Pago" con MP Brick
2.3-D  Página de éxito real con orderId de DB
2.3-E  Emails transaccionales con Resend (confirmar pedido + admin)
```

---

## Resumen de Prioridades

| # | Bug/Mejora | Severidad | Esfuerzo | Sprint |
|---|---|---|---|---|
| B-01 | Precios en dólares en checkout | 🔴 Crítico | Bajo (20 líneas) | Ahora |
| B-02 | Doble símbolo de moneda | 🔴 Alto | Mínimo (3 líneas) | Ahora |
| B-03 | Shipping hardcoded + inconsistente | 🟠 Alto | Bajo | Ahora |
| B-04 | Pickup cost hardcoded | 🟡 Medio | Mínimo | Ahora |
| GUI-06 | handleExpressCheckout crash | 🔴 Alto | Mínimo | Ahora |
| GUI-04 | Página success 404 | 🟠 Alto | Medio | Iteración 1.5 |
| GUI-01 | Validación inline | 🟡 Medio | Medio | Iteración 1.5 |
| GUI-02 | Card masking | 🟡 Medio | Medio | Iteración 2.3 |
| GUI-03 | Sticky CTA móvil | 🟡 Medio | Bajo | Iteración 1.5 |
| GUI-05 | Hydration skeleton | 🟢 Bajo | Bajo | Iteración 1.5 |
| B-05 | Submit real (backend) | 🔴 Crítico | Alto | Iteración 2.3 |
| B-06 | Reemplazar PayPal por MP | 🔴 Alto | Alto | Iteración 2.3 |
