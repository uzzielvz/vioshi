# Plan — Iteración 1.5: Checkout Fixes

> Fecha: 2026-03-12
> Scope: B-01, B-02, B-03, GUI-06 + estética del formulario + BD de México para dirección
> **Fuera de scope:** integración real de pagos (tarjeta, PayPal, etc.)

---

## 0. Auditoría estética del formulario (pre-implementación)

Antes de tocar lógica, se corrigen inconsistencias visuales respecto al diseño minimalista B/W del sitio.

### Problemas detectados

| # | Elemento | Línea aprox. | Estado actual | Corrección |
|---|---|---|---|---|
| E-1 | Botones Express Checkout | 257–277 | Morado `#5A31F4`, amarillo `#FFC439`, negro — rompen paleta B/W | Ocultar (GUI-06 los elimina) |
| E-2 | Label PayPal en Payment | 751–753 | `text-[#003087] text-2xl font-bold` — fuera de escala y color | Eliminar sección PayPal del form |
| E-3 | `rounded` en imágenes del order summary | 858 | `rounded overflow-hidden` | Quitar `rounded` — el sitio no usa border-radius |
| E-4 | Prefijo teléfono | 765 | `+1` hardcodeado | Cambiar a `+52` |
| E-5 | Estado select incompleto | 462–467 | Solo 3 estados + comentario "Add more states" | Se reemplaza por flujo CP → auto-fill |
| E-6 | Doble moneda en total | 934–938 | `{currency}` + `$` prefijo = doble símbolo | Eliminar `{currency}` span — ya incluido en `formatPrice` |

---

## 1. B-01 — Precios hardcodeados con `$` literal

### Descripción del bug
Varios valores en `checkout/page.tsx` usan `$${valor.toFixed(2)}` en lugar de `formatPrice(valor, locale)`, ignorando la moneda y locale del usuario.

### Archivos afectados
- `app/[locale]/checkout/page.tsx`

### Cambios exactos

```tsx
// [1] Costo adicional en info box del pickup point (~línea 577)
- {t('cost')} ${selectedPickupPoint.additionalCost.toFixed(2)}
+ {t('cost')} {formatPrice(selectedPickupPoint.additionalCost, locale)}

// [2] Total en toggle móvil (~línea 849)
- <span className="text-2xl font-bold text-black">${total.toFixed(2)}</span>
+ <span className="text-2xl font-bold text-black">{formatPrice(total, locale)}</span>

// [3] Precio por item en order summary (~línea 879)
- ${(item.price * item.quantity).toFixed(2)}
+ {formatPrice(item.price * item.quantity, locale)}

// [4] Subtotal en order summary (~línea 909)
- <span className="text-xs font-medium">${subtotal.toFixed(2)}</span>
+ <span className="text-xs font-medium">{formatPrice(subtotal, locale)}</span>

// [5] Shipping cost en order summary — rama home (~línea 922)
- showShippingMethods ? `$${shipping.toFixed(2)}` : t('complete_address')
+ showShippingMethods ? formatPrice(shipping, locale) : t('complete_address')

// [6] Costo adicional pickup en order summary (~línea 926)
- `$${selectedPickupPoint.additionalCost.toFixed(2)}`
+ formatPrice(selectedPickupPoint.additionalCost, locale)

// [7] Costo en opciones del dropdown de pickup points (~líneas 549 y 557)
- `(+$${point.additionalCost})`
+ `(+${formatPrice(point.additionalCost, locale)})`
```

---

## 2. B-02 — Doble símbolo de moneda en el total

### Descripción del bug
En el order summary, el total se muestra con un `<span>{currency}</span>` seguido de `$${total.toFixed(2)}`, resultando en algo como **"MXN $1,250.00"** donde el `$` ya viene de `formatPrice`.

### Archivo afectado
- `app/[locale]/checkout/page.tsx` (~líneas 934–938)

### Cambio

```tsx
// Antes
<div className="text-right flex items-baseline gap-1">
  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
    {currency}
  </span>
  <span className="text-2xl font-bold">${total.toFixed(2)}</span>
</div>

// Después
<div className="text-right">
  <span className="text-2xl font-bold">{formatPrice(total, locale)}</span>
</div>
```

---

## 3. B-03 — Costos de envío hardcodeados

### Descripción del bug
El selector de método de envío muestra `$10.00` y `$25.00` hardcodeados en lugar de leer las constantes `STANDARD_SHIPPING_COST` y `EXPRESS_SHIPPING_COST` de `lib/constants.ts`.

### Archivos afectados
- `app/[locale]/checkout/page.tsx` (~líneas 653 y 669)

### Cambios

```tsx
// Envío estándar (~línea 653)
- <span className="text-xs font-medium">$10.00</span>
+ <span className="text-xs font-medium">{formatPrice(STANDARD_SHIPPING_COST, locale)}</span>

// Envío express (~línea 669)
- <span className="text-xs font-medium">$25.00</span>
+ <span className="text-xs font-medium">{formatPrice(EXPRESS_SHIPPING_COST, locale)}</span>
```

> **Nota:** Verificar que los valores en `constants.ts` (`STANDARD_SHIPPING_COST`, `EXPRESS_SHIPPING_COST`) son los correctos como fuente de verdad. Si hay discrepancia con los `$10`/`$25` actuales, se actualiza la constante — no la UI.

---

## 4. GUI-06 — Ocultar botones de Express Checkout no funcionales

### Descripción del bug
Los botones Shop Pay, PayPal y G Pay llaman a `handleExpressCheckout()` que está vacío (`// TODO`). No generan error visible pero no hacen nada — confunde al usuario y rompe la estética con colores de marca ajenos (morado, amarillo).

### Cambios en `checkout/page.tsx`

**a) Ocultar los 3 botones — dejar solo el divisor "OR":**

```tsx
// Reemplazar toda la sección Express Checkout por:
<div className="relative text-center text-[10px] text-gray-500 uppercase tracking-wide mb-5">
  <span className="bg-white px-3 relative z-10">{t('or', { ns: 'common' })}</span>
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-300" />
  </div>
</div>
```

**b) PayPal permanece como opción de pago manual:**
No se integra la API de PayPal. Al seleccionar PayPal, se muestra un bloque informativo con el enlace `paypal.me/[cuenta]` para que el cliente realice la transferencia por su cuenta. El pedido se registra con estado `pendiente_pago_paypal` hasta confirmar manualmente.

UX al seleccionar PayPal:
```
┌─────────────────────────────────────────────────────┐
│ ◉ PayPal                                            │
│                                                     │
│  Realiza tu pago directamente a nuestra cuenta:     │
│                                                     │
│  → paypal.me/viogi                    [Copiar link] │
│                                                     │
│  Incluye tu nombre completo en el concepto.         │
│  Tu pedido se confirmará al recibir el pago.        │
└─────────────────────────────────────────────────────┘
```

La cuenta `paypal.me/viogi` se define como constante en `lib/constants.ts`:
```ts
export const PAYPAL_ME_LINK = 'https://paypal.me/viogi';
```

**c) `CheckoutFormData` — se mantiene `paymentMethod: 'card' | 'paypal'`** sin cambios en el tipo.

---

## 5. México: CP → Colonia / Municipio / Estado

### Contexto
Los formularios estándar en México (Liverpool, Mercado Libre, OXXO Pay, Rappi) siguen el flujo SEPOMEX:

```
Usuario escribe CP (5 dígitos)
    → API fetch
    → Respuesta: { estado, municipio, colonias: string[] }
    → Colonia: dropdown seleccionable
    → Municipio: campo readonly autocompletado
    → Estado: campo readonly autocompletado
```

El campo `ciudad` genérico del formulario actual no aplica al estándar mexicano — se reemplaza por este flujo.

---

### 5.1 Estrategia: JSON estático de SEPOMEX (sin API key)

**Sin registro, sin token, sin límites, sin red.** Los datos de SEPOMEX son públicos y existen como paquetes npm listos para usar.

```bash
npm install @zipcodes-mx/data
```

El paquete expone una función de lookup por CP. Se carga con **dynamic import** para no afectar el bundle inicial del checkout:

```ts
// Solo se carga en el cliente cuando el usuario escribe el CP
const { getByZipCode } = await import('@zipcodes-mx/data');
const results = getByZipCode(cp);
// results: Array<{ estado, municipio, asentamiento, tipo_asentamiento }>
```

Si el paquete no está disponible en npm, se usa el fallback: archivo JSON comprimido descargado de [datos.gob.mx](https://datos.gob.mx) (fuente oficial SEPOMEX), importado como asset estático.

---

### 5.2 Nuevo archivo: `lib/mexico.ts`

```ts
export interface MexicoCPData {
  estado: string;
  municipio: string;
  colonias: string[];
}

export async function lookupCP(cp: string): Promise<MexicoCPData | null> {
  if (cp.length !== 5 || !/^\d{5}$/.test(cp)) return null;

  try {
    const { getByZipCode } = await import('@zipcodes-mx/data');
    const results = getByZipCode(cp);

    if (!results || results.length === 0) return null;

    return {
      estado: results[0].estado,
      municipio: results[0].municipio,
      colonias: results.map((r: any) => r.asentamiento).sort(),
    };
  } catch {
    return null;
  }
}
```

> **Sin variables de entorno necesarias.** Se elimina la sección `.env.local` relacionada con Copomex.

---

### 5.3 Nuevos campos en `CheckoutFormData`

```tsx
interface CheckoutFormData {
  // ... campos existentes
  colonia: string;    // elegida del dropdown (nuevo)
  municipio: string;  // auto-llenado desde CP, readonly (nuevo)
  // `state` → sigue en la interface pero se auto-llena (ya no es select manual)
  // `city` → se elimina (no aplica al estándar mexicano de dirección)
}
```

Estado inicial:
```tsx
colonia: '',
municipio: '',
```

---

### 5.4 Lógica de fetch en el componente

```tsx
const [cpData, setCpData] = useState<MexicoCPData | null>(null);
const [cpLoading, setCpLoading] = useState(false);
const [cpError, setCpError] = useState(false);

// Cuando zipCode cambia a 5 dígitos exactos → fetch
useEffect(() => {
  if (formData.zipCode.length !== 5) {
    setCpData(null);
    setFormData(prev => ({ ...prev, state: '', municipio: '', colonia: '' }));
    return;
  }

  setCpLoading(true);
  setCpError(false);

  fetchCPData(formData.zipCode).then((data) => {
    setCpLoading(false);
    if (data) {
      setCpData(data);
      setFormData(prev => ({
        ...prev,
        state: data.estado,
        municipio: data.municipio,
        colonia: data.colonias.length === 1 ? data.colonias[0] : '',
      }));
    } else {
      setCpError(true);
      setCpData(null);
    }
  });
}, [formData.zipCode]);
```

---

### 5.5 Nueva estructura visual del bloque de dirección

```
┌────────────────────────────────────────────┐
│ DIRECCIÓN                                  │
├────────────────────────────────────────────┤
│ [ Calle y número exterior              ]   │
│ [ Interior / Depto (opcional)          ]   │
│ [ Código Postal (CP) ]                     │
│   ↓ al completar 5 dígitos:               │
│ [ Colonia ▼                            ]   │  ← dropdown con colonias del CP
│ [ Municipio/Alcaldía   ] (readonly)        │  ← auto-llenado
│ [ Estado               ] (readonly)        │  ← auto-llenado
│ [ Teléfono (+52)       ]                   │
└────────────────────────────────────────────┘
```

**Estados del bloque CP:**
- CP < 5 dígitos → solo el input CP, campos de abajo ocultos
- CP = 5 dígitos, cargando → spinner sutil junto al input
- CP = 5 dígitos, data OK → aparece colonia dropdown + municipio + estado (readonly, estilo diferenciado)
- CP = 5 dígitos, error/no encontrado → mensaje "CP no encontrado, ingresa manualmente" + campos de texto libre como fallback

**Estilo campos readonly (minimalista):**
```tsx
className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50
           text-gray-500 text-sm cursor-not-allowed select-none"
```

---

## 6. Resumen de archivos modificados / creados

| Archivo | Tipo | Qué cambia |
|---|---|---|
| `app/[locale]/checkout/page.tsx` | Modificado | B-01, B-02, B-03, GUI-06, estética, nueva UI dirección México |
| `lib/mexico.ts` | **Nuevo** | `fetchCPData()` + tipo `MexicoCPData` |
| `.env.local` | Modificado | Agregar `NEXT_PUBLIC_COPOMEX_TOKEN` |
| `CheckoutFormData` (dentro de page.tsx) | Modificado | `+colonia`, `+municipio`, `-city`, simplificar `paymentMethod` |

---

## 7. Orden de implementación

```
1. Crear lib/mexico.ts
2. Agregar token a .env.local
3. Aplicar fixes B-01, B-02, B-03 (10 reemplazos de precio)
4. Aplicar GUI-06 (ocultar express checkout + limpiar PayPal)
5. Aplicar correcciones estéticas (E-1 a E-6)
6. Reestructurar bloque de dirección con flujo CP → colonia/municipio/estado
7. Conectar lógica fetchCPData al componente
8. Verificar validaciones del handleSubmit con nuevos campos
```

---

## 8. Fuera de scope (próximas iteraciones)

- Integración real de pagos con tarjeta (Stripe / Conekta)
- Integración real de PayPal
- Shop Pay / Google Pay
- Backend de órdenes
- Página de confirmación dinámica (`/checkout/success/[orderId]`)
