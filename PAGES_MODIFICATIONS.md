# VIOGI - Modificaciones de Páginas

> Documento para registrar las modificaciones deseadas en cada página implementada

**Instrucciones:** Escribe las modificaciones que quieres realizar en cada página. Usa checkboxes [ ] para rastrear el progreso.

---

## 🛒 CHECKOUT

**Ruta:** `/checkout`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ] Actualmente al dar click en checkout la pagina parece por debajo de la emergente del carrito, lo correcto es que se muestre inmediatamente al dar click
- [ ] El header tiene que tener el texto igualito al header original VIOGIA, MISMA FUENTE, MISMO TAMANO, Y EN LUGAR DE VOLVER AL CARRITO APARECE UN ICONO MINIMALISTA DR CARRITO COMO EN STUSSY
- [ ] Cuando de click en el icono del carrito te tiene que llevar a la pagina emergente donde diste click al checkout y l pagina de abajo de la emergente una normal, no cres la pagina card
- [ ] Asegurate de no conbinar estilo de fuentes, la fuente en todo se queda igual, solo juega con los tonos y los bold
- [ ] Que su footer sean las paginas importantes coo legal, envios o las otras paginas que tenemos

### Notas:

```
(Escribe aquí cualquier detalle adicional sobre cambios en el checkout)
```

---

## ✅ CHECKOUT SUCCESS

**Ruta:** `/checkout/success/[orderId]`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 👤 ACCOUNT - LOGIN

**Ruta:** `/account`

**Estado:** ✅ Implementado (existente)

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## ✍️ ACCOUNT - REGISTER

**Ruta:** `/account/register`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 🔑 ACCOUNT - FORGOT PASSWORD

**Ruta:** `/account/forgot-password`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 📝 ACCOUNT - PROFILE

**Ruta:** `/account/profile`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 📦 ACCOUNT - ORDERS LIST

**Ruta:** `/account/orders`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 📋 ACCOUNT - ORDER DETAIL

**Ruta:** `/account/orders/[orderId]`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 📍 ACCOUNT - ADDRESSES

**Ruta:** `/account/addresses`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 🏪 VENDER (VENDOR APPLICATION)

**Ruta:** `/vender`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 📚 ARCHIVE - COLLECTION DETAIL

**Ruta:** `/archive/[slug]`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 🔍 SEARCH

**Ruta:** `/search`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## ❤️ WISHLIST

**Ruta:** `/wishlist`

**Estado:** ✅ Implementado

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 🏠 HOMEPAGE

**Ruta:** `/`

**Estado:** ✅ Implementado (existente)

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 🛍️ COLLECTIONS - CATEGORY PAGE

**Ruta:** `/collections/[category]`

**Estado:** ✅ Implementado (existente)

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 👕 PRODUCT DETAIL PAGE

**Ruta:** `/products/[slug]`

**Estado:** ✅ Implementado (existente)

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 🛒 CART PAGE

**Ruta:** `/cart`

**Estado:** ✅ Implementado (existente)

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 📁 ARCHIVE - MAIN PAGE

**Ruta:** `/archive`

**Estado:** ✅ Implementado (existente)

### Modificaciones Solicitadas:

- [ ]
- [ ]
- [ ]

### Notas:

```

```

---

## 📄 INFORMATIONAL PAGES

### Customer Support

**Ruta:** `/pages/customer-support`

**Modificaciones:**

- [ ]
- [ ]

### Locaciones

**Ruta:** `/pages/locaciones`

**Modificaciones:**

- [ ]
- [ ]

### Shipping, Payments & Returns

**Ruta:** `/pages/shipping-payments-returns`

**Modificaciones:**

- [ ]
- [ ]

### Size Guide

**Ruta:** `/pages/size-guide`

**Modificaciones:**

- [ ]
- [ ]

### Legal

**Ruta:** `/pages/legal`

**Modificaciones:**

- [ ]
- [ ]

### Accessibility

**Ruta:** `/pages/accessibility`

**Modificaciones:**

- [ ]
- [ ]

### Chapters

**Ruta:** `/pages/chapters`

**Modificaciones:**

- [ ]
- [ ]

---

## 🎨 COMPONENTES GLOBALES

### Header

**Archivo:** `components/Header.tsx`

**Modificaciones:**

- [ ]
- [ ]

### Footer

**Archivo:** `components/Footer.tsx`

**Modificaciones:**

- [ ]
- [ ]

### CartDrawer

**Archivo:** `components/CartDrawer.tsx`

**Modificaciones:**

- [ ]
- [ ]

### ProductCard

**Archivo:** `components/ProductCard.tsx`

**Modificaciones:**

- [ ]
- [ ]

---

## 🆕 NUEVAS PÁGINAS NECESARIAS

### Reset Password (con token)

**Ruta sugerida:** `/account/reset-password/[token]`

**Descripción:**

- [ ] Página para restablecer contraseña usando token del email
- [ ] Formulario con nueva contraseña y confirmación
- [ ] Validación de token
- [ ] Redirección a login después de éxito

### Account Settings

**Ruta sugerida:** `/account/settings`

**Descripción:**

- [ ] Preferencias de usuario
- [ ] Configuración de notificaciones
- [ ] Cambio de idioma/moneda
- [ ] Eliminar cuenta

### Checkout - Cancelled

**Ruta sugerida:** `/checkout/cancelled`

**Descripción:**

- [ ] Página cuando el pago es cancelado
- [ ] Opción de reintentar
- [ ] Volver al carrito

---

## 🔧 MEJORAS GENERALES

### UI/UX

- [ ]
- [ ]
- [ ]

### Performance

- [ ]
- [ ]
- [ ]

### Accesibilidad

- [ ]
- [ ]
- [ ]

### SEO

- [ ]
- [ ]
- [ ]

### Mobile Responsiveness

- [ ]
- [ ]
- [ ]

---

## 📝 PRIORIDADES

### Alta Prioridad (Crítico)

### Media Prioridad (Importante)

### Baja Prioridad (Nice to Have)

---

**Última actualización:** 2026-01-16

**Notas generales:**

```
(Escribe aquí cualquier nota general sobre el proyecto, decisiones de diseño,
lineamientos de estilo, etc.)
```
