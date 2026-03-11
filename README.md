# VIOGI


---

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- next-intl (es / en)
- Context API + localStorage

## Comandos

```bash
npm run dev          # Desarrollo
npm run build        # Build
npm run lint         # Linter
npm run type-check   # TypeScript
```

## Estructura

```
app/[locale]/        # Rutas localizadas (es, en)
components/          # Componentes UI
store/               # Estado del carrito (Context API)
lib/                 # Productos, utilidades, constantes
messages/            # Traducciones (en.json, es.json)
types/               # Tipos TypeScript
visual-search/       # Módulo de búsqueda visual (en desarrollo)
```

## Módulos

- Catálogo de productos con filtrado por categoría
- Carrito con persistencia en localStorage
- Checkout con envío a domicilio y puntos de entrega
- Cuentas de usuario
- Soporte, guía de tallas, envíos y devoluciones
- Búsqueda visual por imagen (próximamente)

---

Instagram: [@viogi_](https://www.instagram.com/viogi_/)
