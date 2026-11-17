# Paquete V — Lanzar viogi.com como tienda única

**Estado:** LISTO para repartir · **Escrito:** 2026-11-16 · **Base:** `origin/main` en `7eb0c32` (PR #24)

**Meta:** el sábado 21 de noviembre Viogi vende sus piezas reales en su propio
dominio, cobrando con Stripe en vivo. El código queda listo el jueves 19.

Este paquete se divide en sub-paquetes (V0 a V5). Cada uno es para **un agente,
una rama y un PR**, como pide `docs/agents/GIT.md`. Las tareas del humano van
aparte, en § Trámites.

---

## 1. Decisiones del humano (2026-11-16)

1. **Se lanza Viogi sola, no rail.** El sitio sale como la tienda de Viogi en
   su dominio. No hay otros vendedores ni solicitud para vender.
2. **rail sigue siendo el destino.** Es el mismo repo y la misma base. Cuando
   haya datos reales y se resuelvan los bloqueos (empresa, Connect), se prende
   el modo plataforma y se cambia el dominio. No se borra nada de lo social.
3. **Logo:** el mismo dibujo del de rail (nombre en minúsculas, peso
   extra-bold) pero diciendo «viogi» y **todo en negro**, sin el punto azul.
4. **Cuentas de cliente: se quedan, pero básicas.** Entrar, guardar piezas y
   ver compras. Sin foto de portada, sin foto de perfil, sin números ni marcas.
5. **Devoluciones, aprobado:** no hay cambios ni devoluciones, salvo que la
   pieza no coincida con lo publicado; hay 48 horas para avisar.
6. **Quién vende:** Uzziel Valdez Ordoñez y Mario Flores Gonzales. Sin
   domicilio. (La ortografía y el domicilio están en § Dudas abiertas.)

## 2. Estado de arranque

- `main` trae todo hasta el PR #24:
  - compra sin bolsa («Comprar» directo y «Agrega más de Viogi» al pagar);
  - correo de compra, apagado hasta que existan las variables de Resend;
  - reembolsos desde Stripe.
- **Se perdió** el trabajo sin commit del 2026-11-07. Lo que aplica a Viogi se
  rehace en V3:
  - marca en mayúsculas;
  - rebaja en rojo;
  - «Comprar» fijo.
- **Migraciones:** según `STATUS.md`, producción tiene `0001`–`0026`. La
  `0027_condition_nuevo.sql` está en `main` y **no está confirmado** que se
  haya aplicado. La sesión que escribió este plan no tiene red hacia Supabase:
  lo confirma V0.
- **12 piezas de muestra publicadas y pagables** desde el 2026-10-30. Hay que
  quitarlas antes de abrir (`docs/LANZAMIENTO.md` § 2c tiene la consulta).
- **Nada de los trámites está hecho:**
  - dominio;
  - Stripe en vivo;
  - correo de cuentas;
  - textos legales publicados;
  - piezas reales.
- El sitio no mide visitas ni conversiones (ver V4).

## 3. Reglas para todos los agentes

- Lee antes: `docs/agents/STATUS.md`, `FROZEN.md`, `OPEN.md`, `GIT.md` y este
  archivo. El sub-paquete manda sobre `lanes.md` solo en la lista de archivos
  que te da.
- **Este paquete no reabre FROZEN.** El modo tienda es una forma de lanzar; la
  plataforma sigue en el mismo código.
- **No hardcodear «Viogi» ni «rail» como nombre de plataforma.** El nombre
  sale de `lib/brand.ts`.
- **Los textos van en `messages/es.json` y `messages/en.json`**, con las
  mismas llaves en los dos.
- **No se toca la lógica de cobro:**
  - `app/[locale]/checkout/actions.ts`;
  - `app/api/webhooks/stripe/**`;
  - las RPC de stock.
- Sin dependencias nuevas, salvo V4 si el humano lo aprueba.
- **`messages/*.json` lo tocan V1, V2 y V3.** Por eso van en serie:
  V1 → V2 → V3. El que llega después parte de `origin/main` ya con el anterior
  mergeado.
- **DoD de cada sub-paquete:**
  - `npm run type-check`, `npm run lint`, `npm run build` y `npm run test:rules`
    en verde;
  - un PR contra `main`;
  - la fila de `STATUS.md` actualizada en la rama.

## 4. Orden y dependencias

| # | Sub-paquete | Quién | Depende de | Paralelo con |
|---|---|---|---|---|
| V0 | Confirmar producción y aplicar `0027` | Agente local con acceso a Supabase | — | todo |
| V1 | Modo tienda única + marca Viogi | Agente de código | — | V0, trámites |
| V2 | Devoluciones y Legal publicados | Agente de código | V1 mergeado + dudas 2 y 3 | V0 |
| V3 | Tarjeta y ficha (rehacer lo perdido) | Agente de código | V2 mergeado | V0 |
| V4 | Medición (opcional) | Agente de código | V3 mergeado + duda 4 | — |
| V5 | Verificación final en producción | Agente + humano | V0–V3 y trámites H1–H5 | — |

Calendario propuesto:

| Día | Código | Humano |
|---|---|---|
| Lun 16 | V0, V1 | H1 dominio. H2 empezar Stripe y pedir OXXO. H5 empezar fotos y medidas. |
| Mar 17 | V1 mergeado, V2 | H1 dominio en Vercel. H3 Resend y correo de Supabase. H4 variables. |
| Mié 18 | V3 | H2 llaves y webhook. Aprobar textos de V2. |
| Jue 19 | V4 si aplica, V5 | H5 quitar demo y publicar piezas reales. H6 prueba de compra. |
| Vie 20 | Arreglos | Abrir a 10–20 clientes de confianza. |
| Sáb 21 | — | Post y stories con el link en la bio. |

---

## V0 — Confirmar producción y aplicar `0027`

**Quién:** agente local (la máquina del humano tiene el CLI de Supabase
enlazado al proyecto `viogi`). **Rama:** ninguna; no cambia código.

**Reglas:**
- Antes de escribir en producción, muestra el plan y espera el «sí» del humano.
- No imprimas llaves ni connection strings.

**Pasos:**

1. `git pull` en `main`.
2. Lista las migraciones aplicadas (`supabase migration list --linked`) y
   compáralas con `supabase/migrations/`. Esperado:
   - `0001`–`0026` aplicadas;
   - `0027` pendiente.

   Si falta otra o sobra alguna, detente y avisa.
3. Respaldo de esquema y datos a `backups/` con la fecha. Confirma que los
   archivos no están vacíos.
4. `--dry-run`: debe salir solo `0027_condition_nuevo.sql`. Aplícala con
   `db push --linked`.
5. Verifica y reporta:
   - `products_condition_check` acepta `nuevo`, `impecable`, `buen_estado` y
     `con_detalles`;
   - ninguna fila de `products` tiene un `condition` fuera de esos cuatro;
   - `products_defect_notes_required_check` sigue existiendo.
6. Solo lectura, para el reporte:
   - cuántas piezas hay con `listed = true`;
   - cuáles de los 12 ids de `docs/LANZAMIENTO.md` § 2c siguen publicadas;
   - si existen pedidos con `payment_status = 'completed'` (compras de prueba
     que haya que limpiar).

**DoD:** un reporte corto con esos resultados. No cambia el estado de ninguna
pieza.

---

## V1 — Modo tienda única y marca Viogi

**Rama:** `agent/V1-tienda-unica` · **Sin migraciones.**

### Idea

Un interruptor. **Por defecto el sitio es tienda única**; el modo plataforma
se enciende con `NEXT_PUBLIC_MARKETPLACE=on`. Así el lanzamiento no depende de
acordarse de poner una variable, y volver a rail es poner esa variable y
`NEXT_PUBLIC_BRAND_NAME=rail`.

### Archivos permitidos

`lib/mode.ts` (nuevo) · `lib/brand.ts` · `components/ui/Wordmark.tsx` ·
`components/BottomNav.tsx` · `components/Header.tsx` · `components/Footer.tsx` ·
`components/FollowButton.tsx` · `app/[locale]/vender/page.tsx` ·
`app/[locale]/tienda/[slug]/page.tsx` ·
`app/[locale]/products/[slug]/ProductContent.tsx` (solo la fila «Vende», los
«Seguir» y el encabezado de «Más de») ·
`app/[locale]/account/_components/AccountShell.tsx` ·
`app/[locale]/account/following/page.tsx` ·
`app/[locale]/account/profile/page.tsx` ·
`app/[locale]/account/_components/LoginForm.tsx` y
`app/[locale]/account/register/_components/RegisterForm.tsx` (solo el texto de
bienvenida) · `app/[locale]/pages/customer-support/page.tsx` ·
`app/[locale]/pages/shipping-payments-returns/page.tsx` y
`app/[locale]/pages/legal/page.tsx` (solo cambiar la llave del texto por la
variante de tienda) · `messages/es.json` · `messages/en.json` ·
`app/icon.png` · `app/apple-icon.png` · `public/icons/**` · `.env.example` ·
`docs/agents/STATUS.md` · `docs/design/TOKENS.md`.

### Tareas

1. **`lib/mode.ts`**
   - Exporta `isMarketplace = process.env.NEXT_PUBLIC_MARKETPLACE === 'on'`.
   - Lleva un comentario de dos líneas: tienda única por defecto; `on` enciende
     vender, seguir y perfiles de tienda.
   - No lleva lógica de servidor: lo importan componentes de cliente.

2. **Marca (`lib/brand.ts`)**
   - Nombre por defecto `'Viogi'` (hoy es `'VIOGI'`).
   - En modo tienda, la descripción por defecto es «Ropa de segunda mano
     curada. Cada pieza es única.» En modo plataforma queda la actual.
   - `NEXT_PUBLIC_BRAND_*` sigue mandando sobre los valores por defecto.

3. **Logo (`components/ui/Wordmark.tsx`)**
   - Hoy solo la primera «i» lleva el punto dibujado, y es azul.
   - Cambia a: **todas** las «i» del nombre llevan el mismo punto redondo. Sin
     eso, «viogi» queda con un punto redondo y otro cuadrado.
   - Color del punto: `bg-accent` en modo plataforma, `bg-ink` en modo tienda.
   - Verifica «viogi» y «rail» a 25 px y 26 px (los tamaños del header).

4. **Navegación**
   - `BottomNav`: en modo tienda son 4 botones (Inicio · Buscar · Guardados ·
     Cuenta) con `grid-cols-4`. En plataforma siguen los 5.
   - `Header`: quita «Vender» del escritorio y del menú móvil en modo tienda.
   - `Footer`: quita el link «Vender» en modo tienda.

5. **Rutas que no existen en modo tienda** (con `redirect` de
   `next/navigation`, en el servidor):
   - `/[locale]/vender` → `/[locale]`.
   - `/[locale]/tienda/[slug]` → `/[locale]`.
   - `/[locale]/account/following` → `/[locale]/account`.

6. **Seguir, apagado en modo tienda**
   - `components/FollowButton.tsx`: el `export default` devuelve `null` si
     `!isMarketplace`. Eso lo apaga en la ficha y en la búsqueda por marca.
   - No toques `hooks/useFollow.ts`, `lib/social/**` ni la tabla `follows`.

7. **Ficha (`ProductContent.tsx`), solo en modo tienda**
   - Quita la fila «Vende · Viogi».
   - «Más de {store} · Ver perfil» pasa a un título «Más piezas», sin link al
     perfil. La cuadrícula de 4 piezas se queda.
   - La marca sigue siendo link a `/search?brand=`.
   - No toques el botón «Comprar», el precio ni la escala de estado: eso es V3.

8. **Cuenta básica (`AccountShell.tsx`), solo en modo tienda**
   - Encabezado simple, sin `ProfileHeader`:
     - nombre (h1, `screenTitleClass`);
     - correo en `text-muted`;
     - botón «Editar perfil» (`buttonClass('line', 'sm')`).
   - Pestañas con `UnderlineTabs`: Guardados · Compras.
   - No llames a `getPersonProfile`. Basta con el nombre:
     `profiles.select('name')`.
   - `account/profile/page.tsx`: en modo tienda no se muestran «Foto y portada»
     ni «Empezar a vender». Direcciones, contraseña, idioma y cerrar sesión se
     quedan.
   - En modo plataforma todo queda como está hoy.

9. **Ayuda (`customer-support/page.tsx`)**: en modo tienda no se muestran la
   sección «Vender» ni su botón.

10. **Textos.** Agrega la variante de tienda, con las mismas llaves en `en`, y
    elige en el código con `isMarketplace`:

    | Llave nueva | Texto (es) | Reemplaza en modo tienda a |
    |---|---|---|
    | `ui.auth.login_body_store` | Guarda piezas y revisa tus compras en un solo lugar. | `ui.auth.login_body` |
    | `ui.auth.register_body_store` | Compra más rápido, guarda piezas y revisa tus pedidos. | `ui.auth.register_body` |
    | `ui.help.help_lead_store` | Ropa de segunda mano curada. Cada pieza es única. | `ui.help.help_lead` |
    | `ui.help.pay_inside_store` | Paga siempre dentro de {brand}. | `ui.help.pay_inside` |
    | `ui.help.ip_p_store` | Igual que `ip_p`, sin «o de quienes venden en él». | `ui.help.ip_p` |
    | `ui.product.more_pieces` | Más piezas | `ui.product.more_from` |

    «Agrega más de Viogi · Mismo envío», en Pagar, se queda igual: ya se lee
    bien.

11. **Íconos de la app.** Hoy dicen «rail».
    - Genera los cinco con «viogi» en negro sobre blanco, Inter extra-bold, en
      las mismas medidas:
      - `app/icon.png`, 48×48;
      - `app/apple-icon.png`, 180×180;
      - `public/icons/icon-192.png`;
      - `public/icons/icon-512.png`;
      - `public/icons/icon-maskable-512.png`, con el nombre dentro del 80 %
        central.
    - Mueve los de rail a `public/icons/rail/`, con los mismos nombres, para
      cuando vuelva el modo plataforma. Agrega también ahí las copias de
      `icon.png` y `apple-icon.png` de rail.
    - En 48 px «viogi» completo no se lee: usa solo la «v» en ese tamaño.

12. **`.env.example`**: documenta `NEXT_PUBLIC_MARKETPLACE` (vacío = tienda
    única; `on` = plataforma) y cambia los ejemplos de marca a Viogi.

13. **Docs**
    - `STATUS.md`: una fila para V1.
    - `TOKENS.md`: una línea con el modo tienda (barra de 4, logo negro).

### Verificación

- **Modo tienda** (sin la variable), a 390 y 1280 px. Revisa inicio, ficha,
  búsqueda, Pagar, cuenta (con sesión), Editar perfil, ayuda y legal:
  - no aparece «Vender», «Seguir», «Vende» ni «Ver perfil»;
  - `/es/vender`, `/es/tienda/viogi` y `/es/account/following` redirigen;
  - no hay scroll horizontal.
- **Modo plataforma** (`NEXT_PUBLIC_MARKETPLACE=on NEXT_PUBLIC_BRAND_NAME=rail`):
  todo se ve y funciona igual que antes del PR.

---

## V2 — Devoluciones y Legal publicados

**Rama:** `agent/V2-legal` · **Depende de:** V1 mergeado y las dudas 2 y 3
resueltas. Si no lo están, deja los nombres como vienen en § 1 y anota
`BLOQUEO` en el PR.

### Archivos permitidos

`messages/es.json` · `messages/en.json` ·
`app/[locale]/pages/shipping-payments-returns/page.tsx` ·
`app/[locale]/pages/legal/page.tsx` ·
`app/[locale]/pages/customer-support/page.tsx` (solo «Si algo sale mal») ·
`docs/BORRADORES-LEGALES.md` · `docs/LANZAMIENTO.md` · `docs/agents/STATUS.md`.

### Tareas

1. **Devoluciones.** Hoy `ui.help.trouble_body` y la sección «Devoluciones»
   dicen «estamos terminando nuestra política». Publica el texto aprobado:

   > Cada pieza es de segunda mano y única. Por eso no hay cambios ni
   > devoluciones porque no te quedó o no te gustó: revisa las medidas antes
   > de comprar.
   >
   > Sí te devolvemos tu dinero si la pieza no coincide con lo publicado
   > (medidas, estado o un detalle que no describimos) o si llega dañada.
   >
   > Escríbenos a {email} dentro de las 48 horas después de recibirla o
   > recogerla, con tu número de pedido y fotos. Si procede, te reembolsamos
   > el total por el mismo método de pago.

   - No pongas plazos de reembolso ni qué pasa si no se recoge un pedido: eso
     no está decidido (`OPEN.md`).
   - `{email}` es `brand.supportEmail`.
   - En «Si algo sale mal» de la ayuda, deja una frase corta con link a la
     sección de Devoluciones.

2. **Quién vende** (sección nueva al inicio de `/pages/legal`):

   > {brand} es la tienda en línea de Uzziel Valdez Ordoñez y Mario Flores
   > Gonzales. Contacto: {email}.

   - Los nombres van en `messages` (`ui.help.seller_p`).
   - No se publica domicilio, salvo que la duda 3 diga lo contrario.

3. **Aviso de privacidad.** Revisa la sección actual contra
   `docs/BORRADORES-LEGALES.md` § 3 y completa lo que falte:
   - el responsable (los dos nombres);
   - los proveedores reales:
     - Stripe;
     - Supabase;
     - Vercel;
     - Google, para entrar con Google y para Gemini en la búsqueda por foto;
     - Resend;
   - los derechos ARCO, con `brand.legalEmail`;
   - la fecha de última actualización.

   Si V4 se aprueba, ese agente agrega Vercel Analytics a la lista.

4. `docs/LANZAMIENTO.md`: marca «Legal mínimo» como hecho.

### Verificación

Las tres páginas a 390 y 1280 px, en `es` y en `en`. Ningún texto dice «la
estamos terminando».

---

## V3 — Tarjeta y ficha (rehacer lo perdido)

**Rama:** `agent/V3-ficha` · **Depende de:** V2 mergeado · **Sin migraciones**
(`original_price_mxn` ya existe y ya es legible para `anon` desde `0011`).

### Archivos permitidos

`lib/pricing.ts` (nuevo) · `scripts/test-pricing.ts` (nuevo) · `package.json`
(**solo** agregar el archivo de prueba a `test:rules`; es archivo serializado y
este paquete lo autoriza) · `lib/products.ts` (solo `original_price_mxn`) ·
`app/admin/products/actions.ts` (solo `updateProduct`) · `tailwind.config.ts`
(un color) · `components/ui/Price.tsx` (nuevo) · `components/ProductCard.tsx` ·
`components/ProductGrid.tsx` · `components/product/BuyBar.tsx` (nuevo) ·
`app/[locale]/products/[slug]/ProductContent.tsx` · `messages/*.json` ·
`docs/design/TOKENS.md` · `docs/agents/STATUS.md`.

### Tareas

1. **Rebaja de precio**
   - `lib/products.ts`:
     - agrega `original_price_mxn` a `PUBLIC_PRODUCT_SELECT` y a `DbProduct`;
     - `ProductData.originalPrice?: number`, solo cuando es mayor que `price`.
   - `lib/pricing.ts`, función pura
     `originalPriceAfterEdit({ wasListed, oldPrice, oldOriginal, newPrice })`:
     - sin precio nuevo → `undefined` (no tocar la columna);
     - la pieza no estaba publicada → `null` (corregir un precio antes de
       publicar no es rebaja);
     - `antes = max(oldOriginal, oldPrice)`. Si `newPrice < antes` → `antes`;
       si no → `null`.
   - `scripts/test-pricing.ts`, con `node:test`. Casos:
     - 500 → 400 guarda 500;
     - segunda rebaja 400 → 350, con original 500, conserva 500;
     - volver a 500 o subir limpia;
     - sin publicar no cuenta;
     - sin precio devuelve `undefined`.
   - `app/admin/products/actions.ts`, en `updateProduct`:
     - lee `listed, price_mxn, original_price_mxn` actuales;
     - incluye `original_price_mxn` en el `update` cuando la función no
       devuelve `undefined`.
   - `tailwind.config.ts`: color `drop: "#D92D20"`. Se usa **solo** para el
     precio rebajado.
   - `components/ui/Price.tsx`:
     - precio normal en `ink`;
     - con rebaja, el nuevo en `text-drop` y al lado el anterior tachado en
       `muted`;
     - vendida: tachado en `muted`, sin rojo.

2. **Tarjeta (`ProductCard.tsx`)**
   - Marca en **mayúsculas**: 11.5 px, `font-semibold`, `tracking-[0.04em]`.
   - Talla 11.5 px. Título del vendedor 12 px `muted`. Precio 12.5 px
     `font-semibold`, con `Price`. Corazón de 16 px.
   - El corazón debe seguir alineado con el borde derecho de la talla. Mídelo:
     el borde del dibujo queda a ≤ 1 px del de la talla, a 390 y 1280 px.
   - `ProductGrid.tsx` pasa `originalPrice`.

3. **«Comprar» siempre a la vista (`BuyBar.tsx` + `ProductContent.tsx`)**
   - **Celular:** barra fija justo arriba de la barra de navegación. Mide el
     alto real de `BottomNav` para el `bottom` (`ClientLayout` le reserva
     60 px), y suma `env(safe-area-inset-bottom)`. A la izquierda van la marca
     y el precio (con `Price`); a la derecha, el botón azul «Comprar». El botón
     dentro de la página se oculta en celular.
   - **Escritorio:** el botón de la página se queda. La barra aparece abajo
     solo cuando ese botón sale de la pantalla (`IntersectionObserver`), con
     miniatura, nombre, precio y «Comprar».
   - Solo para piezas disponibles. Vendidas y apartadas no llevan barra.
   - Deja espacio al final de la página para que la barra no tape el footer.
   - El precio grande de la ficha también usa `Price`.

4. `TOKENS.md`: anota la tarjeta (mayúsculas y tamaños), el rojo de rebaja y
   la barra de compra.

### Fuera de este paquete (es de rail, no de Viogi)

- Cuántas personas guardaron la pieza y «publicado hace…». Necesitan una
  migración.
- El bloque del vendedor con ventas y seguidores.
- Reseñas. Están prohibidas en Fase 1 (`FROZEN.md`).

### Verificación

- `npm run test:rules` incluye las pruebas nuevas.
- **Rebaja:** una pieza con `original_price_mxn` mayor que su precio se ve en
  rojo con el anterior tachado, en la tarjeta, la ficha y la barra.
- **«Comprar»** lleva a Pagar desde la barra, en celular y en escritorio.
- **Alineación:** el corazón queda alineado con la talla.
- Sin scroll horizontal a 390 y 1280 px.

---

## V4 — Medición (opcional; espera la duda 4)

**Rama:** `agent/V4-medicion` · **Depende de:** V3 mergeado y el «sí» del
humano.

- Agrega `@vercel/analytics`. Es una dependencia nueva y toca `package.json` y
  `package-lock.json`, que son archivos serializados: por eso pide aprobación.
- Monta `<Analytics />` en `app/[locale]/layout.tsx`.
- No usa cookies.
- El humano lo activa en Vercel → Analytics.
- Agrega «Vercel Analytics (medición de visitas, sin cookies)» al aviso de
  privacidad.

Si el humano dice que no, este sub-paquete no se hace.

---

## V5 — Verificación final en producción

**Quién:** un agente con el humano, cuando V0–V3 y H1–H5 estén hechos.

1. **Dominio y marca.** `https://<dominio>/es` carga con el logo «viogi» en
   negro. No aparecen «Vender» ni «rail» en ninguna pantalla ni en el título
   de la pestaña.
2. **Catálogo.** Ninguna de las 12 piezas de muestra está publicada. Las
   reales tienen foto, talla, estado y medidas.
3. **Compra real con tarjeta, de monto bajo:**
   1. la pieza pasa a «Apartada» y luego a «Vendida»;
   2. el pedido sale en Compras;
   3. llega el correo «Tu pedido está pagado» y su link abre sin cuenta;
   4. el admin la ve en `/admin/reservas` y la marca entregada;
   5. reembolso total desde Stripe → el pedido queda «Reembolsado».
4. **OXXO**, si está activo: el voucher aparta la pieza 24 h.
5. **Cuentas:**
   - registro con correo (llega el correo de confirmación);
   - entrar con Google;
   - recuperar contraseña.
6. **Teléfono real:**
   - instalar como app en iPhone y en Android;
   - la barra de abajo no se despega al buscar;
   - la cámara de la búsqueda por foto pide permiso y abre.
7. **Si OXXO o SPEI no están aprobados el jueves:** en `/admin/settings` pon
   el umbral solo-tarjeta en `0`. Con eso toda compra se cobra solo con
   tarjeta y los textos de Pagar lo dicen. No hace falta código.

---

## Trámites del humano

| # | Qué | Desbloquea |
|---|---|---|
| H1 | Comprar el dominio y conectarlo en Vercel. Poner `NEXT_PUBLIC_SITE_URL=https://<dominio>`. Crear `soporte@` y `legal@` (pueden ser reenvíos). | H3, H4, V5 |
| H2 | Activar Stripe en vivo (titular: Uzziel, según `FROZEN.md`) y **pedir OXXO hoy**. Poner las llaves en vivo en Vercel. Crear el webhook a `/api/webhooks/stripe` con los eventos de `docs/LANZAMIENTO.md` § 2, incluido `charge.refunded`, y poner `STRIPE_WEBHOOK_SECRET`. | Cobrar |
| H3 | Verificar el dominio en Resend. Poner su SMTP en Supabase (Authentication → Emails). En Supabase → URL Configuration: Site URL y `https://<dominio>/auth/callback`. En Google OAuth: el dominio nuevo. En Vercel: `RESEND_API_KEY` y `BRAND_EMAIL_FROM`. | Registro con correo y correo de compra |
| H4 | Variables de marca en Vercel: `NEXT_PUBLIC_BRAND_NAME=Viogi`, `NEXT_PUBLIC_BRAND_SUPPORT_EMAIL`, `BRAND_LEGAL_EMAIL`, `NEXT_PUBLIC_BRAND_INSTAGRAM`. **No** poner `NEXT_PUBLIC_MARKETPLACE`. Volver a publicar. | Que el sitio diga Viogi |
| H5 | Despublicar las 12 piezas de muestra (`docs/LANZAMIENTO.md` § 2c). Subir las piezas reales desde `/admin/products` con foto, talla, estado y medidas. | Abrir |
| H6 | Hacer la prueba de V5 con un agente. | Anunciar |

**Opcional, no bloquea:** un número de WhatsApp Business (chip prepago) y
`NEXT_PUBLIC_BRAND_WHATSAPP`. Con eso aparece el botón en Ayuda.

---

## Dudas abiertas (las decide el humano)

1. **Dominio.** ¿Queda `viogi.com`? Se decide hoy con Mario. Falta saber dónde
   se registra, para los pasos de DNS.
2. **Ortografía de los nombres en Legal.** Se escribieron sin acentos:
   «Ordonez» y «Gonzales». ¿Van como «Ordoñez» u «Ordóñez», y «Gonzales» o
   «González»? Deben ir como en su identificación.
3. **Domicilio.** La decisión fue no publicarlo. La Ley Federal de Protección
   al Consumidor (art. 76 bis) pide que quien vende en línea dé su domicilio
   físico y un teléfono para reclamaciones. Opciones:
   - publicarlo;
   - publicar al menos «Toluca, Estado de México»;
   - salir sin él, sabiendo el riesgo.

   Conviene preguntarle a quien les lleve lo legal.
4. **Medición.** ¿Se agrega Vercel Analytics (V4)? Sin eso no hay datos de
   visitas ni de dónde se cae la gente al pagar; solo los pedidos.
5. **Cuántas piezas reales** habrá el día del lanzamiento. Con menos de 20, el
   inicio se ve vacío.

## Supuestos de este plan (si alguno está mal, corrige antes de repartir)

- «Seguir» se apaga completo en modo tienda, también el de marcas.
- La pestaña «Siguiendo» y el perfil `/tienda/viogi` no existen en modo
  tienda.
- La cuenta básica conserva Guardados, Compras, direcciones, cambio de
  contraseña e idioma.
- Mensajes, ofertas, «Para ti» y el reparto con Connect no entran antes del
  lanzamiento.
- El panel `/admin` no cambia.
