# TESTING-PLAN.md — VIOGI E-commerce

**Fecha de creación:** 2026-05-23  
**Última actualización:** 2026-05-27  
**Versión:** 1.1 (Estado real documentado)  
**Estado:** Infraestructura parcial + 1 test unitario escrito. Plan necesita reactivación.

**Propósito:** Definir cómo probar **todo el sistema** de forma profesional, priorizada y sostenible, adaptada a las características reales de VIOGI.

> **Filosofía del plan:** No vamos a escribir tests por escribir tests. Vamos a hacer **preguntas constantes**, exploración de código, análisis de riesgos y pruebas incrementales hasta que el sistema tenga la protección que realmente necesita.

---

## Estado Actual (Actualizado 2026-05-27)

| Aspecto                        | Estado                  | Detalle |
|--------------------------------|-------------------------|--------|
| **Infraestructura**            | Parcialmente completa   | Vitest + RTL + Playwright instalados. Configs (`vitest.config.ts`, `playwright.config.ts`, `vitest.setup.ts`) existen. Scripts de test en `package.json`. |
| **Estructura de carpetas**     | Creada                  | `tests/unit/`, `tests/integration/`, `tests/e2e/` |
| **Tests escritos**             | Muy bajo                | Solo 1 archivo: `tests/unit/lib/cart/reconcile.test.ts` (bastante completo, cubre casos principales de reconciliación). |
| **Fase 0 del plan**            | Parcialmente ejecutada  | Setup técnico iniciado pero nunca documentado ni terminado formalmente. |
| **Fase 1 (Protección del dinero)** | **Sin comenzar**     | No hay tests de `createPaymentIntentAction`, webhook de Stripe, ni lookups de órdenes. |
| **Integración en CI**          | No existe               | `.github/workflows/ci.yml` solo ejecuta lint + type-check + build. |
| **TESTING-PLAN.md**            | Desactualizado          | Este documento no se actualizó desde su creación hasta mayo 2026. |

**Conclusión del estado actual:**  
Se hizo un esfuerzo inicial de infraestructura, pero el trabajo real de pruebas se detuvo muy temprano. Estamos todavía al inicio de Fase 0 / antes de Fase 1.

---

## 1. Entendimiento Profundo del Sistema (Base del Plan)

### 1.1 Naturaleza del producto
VIOGI es un e-commerce de streetwear premium con **transacciones reales de dinero** (Stripe Payment Element en MXN). No es una aplicación de juguete. Los bugs en checkout, precios, autenticación de invitados o webhooks tienen impacto financiero y de confianza directo.

### 1.2 Arquitectura clave relevante para testing (verificada en código)

**Stack principal:**
- Next.js 14 App Router + TypeScript strict
- Supabase (SSR + RLS + service_role)
- Stripe (Payment Element + PaymentIntents + Webhooks)
- next-intl (es/en)
- Gemini + pgvector para búsqueda visual

**Flujos críticos identificados (exploración profunda):**

1. **Checkout de dinero (el más importante)**
   - `app/[locale]/checkout/page.tsx` (Client-heavy con Stripe Elements + sessionStorage)
   - `createPaymentIntentAction` (Server Action crítica en `app/[locale]/checkout/actions.ts`)
     - Reconciliación de carrito (`lib/cart/reconcile.ts`)
     - Validación estricta de precios contra DB
     - Validación de pickup points contra DB
     - Cálculo server-side de totales
     - Creación de `orders` + `order_items` con snapshots
     - Creación de PaymentIntent
     - Generación de `guest_token` HMAC usando `ADMIN_SECRET`
   - `/checkout/return` (manejo de `redirect_status` + sessionStorage)
   - `/checkout/success/[orderId]` (múltiples estrategias de lookup)
   - Webhook `/api/webhooks/stripe` (idempotente, actualiza `payment_status`)

2. **Búsqueda de pedidos de invitados (seguridad crítica)**
   - `getOrderByNumber`, `getOrderByPaymentReference`, `getGuestOrderByPaymentIntent` en `lib/orders.ts`
   - Tres caminos diferentes de lookup
   - Uso de `createAdminClient()` (bypass RLS) + verificación de `guest_token`
   - Token generado como: `HMAC-SHA256(order_number:email, ADMIN_SECRET)`

3. **Autenticación dual (dos sistemas completamente separados)**
   - **Usuarios normales:** Supabase Auth (email/password + Google OAuth) → RLS fuerte
     - Server Actions en `app/[locale]/account/actions.ts`
     - `app/auth/callback/route.ts`
   - **Admin:** Cookie firmada HMAC (nunca contiene el secreto en claro)
     - `lib/admin/session.ts` (HMAC-SHA256 + expiración)
     - `loginAction` con rate limiting (`lib/rate-limit.ts`)
     - `requireAdminSession()` en todas las actions de admin
     - Middleware protege `/admin/*`

4. **Carrito**
   - Solo `localStorage` (`store/cartStore.tsx`)
   - Protección real ocurre en `reconcileCartItems` + `createPaymentIntentAction`

5. **Búsqueda visual (costo + abuso)**
   - `app/api/visual-search/route.ts` (público, rate-limited a 10/min por IP)
   - Llama a Gemini Flash (descripción) + Gemini Embedding (768 dims)
   - Luego RPC `match_products_by_image`
   - Usa `createAdminClient()` (service_role)

6. **Admin CRUD (productos + imágenes + pickup points)**
   - `app/admin/products/actions.ts` (create/update/delete + upload a Storage + `product_attributes`)
   - `app/admin/pickup-points/actions.ts`
   - Subidas de imágenes con validación básica (tipo y 5MB)

### 1.3 Riesgos identificados (de RESEARCH-CONSOLIDADO + exploración propia)

| Riesgo | Severidad | Por qué es peligroso | Probabilidad de bug sin tests |
|--------|-----------|----------------------|-------------------------------|
| Manipulación de precios en localStorage | Alta | Dinero real | Media (ya hay reconciliación) |
| Guest token HMAC roto o predecible | Crítica | Acceso a pedidos ajenos | Baja (pero impacto altísimo) |
| Webhook de Stripe falla o no es idempotente | Alta | Órdenes quedan en mal estado | Media |
| Rollback incompleto en `createPaymentIntentAction` | Alta | Órdenes huérfanas | Media |
| SessionStorage perdido en redirecciones de Stripe | Media | Flujo de invitado roto | Alta |
| Rate limit de visual search insuficiente | Media | Costos Gemini descontrolados | Media |
| Admin auth débil (ya mejorado, pero sigue siendo crítico) | Alta | Compromiso total del panel | Baja (después del endurecimiento) |
| Inconsistencia pickup points (memoria vs DB) | Media | Precios/tiempos incorrectos | Alta |
| RLS mal configurado en orders/addresses | Crítica | Fuga de datos de usuarios | Media |

---

## 2. Estrategia General de Testing

### 2.1 Pirámide adaptada a VIOGI (no la pirámide genérica)

```
                    /\
                   /  \     ← E2E Críticos (Playwright) — 8-12 tests máximo
                  /____\    ← Integration de Server Actions + Webhooks
                 /      \   ← Component Tests (solo UI de alto riesgo)
                /________\  ← Unit Tests (lógica pura + helpers)
```

**Proporción objetivo (Balanced & Practical):**
- 60% Unit + Helpers puros
- 25% Integration (Server Actions + Route Handlers)
- 10% Component Tests
- 5% E2E (pero los más valiosos del mundo)

### 2.2 Principios que seguiremos

1. **Tests que protegen dinero y confianza primero.**
2. **Preferimos tests de comportamiento sobre implementación.**
3. **Mocks agresivos de Stripe, Supabase y Gemini** (nunca llamamos servicios reales en la mayoría de tests).
4. **Un test de E2E con Stripe real (test mode) vale más que 20 unit tests** en el flujo de checkout.
5. **Iteración constante:** Vamos a escribir tests → correrlos → descubrir huecos → hacer más preguntas → refinar.
6. **No perseguimos 100% coverage.** Perseguimos "cobertura de riesgo".

---

## 3. Inventario Detallado de Casos de Prueba (por capas)

### 3.1 Capa Unitaria (Lógica pura y helpers)

**Alta prioridad (escribir primero):**

- `lib/cart/reconcile.ts`
  - UUID válido → mapea correctamente
  - Slug legacy → resuelve a UUID actual + precio actual
  - Producto no existe → error claro
  - Carrito vacío → error
  - Mezcla de legacy + UUID

- `lib/admin/session.ts`
  - `createAdminSessionToken` genera token válido
  - `verifyAdminSessionToken` acepta token válido
  - Rechaza token expirado
  - Rechaza token mal firmado
  - Rechaza legacy plaintext (sin punto)

- `lib/rate-limit.ts`
  - Ventana fija funciona
  - `pruneExpired` limpia correctamente
  - Diferentes keys no se afectan

- `lib/formatters.ts` (priceInMXN, priceInUSD, etc.)

- `lib/mexico.ts` (lookupCP)

- `lib/stripe/formatPaymentError.ts`

### 3.2 Capa Integration (Server Actions + Route Handlers)

**Máxima prioridad:**

1. **`createPaymentIntentAction`** (el test más importante del proyecto)
   - Precios correctos → crea orden + PaymentIntent + guest_token
   - Precio manipulado en carrito → rechaza con `price_changed`
   - Pickup point inactivo → `pickup_inactive`
   - Error en Stripe → rollback de la orden
   - Error guardando guest_token → orden existe pero token puede fallar (comportamiento actual)
   - Cálculo correcto de tax + shipping (home + pickup + express)

2. **Webhook de Stripe (`app/api/webhooks/stripe/route.ts`)**
   - `payment_intent.succeeded` actualiza orden correctamente
   - Idempotencia (mismo evento 3 veces → solo un update)
   - Firma inválida → 400
   - Falta `STRIPE_WEBHOOK_SECRET` → 500 controlado
   - Evento desconocido → 200 (no falla)

3. **Auth de usuarios**
   - `signUpAction` con password < 8 caracteres
   - Email ya registrado
   - `signInAction` credenciales inválidas
   - Flujo de reset password (hasta donde se pueda sin email real)

4. **Direcciones (`addresses/actions.ts`)**
   - Usuario no autenticado → error
   - `setDefaultAddressAction` desactiva el anterior default
   - RLS se respeta (usando cliente anon vs service_role en tests)

5. **Admin actions** (usando `requireAdminSession` mockeado)
   - CRUD de productos con imágenes
   - Validación de tipos MIME y tamaño

### 3.3 RLS Testing (solicitado explícitamente por el usuario)

**Enfoque recomendado:**
- Crear un conjunto de tests de integración que usen **dos clientes**:
  - `createClient()` (anon / usuario autenticado)
  - `createAdminClient()` (service_role)
- Verificar que:
  - Usuario A **no puede** leer órdenes de Usuario B vía RLS
  - Usuario no autenticado **no puede** leer `addresses` ajenas
  - `pickup_points` inactivos no aparecen con anon key
  - Columna `embedding` está protegida (migración 0005)

Esto requiere o bien:
- Un proyecto Supabase de testing separado, o
- Correr contra la misma DB pero con datos de test aislados + limpieza

### 3.4 Component Tests (React Testing Library)

Prioridad media-baja. Solo componentes con lógica compleja de UI:

- `ClearCartOnMount`
- Formularios de checkout complejos (si se separan)
- `AddressesClient` (useOptimistic + useActionState)
- Componentes de manejo de errores de Stripe

### 3.5 E2E con Playwright (los tests que más confianza dan)

**Fase 1 (local, Stripe test mode):**

1. Usuario invitado compra producto → completa pago con `4242...` → ve página de éxito con datos correctos.
2. Usuario invitado intenta ver pedido de otro usando token inválido → 404 o error.
3. Usuario autenticado ve sus pedidos.
4. Admin puede crear/editar producto (flujo largo).
5. Búsqueda visual (básica).

**Características importantes a verificar en E2E:**
- Redirecciones de Stripe
- Limpieza de sessionStorage + localStorage
- Persistencia correcta de la orden
- Mensajes de error amigables

---

## 4. Estrategia de Mocks por Servicio Externo

| Servicio     | Estrategia de Mock                          | Cuándo usar real                  | Herramienta |
|--------------|---------------------------------------------|-----------------------------------|-----------|
| **Stripe**   | `vi.mock('@/lib/stripe')` + mocks de `paymentIntents.create` y `webhooks.constructEvent` | Solo en E2E (Stripe test mode + `stripe listen`) | Vitest + Stripe test helpers |
| **Supabase** | Mock del cliente (devuelve datos controlados) | Tests de RLS (contra DB real de test) | `vi.mock` + factories |
| **Gemini**   | Mock total de `@google/genai` | Nunca en CI normal                | Vitest |
| **Next.js navigation** | Mock de `redirect`, `revalidatePath`, `cookies` | Siempre en tests de Server Actions | `vi.mock('next/navigation')` + `next-test` utilities |
| **localStorage / sessionStorage** | Mock en jsdom | Siempre | `vi.stubGlobal` |

---

## 5. Enfoque Iterativo ("Hacer preguntas y pruebas")

Este plan **no es estático**. La forma correcta de ejecutarlo es:

1. **Exploración** → Leemos código + corremos la app manualmente.
2. **Preguntas** → ¿Qué puede salir mal aquí? ¿Qué asunciones estamos haciendo?
3. **Hipótesis de test** → Escribimos 1-3 tests que validen la hipótesis.
4. **Ejecución + descubrimiento** → Los tests fallan o pasan de formas inesperadas.
5. **Nuevas preguntas** → "¿Por qué falló esto?" → Nuevo caso de prueba.
6. Repetir hasta que el área se sienta "segura".

Este ciclo se aplicará especialmente en:
- Flujo completo de checkout
- Lookup de pedidos de invitados
- Webhook + estados de orden

---

## 6. Plan de Implementación por Fases (Balanced & Practical)

### Fase 0 — Fundamentos (4-6 horas)
- Instalar Vitest + React Testing Library + Playwright + tipos
- Configurar `vitest.config.ts` + setup de jsdom + mocks globales
- Configurar Playwright (`playwright.config.ts`)
- Añadir scripts: `test`, `test:watch`, `test:e2e`
- Primeros 3-4 unit tests de `reconcileCartItems` + `admin/session`

### Fase 1 — Protección del Dinero (10-12 horas) — **La más importante**
- Tests completos de `createPaymentIntentAction` (con mocks)
- Tests del Webhook de Stripe
- Tests de los tres métodos de lookup de órdenes
- Primer E2E de checkout invitado con tarjeta 4242 (local)

### Fase 2 — Seguridad y Auth (6-8 horas)
- Tests de `lib/admin/session.ts` exhaustivos
- Tests de rate limiting (admin login + visual search)
- Tests básicos de RLS (usando dos clientes)
- Tests de Server Actions de auth de usuarios

### Fase 3 — Cobertura de Calidad de Vida (6-8 horas)
- Admin CRUD (productos + imágenes)
- Direcciones + optimistic UI
- Componentes clave de UI
- Más E2E (login + ver pedidos, admin crea producto)

### Fase 4 — CI + Documentación + Mantenimiento (3-4 horas)
- Integrar tests en `.github/workflows/ci.yml`
- Añadir `test:e2e` en CI (con modo headless)
- Actualizar `CONTRIBUTING.md` o `README` con cómo correr tests
- Definir política de "tests requeridos para merge"

**Tiempo total estimado:** 30-38 horas → Dentro del presupuesto "Balanced & Practical".

---

## 7. Estructura de Archivos Recomendada

```
tests/
├── unit/
│   ├── lib/
│   │   ├── cart/
│   │   ├── admin/
│   │   └── formatters.test.ts
│   └── ...
├── integration/
│   ├── actions/
│   │   ├── checkout.test.ts
│   │   └── webhook-stripe.test.ts
│   └── rls/
│       └── orders-rls.test.ts
├── components/
└── e2e/
    ├── checkout.spec.ts
    └── admin.spec.ts
```

Convención: `*.test.ts` para Vitest, `*.spec.ts` para Playwright.

---

## 8. Próximos Pasos Inmediatos (Actualizado 2026-05-27)

**Estado:** La infraestructura básica ya existe. Ya no es necesario empezar desde cero.

### Pasos recomendados ahora:

1. **Actualizar este documento** (hecho en esta sesión) con el estado real.
2. **Completar Fase 0 pendiente** (bajo esfuerzo):
   - Terminar de pulir `vitest.setup.ts` si hace falta (mocks globales de localStorage/sessionStorage).
   - Escribir 2-3 tests adicionales para `lib/admin/session.ts` (ya es una prioridad alta).
3. **Decidir estrategia de datos de prueba** para RLS y Supabase (¿DB separada o prefijo `[test]`?).
4. **Empezar Fase 1** (Protección del Dinero) — esta es la prioridad real del proyecto:
   - Tests de `createPaymentIntentAction`
   - Tests del Webhook de Stripe
   - Tests de lookups de órdenes (guest + auth)
5. Agregar ejecución de tests al CI (`.github/workflows/ci.yml`).

**Recomendación fuerte:** No seguir escribiendo tests aleatorios. Seguir el orden del plan: primero terminar Fase 0 limpia + definir estrategia de datos, luego atacar Fase 1 con foco en `createPaymentIntentAction`.

---

## 9. Preguntas Abiertas Actuales (para refinar el plan)

- ¿Queremos aislar completamente los datos de test (nueva DB) o podemos usar la DB actual con prefijos `[test]`?
- ¿Cuánto estamos dispuestos a invertir en fixtures / factories de datos de prueba?
- ¿Deseamos contract tests contra el schema de Supabase (usando herramientas como `supabase` CLI + snapshots de tipos)?

---

**Este documento es vivo.** Se actualizará después de cada fase de implementación a medida que descubramos nuevos riesgos y mejores formas de probar el sistema.

---

## Historial de Actualizaciones del Plan

| Fecha       | Versión | Cambio |
|-------------|---------|--------|
| 2026-05-23  | 1.0     | Creación inicial del documento |
| 2026-05-27  | 1.1     | Se agregó sección **"Estado Actual"** con diagnóstico real del proyecto. Se actualizaron los "Próximos Pasos" reconociendo que parte de la infraestructura ya existe. Se documentó que solo hay 1 test unitario escrito (`reconcileCartItems`). |

*Fin del TESTING-PLAN.md — VIOGI*