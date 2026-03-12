# Sprint Plan — Corrección de Bugs (8 bugs confirmados)

> Fecha: 2026-03-11
> Basado en: `research.md`
> Estrategia: **4 iteraciones agrupadas por archivo/dependencia**, no una sola iteración ni una por bug

---

## Estrategia General

### ¿Por qué no una sola iteración?

Los 8 bugs afectan **4 archivos distintos** con flujos de verificación independientes. Corregirlos todos a la vez hace imposible aislar regressions: si después del merge algo falla, no sabrías cuál corrección lo causó. Una iteración por bug tampoco tiene sentido porque hay bugs íntimamente relacionados que deben corregirse juntos para que la corrección sea coherente (e.g., `useCallback` en el store + remover la dependencia del `useEffect` en checkout son inseparables).

**La estrategia elegida: 4 iteraciones agrupadas por cohesión de código.**

```
Iteración 1 ──► cartStore.tsx (Bugs #1, #2, #8)
                    ↓  [verificar: checkout no hace bucle, totales correctos]
Iteración 2 ──► checkout/page.tsx (Bugs #4, #5)
                    ↓  [verificar: botón volver, submit con timer]
Iteración 3 ──► ProductContent.tsx (Bug #3)
                    ↓  [verificar: navegación rápida post add-to-cart]
Iteración 4 ──► Header.tsx + páginas de cuenta (Bugs #6, #7)
                    ↓  [verificar: menú de navegación, formularios de cuenta]
```

---

## Iteración 1 — `store/cartStore.tsx`

**Bugs cubiertos:** #1 (bucle infinito), #2 (shipping reset), #8 (re-renders excesivos)

**Motivo de agrupar:** Los tres bugs nacen del mismo archivo. Bug #8 (`useCallback`) es el requisito técnico para que la corrección de Bug #1 funcione. Bug #2 necesita cambiar la firma de `calculateTotals`, lo cual afecta `addItem`, `removeItem` y `updateQuantity` — mejor hacerlo en un solo commit que tocar el archivo tres veces.

### 1.1 — Bug #8: Envolver funciones del contexto con `useCallback`

**Archivo:** `store/cartStore.tsx`

**Cambio:** Agregar `useCallback` a las 7 funciones expuestas en el contexto. Esto es el prerequisito para la corrección de Bug #1.

```typescript
// ANTES
const updateShippingCost = (cost: number) => { ... };
const addItem = (newItem: CartItem) => { ... };
const removeItem = (itemId: string) => { ... };
const updateQuantity = (itemId: string, quantity: number) => { ... };
const clearCart = () => { ... };
const openCart = () => setIsCartOpen(true);
const closeCart = () => setIsCartOpen(false);

// DESPUÉS
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const updateShippingCost = useCallback((cost: number) => { ... }, []);
const addItem = useCallback((newItem: CartItem) => { ... }, []);
const removeItem = useCallback((itemId: string) => { ... }, []);
const updateQuantity = useCallback((itemId: string, quantity: number) => { ... }, []);
const clearCart = useCallback(() => { ... }, []);
const openCart = useCallback(() => setIsCartOpen(true), []);
const closeCart = useCallback(() => setIsCartOpen(false), []);
```

**Notas de implementación:**
- `addItem`, `removeItem`, `updateQuantity` y `clearCart` usan `setCart` con función updater `(prevCart) => ...`. Esto elimina la necesidad de `cart` como dependencia del `useCallback` — todas sus dependencias son `[]`.
- `updateShippingCost` ya usa `setCart((prevCart) => ...)`, por lo que su dep array también es `[]`.
- `openCart`/`closeCart` solo llaman a `setIsCartOpen` (setter de useState, referencia estable), dep array `[]`.

---

### 1.2 — Bug #2: Preservar el costo de envío personalizado en `calculateTotals`

**Archivo:** `store/cartStore.tsx`, líneas 58–71

**Problema:** `calculateTotals` siempre usa `STANDARD_SHIPPING_COST`, ignorando si el usuario ya seleccionó express o pickup.

**Cambio:** Agregar parámetro `prevShipping` a `calculateTotals` y pasarlo en cada llamada usando `prevCart.shipping`.

```typescript
// ANTES
const calculateTotals = (items: CartItem[]): Cart => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = items.length > 0 ? STANDARD_SHIPPING_COST : 0;
  const total = subtotal + tax + shipping;
  return { items, subtotal, tax, shipping, total };
};

// DESPUÉS
const calculateTotals = (items: CartItem[], prevShipping: number = STANDARD_SHIPPING_COST): Cart => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = items.length > 0 ? prevShipping : 0;
  const total = subtotal + tax + shipping;
  return { items, subtotal, tax, shipping, total };
};
```

**Cambio en llamadores** (pasar `prevCart.shipping` para preservar el costo actual):

```typescript
// addItem — dentro del setCart updater
return calculateTotals(updatedItems, prevCart.shipping);

// removeItem — dentro del setCart updater
return calculateTotals(updatedItems, prevCart.shipping);

// updateQuantity — dentro del setCart updater
return calculateTotals(updatedItems, prevCart.shipping);
```

---

### 1.3 — Bug #1: Eliminar `updateShippingCost` de las dependencias del `useEffect` en checkout

**Archivo:** `app/[locale]/checkout/page.tsx`, líneas 112–117

**Este cambio se realiza en la Iteración 1 aunque afecte checkout**, porque es la segunda mitad de la corrección del Bug #1 — sin el `useCallback` del step anterior no tiene sentido.

```typescript
// ANTES
useEffect(() => {
  // ...calcula shippingCost...
  updateShippingCost(shippingCost);
}, [
  formData.deliveryMethod,
  formData.shippingMethod,
  formData.pickupPointId,
  updateShippingCost  // ← ORIGEN DEL BUCLE
]);

// DESPUÉS
useEffect(() => {
  // ...calcula shippingCost...
  updateShippingCost(shippingCost);
}, [
  formData.deliveryMethod,
  formData.shippingMethod,
  formData.pickupPointId,
  // updateShippingCost ya no necesita estar aquí: es estable gracias a useCallback
]);
// eslint-disable-next-line react-hooks/exhaustive-deps  ← agregar solo si el linter lo exige
```

**Alternativa más robusta (recomendada):** Calcular el `shippingCost` con `useMemo` y llamar `updateShippingCost` dentro de un único `useEffect` con el valor derivado — evita el closure sobre `formData` completo:

```typescript
const shippingCost = useMemo(() => {
  if (formData.deliveryMethod === 'home') {
    return formData.shippingMethod === 'express' ? 25 : 10;
  }
  if (formData.deliveryMethod === 'pickup' && formData.pickupPointId) {
    return getPickupPointById(formData.pickupPointId)?.additionalCost ?? 0;
  }
  return 0;
}, [formData.deliveryMethod, formData.shippingMethod, formData.pickupPointId]);

useEffect(() => {
  updateShippingCost(shippingCost);
}, [shippingCost, updateShippingCost]);
// Con useCallback, updateShippingCost es estable → el efecto solo re-corre cuando shippingCost cambia
```

### Verificación de Iteración 1

Antes de continuar, confirmar manualmente:

- [ ] Abrir checkout → no hay bucle infinito visible en DevTools (pestaña Performance — no debe haber re-renders continuos)
- [ ] Seleccionar envío express ($25) → cambiar cantidad de un producto en checkout → el precio de envío sigue siendo $25 (no resetea a $10)
- [ ] Seleccionar punto de recolección con `additionalCost = 0` → el envío muestra $0
- [ ] `npm run type-check` pasa sin errores
- [ ] `npm run lint` pasa sin errores

---

## Iteración 2 — `app/[locale]/checkout/page.tsx` (resto)

**Bugs cubiertos:** #4 (race condition botón volver), #5 (redirect competencia)

**Motivo de iteración separada:** La Iteración 1 ya tocó checkout para el Bug #1. En esta iteración corregimos la lógica de navegación del mismo archivo sin mezclar concerns del store.

### 2.1 — Bug #4: Eliminar el `setTimeout` del botón "Volver al Carrito"

**Archivo:** `app/[locale]/checkout/page.tsx`, líneas 227–235

**Problema:** `router.back()` no es una Promise. El `setTimeout(openCart, 200)` no garantiza que la navegación haya terminado cuando el carrito se abre. No hay cleanup.

**Solución:** Pasar el estado de "abrir carrito" a través de un parámetro de URL, de forma que la página destino lo lea y abra el carrito de forma declarativa.

```typescript
// ANTES
onClick={() => {
  closeCart();
  router.back();
  setTimeout(() => {
    openCart();
  }, 200);
}}

// DESPUÉS
onClick={() => {
  closeCart();
  router.push(`/${locale}/cart?open=1`);
}}
```

**Cambio complementario en** `app/[locale]/(shop)/cart/page.tsx` — leer el parámetro al montar:

```typescript
// En la página del carrito
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const { openCart } = useCart();

useEffect(() => {
  if (searchParams.get('open') === '1') {
    openCart();
  }
}, []); // Solo en mount
```

**Alternativa más simple (si la página del carrito ya muestra el carrito inline):** Simplemente usar `router.push(`/${locale}/cart`)` sin el `openCart()` — el carrito se verá en la página directamente. Esta es la opción preferida si el `CartDrawer` ya se muestra en la página de cart.

---

### 2.2 — Bug #5: Proteger el `useEffect` de redirección por carrito vacío durante el submit

**Archivo:** `app/[locale]/checkout/page.tsx`, líneas 93–98 y 181–197

**Problema:** Si el timer de 2s del submit está corriendo y el carrito se vacía por cualquier razón, el `useEffect` navega a `/cart` mientras el timer aún corre. Luego el timer redirige a `/success`.

**Solución:** Introducir un ref `isSubmitting` que bloquee el redirect del `useEffect` mientras el orden está siendo procesada.

```typescript
// ANTES
useEffect(() => {
  if (cart.length === 0) {
    router.push(`/${locale}/cart`);
  }
}, [cart, router, locale]);

// DESPUÉS
const isSubmittingRef = useRef(false);

// En handleSubmit:
isSubmittingRef.current = true;
setIsProcessing(true);
try {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  router.push(`/${locale}/checkout/success/ORDER123`);
} catch (error) {
  isSubmittingRef.current = false;  // Reset solo en error
  // ...
} finally {
  setIsProcessing(false);
}

// useEffect protegido:
useEffect(() => {
  if (cart.length === 0 && !isSubmittingRef.current) {
    router.push(`/${locale}/cart`);
  }
}, [cart, router, locale]);
```

### Verificación de Iteración 2

- [ ] En checkout, hacer clic en el botón "volver al carrito" (ícono de bolsa) → navega a `/cart` sin abrir el drawer en checkout
- [ ] La página de cart recibe el drawer abierto (si se implementó con `?open=1`) o simplemente muestra el carrito inline
- [ ] Hacer clic en "Confirmar pedido" → durante el timer de 2s no aparece redirección inesperada a `/cart`
- [ ] `npm run type-check` y `npm run lint` pasan

---

## Iteración 3 — `app/[locale]/products/[slug]/ProductContent.tsx`

**Bugs cubiertos:** #3 (setTimeout sin cleanup abre carrito en página destino)

**Motivo de iteración separada:** Es un archivo completamente independiente de los anteriores. Aislarlo permite verificar este flujo específico sin riesgo de regresión en checkout.

### 3.1 — Bug #3: Reemplazar `setTimeout` naked por `useEffect` con cleanup

**Archivo:** `app/[locale]/products/[slug]/ProductContent.tsx`, líneas 30–47

**Problema:** El `setTimeout` de 500ms no tiene `clearTimeout`. Si el usuario navega antes de los 500ms, el timer dispara `openCart()` en la nueva página.

**Solución A — Mover el timer a un `useEffect` con cleanup (recomendada):**

```typescript
// ANTES
const handleAddToCart = () => {
  setIsAdding(true);
  addItem({ ... });
  setTimeout(() => {
    setIsAdding(false);
    openCart();
  }, 500);
};

// DESPUÉS
import { useState, useRef, useEffect } from "react";

const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// Cleanup al desmontar el componente
useEffect(() => {
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, []);

const handleAddToCart = () => {
  setIsAdding(true);
  addItem({ ... });

  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => {
    setIsAdding(false);
    openCart();
  }, 500);
};
```

**Solución B — Eliminar el delay (más simple):**

Si no hay una animación visible que requiera los 500ms, simplemente llamar `openCart()` de forma síncrona:

```typescript
const handleAddToCart = () => {
  setIsAdding(true);
  addItem({ ... });
  openCart();
  // Reset isAdding en el siguiente tick
  requestAnimationFrame(() => setIsAdding(false));
};
```

**La Solución A es preferida** porque preserva el feedback visual de "ADDING..." (500ms) sin el riesgo.

### Verificación de Iteración 3

- [ ] Navegar a un producto → hacer clic en "ADD TO BAG" → esperar que el carrito abra en la misma página ✓
- [ ] Hacer clic en "ADD TO BAG" → **inmediatamente** navegar a otra página usando el botón "atrás" → el carrito **no** debe abrirse en la página destino
- [ ] `npm run type-check` y `npm run lint` pasan

---

## Iteración 4 — `components/Header.tsx` + Páginas de Cuenta

**Bugs cubiertos:** #6 (stale closure en Header), #7 (setState en componentes desmontados)

**Motivo de agrupar:** Son cambios independientes entre sí pero de baja complejidad y bajo riesgo. Agruparlos en una sola iteración reduce el número de ciclos de verificación. Ninguno de los dos depende de los cambios de las iteraciones anteriores.

### 4.1 — Bug #6: Corregir stale closure en Header

**Archivo:** `components/Header.tsx`, líneas 49–71

**Problema:** `shopOpen` y `supportOpen` se usan dentro del `useEffect` pero están excluidos de las dependencias (suprimido con `eslint-disable`). El efecto siempre lee los valores del primer render.

**Análisis más profundo:** El efecto está tratando de sincronizar el estado del menú con la ruta actual. La lógica condicional `if (!shopOpen)` / `if (shopOpen || supportOpen)` intenta evitar actualizaciones innecesarias. Con `useCallback` en los setters (que ya son estables en React), la forma correcta es:

```typescript
// ANTES — stale closure
useEffect(() => {
  if (!mounted) return;
  const isShopRoute = ...;
  const isSupportRoute = ...;

  if (isShopRoute) {
    if (!shopOpen) {        // ← lee shopOpen del primer render (stale)
      setShopOpen(true);
      setSupportOpen(false);
    }
  } else if (isSupportRoute) {
    if (!supportOpen) {    // ← lee supportOpen del primer render (stale)
      setSupportOpen(true);
      setShopOpen(false);
    }
  } else {
    if (shopOpen || supportOpen) {  // ← stale
      setShopOpen(false);
      setSupportOpen(false);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [pathnameWithoutLocale, mounted]);

// DESPUÉS — sin stale closure, sin condicionales redundantes
useEffect(() => {
  if (!mounted) return;
  const isShopRoute = pathnameWithoutLocale.includes('/collections') || pathnameWithoutLocale.endsWith('/collections/all');
  const isSupportRoute = (pathnameWithoutLocale.includes('/pages/') && !pathnameWithoutLocale.endsWith('/pages/chapters')) || pathnameWithoutLocale.includes('/support');

  setShopOpen(isShopRoute);
  setSupportOpen(isSupportRoute);
}, [pathnameWithoutLocale, mounted]);
```

**Justificación:** Los setters de `useState` son idempotentes — llamar `setShopOpen(false)` cuando ya es `false` no causa re-render. Eliminar los `if (!shopOpen)` guards simplifica el código y elimina la necesidad de leer el estado actual, eliminando el stale closure completamente.

---

### 4.2 — Bug #7: Cancelar `async/await` con `setTimeout` en páginas de cuenta

**Archivos:** `account/register/page.tsx` (l.52), `account/profile/page.tsx` (l.25), `account/forgot-password/page.tsx` (l.22), `vender/page.tsx` (l.36)

**Patrón del problema:** Cada página tiene un `async` handler que llama `await new Promise(resolve => setTimeout(resolve, N))`. Si el usuario navega durante la espera, el componente se desmonta pero el timer sigue corriendo y llama `setState` o `router.push` sobre un componente desmontado.

**Solución — Patrón `AbortController` con ref:**

```typescript
// Patrón a aplicar en cada página afectada
import { useRef, useEffect } from 'react';

export default function RegisterPage() {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (!mountedRef.current) return;  // ← guard antes de cualquier setState/push
      router.push(`/${locale}/account`);
    } catch (error) {
      if (!mountedRef.current) return;
      console.error(error);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };
}
```

**Archivos a modificar con este patrón:**
1. `app/[locale]/account/register/page.tsx`
2. `app/[locale]/account/profile/page.tsx`
3. `app/[locale]/account/forgot-password/page.tsx`
4. `app/[locale]/vender/page.tsx`

### Verificación de Iteración 4

- [ ] Navegar entre páginas de shop mientras el menú está abierto → el menú se cierra correctamente al ir a una ruta no-shop
- [ ] Estar en `/collections/all` → el menú SHOP aparece expandido al cargar
- [ ] En `/register`: hacer clic en registrar → **antes** de los 1.5s, navegar a otra página → no aparecen errores de "setState on unmounted component" en consola
- [ ] Mismo test para `/profile` (editar perfil) y `/forgot-password`
- [ ] `npm run type-check` y `npm run lint` pasan

---

## Resumen de Cambios por Archivo

| Archivo | Iteración | Líneas afectadas | Tipo de cambio |
|---------|-----------|-----------------|---------------|
| `store/cartStore.tsx` | 1 | 3, 58–71, 96, 103, 117, 121–134, 136–141 | `useCallback` + `calculateTotals` param |
| `app/[locale]/checkout/page.tsx` | 1+2 | 100–117, 93–98, 181–197, 227–235 | Deps useEffect + useRef + router.push |
| `app/[locale]/products/[slug]/ProductContent.tsx` | 3 | 1, 30–47 | useRef + cleanup |
| `components/Header.tsx` | 4 | 49–71 | Simplificar useEffect |
| `app/[locale]/account/register/page.tsx` | 4 | 1–70 | mountedRef guard |
| `app/[locale]/account/profile/page.tsx` | 4 | 1–50 | mountedRef guard |
| `app/[locale]/account/forgot-password/page.tsx` | 4 | 1–40 | mountedRef guard |
| `app/[locale]/vender/page.tsx` | 4 | 30–45 | mountedRef guard |

---

## Flujo de Git

Cada iteración termina con un commit atómico. Las correcciones de bugs relacionados van en el mismo commit, nunca mezclados con otros bugs.

```bash
# Iteración 1
git add store/cartStore.tsx app/[locale]/checkout/page.tsx
git commit -m "fix(cart): prevent infinite loop in shipping useEffect and preserve shipping on quantity change"

# Iteración 2
git add app/[locale]/checkout/page.tsx
git commit -m "fix(checkout): remove racy setTimeout on back button and guard empty-cart redirect during submit"

# Iteración 3
git add "app/[locale]/products/[slug]/ProductContent.tsx"
git commit -m "fix(product): cleanup add-to-cart setTimeout on unmount to prevent cart opening on wrong page"

# Iteración 4
git add components/Header.tsx "app/[locale]/account/**" "app/[locale]/vender/page.tsx"
git commit -m "fix(header,account): fix stale closure in nav effect and guard async setState on unmounted pages"

# Push final
git push -u origin claude/claude-code-mobile-guide-oV6Nb
```

---

## Riesgos y Consideraciones

| Riesgo | Iteración | Mitigación |
|--------|-----------|------------|
| `useCallback` con deps vacías puede capturar closures incorrectos | 1 | Verificado: todas las funciones del store usan setter funcional `setCart(prev => ...)`, por lo que no necesitan leer `cart` directamente |
| Simplificar el `useEffect` del Header podría cambiar el comportamiento de los guards de "no-rerender" | 4 | Los setters de `useState` en React no re-renderizan si el valor no cambia (misma referencia primitiva). `setShopOpen(false)` cuando ya es `false` = no-op |
| El patrón `mountedRef` no cancela el `setTimeout` real, solo ignora el resultado | 4 | Aceptable en este contexto (no son operaciones de red ni efectos secundarios externos). Si en el futuro se integra un backend real, reemplazar con `AbortController` |
| Bug #4: `router.push('/cart?open=1')` requiere que la página de cart maneje el param `open` | 2 | El cambio complementario en `cart/page.tsx` es parte de la misma iteración. Si no se desea el parámetro, la alternativa más simple es `router.push('/cart')` sin abrir el drawer |
