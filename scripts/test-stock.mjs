/**
 * Pruebas del control de stock de pieza única.
 *
 * Corre contra la base real con service_role. Crea sus propios productos de
 * prueba (prefijo ZZTEST_) y los borra al final. No toca datos existentes.
 *
 *   node scripts/test-stock.mjs
 */
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const U = env.NEXT_PUBLIC_SUPABASE_URL;
const S = env.SUPABASE_SERVICE_ROLE_KEY;
const A = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const H = (k, extra = {}) => ({
  apikey: k, Authorization: `Bearer ${k}`, 'Content-Type': 'application/json', ...extra,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * El pooler del plan Free corta conexiones de vez en cuando. Se reintenta solo
 * ante fallos de RED, nunca ante respuestas HTTP: un 400 de una reserva perdida
 * es un resultado legítimo de la prueba y reintentarlo falsearía el veredicto.
 */
async function rest(path, { key = S, method = 'GET', body, headers } = {}) {
  let lastErr;
  for (let intento = 0; intento < 4; intento++) {
    try {
      const r = await fetch(`${U}/rest/v1${path}`, {
        method, headers: H(key, headers), body: body ? JSON.stringify(body) : undefined,
      });
      const t = await r.text();
      let b; try { b = t ? JSON.parse(t) : null; } catch { b = t; }
      return { status: r.status, body: b };
    } catch (e) {
      lastErr = e;
      await sleep(400 * (intento + 1));
    }
  }
  throw new Error(`red falló tras 4 intentos en ${method} ${path}: ${lastErr?.message}`);
}

const rpc = (fn, args, key = S) =>
  rest(`/rpc/${fn}`, { key, method: 'POST', body: args });

let pass = 0, fail = 0;
const results = [];
function check(ok, label, detail = '') {
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? '  → ' + detail : ''}`); }
  results.push({ ok, label });
}
const section = (t) => console.log(`\n${'─'.repeat(70)}\n${t}\n${'─'.repeat(70)}`);

// ─── Utilidades de datos de prueba ───────────────────────────────────────────

const creados = { products: [], orders: [] };

async function crearProducto(nombre, extra = {}) {
  const r = await rest('/products', {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: {
      name: `ZZTEST_${nombre}`,
      slug: `zztest-${nombre.toLowerCase()}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      price_mxn: 300, made_in: 'México', owner: 'uzziel',
      garment_type: 'playera', chest_cm: 55, length_cm: 70, condition: 'impecable',
      ...extra,
    },
  });
  if (r.status !== 201) throw new Error(`no se pudo crear producto: ${JSON.stringify(r.body)}`);
  const p = r.body[0];
  creados.products.push(p.id);
  return p;
}

async function crearOrden(productIds) {
  const r = await rest('/orders', {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: {
      email: 'zztest@viogi.test', subtotal_mxn: 300, tax_mxn: 0, shipping_mxn: 0,
      total_mxn: 300, delivery_method: 'pickup', status: 'pending', payment_status: 'pending',
    },
  });
  if (r.status !== 201) throw new Error(`no se pudo crear orden: ${JSON.stringify(r.body)}`);
  const o = r.body[0];
  creados.orders.push(o.id);
  if (productIds?.length) {
    await rest('/order_items', {
      method: 'POST',
      body: productIds.map((pid) => ({
        order_id: o.id, product_id: pid, product_name: 'ZZTEST', quantity: 1,
        unit_price_mxn: 300, total_price_mxn: 300,
      })),
    });
  }
  return o;
}

const getProducto = async (id) =>
  (await rest(`/products?id=eq.${id}&select=id,name,sold_out,reserved_order_id,reserved_until,reservation_kind`)).body?.[0];

// ─── Pruebas ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  CONTROL DE STOCK — PIEZA ÚNICA                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  section('0. Estructura de 0012');
  const st = await rest('/settings?select=*');
  check(st.status === 200 && st.body?.length === 1, 'settings existe con exactamente 1 fila',
    `filas=${st.body?.length}`);
  const cfg = st.body?.[0];
  console.log(`    umbral=$${cfg?.card_only_threshold_mxn} · tarjeta=${cfg?.card_reserve_minutes}min · voucher=${cfg?.voucher_hours}h · manual=${cfg?.manual_hold_days}d`);

  const dup = await rest('/settings', { method: 'POST', body: { id: true } });
  check(dup.status >= 400, 'settings rechaza una segunda fila', `HTTP ${dup.status}`);

  const anonSet = await rest('/settings?select=card_only_threshold_mxn', { key: A });
  check(anonSet.status === 200, 'anon puede leer settings (el checkout lo necesita)');

  for (const c of ['reservation_kind', 'reserved_contact_phone', 'reserved_order_id']) {
    const r = await rest(`/products?select=${c}&limit=1`, { key: A });
    check(r.status !== 200, `anon bloqueado en products.${c}`, `HTTP ${r.status}`);
  }
  const anonRU = await rest('/products?select=reserved_until&limit=1', { key: A });
  check(anonRU.status === 200, 'anon SÍ lee reserved_until (para mostrar "apartada")');

  for (const fn of ['reserve_products', 'release_reservation', 'mark_order_sold', 'expire_reservations']) {
    const r = await rpc(fn, {}, A);
    check(r.status === 404 || r.status === 401 || r.status === 403,
      `anon NO puede invocar ${fn}()`, `HTTP ${r.status}`);
  }

  // ── a) Concurrencia real ──────────────────────────────────────────────────
  section('a) Dos reservas concurrentes sobre la misma prenda');
  const pA = await crearProducto('CONCURRENCIA');
  const o1 = await crearOrden([pA.id]);
  const o2 = await crearOrden([pA.id]);

  console.log('    disparando 2 reservas en paralelo (Promise.all, no en serie)…');
  const [r1, r2] = await Promise.all([
    rpc('reserve_products', { p_product_ids: [pA.id], p_order_id: o1.id, p_kind: 'card' }),
    rpc('reserve_products', { p_product_ids: [pA.id], p_order_id: o2.id, p_kind: 'card' }),
  ]);
  const ganadores = [r1, r2].filter((r) => r.status === 200).length;
  const perdedores = [r1, r2].filter((r) => r.status >= 400).length;
  console.log(`    resultado: HTTP ${r1.status} / HTTP ${r2.status}`);
  check(ganadores === 1 && perdedores === 1, 'exactamente UNA reserva gana', `ganaron ${ganadores}`);

  const perdedor = [r1, r2].find((r) => r.status >= 400);
  check(String(perdedor?.body?.message ?? '').includes('product_unavailable'),
    'la perdedora falla con product_unavailable (no un 500 genérico)',
    JSON.stringify(perdedor?.body).slice(0, 120));

  const trasCarrera = await getProducto(pA.id);
  const duenio = trasCarrera.reserved_order_id;
  check(duenio === o1.id || duenio === o2.id, 'la prenda quedó reservada por una sola orden');

  // ── 10 concurrentes, por si dos fue suerte ────────────────────────────────
  const pB = await crearProducto('CONCURRENCIA10');
  const ordenes = await Promise.all(Array.from({ length: 10 }, () => crearOrden([pB.id])));
  const res10 = await Promise.all(
    ordenes.map((o) => rpc('reserve_products', { p_product_ids: [pB.id], p_order_id: o.id, p_kind: 'card' }))
  );
  const ok10 = res10.filter((r) => r.status === 200).length;
  check(ok10 === 1, '10 reservas concurrentes: exactamente una gana', `ganaron ${ok10}`);

  // ── b) Reserva vencida ────────────────────────────────────────────────────
  section('b) Una reserva vencida no bloquea a nadie');
  const pC = await crearProducto('VENCIDA');
  const oC1 = await crearOrden([pC.id]);
  const oC2 = await crearOrden([pC.id]);
  await rpc('reserve_products', { p_product_ids: [pC.id], p_order_id: oC1.id, p_kind: 'card' });

  // Forzar el vencimiento sin tocar reserved_order_id
  await rest(`/products?id=eq.${pC.id}`, {
    method: 'PATCH', body: { reserved_until: new Date(Date.now() - 60_000).toISOString() },
  });
  const rVenc = await rpc('reserve_products', { p_product_ids: [pC.id], p_order_id: oC2.id, p_kind: 'card' });
  check(rVenc.status === 200, 'otro usuario SÍ puede tomar una reserva vencida', `HTTP ${rVenc.status}`);
  const trasVenc = await getProducto(pC.id);
  check(trasVenc.reserved_order_id === oC2.id, 'la reserva quedó a nombre del segundo usuario');
  console.log('    (sin cron de por medio: la condición vive dentro del UPDATE)');

  // ── f) Carrito de 2 con 1 ya tomada ───────────────────────────────────────
  section('f) Carrito de 2 prendas con 1 ya tomada: no reserva ninguna');
  const pD = await crearProducto('CARRITO_LIBRE');
  const pE = await crearProducto('CARRITO_TOMADA');
  const oOtro = await crearOrden([pE.id]);
  await rpc('reserve_products', { p_product_ids: [pE.id], p_order_id: oOtro.id, p_kind: 'card' });

  const oCarrito = await crearOrden([pD.id, pE.id]);
  const rCarrito = await rpc('reserve_products', {
    p_product_ids: [pD.id, pE.id], p_order_id: oCarrito.id, p_kind: 'card',
  });
  check(rCarrito.status >= 400, 'el carrito completo falla', `HTTP ${rCarrito.status}`);
  const libreTrasFallo = await getProducto(pD.id);
  check(libreTrasFallo.reserved_order_id === null,
    'la prenda libre NO quedó reservada (rollback de todas o ninguna)',
    `reserved_order_id=${libreTrasFallo.reserved_order_id}`);
  check(String(rCarrito.body?.message ?? '').includes('CARRITO_TOMADA'),
    'el error nombra cuál prenda se agotó',
    String(rCarrito.body?.message ?? '').slice(0, 120));

  // ── c) Pago confirmado ────────────────────────────────────────────────────
  section('c) Pago confirmado → vendida y fuera del listado');
  const pF = await crearProducto('VENDIDA_OK');
  const oF = await crearOrden([pF.id]);
  await rpc('reserve_products', { p_product_ids: [pF.id], p_order_id: oF.id, p_kind: 'card' });
  const rSold = await rpc('mark_order_sold', { p_order_id: oF.id });
  check(rSold.status === 200 && rSold.body?.[0]?.outcome === 'sold',
    'mark_order_sold devuelve outcome=sold', JSON.stringify(rSold.body));
  const trasVenta = await getProducto(pF.id);
  check(trasVenta.sold_out === true, 'sold_out = true');
  check(trasVenta.reserved_order_id === null, 'la reserva se limpió');

  const rReVender = await rpc('reserve_products', { p_product_ids: [pF.id], p_order_id: (await crearOrden([])).id, p_kind: 'card' });
  check(rReVender.status >= 400, 'una prenda vendida ya no se puede reservar', `HTTP ${rReVender.status}`);

  // ── d) Pago cancelado ─────────────────────────────────────────────────────
  section('d) Pago cancelado → vuelve a estar disponible');
  const pG = await crearProducto('LIBERADA');
  const oG = await crearOrden([pG.id]);
  await rpc('reserve_products', { p_product_ids: [pG.id], p_order_id: oG.id, p_kind: 'card' });
  const rRel = await rpc('release_reservation', { p_order_id: oG.id });
  check(rRel.status === 200 && rRel.body === 1, 'release_reservation liberó 1 prenda', `devolvió ${JSON.stringify(rRel.body)}`);
  const trasLib = await getProducto(pG.id);
  check(trasLib.reserved_order_id === null && trasLib.sold_out === false, 'la prenda está disponible otra vez');
  const oG2 = await crearOrden([pG.id]);
  const rRetoma = await rpc('reserve_products', { p_product_ids: [pG.id], p_order_id: oG2.id, p_kind: 'card' });
  check(rRetoma.status === 200, 'otro usuario puede comprarla');

  // ── e) Idempotencia ───────────────────────────────────────────────────────
  section('e) Webhook duplicado: no rompe ni duplica');
  const pH = await crearProducto('IDEMPOTENTE');
  const oH = await crearOrden([pH.id]);
  await rpc('reserve_products', { p_product_ids: [pH.id], p_order_id: oH.id, p_kind: 'card' });
  const s1 = await rpc('mark_order_sold', { p_order_id: oH.id });
  const s2 = await rpc('mark_order_sold', { p_order_id: oH.id });
  const s3 = await rpc('mark_order_sold', { p_order_id: oH.id });
  check(s1.status === 200 && s2.status === 200 && s3.status === 200,
    'mark_order_sold 3 veces seguidas: ningún error');
  const trasIdem = await getProducto(pH.id);
  check(trasIdem.sold_out === true, 'sigue vendida (no se corrompió)');
  const items = await rest(`/order_items?order_id=eq.${oH.id}&select=id`);
  check(items.body?.length === 1, 'no se duplicaron order_items', `hay ${items.body?.length}`);

  // Reserva repetida por la MISMA orden (reintento del usuario)
  const pI = await crearProducto('REINTENTO');
  const oI = await crearOrden([pI.id]);
  const t1 = await rpc('reserve_products', { p_product_ids: [pI.id], p_order_id: oI.id, p_kind: 'card' });
  const t2 = await rpc('reserve_products', { p_product_ids: [pI.id], p_order_id: oI.id, p_kind: 'card' });
  check(t1.status === 200 && t2.status === 200, 'la misma orden puede re-reservar su prenda (reintento)');

  // ── Caso borde del punto 5 ────────────────────────────────────────────────
  section('Caso borde: pago confirmado pero la prenda ya se fue con otro');
  const pJ = await crearProducto('CONFLICTO');
  const oLento = await crearOrden([pJ.id]);
  await rpc('reserve_products', { p_product_ids: [pJ.id], p_order_id: oLento.id, p_kind: 'card' });
  await rest(`/products?id=eq.${pJ.id}`, {
    method: 'PATCH', body: { reserved_until: new Date(Date.now() - 60_000).toISOString() },
  });
  const oRapido = await crearOrden([pJ.id]);
  await rpc('reserve_products', { p_product_ids: [pJ.id], p_order_id: oRapido.id, p_kind: 'card' });
  await rpc('mark_order_sold', { p_order_id: oRapido.id });

  const rConflicto = await rpc('mark_order_sold', { p_order_id: oLento.id });
  check(rConflicto.body?.[0]?.outcome === 'conflict',
    'el pedido tardío devuelve outcome=conflict (no pasa en silencio)',
    JSON.stringify(rConflicto.body));

  // ── Regresión: pago tardío NO le roba la prenda a una reserva viva ────────
  // Este es el orden que importa: el pago tardío llega ANTES de que el nuevo
  // dueño pague. La versión de 0012 vendía la prenda al pedido tardío y
  // borraba la reserva viva del otro. Corregido en 0013.
  section('Regresión: un pago tardío no le roba la prenda a otra reserva viva');
  const pR = await crearProducto('ROBO');
  const oTarde = await crearOrden([pR.id]);
  const oNuevo = await crearOrden([pR.id]);

  await rpc('reserve_products', { p_product_ids: [pR.id], p_order_id: oTarde.id, p_kind: 'card' });
  await rest(`/products?id=eq.${pR.id}`, {
    method: 'PATCH', body: { reserved_until: new Date(Date.now() - 60_000).toISOString() },
  });
  await rpc('reserve_products', { p_product_ids: [pR.id], p_order_id: oNuevo.id, p_kind: 'card' });

  const rTardio = await rpc('mark_order_sold', { p_order_id: oTarde.id });
  check(rTardio.body?.[0]?.outcome === 'conflict',
    'el pago tardío devuelve conflict, no se queda la prenda',
    JSON.stringify(rTardio.body));

  const trasRobo = await getProducto(pR.id);
  check(trasRobo.sold_out === false, 'la prenda NO quedó vendida al pedido tardío');
  check(trasRobo.reserved_order_id === oNuevo.id,
    'la reserva viva del nuevo dueño sobrevivió intacta',
    `reserved_order_id=${trasRobo.reserved_order_id}`);

  const rNuevo = await rpc('mark_order_sold', { p_order_id: oNuevo.id });
  check(rNuevo.body?.[0]?.outcome === 'sold', 'el dueño legítimo sí puede completar su compra');

  // Idempotencia después del fix: repetir sobre una venta propia no da conflict
  const rRepite = await rpc('mark_order_sold', { p_order_id: oNuevo.id });
  check(rRepite.body?.[0]?.outcome === 'sold',
    'webhook repetido sobre venta propia sigue dando sold (no conflict)',
    JSON.stringify(rRepite.body));

  // ── Ventanas por método de pago ───────────────────────────────────────────
  section('Ventanas de reserva: tarjeta / SPEI / OXXO son distintas');
  const cfgW = (await rest('/settings?select=*')).body[0];
  const esHabil = (await rpc('is_business_day', {
    p_date: new Date(Date.now() - 6 * 3600e3).toISOString().slice(0, 10), // hora MX aprox
  })).body;
  console.log(`    hoy en México: ${esHabil ? 'día hábil' : 'NO hábil (fin de semana o festivo)'}`);

  const ventana = async (kind) => {
    const p = await crearProducto(`VENTANA_${kind.toUpperCase()}`);
    const o = await crearOrden([p.id]);
    const r = await rpc('reserve_products', { p_product_ids: [p.id], p_order_id: o.id, p_kind: kind });
    if (r.status !== 200) return null;
    return Math.round((new Date(r.body) - Date.now()) / 60000);
  };

  const mCard = await ventana('card');
  const mSpei = await ventana('spei');
  const mVouc = await ventana('voucher');
  console.log(`    tarjeta=${mCard}min · spei=${mSpei}min · oxxo=${mVouc}min`);

  check(mCard !== null && Math.abs(mCard - cfgW.card_reserve_minutes) <= 2,
    `tarjeta usa card_reserve_minutes (${cfgW.card_reserve_minutes})`, `dio ${mCard}`);
  check(mVouc !== null && Math.abs(mVouc - cfgW.voucher_hours * 60) <= 2,
    `OXXO usa voucher_hours (${cfgW.voucher_hours}h)`, `dio ${mVouc}min`);

  if (esHabil) {
    check(mSpei !== null && Math.abs(mSpei - cfgW.spei_reserve_minutes) <= 2,
      `SPEI en día hábil usa spei_reserve_minutes (${cfgW.spei_reserve_minutes})`, `dio ${mSpei}`);
  } else {
    check(mSpei !== null && mSpei > cfgW.spei_reserve_minutes * 2,
      'SPEI en día NO hábil se extiende al siguiente día hábil',
      `dio ${mSpei}min, esperaba mucho más que ${cfgW.spei_reserve_minutes}`);
  }
  check(mSpei !== mVouc, 'SPEI y OXXO NO comparten ventana (son tres, no dos)');

  // Cambiar de método a media sesión extiende la reserva
  const pExt = await crearProducto('EXTIENDE');
  const oExt = await crearOrden([pExt.id]);
  const t0 = await rpc('reserve_products', { p_product_ids: [pExt.id], p_order_id: oExt.id, p_kind: 'card' });
  const tExt = await rpc('extend_reservation_for_method', { p_order_id: oExt.id, p_kind: 'voucher' });
  check(new Date(tExt.body) > new Date(t0.body),
    'elegir OXXO a media sesión extiende la reserva de 30min a 24h');

  // Calendario de días hábiles
  section('Calendario bancario mexicano');
  for (const [fecha, etq, esperado] of [
    ['2026-09-16', '16 de septiembre', false],
    ['2026-12-25', 'Navidad', false],
    ['2026-09-19', 'sábado', false],
    ['2026-09-14', 'lunes normal', true],
  ]) {
    const r = await rpc('is_business_day', { p_date: fecha });
    check(r.body === esperado, `${fecha} (${etq}) → ${esperado ? 'hábil' : 'no hábil'}`);
  }
  const nbd = await rpc('next_business_day', { p_date: '2026-09-15' });
  check(nbd.body === '2026-09-17', 'martes 15 → jueves 17 (salta el festivo del 16)', `dio ${nbd.body}`);

  // ── Apartado manual ───────────────────────────────────────────────────────
  section('Apartado manual (venta por DM)');
  const pK = await crearProducto('MANUAL');
  const rMan = await rpc('admin_manual_hold', {
    p_product_id: pK.id, p_name: 'Cliente DM', p_phone: '+5215512345678',
  });
  check(rMan.status === 200, 'admin_manual_hold aparta la prenda', `HTTP ${rMan.status}`);
  const trasManual = await getProducto(pK.id);
  check(trasManual.reservation_kind === 'manual', 'reservation_kind = manual');
  const oIntruso = await crearOrden([pK.id]);
  const rIntruso = await rpc('reserve_products', { p_product_ids: [pK.id], p_order_id: oIntruso.id, p_kind: 'card' });
  check(rIntruso.status >= 400, 'nadie puede comprarla mientras está apartada por DM');
  await rpc('admin_release_product', { p_product_id: pK.id });
  const trasSoltar = await getProducto(pK.id);
  check(trasSoltar.reserved_order_id === null, 'admin_release_product la libera');

  // ── Higiene ───────────────────────────────────────────────────────────────
  section('Cron de higiene (no es correctitud, es limpieza)');
  const pL = await crearProducto('HIGIENE');
  const oL = await crearOrden([pL.id]);
  await rpc('reserve_products', { p_product_ids: [pL.id], p_order_id: oL.id, p_kind: 'card' });
  await rest(`/products?id=eq.${pL.id}`, {
    method: 'PATCH', body: { reserved_until: new Date(Date.now() - 60_000).toISOString() },
  });
  const rExp = await rpc('expire_reservations', {});
  check(rExp.status === 200 && Number(rExp.body) >= 1, 'expire_reservations limpia vencidas', `limpió ${rExp.body}`);

  // ── Limpieza ──────────────────────────────────────────────────────────────
  section('Limpieza de datos de prueba');
  for (const id of creados.orders) await rest(`/order_items?order_id=eq.${id}`, { method: 'DELETE' });
  for (const id of creados.orders) await rest(`/orders?id=eq.${id}`, { method: 'DELETE' });
  for (const id of creados.products) await rest(`/products?id=eq.${id}`, { method: 'DELETE' });
  const quedan = await rest('/products?select=id&name=like.ZZTEST_*');
  check((quedan.body ?? []).length === 0, 'no quedaron productos de prueba', `quedan ${quedan.body?.length}`);
  const total = await rest('/products?select=id');
  console.log(`    productos reales en la base: ${(total.body ?? []).length}`);

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`RESULTADO: ${pass} pasan · ${fail} fallan`);
  console.log('═'.repeat(70));
  if (fail > 0) {
    console.log('\nFALLAS:');
    results.filter((r) => !r.ok).forEach((r) => console.log(`  ✗ ${r.label}`));
    process.exit(1);
  }
}

main().catch(async (e) => {
  console.error('\nERROR FATAL:', e.message);
  console.error('Intentando limpiar…');
  for (const id of creados.orders) await rest(`/order_items?order_id=eq.${id}`, { method: 'DELETE' });
  for (const id of creados.orders) await rest(`/orders?id=eq.${id}`, { method: 'DELETE' });
  for (const id of creados.products) await rest(`/products?id=eq.${id}`, { method: 'DELETE' });
  process.exit(1);
});
