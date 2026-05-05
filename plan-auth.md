# VIOGI — Plan: Autenticación de usuarios (Supabase Auth)

> **Creado**: 2026-05-03
> **Autor**: Cursor (Claude Opus 4.7)
> **Branch**: `feat/product-attributes` (commits directos, 1 por paso)
> **Stack**: Next.js 14 App Router + `@supabase/ssr` 0.10 + `@supabase/supabase-js` 2.104

Este documento describe el estado actual de la autenticación en el proyecto y
los pasos atómicos para terminar de cablear Supabase Auth a la UI existente.

Cada paso = 1 commit. Tras cada commit hago una pausa, te digo qué probar (o
si no es necesario probar nada) y espero tu OK.

---

## 1. Resumen ejecutivo

VIOGI ya tiene **toda la infraestructura de Supabase Auth lista en backend**:
clientes (`browser` / `server` / `admin`), middleware que refresca cookies,
server actions completas (`signIn`, `signUp`, `signOut`, `reset`, `update`,
`Google OAuth`), y la ruta de callback `/auth/callback` que intercambia el
`code` por sesión.

**Lo que falta es 100 % de UI**: las páginas `account/`, `register/`,
`forgot-password/`, `profile/` están construidas pero usan datos mock
(`setTimeout` simulado, "Juan Pérez" hardcoded, mockOrders). Ninguna llama
todavía a las server actions que ya existen.

### Métodos de autenticación incluidos en este plan

VIOGI soportará **dos métodos** de autenticación, ambos cubiertos aquí:

1. **Email + contraseña** (propio de la plataforma)
   - Login → `AU-03`
   - Registro con auto-creación en `profiles` vía trigger SQL → `AU-04`
   - Recuperar contraseña + página de reset → `AU-05`
2. **Google OAuth** (un click)
   - Botón cableado a `signInWithGoogleAction` + flujo callback → `AU-07`
   - Requiere configuración manual en Google Cloud + Supabase Dashboard
     (paso 4.3 de este documento)

Ambos métodos comparten la misma sesión (Supabase Auth los unifica) y caen
en la misma fila de `auth.users` + `public.profiles`. El usuario que se
registra con email puede luego loguearse con Google **si usa el mismo email**
(Supabase fusiona automáticamente las identidades).

Este plan cierra la brecha en **5 iteraciones** (`AU-03` → `AU-07`).

---

## 2. Estado actual verificado del proyecto

### 2.1 Lo que ya está hecho ✅

| Capa | Archivo | Estado |
|---|---|---|
| Cliente browser | `lib/supabase/client.ts` | Configurado con `createBrowserClient` |
| Cliente server (cookies) | `lib/supabase/server.ts` | Configurado con `createServerClient` |
| Cliente service-role | `lib/supabase/admin.ts` | Listo (solo para server actions con privilegios) |
| Middleware refresh sesión | `lib/supabase/middleware.ts` + `middleware.ts` | Refresca cookies en cada request, excluye `/admin`, `/api`, `/auth` |
| Server Actions de Auth | `app/[locale]/account/actions.ts` | `signInAction`, `signUpAction`, `signOutAction`, `resetPasswordAction`, `updatePasswordAction`, `signInWithGoogleAction` |
| Callback OAuth/Magic Link | `app/auth/callback/route.ts` | `exchangeCodeForSession` → redirect a `?next=` |
| Schema DB | `supabase/migrations/0001_initial_schema.sql` | Tablas `profiles`, `addresses`, `orders`, `wishlist_items` con RLS y políticas `auth.uid()` |
| Variables entorno | `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY` ya configuradas |

### 2.2 Lo que NO está hecho ⏳

| Aspecto | Detalle |
|---|---|
| `account/page.tsx` (login) | UI lista pero **no llama a `signInAction`**. Usa `useState` local sin submit. |
| `account/register/page.tsx` | UI lista pero **no llama a `signUpAction`**. Tiene `setTimeout(1500)` simulado. |
| `account/forgot-password/page.tsx` | UI lista pero **no llama a `resetPasswordAction`**. `setTimeout(1500)` simulado. |
| `account/reset/page.tsx` | **No existe**. Es la página a la que vuelve el usuario desde el email de recuperación. |
| `account/profile/page.tsx` | Datos hardcoded `"Juan Pérez"`. **No lee `auth.getUser()` ni `profiles`**. |
| `account/addresses/page.tsx` | `mockAddresses` hardcoded. |
| `account/orders/page.tsx` | `mockOrders` hardcoded. |
| Detección de sesión en `/account` | No hay. El usuario logueado entra y vuelve a ver el form de login. |
| Header dinámico | Siempre dice `CUENTA`. No cambia según sesión. |
| Botón "Continuar con Google" | Renderiza pero **sin onClick** ni form action. |
| Trigger SQL `handle_new_user` | **No existe.** El upsert manual a `profiles` desde `signUpAction` puede fallar silenciosamente cuando no hay sesión (si la confirmación de email está activada). |

### 2.3 Lo que NO entra en este plan (se deja para después)

| Tema | Por qué se posterga |
|---|---|
| Persistir carrito (`store/cartStore.tsx`) por usuario | Sigue en localStorage. Una iteración futura puede mergearlo con DB al login (tabla nueva `cart_items`). |
| Persistir wishlist (`localStorage` → `wishlist_items`) | Tabla `wishlist_items` ya existe en DB con RLS. Iteración aparte (AU-WL). |
| Conectar `addresses/page.tsx` a tabla `addresses` | Iteración aparte (AU-ADDR). |
| Conectar `orders/page.tsx` a tabla `orders` | Depende de tener checkout funcional creando órdenes reales (Fase de pagos). |
| Pagos (Stripe / MercadoPago) | Fase futura. |
| Confirmación de email obligatoria en producción | Toggle manual en Supabase Dashboard cuando se vaya a producción. |
| Email transaccional custom (Resend) | Fase futura. Por ahora se usan los emails default de Supabase. |
| Unificar admin auth con Supabase Auth | El admin sigue con cookie `admin_token` + `ADMIN_SECRET`. Funciona y es independiente. Migrarlo a Supabase Auth con role check vía RLS sería otra fase. |

---

## 3. Decisiones técnicas

| # | Decisión | Razón |
|---|---|---|
| D1 | Usar Server Actions con `useFormState` (React 18) | Ya hay `useFormState` en el proyecto (`app/admin/login/page.tsx`). Patrón consistente. Sin librerías extra. |
| D2 | Trigger SQL `handle_new_user` con `security definer` | Más robusto que upsert client-side. Funciona aunque la sesión no exista (confirmación email obligatoria). Patrón oficial recomendado por Supabase. |
| D3 | `account/page.tsx` se convierte en **Server Component** que ramifica según sesión | Si hay sesión → mini-dashboard con logout. Si no → renderiza un Client Component `<LoginForm/>`. Soluciona el bug "redirige al mismo formulario". |
| D4 | Confirmación de email **desactivada** durante desarrollo | Permite probar el flujo sin servidor SMTP. En producción se activa con toggle en Supabase. |
| D5 | El campo `username` del formulario de registro **se ignora** | La tabla `profiles` no tiene columna `username`. Se guarda `name = "${firstName} ${lastName}"`. Si más adelante quieres `username`, añadimos `alter table` en otra iteración. |
| D6 | Header dinámico se hace con un Server Component padre que pasa `user` por prop | El Header es Client Component grande (1100+ líneas). Mantenerlo client + recibir `user` como prop es lo menos intrusivo. |
| D7 | Mensajes de error en español hard-coded en server actions | Por simplicidad. Migrar a `next-intl` server-side queda para una iteración de pulido. |
| D8 | Botón Google OAuth se cablea con `<form action={signInWithGoogleAction}>` | Server actions se invocan así sin necesidad de Client Component extra. |
| D9 | Tras `signInAction` exitoso, redirigir a `/${locale}/account` (no a `/profile`) | La página `/account` ya tendrá el dashboard (D3). Redirigir a `/profile` saltaría innecesariamente. |
| D10 | `signOutAction` se usa con `<form action={signOutAction}>` (no `useFormState`) | No tiene estado que devolver, solo redirige. |

---

## 4. Configuración manual requerida en Supabase Dashboard

**Antes de empezar a probar AU-03**, debes hacer estos pasos en el Dashboard
de tu proyecto Supabase (`https://supabase.com/dashboard/project/oilvubxpxxzfxlqhsumk`):

### 4.1 Desactivar confirmación de email (solo desarrollo)

1. **Authentication** → **Providers** → **Email**
2. Desactivar el toggle **"Confirm email"**
3. Guardar

> Esto permite que `signUp` cree usuarios usables al instante. En producción
> se vuelve a activar.

### 4.2 Configurar URLs de redirect permitidas

1. **Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**: añadir
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
4. Guardar

### 4.3 Configurar Google OAuth (REQUERIDO para AU-07)

1. Crear OAuth 2.0 Client en **Google Cloud Console**
   (https://console.cloud.google.com/apis/credentials):
   - **Application type**: Web application
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://oilvubxpxxzfxlqhsumk.supabase.co`
   - **Authorized redirect URIs**:
     - `https://oilvubxpxxzfxlqhsumk.supabase.co/auth/v1/callback`
2. Copiar **Client ID** y **Client Secret**.
3. En Supabase Dashboard → **Authentication** → **Providers** → **Google**
   → habilitar
4. Pegar Client ID y Client Secret → guardar.
5. Verificar que en **URL Configuration** la redirect URL
   `http://localhost:3000/auth/callback` está en la lista (ya añadida en 4.2).

> Sin esto, el botón "Continuar con Google" devolverá
> `?error=oauth` y AU-07 fallará la verificación.

---

## 5. Iteraciones (5 commits)

### AU-03 — Login funcional + dashboard según sesión

**Archivos**:
- `app/[locale]/account/page.tsx` (rehecho como Server Component)
- `app/[locale]/account/_components/LoginForm.tsx` (nuevo, Client Component)
- `app/[locale]/account/_components/AccountDashboard.tsx` (nuevo, Server Component con `signOut` form)

**Lógica**:
```
account/page.tsx (server)
  ├─ getUser()
  ├─ si user → <AccountDashboard user={user} />
  └─ si no   → <LoginForm locale={locale} />
```

`<LoginForm/>`:
- Mantiene el diseño visual actual (logo VIOGI, divider OR, campos, etc.).
- Usa `useFormState(signInAction, null)` para mostrar errores.
- Botón Google queda visible pero **deshabilitado con `disabled` y tooltip
  "Próximamente"** hasta AU-07 (donde se cablea al `signInWithGoogleAction`).
- Input hidden con `name="locale"` para pasar el locale al server action.

`<AccountDashboard/>`:
- Saluda con `user.email` (o nombre si lo tenemos).
- 4 cards: Mi Perfil, Mis Pedidos, Mis Direcciones, Wishlist.
- Botón "Cerrar Sesión" como `<form action={signOutAction}>` con hidden locale.

**Verificación**:
- Abrir `/es/account` sin sesión → ver form login
- Email/password vacío → "Email y contraseña requeridos"
- Credenciales inválidas → "Credenciales inválidas"
- (Tras AU-04) registrar usuario y volver aquí → login exitoso → dashboard visible
- Recargar página estando logueado → sigue mostrando dashboard
- Click "Cerrar Sesión" → vuelve al form

**Commit**: `feat(AU-03): wire login form to signInAction and add session dashboard`

---

### AU-04 — Registro funcional + trigger SQL para `profiles`

**Archivos**:
- `supabase/migrations/0002_handle_new_user.sql` (nuevo)
- `app/[locale]/account/register/page.tsx` (refactor a `useFormState`)

**SQL del trigger** (en Supabase SQL Editor + commit del archivo):
```sql
-- Crea automáticamente public.profiles cuando se crea auth.users.
-- security definer permite bypassear RLS porque la función corre como owner.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      new.email
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Aplicación**: copiar/pegar en **Supabase Dashboard → SQL Editor → Run**.

**Refactor del form**:
- Reemplazar `useState` + `setTimeout` por `useFormState(signUpAction, null)`.
- Mostrar errores devueltos por la action.
- Si la action devuelve `success` (cuando email confirmation está activo) →
  mostrar mensaje "Revisa tu correo".
- Si la action redirige (autoconfirm) → el usuario aterriza en
  `/account` viendo el dashboard de AU-03.
- Quitar el `username` del payload o dejarlo solo visual.

**Verificación**:
- Registrar `test@viogi.local` / `Password123` / Juan / Pérez → redirect a
  `/es/account` → ver dashboard con `test@viogi.local`
- En Supabase Studio → tabla `profiles` debe tener una fila con `id = auth.users.id`
  y `name = "Juan Pérez"`
- Re-registrar mismo email → "Este correo ya está registrado."
- Password de 5 chars → "La contraseña debe tener al menos 8 caracteres."

**Commit**: `feat(AU-04): handle_new_user trigger and wire register form to signUpAction`

---

### AU-05 — Forgot password + reset password

**Archivos**:
- `app/[locale]/account/forgot-password/page.tsx` (refactor a `useFormState`)
- `app/[locale]/account/reset/page.tsx` (nuevo)
- `app/[locale]/account/reset/ResetForm.tsx` (nuevo, Client Component)

**Flujo**:
1. Usuario en `/account/forgot-password` introduce email → `resetPasswordAction`
   envía correo → muestra confirmación visual ("Correo enviado").
2. Email contiene link a `${origin}/auth/callback?next=/${locale}/account/reset&code=...`
3. Callback intercambia code por sesión → redirect a `/account/reset`.
4. `/account/reset` muestra form de nueva contraseña → `updatePasswordAction`
   actualiza → redirect a `/account` (con sesión activa).

**Detalle de `/account/reset/page.tsx`**:
- Server Component que verifica `getUser()`. Si no hay sesión → redirige a
  `/account` con `?error=reset_expired`.
- Si hay sesión → renderiza `<ResetForm locale={locale} />`.

**Verificación**:
- En `/es/account/forgot-password` introducir email registrado → ver mensaje
  "Correo enviado"
- Email no registrado → mismo mensaje (anti-enumeration)
- Click en link del email → aterriza en `/account/reset` con form de password
- Password nueva válida → redirect a `/account` (sesión activa)
- Acceso directo a `/account/reset` sin sesión → redirect a `/account`

**Commit**: `feat(AU-05): wire forgot-password to resetPasswordAction and add reset page`

---

### AU-06 — Profile real + Header dinámico

**Archivos**:
- `app/[locale]/account/profile/page.tsx` (rehecho server + client)
- `app/[locale]/account/profile/ProfileForm.tsx` (nuevo, Client)
- `app/[locale]/account/profile/actions.ts` (nuevo: `updateProfileAction`)
- `components/Header.tsx` (recibe prop `userEmail` opcional)
- `components/ClientLayout.tsx` o `app/[locale]/layout.tsx` (lee user y lo pasa al Header)

**Lógica**:
- `profile/page.tsx` (server): `getUser()` → si no hay sesión, redirect a `/account`.
  Si sí, lee fila de `profiles` y pasa al Client.
- `<ProfileForm/>` muestra campos editables (`name`, `phone`) y al guardar
  llama `updateProfileAction` que hace `update profiles set ... where id = auth.uid()`.
  El email de auth no se edita aquí (cambiar email es flujo aparte de Supabase).
- `Header.tsx`: nuevo prop `userEmail?: string`. Si llega, el link "CUENTA"
  cambia el texto a "MI CUENTA" o muestra inicial. Sin breaking changes.
- Layout server lee `getUser()` una sola vez por request y pasa al Client
  layout para que llegue al Header.

**Verificación**:
- Login → ir a `/es/account/profile` → ver email del usuario, campo `name`
  prellenado del trigger
- Cambiar nombre → guardar → recargar → persiste
- Sin sesión → ir a `/es/account/profile` → redirect a `/account`
- Header logueado → muestra "MI CUENTA" (o variante)
- Header sin sesión → muestra "CUENTA"

**Commit**: `feat(AU-06): real profile page bound to profiles table and dynamic header`

---

### AU-07 — Botón "Continuar con Google" funcional

**Pre-req manual**: configuración Google del paso 4.3 hecha (Client ID y
Secret pegados en Supabase Dashboard).

**Archivos**:
- `app/[locale]/account/_components/LoginForm.tsx` (envolver botón Google en `<form action={signInWithGoogleAction}>`)

**Cambio mínimo**:
```tsx
<form action={signInWithGoogleAction}>
  <input type="hidden" name="locale" value={locale} />
  <button type="submit" className="...">
    <GoogleLogo /> {t('login_with_google')}
  </button>
</form>
```

**Verificación**:
- Click en "Continuar con Google" → redirige a Google
- Aprobar → vuelve a `/auth/callback` → redirige a `/es/account` con sesión
- Si Google provider no está configurado → redirect a `/es/account?error=oauth`

**Commit**: `feat(AU-07): wire Google OAuth button to signInWithGoogleAction`

---

## 6. Checklist de seguridad

- [x] **CSRF**: Server Actions de Next.js tienen protección CSRF nativa.
- [x] **RLS activado** en todas las tablas con datos de usuario (`profiles`,
      `addresses`, `orders`, `wishlist_items`). Policies usan `auth.uid()`.
- [x] **Service-role key** solo en `lib/supabase/admin.ts`, nunca en Client
      Components. `'use server'` confirmado.
- [x] **Cookies de sesión**: `httpOnly`, `secure` en producción, `sameSite=lax`,
      manejadas por `@supabase/ssr` (no las tocamos manualmente).
- [x] **Anti-enumeration en reset password**: `resetPasswordAction` devuelve
      `success` aunque el email no exista.
- [ ] **Email verification en producción**: pendiente activar al desplegar.
- [ ] **Rate limiting**: confiamos en los límites de Supabase Auth (default).
      Para producción se puede añadir Vercel Edge Config o Upstash.
- [ ] **Validación de password fuerte**: solo validamos `length >= 8`. Se
      puede endurecer (regex con mayúsculas/números) en una iteración aparte.
- [x] **Trigger `security definer`**: `search_path = public` fijo evita
      ataques de hijacking via search_path.
- [x] **Admin auth aislado**: el `ADMIN_SECRET` cookie sigue independiente
      de Supabase Auth. No hay riesgo de cruzar permisos.

---

## 7. Estado de iteraciones

| Paso | Descripción | Estado | Commit |
|---|---|---|---|
| AU-01  | Middleware Supabase                                       | ✅ Hecho     | `9a0e6b3` |
| AU-02  | Server Actions + OAuth callback                           | ✅ Hecho     | `3e41ddd` |
| AU-03  | Login + dashboard según sesión                            | ✅ Hecho     | `1905ed5` |
| AU-03b | Fix: redirigir a la tienda tras login/signup              | ✅ Hecho     | `d6d3b43` |
| AU-04  | Registro + trigger `handle_new_user`                      | ✅ Hecho     | `2db928c` |
| AU-05  | Forgot password + página reset                            | ✅ Hecho     | `1c8fc91` |
| AU-05b | Fix: propagar cookies de sesión en `/auth/callback`       | ✅ Hecho     | `27bf7b4` |
| AU-06a | Profile conectado a tabla `profiles` (read + update)      | ✅ Hecho     | `2dfe705` |
| AU-06b | Header dinámico ("MI CUENTA" cuando hay sesión)           | ✅ Hecho     | `a0641c4` |
| AU-07  | Botón Google OAuth                                        | ⏳ Pendiente | —         |

### Notas operativas aprendidas durante la implementación

- **Confirmación de email**: desactivada en Supabase Dashboard durante desarrollo
  (Authentication → Providers → Email → "Confirm email" OFF). Para producción
  hay que reactivarla.
- **Trigger SQL**: `0002_handle_new_user.sql` aplicado manualmente en
  Supabase SQL Editor. La fila en `public.profiles` se crea automáticamente
  al crear `auth.users`. Confirmado por pruebas de registro.
- **Bug del callback OAuth**: el patrón "set cookies + return
  NextResponse.redirect()" NO propaga las cookies al redirect. Se arregló
  construyendo el response explícito y pasándolo al cliente Supabase para
  que aplique las cookies directamente (`AU-05b`). Sin este fix, el flujo
  de recovery aterrizaba siempre en `?error=reset_expired`.
- **Botón "Cambiar contraseña" en `/account/profile`**: hoy redirige a
  `/account/forgot-password`, que a su vez redirige a `/account` si hay
  sesión (bug menor). En una iteración futura conviene ofrecer un flujo
  "cambiar password con sesión activa" sin pasar por email.
- **Mensaje de error genérico**: si Supabase devuelve "email not confirmed",
  hoy lo mostramos como "Credenciales inválidas." Mejorable cuando se
  reactive la confirmación de email en producción.

---

## 8. Después de este plan (siguientes fases)

Una vez cerrada la autenticación, el orden sugerido es:

1. **AU-WL** — Migrar wishlist de localStorage a tabla `wishlist_items`
   (con merge en login si ya había items locales).
2. **AU-ADDR** — Conectar `addresses/page.tsx` a tabla `addresses` (CRUD).
3. **AU-CART** — Persistir carrito por usuario en una tabla `cart_items`
   (con merge en login).
4. **PAY-01** — Stripe / MercadoPago en checkout.
5. **PAY-02** — Crear `orders` reales en Supabase post-pago.
6. **AU-ORD** — Conectar `orders/page.tsx` a tabla `orders` real.
7. **EMAIL-01** — Resend para confirmaciones de pedido.
8. **CFDI-01** — Facturapi para facturación.

---

## 9. Reglas de ejecución (recordatorio)

1. **Una iteración a la vez**.
2. Tras cada commit: pausa, te digo **qué probar exactamente** o "no hace
   falta probar nada", espero tu OK.
3. Si encuentro algo fuera del scope durante la iteración → lo apunto en
   este archivo en sección "TODO" y sigo.
4. Si una iteración rompe algo → `git reset --hard HEAD~1` y replanifico.
5. Antes de cada commit: `npm run type-check` debe pasar.
