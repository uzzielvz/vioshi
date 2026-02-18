# VIOGI - Roadmap de Implementación

> Documento de planificación técnica para completar la plataforma e-commerce

---

## 🔴 FASE 1: FUNCIONALIDADES CRÍTICAS

### 1.1 Backend y Base de Datos

**Objetivo:** Establecer la infraestructura de datos persistentes

#### Decisiones por tomar:
- [ ] **Base de datos**:
  - PostgreSQL (relacional, robusto, Vercel Postgres)
  - MongoDB (NoSQL, flexible, MongoDB Atlas)
  - **Recomendación**: PostgreSQL con Prisma ORM
- [ ] **ORM/Query Builder**:
  - Prisma (type-safe, migraciones automáticas)
  - Drizzle (lightweight, SQL-like)
  - Kysely (SQL builder)
- [ ] **Hosting de DB**:
  - Vercel Postgres (integración directa)
  - Supabase (incluye auth y storage)
  - PlanetScale (MySQL serverless)
  - Railway/Render

#### Implementación:
1. **Instalar dependencias**
   ```bash
   npm install prisma @prisma/client
   npm install -D prisma
   ```

2. **Inicializar Prisma**
   ```bash
   npx prisma init
   ```

3. **Definir schema** (`prisma/schema.prisma`)
   - Modelo Product (migrar desde mock data)
   - Modelo User
   - Modelo Order
   - Modelo OrderItem
   - Modelo Address
   - Modelo Review

4. **Crear migraciones**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seedear productos** (migrar `lib/products.ts` a DB)

6. **Crear API routes**
   - `app/api/products/route.ts` - GET todos los productos
   - `app/api/products/[slug]/route.ts` - GET producto individual
   - `app/api/categories/[category]/route.ts` - GET por categoría

#### Consideraciones:
- Configurar variables de entorno en `.env.local`
- Agregar `.env.local` a `.gitignore`
- Implementar connection pooling para serverless
- Manejar errores de conexión
- Implementar caching (React Cache, SWR, o React Query)

---

### 1.2 Autenticación de Usuarios

**Objetivo:** Sistema de login/registro funcional con sesiones persistentes

#### Decisiones por tomar:
- [ ] **Proveedor de autenticación**:
  - NextAuth.js (v5/Auth.js) - Integrado con Next.js
  - Clerk - UI pre-construida, fácil setup
  - Supabase Auth - Si usas Supabase como DB
  - Firebase Auth
  - Custom (JWT + bcrypt) - Más control
  - **Recomendación**: NextAuth.js v5 o Clerk

- [ ] **Métodos de login**:
  - Email/Password ✓
  - OAuth (Google, Facebook) ?
  - Magic Links ?
  - SMS/Phone ?

- [ ] **Almacenamiento de sesiones**:
  - JWT tokens
  - Database sessions
  - Cookies

#### Implementación con NextAuth.js:
1. **Instalar**
   ```bash
   npm install next-auth@beta @auth/prisma-adapter
   ```

2. **Configurar** `app/api/auth/[...nextauth]/route.ts`
   - Providers (credentials, Google, etc.)
   - Callbacks (session, JWT)
   - Páginas custom

3. **Crear provider** en `app/layout.tsx`

4. **Middleware** para rutas protegidas (`middleware.ts`)
   - Proteger `/account/*`
   - Proteger `/checkout`
   - Redirigir a `/account` si autenticado

5. **Actualizar páginas**
   - `/account` - Login/Register forms funcionales
   - `/account/profile` - Dashboard del usuario
   - `/account/orders` - Historial de pedidos
   - `/account/addresses` - Gestión de direcciones

#### Consideraciones:
- Hash de passwords (bcrypt, argon2)
- Rate limiting en login (prevenir brute force)
- Validación de email
- 2FA opcional
- Recuperación de contraseña
- Políticas de privacidad y términos

---

### 1.3 Checkout y Pagos

**Objetivo:** Flujo completo de compra con procesamiento de pagos

#### Decisiones por tomar:
- [ ] **Pasarela de pago**:
  - Stripe (internacional, bien documentado)
  - MercadoPago (LATAM, México)
  - PayPal
  - Openpay (México)
  - **Recomendación**: Stripe + MercadoPago

- [ ] **Métodos de pago a soportar**:
  - Tarjeta de crédito/débito ✓
  - OXXO (MercadoPago)
  - Transferencia bancaria
  - PayPal
  - Meses sin intereses

- [ ] **Flujo de checkout**:
  - One-page checkout
  - Multi-step checkout (Información → Envío → Pago)
  - **Recomendación**: Multi-step

#### Implementación:
1. **Crear página** `/app/checkout/page.tsx`
   - Step 1: Guest vs Login
   - Step 2: Información de contacto y envío
   - Step 3: Método de envío
   - Step 4: Método de pago
   - Step 5: Revisión y confirmación

2. **Instalar Stripe**
   ```bash
   npm install @stripe/stripe-js stripe
   ```

3. **API routes**
   - `app/api/checkout/session/route.ts` - Crear sesión de pago
   - `app/api/webhooks/stripe/route.ts` - Webhook para confirmaciones

4. **Integración con Stripe**
   - Crear Payment Intent
   - Stripe Elements para formulario de tarjeta
   - Manejar 3D Secure
   - Webhook para actualizar estado de orden

5. **Crear tabla Orders**
   - Guardar orden al iniciar checkout
   - Status: pending → processing → completed/failed
   - Asociar con User (o guest email)

6. **Página de confirmación** `/checkout/success/[orderId]`
   - Mostrar detalles de orden
   - Número de seguimiento
   - Email de confirmación

#### Consideraciones:
- Validación de stock antes de checkout
- Calcular envío dinámicamente (API de paquetería)
- Impuestos por región (IVA México)
- Códigos de descuento/cupones
- Manejo de errores de pago
- Retry logic
- PCI compliance (Stripe maneja esto)
- Testing en modo sandbox
- Checkout como guest (sin cuenta)

---

### 1.4 Gestión de Pedidos

**Objetivo:** Sistema completo de órdenes para usuarios y admin

#### Implementación:
1. **Modelo de datos** (Prisma schema)
   ```prisma
   model Order {
     id              String      @id @default(cuid())
     orderNumber     String      @unique
     userId          String?
     guestEmail      String?
     status          OrderStatus
     items           OrderItem[]
     subtotal        Float
     tax             Float
     shipping        Float
     total           Float
     shippingAddress Address
     billingAddress  Address?
     paymentMethod   String
     paymentStatus   PaymentStatus
     trackingNumber  String?
     createdAt       DateTime    @default(now())
     updatedAt       DateTime    @updatedAt
   }

   enum OrderStatus {
     PENDING
     PROCESSING
     SHIPPED
     DELIVERED
     CANCELLED
     REFUNDED
   }

   enum PaymentStatus {
     PENDING
     PAID
     FAILED
     REFUNDED
   }
   ```

2. **API routes**
   - `app/api/orders/route.ts` - GET (historial), POST (crear orden)
   - `app/api/orders/[orderId]/route.ts` - GET, PATCH (actualizar status)
   - `app/api/orders/[orderId]/cancel/route.ts` - Cancelar orden

3. **Páginas de usuario**
   - `/account/orders` - Lista de órdenes
   - `/account/orders/[orderId]` - Detalle de orden
   - Filtros: Todas, Pendientes, Enviadas, Completadas

4. **Email notifications**
   - Confirmación de orden
   - Orden enviada (con tracking)
   - Orden entregada

#### Consideraciones:
- Generación de número de orden único
- Estados de orden (máquina de estados)
- Historial de cambios (audit log)
- Cancelación de órdenes (reglas de negocio)
- Reembolsos parciales/totales
- Integración con sistema de paquetería

---

## 🟡 FASE 2: FUNCIONALIDADES IMPORTANTES

### 2.1 Búsqueda de Productos

**Objetivo:** Sistema de búsqueda funcional con filtros

#### Decisiones por tomar:
- [ ] **Tipo de búsqueda**:
  - Full-text search en DB (PostgreSQL `ts_vector`)
  - Algolia (search-as-a-service, rápido)
  - Elasticsearch (self-hosted)
  - MeiliSearch (open-source, rápido)
  - **Recomendación**: PostgreSQL full-text para inicio, Algolia si escala

#### Implementación:
1. **Actualizar modal de búsqueda** (Header)
   - Input con debouncing (300ms)
   - Resultados en tiempo real (dropdown)
   - Mostrar: imagen, nombre, precio, categoría
   - Link a página de resultados

2. **API route** `app/api/search/route.ts`
   ```typescript
   GET /api/search?q=hoodie&category=outerwear&minPrice=500&maxPrice=2000
   ```

3. **Página de resultados** `/app/search/page.tsx`
   - Query params desde URL
   - Misma UI que CategoryPage
   - Sidebar con filtros
   - "X resultados para 'query'"

4. **Indexación** (si usas Algolia)
   - Script para sincronizar productos
   - Webhook cuando se actualiza producto

#### Consideraciones:
- Búsqueda por: nombre, descripción, SKU, categoría
- Tolerancia a errores de tipeo (fuzzy search)
- Búsqueda en español (stemming)
- Autocompletado
- Sugerencias de búsqueda
- Analytics de búsquedas (qué buscan los usuarios)
- Resultados vacíos (sugerir productos relacionados)

---

### 2.2 Filtros y Ordenamiento

**Objetivo:** Filtrado avanzado en páginas de categoría

#### Implementación:
1. **UI de filtros** (Sidebar en CategoryPage)
   - Precio (slider con rango)
   - Tallas (checkboxes multi-select)
   - Colores (color swatches)
   - Disponibilidad (En stock)
   - Botón "Limpiar filtros"

2. **Componente de ordenamiento** (Dropdown)
   - Más reciente
   - Precio: Menor a mayor
   - Precio: Mayor a menor
   - Más vendido
   - Mejor calificado

3. **Query params en URL**
   ```
   /collections/hoodie?sort=price_asc&minPrice=500&maxPrice=2000&sizes=M,L&colors=black,white
   ```

4. **Actualizar API**
   - Filtrar en query de DB
   - Ordenar según parámetro
   - Retornar total de resultados

5. **Estado del filtro**
   - URL como source of truth
   - Usar `useSearchParams` y `useRouter`
   - Shallow routing (no recarga)

#### Consideraciones:
- Mostrar conteo de productos por filtro
- Deshabilitar filtros sin resultados
- Loading states al filtrar
- Mobile: Filtros en modal/drawer
- Persistir filtros al navegar back

---

### 2.3 Wishlist

**Objetivo:** Guardar productos favoritos

#### Decisiones por tomar:
- [ ] **Almacenamiento**:
  - Solo localStorage (guest + logged in)
  - DB + localStorage (sincronizar cuando se loguea)
  - Solo DB (requiere login)
  - **Recomendación**: DB + localStorage con sync

#### Implementación:
1. **Context/Store** `store/wishlistStore.tsx`
   - Similar a `cartStore.tsx`
   - Actions: add, remove, clear, isInWishlist
   - Sync con DB si hay usuario

2. **Modelo Prisma**
   ```prisma
   model WishlistItem {
     id        String   @id @default(cuid())
     userId    String
     productId String
     user      User     @relation(fields: [userId], references: [id])
     product   Product  @relation(fields: [productId], references: [id])
     createdAt DateTime @default(now())

     @@unique([userId, productId])
   }
   ```

3. **Botón de wishlist**
   - En ProductCard (corazón en esquina)
   - En ProductPage (junto a "Añadir al carrito")
   - Toggle estado (outline → filled)

4. **Página** `/app/wishlist/page.tsx`
   - Grid similar a CategoryPage
   - ProductCard con botón "Mover a bolsa"
   - Empty state: "Tu wishlist está vacía"

5. **API routes**
   - `app/api/wishlist/route.ts` - GET, POST, DELETE
   - Requiere autenticación

#### Consideraciones:
- Merge wishlist localStorage → DB al login
- Límite de items (ej. 100)
- Notificar si producto en wishlist baja de precio
- Compartir wishlist (link único)

---

### 2.4 Recently Viewed

**Objetivo:** Mostrar productos recientemente vistos

#### Implementación:
1. **Tracking en ProductPage**
   ```typescript
   useEffect(() => {
     addToRecentlyViewed(product.id);
   }, [product.id]);
   ```

2. **Función en `lib/recentlyViewed.ts`**
   - Guardar array de product IDs en localStorage
   - Límite de 10-20 productos
   - Más reciente primero (LIFO)

3. **Componente** `components/RecentlyViewed.tsx`
   - Carousel horizontal con ProductCards
   - Mostrar en homepage (abajo)
   - Mostrar en ProductPage (sección "Visto recientemente")

4. **Optimización**
   - No duplicar productos
   - No mostrar el producto actual
   - Lazy load

#### Consideraciones:
- Solo localStorage (no requiere DB)
- No trackear si es un bot
- Respetar configuración de privacidad

---

### 2.5 Reviews y Ratings

**Objetivo:** Sistema de reseñas de productos

#### Decisiones por tomar:
- [ ] **Moderación**:
  - Auto-publicar reviews
  - Moderación manual antes de publicar
  - **Recomendación**: Auto-publicar con opción de reportar

- [ ] **Verificación**:
  - Solo usuarios que compraron pueden opinar
  - Cualquier usuario registrado
  - **Recomendación**: Solo compradores verificados

#### Implementación:
1. **Modelo Prisma**
   ```prisma
   model Review {
     id        String   @id @default(cuid())
     productId String
     userId    String
     orderId   String?  // Verificación de compra
     rating    Int      // 1-5
     title     String?
     comment   String
     verified  Boolean  @default(false)
     helpful   Int      @default(0)
     createdAt DateTime @default(now())

     product   Product  @relation(fields: [productId], references: [id])
     user      User     @relation(fields: [userId], references: [id])
   }
   ```

2. **UI en ProductPage**
   - Sección "Reseñas" (scroll to)
   - Promedio de rating (estrellas)
   - Distribución de ratings (gráfico de barras)
   - Lista de reviews (paginada)
   - Ordenar por: Más reciente, Más útil, Rating

3. **Formulario de review**
   - Modal o sección expandible
   - Rating (estrellas clickeables)
   - Título (opcional)
   - Comentario (textarea)
   - Solo si usuario compró producto

4. **API routes**
   - `app/api/products/[productId]/reviews/route.ts` - GET, POST
   - `app/api/reviews/[reviewId]/helpful/route.ts` - POST (marcar como útil)

5. **Componente** `components/ProductReviews.tsx`
   - ReviewCard con usuario, fecha, rating, comentario
   - Badge "Compra verificada"
   - Botón "¿Fue útil?" (thumbs up counter)

#### Consideraciones:
- Validar solo 1 review por producto por usuario
- Edición de reviews (30 días)
- Reportar reviews inapropiadas
- Respuestas de la marca (admin)
- Analytics: sentiment analysis

---

## 🟢 FASE 3: NICE TO HAVE

### 3.1 Panel de Administración

**Objetivo:** Dashboard para gestionar el e-commerce

#### Decisiones por tomar:
- [ ] **Framework de admin**:
  - Custom (React + Next.js)
  - React Admin
  - Refine
  - **Recomendación**: Custom con Shadcn UI

- [ ] **Rutas**:
  - Bajo `/admin/*`
  - Subdomain `admin.viogi.com`
  - App separada
  - **Recomendación**: `/admin/*` con middleware

#### Funcionalidades:
1. **Dashboard** `/admin`
   - Ventas del día/semana/mes
   - Órdenes pendientes
   - Productos con stock bajo
   - Gráficos de ventas

2. **Productos** `/admin/products`
   - Lista con búsqueda y filtros
   - Crear/editar/eliminar productos
   - Upload de imágenes (Cloudinary/Uploadthing)
   - Gestión de variantes (tallas, colores)
   - Control de inventario

3. **Órdenes** `/admin/orders`
   - Lista de órdenes
   - Filtros por status
   - Actualizar status
   - Ver detalles
   - Generar guías de envío
   - Procesar reembolsos

4. **Clientes** `/admin/customers`
   - Lista de usuarios
   - Detalles de cliente
   - Historial de compras

5. **Analytics** `/admin/analytics`
   - Productos más vendidos
   - Ingresos por categoría
   - Embudo de conversión
   - Carritos abandonados

6. **Configuración** `/admin/settings`
   - Impuestos y envíos
   - Métodos de pago
   - Políticas
   - Usuarios admin

#### Implementación:
- Middleware para proteger rutas `/admin/*`
- Roles: ADMIN, SUPER_ADMIN
- Logs de acciones (audit trail)

---

### 3.2 Email Notifications

**Objetivo:** Emails transaccionales automatizados

#### Decisiones por tomar:
- [ ] **Proveedor de email**:
  - Resend (moderno, DX excelente)
  - SendGrid
  - Mailgun
  - AWS SES
  - **Recomendación**: Resend

- [ ] **Templates**:
  - React Email (components → HTML)
  - MJML
  - HTML manual
  - **Recomendación**: React Email

#### Emails a implementar:
1. **Confirmación de cuenta** (email verification)
2. **Recuperación de contraseña**
3. **Confirmación de orden** (con detalles)
4. **Orden enviada** (con tracking)
5. **Orden entregada**
6. **Review reminder** (7 días después de entrega)
7. **Abandono de carrito** (24h después)
8. **Restock notification** (producto regresa a stock)

#### Implementación:
1. **Instalar**
   ```bash
   npm install resend react-email
   ```

2. **Crear templates** en `emails/`
   - `OrderConfirmation.tsx`
   - `OrderShipped.tsx`
   - etc.

3. **Función helper** `lib/email.ts`
   ```typescript
   export async function sendOrderConfirmation(order: Order) {
     await resend.emails.send({
       from: 'VIOGI <orders@viogi.com>',
       to: order.email,
       subject: `Orden confirmada #${order.orderNumber}`,
       react: OrderConfirmation({ order })
     });
   }
   ```

4. **Trigger emails**
   - En API routes (después de crear orden)
   - En webhooks (Stripe)
   - En jobs programados (carrito abandonado)

#### Consideraciones:
- SPF, DKIM, DMARC records
- Email testing (Mailtrap, Ethereal)
- Unsubscribe links
- Preferencias de notificación del usuario
- Rate limiting

---

### 3.3 Analytics e Insights

**Objetivo:** Tracking de comportamiento y conversiones

#### Implementación:
1. **Google Analytics 4**
   - Script en `app/layout.tsx`
   - Eventos: page_view, add_to_cart, purchase
   - Enhanced ecommerce

2. **Meta Pixel** (Facebook/Instagram)
   - Tracking de conversiones para ads

3. **Eventos custom**
   - Product view
   - Add to cart
   - Begin checkout
   - Purchase
   - Search

4. **Heatmaps** (opcional)
   - Hotjar
   - Microsoft Clarity

#### Consideraciones:
- Consentimiento de cookies (GDPR)
- Privacy policy actualizada
- Cookie banner

---

### 3.4 Códigos de Descuento

**Objetivo:** Sistema de cupones y promociones

#### Implementación:
1. **Modelo Prisma**
   ```prisma
   model Coupon {
     id          String    @id @default(cuid())
     code        String    @unique
     type        CouponType // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
     value       Float
     minPurchase Float?
     maxUses     Int?
     usedCount   Int       @default(0)
     validFrom   DateTime
     validUntil  DateTime?
     active      Boolean   @default(true)
   }
   ```

2. **UI en Cart/Checkout**
   - Input "Código de descuento"
   - Botón "Aplicar"
   - Mostrar descuento en resumen
   - Error si código inválido

3. **API route** `app/api/coupons/validate/route.ts`
   - Validar código
   - Verificar vigencia
   - Verificar uso
   - Calcular descuento

4. **Admin** `/admin/coupons`
   - Crear/editar cupones
   - Ver uso
   - Desactivar

---

### 3.5 Multi-idioma y Multi-moneda

**Objetivo:** Soporte para inglés/español y USD/MXN

#### Decisiones por tomar:
- [ ] **i18n library**:
  - next-intl (recomendado para App Router)
  - react-i18next
  - **Recomendación**: next-intl

#### Implementación:
1. **Instalar**
   ```bash
   npm install next-intl
   ```

2. **Estructura**
   ```
   messages/
     es.json
     en.json
   ```

3. **Configurar** en `app/[locale]/layout.tsx`

4. **Conversión de moneda**
   - API de tipos de cambio (exchangerate-api.com)
   - Actualizar diario
   - Guardar preferencia en localStorage

5. **Actualizar Header**
   - Selector funcional (ya existe UI)
   - Cambiar locale y moneda
   - Persistir en cookies

#### Consideraciones:
- SEO: URLs localizadas (`/es/productos`, `/en/products`)
- Precios en DB en una moneda base
- Convertir en runtime
- Formato de fecha/hora por locale

---

## 📋 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

### Sprint 1 (Base Crítica) - 2-3 semanas
1. Backend y Base de Datos
2. Autenticación de Usuarios
3. Gestión de Pedidos (modelo + API)

### Sprint 2 (Transacciones) - 2-3 semanas
4. Checkout y Pagos (Stripe)
5. Email Notifications (básico)
6. Admin Panel (órdenes y productos básico)

### Sprint 3 (Mejoras UX) - 1-2 semanas
7. Búsqueda funcional
8. Filtros y ordenamiento
9. Wishlist
10. Recently Viewed

### Sprint 4 (Engagement) - 1-2 semanas
11. Reviews y Ratings
12. Códigos de descuento
13. Analytics

### Sprint 5 (Polish) - 1 semana
14. Multi-idioma/moneda
15. Admin panel completo
16. Optimizaciones

---

## 🔧 CONFIGURACIÓN INICIAL REQUERIDA

### Variables de entorno (.env.local)
```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Email
RESEND_API_KEY=""

# Storage
CLOUDINARY_URL=""

# Analytics
NEXT_PUBLIC_GA_ID=""
```

---

## 📊 MÉTRICAS DE ÉXITO

- Tiempo de carga < 2s
- Conversión de checkout > 2%
- Tasa de abandono de carrito < 70%
- Disponibilidad > 99.9%
- Error rate < 0.1%

---

**Última actualización:** 2026-01-16
