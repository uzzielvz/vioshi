# 📘 Guía del Header - VIOGI

## 🎨 Diseño y Estructura

El header de VIOGI está inspirado en el diseño minimalista de Stüssy, con enfoque en transparencia total y iconos minimalistas.

### Características principales:

1. **Posicionamiento**: `fixed` top-0 (siempre visible al hacer scroll)
2. **Fondo**: `bg-white` (100% transparente, sin blur)
3. **Border sutil**: `border-gray-200`
4. **Altura fija**: `h-16` (64px)
5. **Iconos minimalistas**: Lupa y carrito con líneas simples

---

## 📐 Estructura Desktop

```
┌─────────────────────────────────────────────────────────────┐
│  VIOGI    [SHOP ▼]  [ARCHIVO]  [SOPORTE ▼]     🔍  MXN  🛍️  │
└─────────────────────────────────────────────────────────────┘
```

### Distribución:
- **Izquierda**: Logo "VIOGI" (fuente `Bebas Neue`, size `text-3xl`)
- **Centro**: Navegación principal (posicionada con `absolute left-1/2 -translate-x-1/2`)
  - SHOP (con dropdown)
  - ARCHIVO
  - SOPORTE (con dropdown)
- **Derecha**: 
  - 🔍 Icono de lupa (búsqueda)
  - MXN (moneda por defecto)
  - 🛍️ Icono de carrito

---

## 📱 Estructura Mobile

```
┌────────────────────────────────────────────┐
│  VIOGI               🔍  🛍️  [MENU]        │
└────────────────────────────────────────────┘
```

### Distribución:
- **Izquierda**: Logo "VIOGI"
- **Derecha**: 
  - 🔍 Icono de lupa
  - 🛍️ Icono de carrito (con contador)
  - Texto "MENU"

---

## 🎯 Dropdowns (Menús Desplegables)

### Características:
- **Fondo**: `bg-white` (sólido, sin blur)
- **Posición**: `absolute top-full` directamente pegado al header (sin `mt-`)
- **Centrado**: `left-1/2 -translate-x-1/2`
- **Border**: `border-t border-gray-200` (solo arriba)
- **Ancho mínimo**: `min-w-[280px]`
- **Sombra**: `shadow-sm` (muy sutil)
- **Efecto hover**: Items cambian a `bg-black text-white`

### Interacción:
```typescript
onMouseEnter={() => setShopOpen(true)}
onMouseLeave={() => setShopOpen(false)}
```

Los dropdowns aparecen al pasar el mouse y desaparecen al salir.

---

## 📋 Menú Mobile Fullscreen

### Características:
- **Posición**: `fixed inset-0 top-16` (fullscreen debajo del header)
- **Fondo**: `bg-white` (sólido)
- **Scroll**: `overflow-y-auto`
- **Organización**: Por secciones con títulos
  - SHOP (con todos los productos)
  - ARCHIVO
  - SOPORTE (con submenús)

### Toggle:
```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
  MENU
</button>
```

---

## 🎨 Tipografía

### Logo:
- **Fuente**: `font-logo` (Bebas Neue)
- **Tamaño**: `text-3xl`
- **Estilo**: Bold, condensada, mayúsculas

### Navegación:
- **Tamaño**: `text-xs`
- **Peso**: `font-medium`
- **Transform**: `uppercase`
- **Tracking**: `tracking-wider` (mayor espaciado)

### Items de menú:
- Desktop dropdown: `text-xs font-medium uppercase tracking-wider`
- Mobile menu: `text-sm font-medium uppercase tracking-wider`

---

## 🔧 Clases CSS Importantes

### Header container:
```tsx
className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200"
```

### Dropdown:
```tsx
className="absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-white border-t border-gray-200 py-6 min-w-[280px] shadow-sm"
```

### Mobile menu:
```tsx
className="md:hidden fixed inset-0 top-16 bg-white overflow-y-auto"
```

---

## 🎨 Iconos SVG Minimalistas

### Icono de búsqueda (Lupa):
```tsx
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
  <circle cx="11" cy="11" r="7" />
  <path d="m21 21-4.35-4.35" />
</svg>
```

### Icono de carrito:
```tsx
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
  <line x1="3" y1="6" x2="21" y2="6" />
  <path d="M16 10a4 4 0 0 1-8 0" />
</svg>
```

**Características**:
- `strokeWidth="2"` para líneas limpias
- `fill="none"` para estilo outline
- `w-5 h-5` (20px) de tamaño

---

## 🛠️ Estados y Lógica

### Estados necesarios:
```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [shopOpen, setShopOpen] = useState(false);
const [supportOpen, setSupportOpen] = useState(false);
const { itemCount } = useCart(); // Del store de carrito
```

### Contador de carrito:
```tsx
{itemCount > 0 && (
  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
    {itemCount}
  </span>
)}
```

---

## 📦 Secciones del Menú (en español)

### SHOP:
- Nuevos Lanzamientos
- Camisetas
- Sudaderas
- Abrigos
- Shorts
- Denim
- Accesorios

### SOPORTE:
- Atención al Cliente
- Envíos y Devoluciones
- Guía de Tallas
- Garantía

---

## ⚡ Responsive Breakpoints

- **Mobile**: `< 768px` (md)
  - Logo + iconos minimalistas
  - Menú fullscreen
  
- **Desktop**: `>= 768px`
  - Logo + navegación centrada + utilidades
  - Dropdowns on hover

---

## 🎯 Diferencias con Versión Anterior

### ❌ ANTES (con blur):
- `bg-white/80 backdrop-blur-md`
- `border-black/10`
- `mt-3` en dropdowns
- Texto "BUSCAR" y "BOLSA"
- "US / $"

### ✅ AHORA (estilo Stüssy exacto):
- `bg-white` (100% opaco)
- `border-gray-200`
- `mt-0` en dropdowns (pegados)
- Iconos minimalistas 🔍 🛍️
- "MXN" como moneda

---

## 📁 Archivos Relacionados

- **Header Component**: `components/Header.tsx`
- **Estilos globales**: `app/globals.css`
- **Configuración Tailwind**: `tailwind.config.ts`
- **Store de carrito**: `store/cartStore.tsx`

---

## 🔄 Compensación del Header Fixed

Como el header es `fixed`, necesitas agregar `pt-16` (padding-top de 64px) al `<main>` de todas las páginas:

```tsx
<main className="flex-1 pt-16">
  {/* contenido */}
</main>
```

Esto evita que el contenido quede oculto detrás del header.

---

## 💡 Tips de Desarrollo

1. **No cambiar la altura del header** sin actualizar el `pt-16` en las páginas
2. **El fondo es sólido** - sin efectos de blur o transparencia
3. **Los dropdowns están pegados** al header (sin gap)
4. **Cerrar el menú mobile** al hacer clic en un link:
   ```tsx
   onClick={() => setMobileMenuOpen(false)}
   ```
5. **El logo usa una fuente especial**: `font-logo` (Bebas Neue)
6. **Iconos son minimalistas**: stroke de 2px, sin relleno

---

## 🎨 Fuentes del Proyecto

### Logo (Bebas Neue):
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
```

Usada en: Logo del header

### Sistema (Inter):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

Usada en: Todo el resto del sitio

---

## 🌍 Moneda

Por defecto se usa **MXN** (Pesos Mexicanos) en lugar de USD.

```tsx
<button className="hidden md:block text-xs font-medium uppercase tracking-wider hover:opacity-60 transition-opacity">
  MXN
</button>
```

---

¡Listo! Con esta guía puedes entender y modificar el header sin romper nada. 🚀
