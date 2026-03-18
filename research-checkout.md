# Research: Checkout — Bugs, GUI, CP Lookup y Estrategia de Pagos

> Última actualización: 2026-03-17
> Archivos auditados: `app/[locale]/checkout/page.tsx`, `app/[locale]/(shop)/cart/page.tsx`,
> `components/CartDrawer.tsx`, `store/cartStore.tsx`, `lib/formatters.ts`,
> `lib/constants.ts`, `lib/pickupPoints.ts`, `lib/mexico.ts`

---

## 1. Estado Actual del Checkout

El checkout es un **Client Component** completo con estado local (`useState`). Implementa:
- Delivery mode: envío a domicilio vs recogida en punto
- CP lookup automático via SEPOMEX (colonia, municipio, estado)
- Métodos de pago: tarjeta o PayPal manual
- Resumen de pedido colapsable en mobile
- Cálculo de subtotal, IVA (16%) y shipping usando constantes y `formatPrice`

No tiene backend. El submit ejecuta un delay artificial de 2s y redirige a `/checkout/success/ORDER123`.

---

## 2. Bugs Resueltos

### ✅ B-01 — Precios en dólares en checkout

**Archivo:** `app/[locale]/checkout/page.tsx`
**Estado:** RESUELTO

Todos los displays de precio ahora usan `formatPrice(amount, locale)`:
- Items del carrito: `formatPrice(item.price * item.quantity, locale)`
- Subtotal: `formatPrice(subtotal, locale)`
- Shipping: `formatPrice(shipping, locale)`
- Total: `formatPrice(total, locale)`
- Costo de pickup: `formatPrice(selectedPickupPoint.additionalCost, locale)`

En `/es/` muestra `MX$X,XXX.00`. En `/en/` muestra `$XXX.00`.

---

### ✅ B-02 — Doble símbolo de moneda

**Estado:** RESUELTO

El span separado `{currency}` ("MXN") fue eliminado. El total usa únicamente
`formatPrice(total, locale)` que ya incluye el símbolo/prefijo correcto según locale.

---

### ✅ B-03 — Costos de envío hardcodeados e inconsistentes

**Estado:** RESUELTO

Los labels de métodos de envío ahora construyen el precio dinámicamente:

```tsx
label={`${t('shipping_standard')} — ${formatPrice(STANDARD_SHIPPING_COST, locale)}`}
label={`${t('shipping_express')} — ${formatPrice(EXPRESS_SHIPPING_COST, locale)}`}
```

Donde `STANDARD_SHIPPING_COST = 10` y `EXPRESS_SHIPPING_COST = 20` (USD) desde `lib/constants.ts`.
En `/es/` se convierten a MXN correctamente.

---

### ✅ B-04 — Costo adicional de pickup hardcodeado

**Estado:** RESUELTO

```tsx
// Selector de puntos
{point.name}{point.additionalCost > 0 ? ` (+${formatPrice(point.additionalCost, locale)})` : ''}

// Display del punto seleccionado
{t('cost')} {formatPrice(selectedPickupPoint.additionalCost, locale)}
```

---

### ✅ GUI-04 — Página de éxito inexistente

**Estado:** RESUELTO

`app/[locale]/checkout/success/[orderId]/page.tsx` existe. Muestra confirmación
con número de orden, pasos siguientes y links a cuenta y tienda.
Limitación actual: el `orderId` es siempre `ORDER123` (hardcodeado en el submit).

---

### ✅ GUI-06 — `handleExpressCheckout` crash

**Estado:** RESUELTO

Los botones de "Express Checkout" fueron eliminados del UI. No hay referencia
a `handleExpressCheckout` en el código actual. La sección de express checkout
fue removida completamente.

---

## 3. Bugs Pendientes

### ⏳ B-05 — Submit sin backend real

**Archivo:** `app/[locale]/checkout/page.tsx:277`
**Severidad:** Bloqueante (Fase 2)

```tsx
// Estado actual
await new Promise((resolve) => setTimeout(resolve, 2000)); // delay fake
router.push(`/${locale}/checkout/success/ORDER123`);       // ID hardcodeado
```

El checkout no hace ninguna llamada real:
- No valida la tarjeta
- No crea una orden en base de datos
- No envía email de confirmación
- No descuenta inventario
- El número de orden es siempre "ORDER123"

**Fix requerido (Fase 2.3):** Integrar con procesador de pagos (MercadoPago/Stripe),
crear Order en DB via webhook, y enviar email con Resend.

---

### ⚠️ B-06 — PayPal como método de pago

**Archivo:** `app/[locale]/checkout/page.tsx`
**Severidad:** Media — funcional pero no óptimo para México
**Decisión:** Mantenido temporalmente como link manual

**Estado actual:** PayPal está implementado como "link de pago manual":

```tsx
// El usuario copia el link o hace click en él
<a href={PAYPAL_ME_LINK} target="_blank">paypal.me/viogi</a>
// PAYPAL_ME_LINK = 'https://paypal.me/viogi' en lib/constants.ts
```

No es una integración real. El usuario tiene que pagar por su cuenta en PayPal
y el sistema no verifica el pago. Es un workaround temporal.

**Por qué se mantiene temporalmente:** Permite al equipo operar manualmente
mientras se desarrolla la integración real.

**Fix definitivo (Fase 2.3):** Reemplazar por MercadoPago como procesador primario
(ver Sección 5). PayPal tiene <5% de adopción en México.

---

### ⏳ GUI-01 — Validación con `alert()` nativo

**Archivo:** `app/[locale]/checkout/page.tsx`
**Severidad:** Media — UX regresivo

```tsx
// Estado actual — 3 instancias
if (!formData.agreeTerms) { alert(t('alert_terms')); return; }
if (!hasValidAddress) { alert(t('alert_address')); return; }
if (!formData.pickupPointId) { alert(t('alert_pickup')); return; }
```

`alert()` bloquea el thread, no tiene estilos de VIOGI, en móvil se ve como
sistema operativo. Las claves `alert_*` existen en los messages pero se usan
en el browser native alert.

**Fix sugerido:** Agregar estado de error por campo y mostrar mensajes inline:

```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

// En lugar de alert():
setErrors({ terms: t('alert_terms') });
return;

// En el JSX:
{errors.terms && <p className="text-red-500 text-[10px] mt-1">{errors.terms}</p>}
```

---

### ⏳ GUI-02 — Campos de tarjeta sin masking

**Archivo:** `app/[locale]/checkout/page.tsx`
**Severidad:** Baja

Los campos `cardNumber`, `expirationDate`, `securityCode` son `<input type="text">`
sin restricciones. El usuario puede escribir cualquier cosa, sin guías visuales.

**Fix sugerido:**

```tsx
// Número de tarjeta: auto-espacios cada 4 dígitos
const formatCardNumber = (value: string) =>
  value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

// Expiración: auto-slash
const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits;
};

// CVV: solo números, max 4
const formatCVV = (value: string) => value.replace(/\D/g, '').slice(0, 4);
```

Librería alternativa: `react-payment-inputs` (evita reinventar la rueda).

---

### ⏳ GUI-03 — Sin CTA sticky en móvil

**Archivo:** `app/[locale]/checkout/page.tsx`
**Severidad:** Baja

En pantallas pequeñas el botón "Completar Pedido" queda debajo de un formulario largo.
El usuario no puede ver el total ni el botón sin hacer scroll hasta el fondo.

**Fix sugerido:**

```tsx
{/* Footer sticky — solo en mobile */}
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
  <div className="flex justify-between items-center mb-3">
    <span className="text-[10px] uppercase tracking-widest text-gray-400">{t('total')}</span>
    <span className="text-base font-light">{formatPrice(total, locale)}</span>
  </div>
  <button type="submit" className="w-full bg-black text-white py-3.5 text-[11px] uppercase tracking-widest">
    {isProcessing ? t('processing') : t('complete_order')}
  </button>
</div>
```

---

### ⏳ GUI-05 — Sin skeleton de hidratación en checkout

**Archivo:** `app/[locale]/checkout/page.tsx`
**Severidad:** Baja

Cuando el usuario navega directamente a `/checkout` con el carrito vacío,
el store de localStorage no se hidrata instantáneamente. El checkout renderiza
brevemente con `cart = []` antes de leer localStorage.

**Fix sugerido:**

```tsx
const { cart, isInitialized } = useCart();

if (!isInitialized) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-[10px] uppercase tracking-widest text-gray-400">
        Cargando...
      </div>
    </div>
  );
}
```

---

## 4. Feature: CP Lookup SEPOMEX

### Descripción

Al escribir el código postal (5 dígitos), el checkout consulta automáticamente
la API pública de SEPOMEX y rellena colonia, municipio y estado.

### Implementación actual (`lib/mexico.ts`)

```typescript
export async function lookupCP(cp: string): Promise<MexicoCPData | null>
// Endpoint: https://api-sepomex.hckdrk.mx/query/info_cp/{cp}?type=JSON
// Tipo retornado: { estado: string, municipio: string, colonias: string[] }
```

### Flujo en checkout

```
Usuario escribe CP (5 dígitos)
  → useEffect detecta cambio
  → lookupCP(formData.zipCode)
  → Si retorna datos:
      - Si 1 colonia: auto-selecciona y muestra como texto
      - Si >1 colonias: muestra <select> con opciones
      - municipio y estado: auto-rellenados, read-only
  → Si retorna null: muestra inputs de texto normales
```

### Riesgos y mitigaciones

| Riesgo | Mitigación actual |
|---|---|
| API caída o sin respuesta | Fallback a inputs manuales (cpData === null) |
| CP inválido | Validación previa: `/^\d{5}$/.test(cp)` |
| Respuesta lenta | No hay loading indicator — mejora pendiente |
| Sin SLA (servicio comunitario) | En producción: considerar cacheo o SEPOMEX oficial |

---

## 5. Estrategia de Pagos: MercadoPago + Stripe

### Por qué dos procesadores

| Criterio | Stripe | Mercado Pago |
|---|---|---|
| Tarjetas internacionales | ✅ Visa/MC/Amex global | ⚠️ Principalmente MX/LATAM |
| OXXO (efectivo MX) | ❌ No | ✅ Nativo |
| Mercado Pago Wallet | ❌ No | ✅ |
| Apple Pay / Google Pay | ✅ | ⚠️ Limitado |
| Comisión MX (aprox.) | 2.9% + $0.30 USD | 3.29% + $3.00 MXN |
| Adopción México | Startups tech | E-commerce mainstream |
| OXXO crítico para ventas fuera CDMX | ❌ | ✅ |

**Conclusión:** MercadoPago es el procesador primario para VIOGI (cubre OXXO,
que es crítico para ventas fuera de CDMX y NSE C/D). Stripe es el secundario
para clientes con tarjetas internacionales o Apple/Google Pay.

---

### Arquitectura de integración

```
checkout/page.tsx (submit)
    │
    ├── paymentMethod === 'card'
    │   ├── opción A: MercadoPago Bricks (tarjetas MX, OXXO, wallet)
    │   │     └── POST /api/payments/mp/create-preference
    │   │             └── MP SDK preference.create()
    │   │                     └── <Payment /> Brick renderiza inline
    │   │
    │   └── opción B: Stripe (tarjetas internacionales, Apple/Google Pay)
    │         └── POST /api/payments/stripe/create-intent
    │                 └── stripe.paymentIntents.create()
    │                         └── <PaymentElement /> de @stripe/react-stripe-js
    │
    └── (ambos) → webhook confirmación
              ├── /api/webhooks/stripe
              └── /api/webhooks/mercadopago
                      └── crear Order en DB
                      └── vaciar carrito
                      └── enviar email (Resend)
                      └── redirect → /checkout/success/[orderId]
```

---

### UX recomendada: MercadoPago Bricks

MP Bricks es el SDK embebible de Mercado Pago. Mantiene el diseño del sitio sin
redirigir al usuario a mercadopago.com.mx.

```tsx
// npm install @mercadopago/sdk-react
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

<Payment
  initialization={{ amount: totalInMXN, preferenceId }}
  customization={{
    paymentMethods: {
      creditCard: 'all',
      debitCard: 'all',
      ticket: 'all',  // OXXO
      atm: 'all',     // SPEI
    }
  }}
  onSubmit={async ({ formData }) => {
    await fetch('/api/payments/mp/process', {
      method: 'POST',
      body: JSON.stringify({ formData, orderId }),
    });
  }}
/>
```

---

### UX recomendada: Stripe Payment Element

```tsx
// npm install @stripe/react-stripe-js @stripe/stripe-js
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// 1. Backend: crear PaymentIntent → retornar clientSecret
// 2. Frontend: envolver en Elements con clientSecret
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentElement />
  {/* PaymentElement renderiza el método disponible según dispositivo:
      tarjeta en desktop, Apple Pay en Safari, Google Pay en Chrome */}
</Elements>
```

---

### Variables de entorno requeridas (Fase 2.3)

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-...
MP_ACCESS_TOKEN=APP_USR-...

# Tipo de cambio
NEXT_PUBLIC_USD_MXN_RATE=17.5
```

---

### Secuencia de implementación (Fase 2.3)

```
2.3-A  Crear proyecto en Stripe + MercadoPago (modo sandbox)
2.3-B  Variables de entorno en .env.local y Vercel

2.3-C  API Routes:
         POST /api/payments/mp/create-preference   → MP SDK
         POST /api/payments/stripe/create-intent   → Stripe SDK
         POST /api/webhooks/stripe                 → verificar firma, crear Order
         POST /api/webhooks/mercadopago            → verificar firma, crear Order

2.3-D  UI Checkout:
         - Agregar tabs "Tarjeta MX (MP)" | "Tarjeta Internacional (Stripe)"
         - Renderizar Brick o PaymentElement según selección
         - Eliminar form de tarjeta falso y link de PayPal manual

2.3-E  Página de éxito real:
         - Recibe orderId real desde webhook
         - Muestra resumen de la orden desde DB
         - Llama clearCart() para vaciar el carrito

2.3-F  Emails transaccionales (Resend):
         - Template: confirmación de orden (nombre, items, total, número)
         - Disparado desde webhook al confirmar pago

2.3-G  Tests en sandbox:
         - MP: tarjeta de prueba 5031 7557 3453 0604
         - Stripe: 4242 4242 4242 4242
         - OXXO: trigger manual desde MP dashboard
```

---

## 6. Tabla de Prioridades Actualizada

| # | Bug/Mejora | Severidad | Estado | Sprint |
|---|---|---|---|---|
| B-01 | Precios en dólares en checkout | 🔴 Crítico | ✅ Resuelto | — |
| B-02 | Doble símbolo de moneda | 🔴 Alto | ✅ Resuelto | — |
| B-03 | Shipping hardcoded + inconsistente | 🟠 Alto | ✅ Resuelto | — |
| B-04 | Pickup cost hardcodeado | 🟡 Medio | ✅ Resuelto | — |
| GUI-04 | Página success 404 | 🟠 Alto | ✅ Resuelto | — |
| GUI-06 | handleExpressCheckout crash | 🔴 Alto | ✅ Resuelto | — |
| GUI-01 | Validación inline (alert → inline) | 🟡 Medio | ⏳ Pendiente | Antes de lanzamiento |
| GUI-03 | Sticky CTA móvil | 🟡 Medio | ⏳ Pendiente | Antes de lanzamiento |
| GUI-02 | Card masking | 🟡 Medio | ⏳ Pendiente | Antes de lanzamiento |
| GUI-05 | Hydration skeleton | 🟢 Bajo | ⏳ Pendiente | Antes de lanzamiento |
| B-05 | Submit real (backend) | 🔴 Crítico | ⏳ Pendiente | Fase 2.3 |
| B-06 | Reemplazar PayPal por MP | 🔴 Alto | ⚠️ Parcial | Fase 2.3 |
