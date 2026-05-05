# VIOGI — Pre-flight: Bugs y Deuda Técnica Antes del Backend

> Creado: 2026-04-24
> Objetivo: dejar el frontend 100% limpio antes de conectar Supabase + Auth + Pagos
> Regla: un cambio → type-check + build → verificación → commit → siguiente

---

## Bugs y deuda identificados

| ID | Tipo | Archivo | Descripción |
|---|---|---|---|
| PF-01 | Bug UX | `components/Header.tsx` | Search input no navega a `/search` |
| PF-02 | Bug UI | `checkout/page.tsx` | Botón "Apply" descuento es no-op visible |
| PF-03 | Bug funcional | `wishlist/page.tsx` | Wishlist no persiste en localStorage |
| PF-04 | Deuda | `package.json` | `framer-motion` declarado pero sin ningún import |

---

## PF-01 — Header search navega a `/search`

**Archivo:** `components/Header.tsx`
**Problema:** El input captura `searchQuery` en estado local pero no hay `onSubmit`
ni `onKeyDown`. El usuario escribe y pulsa Enter → nada. La página `/search`
ya acepta `?q=` pero nunca recibe el query desde el header.

**Cambio:**
1. Importar `useRouter` de `next/navigation` (ya importado en el archivo — verificar).
2. Envolver el bloque `<svg lupa> + <input>` en un `<form>` con:
   ```tsx
   onSubmit={(e) => {
     e.preventDefault();
     const q = searchQuery.trim();
     if (!q) return;
     setSearchOpen(false);
     setSearchQuery('');
     router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
   }}
   ```
3. El botón de cerrar (×) debe tener `type="button"` para no disparar el submit.

**Verificación:**
- [ ] Escribir "hoodie" + Enter → navega a `/es/search?q=hoodie` y muestra el hoodie Playboy
- [ ] Query vacío + Enter → no navega
- [ ] ESC cierra el modal sin navegar
- [ ] Click en el overlay cierra sin navegar
- [ ] En `/en/`: navega a `/en/search?q=hoodie`
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅

**Commit:** `fix(PF-01): wire header search input to /search?q=`

---

## PF-02 — Ocultar bloque de descuento hasta tener backend

**Archivo:** `app/[locale]/checkout/page.tsx`
**Problema:** El campo de código de descuento y su botón "Apply" son visibles.
El botón tiene `onClick={() => {/* TODO */}}`. El estado `discountCode` existe
pero nunca afecta ningún total. Un usuario real escribe un código → aprieta
Apply → nothing → confusión.

**Cambio:**
1. Eliminar el bloque del input de descuento + botón Apply (~10 líneas).
2. Eliminar el estado `const [discountCode, setDiscountCode] = useState('')`
   si ya no se usa en ningún otro lugar del archivo.
3. Dejar la clave `discount_code` en `messages/*.json` intacta (se usará
   en Fase 2 cuando haya backend de cupones).

**Verificación:**
- [ ] El campo de descuento no aparece en el resumen del checkout
- [ ] El layout del resumen lateral se ve correcto sin ese bloque
- [ ] No hay errores TypeScript por variable sin usar
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅

**Commit:** `fix(PF-02): hide discount code input until backend is ready`

---

## PF-03 — Wishlist persiste en localStorage

**Archivo:** `app/[locale]/wishlist/page.tsx`
**Problema:** Los items están inicializados como `['1','2','3']` hardcodeados.
Quitar un item y recargar → vuelven. `STORAGE_KEYS.WISHLIST` (`viogi_wishlist`)
ya existe en `lib/constants.ts` pero no se usa aquí.

**Cambio — patrón idéntico al cartStore:**
1. Importar `STORAGE_KEYS` desde `@/lib/constants`.
2. Reemplazar `useState(['1','2','3'])` por `useState<string[]>([])`.
3. Agregar `useEffect` de hidratación (lee localStorage al montar).
4. Agregar `useEffect` de persistencia (escribe en cada cambio, solo tras hidratación).

**Verificación:**
- [ ] Cargar `/es/wishlist` → lista vacía (no más mock)
- [ ] Agregar via DevTools: `localStorage.setItem('viogi_wishlist', '["1","2"]')` + recargar → muestra 2 productos
- [ ] Quitar un item → recargar → sigue sin ese item
- [ ] Vaciar → recargar → sigue vacía
- [ ] Sin localStorage disponible → no rompe, muestra lista vacía
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅

**Commit:** `fix(PF-03): persist wishlist to localStorage (STORAGE_KEYS.WISHLIST)`

---

## PF-04 — Eliminar dependencia framer-motion sin usar

**Archivo:** `package.json`
**Problema:** `framer-motion` está en `dependencies` pero no hay ningún
`import from 'framer-motion'` en todo el codebase. Peso muerto en el bundle.

**Cambio:**
1. Verificar con grep que no haya imports.
2. `npm uninstall framer-motion`.
3. Confirmar que `package.json` y `package-lock.json` se actualizan.

**Verificación:**
- [ ] `npm run build` ✅ sin el paquete
- [ ] `npm run type-check` ✅

**Commit:** `chore(PF-04): remove unused framer-motion dependency`

---

## Orden de ejecución

```
PF-01 → PF-02 → PF-03 → PF-04
```

Cada uno: cambio → type-check → build → verificación → commit → siguiente.

---

## Estado

| ID | Estado | Commit |
|---|---|---|
| PF-01 | ✅ Completado | `a9553ce` |
| PF-02 | ✅ Completado | `554a79c` |
| PF-03 | ✅ Completado | `413e146` |
| PF-04 | ✅ Completado | `3433ad3` |
