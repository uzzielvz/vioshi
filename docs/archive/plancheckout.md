> ⚠️ **DOCUMENTO HISTÓRICO** — Archivado en CLN-07. Checkout sigue mock; ver [`PLAN.md`](../../PLAN.md) Fase 2.
> Docs vivas: [`RESEARCH-CONSOLIDADO.md`](../../RESEARCH-CONSOLIDADO.md) · [`README.md`](./README.md)

# Plan: Checkout + Login — Legibilidad, UX y Auditoría

> Creado: 2026-03-17
> Regla: una iteración a la vez — type-check + build antes de commitear

---

## Diagnóstico actual

### Checkout — qué salió mal

El checkout fue diseñado con extremo minimalismo tipo editorial. Funciona visualmente
como un lookbook pero falla como formulario de compra:

| Problema | Causa | Impacto |
|---|---|---|
| Section labels en 9px gris (`text-[9px] text-gray-400`) | `SECTION_LABEL` demasiado sutil | El usuario no sabe dónde empieza cada sección |
| Inputs solo con borde inferior (`border-b border-gray-200`) | `INPUT` sin fondo ni contenedor | Campos casi invisibles, difícil saber dónde clickear |
| Texto del botón Submit en 10px | `text-[10px]` en el CTA principal | CTA principal ilegible, especialmente en mobile |
| Sección "Save info" fuera de contexto | Copia UX de Shop.app con prefijo `+52` | Confunde al usuario — no es una tienda de Shop |
| Sin separación visual entre secciones | Solo `space-y-10` entre bloques | Contact, Delivery y Payment se mezclan visualmente |
| Sin numeración o progreso | No hay indicación de flujo | Usuario no sabe cuántos pasos quedan |
| Sin "Volver a la tienda" en header | Solo VIOGI logo (navega al home) | No hay escape claro si el usuario cambia de opinión |
| Totales en columna derecha casi invisibles | `text-[10px] text-gray-400` en labels | Los precios del resumen son difíciles de leer |

### Login — qué falta

| Problema | Impacto |
|---|---|
| Sin link "Volver a la tienda" | Usuario atrapado — debe usar botón Back del navegador |
| Sin selector de idioma | Si llegó al login en `/en/`, no puede cambiarse a `/es/` |
| Inputs sin `name` ni `id` | El formulario no puede ser enviado (no está conectado a nada) |
| Google OAuth sin handler | Botón presente pero no hace nada |

---

## Iteración C-1 — Legibilidad del Checkout

**Scope:** Solo mejoras visuales/tipográficas. Sin cambios de lógica.
**Archivos:** `app/[locale]/checkout/page.tsx`

### C-1.1 Section labels más prominentes

```tsx
// Antes
const SECTION_LABEL = 'text-[9px] uppercase tracking-widest text-gray-400';

// Después — más grande, más peso, línea separadora
const SECTION_LABEL = 'text-[11px] uppercase tracking-widest text-black font-medium';
```

Cada `<section>` del form recibe un separador visual:

```tsx
// Antes
<p className={`${SECTION_LABEL} mb-6`}>{t('contact')}</p>

// Después — con número de paso + borde superior
<div className="flex items-center gap-3 mb-6 pt-2 border-t border-gray-100">
  <span className="text-[9px] text-gray-300 tracking-widest">01</span>
  <p className="text-[11px] uppercase tracking-widest font-medium">{t('contact')}</p>
</div>
```

Numeración: 01 Contacto · 02 Entrega · 03 Envío · 04 Pago

### C-1.2 Inputs con fondo sutil

Los inputs actuales son underline-only. Agregar un fondo muy ligero que los hace
identificables sin perder el minimalismo:

```tsx
// Antes
const INPUT = 'w-full py-3.5 border-b border-gray-200 bg-transparent...';

// Después — fondo en focus, placeholder más visible
const INPUT = 'w-full py-3.5 border-b border-gray-200 bg-transparent ' +
  'focus:outline-none focus:border-black focus:bg-gray-50/50 ' +
  'placeholder:text-gray-300 placeholder:text-[11px] placeholder:tracking-wider ' +
  'text-sm transition-all duration-150';
```

### C-1.3 Botón Submit legible

```tsx
// Antes
className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-widest..."

// Después
className="w-full bg-black text-white py-4 text-[12px] uppercase tracking-widest font-medium..."
```

### C-1.4 Resumen de orden más legible

Labels del resumen:
```tsx
// Antes — casi invisible
<span className="text-[10px] uppercase tracking-widest text-gray-400">{t('subtotal')}</span>

// Después — distinguible del valor
<span className="text-[11px] uppercase tracking-widest text-gray-500">{t('subtotal')}</span>
<span className="text-[12px] text-black">{formatPrice(subtotal, locale)}</span>
```

Total (ya grande con `text-xl font-light`) queda bien — solo ajustar los labels secundarios.

### C-1.5 Eliminar sección "Save info" / Shop.app

La sección actual:
```tsx
<section>
  <p className={`${SECTION_LABEL} mb-6`}>{t('save_info_title')}</p>
  <div className="flex items-end gap-3">
    <span>+52</span>
    <input type="tel" name="mobilePhone" placeholder={t('mobile_phone')} />
  </div>
  <p>{t('shop_terms_text')} ...</p>
</section>
```

Reemplazar por un checkbox simple:
```tsx
<label className="flex items-center gap-2.5 cursor-pointer">
  <CustomCheckbox checked={formData.saveInfo} onChange={...} />
  <span className="text-[11px] text-gray-500">{t('save_info_title')}</span>
</label>
```

Eliminar del `CheckoutFormData`: `mobilePhone`, `saveInfo` (o simplificar a boolean).
Eliminar del `messages/es.json` y `messages/en.json`: `shop_terms_text`, `shop_terms_link`,
`shop_and`, `shop_privacy_link`, `shop_terms_end`, `mobile_phone`.

**Verificación C-1:**
- [ ] Los 4 section labels se leen cómodamente
- [ ] Los inputs tienen contraste suficiente para identificarlos
- [ ] El botón Submit se lee bien en mobile
- [ ] La sección Shop.app desapareció
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅

---

## Iteración C-2 — Header del Checkout + Back to Store

**Scope:** Header del checkout. Sin cambios de lógica.
**Archivos:** `app/[locale]/checkout/page.tsx`

### C-2.1 Agregar "Volver a la tienda"

El header actual solo tiene el logo VIOGI y el ícono del carrito. Agregar link de regreso:

```tsx
// Header del checkout — estructura actual
<div className="flex items-center justify-between h-16">
  <button onClick={...}>VIOGI</button>
  <button aria-label={t('back_to_cart_aria')}>🛍 icono</button>
</div>

// Propuesta
<div className="flex items-center justify-between h-16">
  {/* Izquierda: logo */}
  <button onClick={navigateHome}>VIOGI</button>

  {/* Centro: breadcrumb / back link */}
  <button
    onClick={() => router.push(`/${locale}/cart`)}
    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
  >
    ← {t('back_to_cart_aria')}
  </button>

  {/* Derecha: idioma */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => switchLocale('es')}
      className={`text-[10px] uppercase tracking-widest transition-colors ${locale === 'es' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
    >
      ES
    </button>
    <span className="text-gray-200 text-[10px]">/</span>
    <button
      onClick={() => switchLocale('en')}
      className={`text-[10px] uppercase tracking-widest transition-colors ${locale === 'en' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
    >
      EN
    </button>
  </div>
</div>
```

Función `switchLocale` (igual que en Header.tsx):
```tsx
const switchLocale = (newLocale: 'es' | 'en') => {
  if (newLocale === locale) return;
  window.location.href = `/${newLocale}/checkout`;
};
```

Agregar claves en messages:
```json
// en.json
"back_to_store": "BACK TO STORE"

// es.json
"back_to_store": "VOLVER A LA TIENDA"
```

**Verificación C-2:**
- [ ] Click en "← Volver al carrito" navega correctamente a `/[locale]/cart`
- [ ] Switch ES/EN en el header del checkout funciona
- [ ] En `/en/checkout` el switch muestra EN activo
- [ ] `npm run type-check` ✅

---

## Iteración C-3 — Mejoras al Login

**Scope:** `app/[locale]/account/page.tsx` y `app/[locale]/account/register/page.tsx`
**Archivos:** 2 páginas de account

### C-3.1 Volver a la tienda

```tsx
// Agregar debajo del logo, antes de los títulos
<div className="text-center mb-5">
  <Link
    href={`/${locale}`}
    className="text-[10px] uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
  >
    ← {t('back_to_store')}
  </Link>
</div>
```

Clave nueva en messages:
```json
// account.back_to_store
"back_to_store": "BACK TO STORE"  // en
"back_to_store": "VOLVER A LA TIENDA"  // es
```

### C-3.2 Selector de idioma en login

```tsx
// Agregar al final de la tarjeta, después del link "Crear Cuenta"
<div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-gray-200">
  <button
    onClick={() => switchLocale('es')}
    className={`text-[10px] uppercase tracking-widest ${locale === 'es' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
  >
    ES / MXN
  </button>
  <span className="text-gray-200">|</span>
  <button
    onClick={() => switchLocale('en')}
    className={`text-[10px] uppercase tracking-widest ${locale === 'en' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
  >
    EN / USD
  </button>
</div>
```

### C-3.3 Agregar `name` e `id` a los inputs

Los inputs del login actualmente no tienen `name` ni `id`. Sin estos, `htmlFor` en
labels no funciona y el password manager del browser no puede auto-completar.

```tsx
// Antes
<input type="email" placeholder="Email" className="..." />
<input type="password" placeholder="Password" className="..." />

// Después
<input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  placeholder={t('email_placeholder')}
  className="..."
/>
<input
  id="password"
  name="password"
  type="password"
  autoComplete="current-password"
  placeholder={t('password_placeholder')}
  className="..."
/>
```

### C-3.4 Aplicar mismo `back_to_store` + locale switcher a register y forgot-password

Las 3 páginas de account deben ser consistentes:
- `account/page.tsx` (login)
- `account/register/page.tsx`
- `account/forgot-password/page.tsx`

**Verificación C-3:**
- [ ] Login muestra "← Volver a la tienda" que navega al home
- [ ] Switcher ES/EN funciona en el login
- [ ] Browser autocomplete sugiere email/password en login
- [ ] Register y forgot-password tienen los mismos elementos
- [ ] `npm run type-check` ✅

---

## Iteración C-4 — Validación inline (reemplazar alert())

**Scope:** `app/[locale]/checkout/page.tsx`
**Archivos:** 1 archivo

El checkout tiene 3 `alert()` y 1 `alert()` de error genérico. Reemplazar con
mensajes inline.

### Estrategia

```tsx
// Estado de errores
const [formErrors, setFormErrors] = useState<{
  terms?: string;
  address?: string;
  pickup?: string;
  general?: string;
}>({});

// En handleSubmit — reemplazar alerts:

// Antes
if (!formData.agreeToTerms) { alert(t('alert_terms')); return; }
if (!hasValidAddress) { alert(t('alert_address')); return; }
if (isPickup && !formData.pickupPointId) { alert(t('alert_pickup')); return; }

// Después
const errors: typeof formErrors = {};
if (!formData.agreeToTerms) errors.terms = t('alert_terms');
if (!hasValidAddress) errors.address = t('alert_address');
if (isPickup && !formData.pickupPointId) errors.pickup = t('alert_pickup');

if (Object.keys(errors).length > 0) {
  setFormErrors(errors);
  // Scroll al primer error
  const firstErrorEl = document.querySelector('[data-error]');
  firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return;
}
setFormErrors({});
```

### Dónde mostrar los errores

```tsx
// Error de términos — debajo del checkbox de términos
{formErrors.terms && (
  <p data-error className="text-[10px] text-red-500 mt-1">{formErrors.terms}</p>
)}

// Error de dirección — debajo del bloque de address
{formErrors.address && (
  <p data-error className="text-[10px] text-red-500 mt-1">{formErrors.address}</p>
)}

// Error de pickup — debajo del selector de punto
{formErrors.pickup && (
  <p data-error className="text-[10px] text-red-500 mt-1">{formErrors.pickup}</p>
)}

// Error general — sobre el botón submit
{formErrors.general && (
  <div className="bg-red-50 border border-red-200 px-4 py-3">
    <p className="text-[11px] text-red-600">{formErrors.general}</p>
  </div>
)}
```

**Verificación C-4:**
- [ ] Submit sin aceptar términos muestra error inline (no alert)
- [ ] Submit sin dirección completa muestra error inline
- [ ] Error de servidor muestra banner inline
- [ ] Los errores desaparecen al corregir el campo
- [ ] `npm run type-check` ✅

---

## Iteración C-5 — Auditoría general del código

**Scope:** Todo el proyecto.
**Objetivo:** Detectar y documentar bugs restantes, código muerto, inconsistencias.

### 5.1 Audit de TypeScript

```bash
npm run type-check 2>&1
```

Revisar warnings (no solo errors). Documentar cualquier `any` implícito,
props sin tipar, o aserciones `as` cuestionables.

### 5.2 Audit de i18n

Verificar que todas las claves usadas con `t('...')` existan en AMBOS archivos de messages.

```bash
# Claves usadas en código que no están en messages
grep -r "t('" --include="*.tsx" --include="*.ts" | grep -v "//.*t('" | \
  sed "s/.*t('\([^']*\)').*/\1/" | sort -u > /tmp/keys_used.txt

# Comparar contra messages/es.json (manualmente o con jq)
```

Inconsistencias conocidas a verificar:
- `checkout/page.tsx` usa `t('agreeTerms')` vs clave real en messages (`agreeToTerms` no existe en messages)
- `account/page.tsx` — inputs sin i18n para placeholder

### 5.3 Audit de links locale

Verificar que NO haya links sin prefijo `/${locale}/` en páginas client-side.

```bash
grep -r "href=\"/" --include="*.tsx" | grep -v "href=\"/\${locale}" | grep -v "href=\"/api"
```

Excluir: `/api/*`, links externos con `http`, y el `href="/"` de `not-found.tsx` (correcto).

### 5.4 Audit de console.log y código debug

```bash
grep -rn "console\.log\|console\.warn\|TODO\|FIXME\|HACK" --include="*.tsx" --include="*.ts"
```

Limpiar antes de cualquier deploy a producción.

### 5.5 Audit de imágenes rotas

```bash
# Verificar que todos los paths de imagen en products.ts existen en /public/
grep "image:" lib/products.ts | sed "s/.*image: \"\(.*\)\".*/\1/"
# Luego verificar manualmente en public/products/
```

T-03: `JEANS WRANGLER-32x32- 250.png` tiene espacios — verificar si el archivo
físico existe con ese nombre exacto. Si no, corregir el slug en products.ts.

### 5.6 Audit de rutas sin página

Verificar que todas las rutas enlazadas desde Header y Footer tengan página:

| Ruta | Estado |
|---|---|
| `/[locale]/pages/legal` | ✓ Existe |
| `/[locale]/pages/chapters` | ✓ Existe (placeholder) |
| `/[locale]/pages/locaciones` | ✓ Existe |
| `/[locale]/pages/accessibility` | ✓ Existe |
| `/[locale]/vender` | ✓ Existe |
| `/[locale]/archive` | ✓ Existe |
| `/[locale]/account/profile` | ✓ Existe (placeholder) |
| `/[locale]/account/orders` | ✓ Existe (placeholder) |
| `/[locale]/account/addresses` | ✓ Existe (placeholder) |
| `/[locale]/account/archivos` | ✓ Existe |

### 5.7 Audit de ClientLayout — rutas ocultas

`ClientLayout` oculta Header/Footer en `/account/*`. Verificar que:
1. No hay ruta en `/account/*` que necesite el Header/Footer
2. El `pt-16` no se aplica en account (layout sin header) — las páginas de account
   deben gestionar su propio padding (actualmente usan `min-h-screen flex items-center justify-center`)

### 5.8 Detectar duplicación de lógica

- `getPathnameWithoutLocale` está definido en `Header.tsx` Y en `ClientLayout.tsx` de forma similar.
  Candidato para mover a `lib/utils.ts` y reutilizar.

- `switchLocale` pattern está en `Header.tsx`. Después de C-2, también en `checkout/page.tsx`.
  Si se repite en login (C-3), crear hook `useLocaleSwitch()`.

---

## Orden de ejecución

```
C-1: Legibilidad checkout (labels, inputs, botón, eliminar Shop.app section)
  └─ test visual en /es/checkout y /en/checkout
  └─ type-check + build → commit

C-2: Header checkout (back to cart, locale switcher)
  └─ test en ambos locales
  └─ type-check → commit

C-3: Login mejorado (back to store, locale, autocomplete)
  └─ test en ambos locales
  └─ type-check → commit

C-4: Validación inline (eliminar alert())
  └─ test los 3 casos de error
  └─ type-check → commit

C-5: Auditoría general
  └─ Documentar hallazgos en research.md
  └─ Corregir bugs encontrados
  └─ type-check + lint + build → commit final
```

---

## Pendiente fuera de scope de este plan

| Item | Plan |
|---|---|
| Card masking (GUI-02) | Iterar después de C-5 |
| Sticky CTA mobile (GUI-03) | Iterar después de C-5 |
| Hydration skeleton (GUI-05) | Iterar después de C-5 |
| Submit real con backend | Fase 2.3 (Supabase + MercadoPago) |
| Google OAuth funcional | Fase 2.2 (NextAuth.js) |
