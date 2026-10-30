# Lanzamiento de rail (Fase 1: Viogi como única tienda)

Lista corta de lo que falta para abrir al público. Lo que no está aquí no
bloquea el lanzamiento. Actualizado el 2026-10-29.

## Ya hecho en el código

- Tienda completa con la guía de diseño: feed, prenda, bolsa, pagar, cuenta,
  búsqueda, búsqueda por foto, vender (solicitud), ayuda y legal.
- Seguir tiendas y marcas, Guardados en la cuenta (migraciones `0024` y `0025`
  aplicadas en prod).
- Arreglos de cobro de la Etapa 1:
  - una pieza por prenda en el servidor;
  - método de pago real;
  - reintento de tarjeta;
  - eventos tardíos;
  - cancelar con prueba de dueño;
  - catálogo fresco al vender.
- Web instalable como app (PWA): ícono, pantalla completa, aviso «Instala rail»
  y página sin conexión.
- Perfil único para personas y tiendas: portada, foto, números, marcas,
  pestañas y filtros. La foto y la portada se pueden cambiar cuando se aplique
  `0026`.

## Bloquea el lanzamiento

### 1. Correo de cuentas (Supabase) — humano

- [ ] **Configurar SMTP propio en Supabase** (Authentication → Emails → SMTP).
  - Verificar en el panel: el correo de Supabase por defecto es solo para
    pruebas y no llega al público.
  - Sin SMTP propio, crear cuenta y «¿La olvidaste?» no le mandan correo a la
    gente.
  - Con Resend: un dominio verificado y su SMTP.
- [ ] En Authentication → URL Configuration:
  - Site URL = dominio final.
  - Redirect URLs incluye `https://<dominio>/auth/callback`.
- [ ] Google OAuth: el dominio final en los orígenes y redirecciones
  autorizados.

### 2. Stripe en vivo — humano

- [ ] Llaves live en Vercel: `STRIPE_SECRET_KEY` y
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- [ ] Webhook live a `https://<dominio>/api/webhooks/stripe` con estos eventos.
  Después, su `STRIPE_WEBHOOK_SECRET` en Vercel.
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
  - `payment_intent.payment_failed` (solo se registra; ya no libera)
  - `customer_cash_balance_transaction.created`
- [ ] OXXO y transferencia bancaria (SPEI) activados en el panel de Stripe.

### 2b. Migración `0026` (foto y portada) — humano

- [ ] Aplicar `supabase/migrations/0026_profile_media.sql`, igual que
  `0024`/`0025`: primero con `--dry-run`. Crea el bucket `profile-media`.
- [ ] Opcional: portada de Viogi. Subir la imagen al bucket y correr
  `update stores set cover_url = '<url pública>' where slug = 'viogi'`. Sin
  ella, la portada es un collage de sus piezas.

### 3. Dominio y marca — humano

- [ ] Dominio conectado en Vercel y `NEXT_PUBLIC_SITE_URL=https://<dominio>`.
- [ ] Variables de marca en Vercel:
  - `NEXT_PUBLIC_BRAND_NAME=rail` (ya está)
  - `NEXT_PUBLIC_BRAND_SUPPORT_EMAIL`
  - `NEXT_PUBLIC_BRAND_WHATSAPP` (opcional)
  - `BRAND_LEGAL_EMAIL`
  - `NEXT_PUBLIC_BRAND_INSTAGRAM` (cuando exista la cuenta de rail)

### 4. Legal mínimo (PROFECO) — humano

- [ ] Política de devoluciones. Hoy la página dice «la estamos terminando».
- [ ] En Legal: quién vende (nombre o razón social), domicilio y contacto.
- [ ] Aviso de privacidad con los proveedores reales:
  - Stripe
  - Supabase
  - Vercel
  - Google (Gemini, en búsqueda por foto)
  - el proveedor de correo

### 5. Prueba de punta a punta en producción — humano + agente

- [ ] Compra con tarjeta, de monto bajo:
  1. La pieza sale «Apartada» y luego «Vendida».
  2. El pedido aparece en Compras.
  3. El admin lo marca entregado.
  4. Reembolso desde Stripe.
- [ ] Compra con OXXO: el voucher aparta la pieza 24 h y, si vence, se libera.
- [ ] Crear cuenta, confirmar el correo, entrar con Google y recuperar la
  contraseña.
- [ ] Instalar la app desde un iPhone y desde un Android.

## Muy recomendable antes de abrir

- **Correo de confirmación de compra (Resend).** Una persona que compra sin
  cuenta solo ve su pedido en la página de confirmación. Si la cierra, no tiene
  cómo volver a verlo.

## Después del lanzamiento (no bloquea)

- Feed «Para ti», Actividad, mensajes y ofertas.
- Botón para que la tienda cambie su portada desde el panel, y los pasos 2–3
  de vender (cobros y revisión).
- Decidir la bolsa: por tienda más «Comprar» directo, o quitarla.
- App en tiendas con Capacitor, cuando exista la empresa.
- Admin con la nueva estética (PR #15).
- Empresa y fiscal (ver `docs/archive` y la guía fiscal del humano). Es
  necesario antes de sumar vendedores externos. Lanzar solo con Viogi no cambia
  cómo ya vende hoy.
