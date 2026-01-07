# VIOGI - Premium Accessible Streetwear

Tienda e-commerce minimalista inspirada en Stüssy, con arquitectura escalable para convertirse en un marketplace.

## ✨ Características Implementadas

- ✅ Header transparente con efecto glassmorphism (blur)
- ✅ Navegación responsive (desktop/mobile)
- ✅ Sistema de carrito funcional con localStorage
- ✅ Dropdowns estilo Stüssy (transparentes y centrados)
- ✅ Grid de productos responsivo
- ✅ Arquitectura TypeScript completa
- ✅ Componentes reutilizables
- ✅ Diseño minimalista blanco/negro

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Estado:** Context API + localStorage
- **Imágenes:** Next/Image optimizado
- **Fuentes:** Bebas Neue (logo), Inter (sistema)

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
viogi-ecommerce/
├── app/                        # Next.js App Router
│   ├── (shop)/                 # Grupo de rutas de tienda
│   │   └── cart/              # Carrito de compras
│   ├── collections/           # Páginas de colecciones
│   │   └── [category]/       # Página dinámica por categoría
│   ├── products/              # Páginas de productos
│   │   └── [slug]/           # Página dinámica por producto
│   ├── layout.tsx             # Layout principal con CartProvider
│   ├── page.tsx               # Homepage
│   ├── loading.tsx            # Loading state
│   ├── error.tsx              # Error boundary
│   ├── not-found.tsx          # 404
│   └── globals.css            # Estilos globales + fuentes
│
├── components/                 # Componentes React
│   ├── common/                # Componentes comunes
│   │   ├── Button.tsx         # Botón con variantes
│   │   ├── Input.tsx          # Input con label/error
│   │   ├── Spinner.tsx        # Loading indicator
│   │   └── Badge.tsx          # Badges y etiquetas
│   ├── Header.tsx             # Header con nav transparente
│   ├── Footer.tsx             # Footer
│   ├── ProductCard.tsx        # Tarjeta de producto
│   └── ProductGrid.tsx        # Grid de productos
│
├── types/                      # TypeScript types
│   ├── index.ts               # Exports
│   ├── product.ts             # Product, Category, Review
│   ├── cart.ts                # Cart, CartItem
│   ├── user.ts                # User, Address, Preferences
│   └── order.ts               # Order, OrderItem, Status
│
├── store/                      # Estado global
│   └── cartStore.tsx          # Context API para carrito
│
├── hooks/                      # Custom hooks
│   ├── useLocalStorage.ts     # Hook para localStorage
│   └── useDebounce.ts         # Hook para debounce
│
├── lib/                        # Utilidades y datos
│   ├── products.ts            # Mock data de productos
│   ├── utils.ts               # Funciones útiles
│   └── constants.ts           # Constantes de la app
│
├── tailwind.config.ts          # Config Tailwind + fuentes
├── tsconfig.json               # Config TypeScript
├── next.config.js              # Config Next.js
├── HEADER_GUIDE.md             # 📘 Guía detallada del header
└── README.md                   # Este archivo
```

## 🎨 Header - Diseño Stüssy

El header implementa el diseño exacto de Stüssy con las siguientes características:

### Desktop:
```
VIOGI    [SHOP ▼]  [ARCHIVO]  [SOPORTE ▼]   BUSCAR  US/$  BOLSA
```

### Mobile:
```
VIOGI                              [🔍] [🛍️] [MENU]
```

### Características técnicas:
- **Posición**: Fixed top-0 (siempre visible)
- **Efecto**: Transparente con backdrop-blur (`bg-white/80 backdrop-blur-md`)
- **Dropdowns**: Transparentes, centrados, con hover
- **Mobile menu**: Fullscreen con blur
- **Tipografía**: 
  - Logo: Bebas Neue (bold, condensada)
  - Navegación: Inter (uppercase, tracking-wider)

**📘 Para más detalles, lee [`HEADER_GUIDE.md`](./HEADER_GUIDE.md)**

## 🎯 Componentes Principales

### Button
```tsx
import { Button } from "@/components/common/Button";

<Button variant="primary" size="md" loading={false}>
  Add to Cart
</Button>

// Variantes: primary, secondary, tertiary
// Tamaños: sm, md, lg
```

### Input
```tsx
import { Input } from "@/components/common/Input";

<Input 
  label="Email" 
  type="email" 
  error="Invalid email"
  fullWidth
/>
```

### useCart Hook
```tsx
import { useCart } from "@/store/cartStore";

const { 
  cart,          // Objeto completo del carrito
  addItem,       // Agregar producto
  removeItem,    // Eliminar producto
  updateQuantity,// Actualizar cantidad
  clearCart,     // Vaciar carrito
  itemCount      // Total de items
} = useCart();
```

## 🛒 Sistema de Carrito

El carrito está implementado con Context API y localStorage:

### Características:
- ✅ Agregar/eliminar productos
- ✅ Actualizar cantidades
- ✅ Cálculo automático de subtotal, tax, shipping
- ✅ Persistencia en localStorage
- ✅ Contador en header
- ✅ Página de carrito completa

### Flujo:
1. Usuario hace clic en "Add to Cart" en ProductCard
2. Se genera un ID único para el item
3. Se agrega al store (Context)
4. Se guarda automáticamente en localStorage
5. El contador del header se actualiza
6. Usuario puede ver/editar en `/cart`

## 📋 Comandos Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar linter
npm run type-check   # Verificar tipos TypeScript
```

## 🎨 Sistema de Diseño

### Colores:
- **Background**: `#ffffff` (blanco puro)
- **Foreground**: `#000000` (negro puro)
- **Borders**: `black/10` (negro al 10%)

### Tipografía:
- **Logo**: Bebas Neue (fuerte, condensada)
- **Sistema**: Inter (limpia, legible)
- **Tamaños**: `text-xs` (11px), `text-sm` (14px), `text-base` (16px)

### Espaciado:
- **Padding horizontal**: `px-6 md:px-8`
- **Padding vertical**: `py-8 md:py-12`
- **Header height**: `h-16` (64px)

### Efectos:
- **Transparencia**: `bg-white/80` (80% opacidad)
- **Blur**: `backdrop-blur-md`
- **Transiciones**: `transition-opacity duration-150`
- **Hover**: `hover:opacity-60`

## 🔧 Configuración de Fuentes

Las fuentes se importan en `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
```

Y se configuran en `tailwind.config.ts`:

```typescript
fontFamily: {
  sans: ["-apple-system", "BlinkMacSystemFont", ...],
  logo: ["var(--font-logo)"], // Bebas Neue
}
```

## 🎯 Fases del Proyecto

### ✅ Fase 1 - Fundamentos (Completado)
- [x] Header transparente estilo Stüssy
- [x] Sistema de navegación responsive
- [x] Estructura de carpetas profesional
- [x] Sistema de tipos TypeScript completo
- [x] Componentes comunes reutilizables
- [x] Sistema de carrito funcional
- [x] Persistencia en localStorage
- [x] Diseño minimalista consistente

### 🔄 Fase 2 - E-commerce Básico (Próximo)
- [ ] Página de producto mejorada (galería de imágenes)
- [ ] Selector de colores y tallas
- [ ] Wishlist/favoritos
- [ ] Búsqueda de productos funcional
- [ ] Filtros y ordenamiento
- [ ] Paginación

### 📅 Fase 3 - Backend
- [ ] Base de datos (Supabase/PostgreSQL)
- [ ] API routes para productos
- [ ] Autenticación (NextAuth.js)
- [ ] Panel de administración básico
- [ ] Gestión de inventario

### 💳 Fase 4 - Pagos y Órdenes
- [ ] Integración con Stripe
- [ ] Proceso de checkout completo
- [ ] Historial de órdenes
- [ ] Sistema de envíos
- [ ] Emails transaccionales

### 🏪 Fase 5 - Marketplace
- [ ] Sistema multi-vendedor
- [ ] Dashboard para vendedores
- [ ] Sistema de comisiones
- [ ] Reviews y ratings
- [ ] Sistema de mensajería

## 📝 Estándares de Código

1. **TypeScript**: Strict mode habilitado, evitar `any`
2. **Componentes**: Funcionales con hooks
3. **Naming**: 
   - camelCase para variables y funciones
   - PascalCase para componentes
   - UPPERCASE para constantes
4. **Estilos**: Tailwind CSS (utility-first)
5. **Imports**: Usar alias `@/` para paths absolutos

## 🎓 Conceptos Clave para Entender

### 1. Header Fixed con Transparencia
El header usa `fixed top-0` para quedar siempre visible. Por eso todas las páginas necesitan `pt-16` en el `<main>` para compensar.

### 2. Context API para Estado Global
El carrito usa React Context para compartir estado entre componentes sin prop drilling.

### 3. localStorage para Persistencia
Los datos del carrito se guardan automáticamente en localStorage usando un custom hook (`useLocalStorage`).

### 4. Server vs Client Components
- **Server**: Por defecto en Next.js 14 (más rápido)
- **Client**: Solo cuando necesitas interactividad (`"use client"`)

### 5. Dynamic Routes
- `/collections/[category]` → Página dinámica por categoría
- `/products/[slug]` → Página dinámica por producto

## 🐛 Debugging Tips

1. **Header no se ve transparente**: 
   - Verifica que hay contenido debajo
   - Checa `backdrop-blur-md` esté aplicado

2. **Carrito no persiste**: 
   - Abre DevTools → Application → Local Storage
   - Busca la key `viogi_cart`

3. **Tipos TypeScript error**:
   - Ejecuta `npm run type-check`
   - Lee el error completo

4. **Componente no renderiza**:
   - Verifica si es Server o Client component
   - Checa imports correctos

## 📞 Contacto

Instagram: [@viogi_](https://www.instagram.com/viogi_/?hl=es)

---

**Versión:** 0.1.0 - Fase 1 Completada  
**Última actualización:** Enero 2026  
**Próximo objetivo:** Mejorar página de producto individual
