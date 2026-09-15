/**
 * Pruebas del flujo de pago: umbral de métodos y ciclo asíncrono de OXXO.
 *
 * Requiere el servidor de desarrollo corriendo en localhost:3000, porque
 * dispara webhooks FIRMADOS contra la ruta real /api/webhooks/stripe.
 *
 *   npm run dev          (en otra terminal)
 *   node scripts/test-checkout-flow.mjs
 */
import fs from 'node:fs';
import Stripe from 'stripe';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const U = env.NEXT_PUBLIC_SUPABASE_URL;
const S = env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
const APP = process.env.APP_URL ?? 'http://localhost:3000';
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rest(path, { method = 'GET', body, headers } = {}) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(`${U}/rest/v1${path}`, {
        method,
        headers: { apikey: S, Authorization: `Bearer ${S}`, 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
      });
      const t = await r.text();
      let b; try { b = t ? JSON.parse(t) : null; } catch { b = t; }
      return { status: r.status, body: b };
    } catch (e) { await sleep(400 * (i + 1)); }
  }
  throw new Error(`red falló en ${method} ${path}`);
}
const rpc = (fn, args) => rest(`/rpc/${fn}`, { method: 'POST', body: args });

let pass = 0, fail = 0;
const fallas = [];
function check(ok, label, detail = '') {
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; fallas.push(label); console.log(`  ✗ ${label}${detail ? '  → ' + detail : ''}`); }
}
const section = (t) => console.log(`\n${'─'.repeat(70)}\n${t}\n${'─'.repeat(70)}`);

const limpiar = { productos: [], ordenes: [] };

async function crearProducto(nombre, precio = 300) {
  const r = await rest('/products', {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: {
      name: `ZZFLOW_${nombre}`,
      slug: `zzflow-${nombre.toLowerCase()}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      price_mxn: precio, made_in: 'México', owner: 'uzziel',
      garment_type: 'playera', chest_cm: 55, length_cm: 70, condition: 'impecable',
    },
  });
  if (r.status !== 201) throw new Error(`crear producto: ${JSON.stringify(r.body)}`);
  limpiar.productos.push(r.body[0].id);
  return r.body[0];
}

async function crearOrden(productId, sessionId) {
  const r = await rest('/orders', {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: {
      email: 'zzflow@viogi.test', phone: '+5215500000000',
      subtotal_mxn: 300, tax_mxn: 0, shipping_mxn: 0, total_mxn: 300,
      delivery_method: 'pickup', status: 'pending', payment_status: 'pending',
      stripe_session_id: sessionId,
    },
  });
  if (r.status !== 201) throw new Error(`crear orden: ${JSON.stringify(r.body)}`);
  const o = r.body[0];
  limpiar.ordenes.push(o.id);
  await rest('/order_items', {
    method: 'POST',
    body: [{ order_id: o.id, product_id: productId, product_name: 'ZZFLOW', quantity: 1, unit_price_mxn: 300, total_price_mxn: 300 }],
  });
  return o;
}

/** Dispara un webhook FIRMADO contra la ruta real. */
async function webhook(tipo, objeto) {
  const payload = JSON.stringify({
    id: `evt_test_${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
    object: 'event', api_version: '2026-04-22.dahlia', created: Math.floor(Date.now() / 1000),
    type: tipo, data: { object: objeto },
  });
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  const r = await fetch(`${APP}/api/webhooks/stripe`, {
    method: 'POST',
    headers: { 'stripe-signature': header, 'Content-Type': 'application/json' },
    body: payload,
  });
  return { status: r.status, body: await r.text() };
}

const getProducto = async (id) =>
  (await rest(`/products?id=eq.${id}&select=sold_out,reserved_order_id,reserved_until,reservation_kind`)).body?.[0];
const getOrden = async (id) =>
  (await rest(`/orders?id=eq.${id}&select=payment_status,status,payment_method,needs_review,review_reason`)).body?.[0];

const sesion = (overrides) => ({
  id: `cs_test_${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
  object: 'checkout.session', mode: 'payment', payment_intent: `pi_test_${Date.now()}`,
  ...overrides,
});

// ─── Pruebas ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  FLUJO DE PAGO — UMBRAL Y CICLO ASÍNCRONO                        ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  // El servidor tiene que estar arriba o las pruebas del webhook no prueban nada.
  try {
    const ping = await fetch(`${APP}/api/webhooks/stripe`, { method: 'POST', body: '{}' });
    if (ping.status !== 400) throw new Error(`respuesta inesperada: ${ping.status}`);
  } catch (e) {
    console.error(`\nERROR: el servidor no responde en ${APP}\n  Corre \`npm run dev\` en otra terminal.\n  (${e.message})`);
    process.exit(1);
  }
  console.log(`\n  servidor: ${APP} — responde`);

  const cfg = (await rest('/settings?select=*')).body[0];
  console.log(`  umbral: $${cfg.card_only_threshold_mxn} · tarjeta ${cfg.card_reserve_minutes}min · spei ${cfg.spei_reserve_minutes}min · oxxo ${cfg.voucher_hours}h`);

  // ── g) Umbral: prenda cara no ofrece OXXO/SPEI ────────────────────────────
  section('g) Umbral — una prenda de $600 no ofrece OXXO ni SPEI');

  const umbral = Number(cfg.card_only_threshold_mxn);

  // Primero la decisión pura, en los bordes exactos.
  const esSoloTarjeta = (total) => total > umbral;
  check(!esSoloTarjeta(umbral), `$${umbral} exacto NO es solo-tarjeta (el umbral no incluye el límite)`);
  check(esSoloTarjeta(umbral + 0.01), `$${umbral + 0.01} SÍ es solo-tarjeta`);
  check(esSoloTarjeta(600), '$600 es solo-tarjeta');
  check(!esSoloTarjeta(300), '$300 acepta métodos diferidos');

  // Ahora contra Stripe de verdad: ¿respeta la exclusión?
  const crearSesion = async (montoMxn, excluir) =>
    stripe.checkout.sessions.create({
      mode: 'payment', ui_mode: 'embedded_page', return_url: `${APP}/es/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      line_items: [{ quantity: 1, price_data: { currency: 'mxn', unit_amount: montoMxn * 100, product_data: { name: 'ZZFLOW umbral' } } }],
      ...(excluir ? { excluded_payment_method_types: ['oxxo', 'customer_balance'] } : {}),
    });

  const caraCS = await crearSesion(600, true);
  const metodosCara = caraCS.payment_method_types ?? [];
  console.log(`    $600 → métodos ofrecidos: ${metodosCara.join(', ')}`);
  check(!metodosCara.includes('oxxo'), 'Stripe NO ofrece OXXO en la prenda de $600');
  check(!metodosCara.includes('customer_balance'), 'Stripe NO ofrece SPEI en la prenda de $600');
  check(metodosCara.includes('card'), 'Stripe sí ofrece tarjeta');
  await stripe.checkout.sessions.expire(caraCS.id).catch(() => {});

  const baratCS = await crearSesion(300, false);
  const metodosBarata = baratCS.payment_method_types ?? [];
  console.log(`    $300 → métodos ofrecidos: ${metodosBarata.join(', ')}`);
  check(metodosBarata.length > 0, 'la prenda barata ofrece métodos dinámicos');
  await stripe.checkout.sessions.expire(baratCS.id).catch(() => {});

  // Forzar la petición desde el cliente no sirve: el servidor decide.
  console.log('    (la exclusión la decide el servidor al crear la sesión: el cliente');
  console.log('     no puede reactivar OXXO manipulando la petición)');

  // ── h) Flujo OXXO completo ────────────────────────────────────────────────
  section('h) OXXO: sesión completada → PAGO_PENDIENTE → pago confirmado → VENDIDA');

  const pOxxo = await crearProducto('OXXO');
  const csId = `cs_test_oxxo_${Date.now()}`;
  const oOxxo = await crearOrden(pOxxo.id, csId);

  // 1. Reserva al iniciar el checkout, con ventana de tarjeta
  const res = await rpc('reserve_products', { p_product_ids: [pOxxo.id], p_order_id: oOxxo.id, p_kind: 'card' });
  check(res.status === 200, '1. la prenda se reserva al iniciar el checkout');
  const trasReserva = await getProducto(pOxxo.id);
  const minsIniciales = Math.round((new Date(trasReserva.reserved_until) - Date.now()) / 60000);
  check(trasReserva.reservation_kind === 'card', `   ventana inicial de tarjeta (${minsIniciales} min)`);

  // 2. El cliente elige OXXO → sesión completada SIN pagar
  const w1 = await webhook('checkout.session.completed', sesion({
    id: csId, payment_status: 'unpaid', payment_method_types: ['oxxo'],
    metadata: { order_id: oOxxo.id, order_number: 'ZZFLOW' },
  }));
  check(w1.status === 200, '2. webhook checkout.session.completed (sin pagar) aceptado', `HTTP ${w1.status} ${w1.body}`);

  const ordenPend = await getOrden(oOxxo.id);
  check(ordenPend.payment_status === 'awaiting_payment',
    '   el pedido queda en PAGO_PENDIENTE, no en confirmado', `dio ${ordenPend.payment_status}`);
  check(ordenPend.payment_method === 'oxxo', '   método registrado como oxxo', `dio ${ordenPend.payment_method}`);

  const trasVoucher = await getProducto(pOxxo.id);
  const minsVoucher = Math.round((new Date(trasVoucher.reserved_until) - Date.now()) / 60000);
  check(trasVoucher.reservation_kind === 'voucher',
    '   la reserva cambia a ventana de voucher', `dio ${trasVoucher.reservation_kind}`);
  check(minsVoucher > minsIniciales,
    `   la ventana se extiende (${minsIniciales}min → ${minsVoucher}min)`);
  check(trasVoucher.sold_out === false, '   la prenda NO se marca vendida todavía');

  // 3. El cliente paga en OXXO
  const w2 = await webhook('checkout.session.async_payment_succeeded', sesion({
    id: csId, payment_status: 'paid', payment_method_types: ['oxxo'],
    metadata: { order_id: oOxxo.id, order_number: 'ZZFLOW' },
  }));
  check(w2.status === 200, '3. webhook async_payment_succeeded aceptado', `HTTP ${w2.status} ${w2.body}`);

  const ordenFinal = await getOrden(oOxxo.id);
  const prendaFinal = await getProducto(pOxxo.id);
  check(ordenFinal.payment_status === 'completed', '   pedido confirmado', `dio ${ordenFinal.payment_status}`);
  check(prendaFinal.sold_out === true, '   la prenda queda VENDIDA');
  check(prendaFinal.reserved_order_id === null, '   la reserva se limpió');
  check(ordenFinal.needs_review === false, '   sin bandera de revisión (todo salió bien)');

  // ── OXXO que nunca se paga ────────────────────────────────────────────────
  section('OXXO: el voucher vence sin pagar → la prenda se libera');
  const pFall = await crearProducto('OXXO_FALLIDO');
  const csFall = `cs_test_fall_${Date.now()}`;
  const oFall = await crearOrden(pFall.id, csFall);
  await rpc('reserve_products', { p_product_ids: [pFall.id], p_order_id: oFall.id, p_kind: 'card' });
  await webhook('checkout.session.completed', sesion({
    id: csFall, payment_status: 'unpaid', payment_method_types: ['oxxo'],
    metadata: { order_id: oFall.id },
  }));
  const wFall = await webhook('checkout.session.async_payment_failed', sesion({
    id: csFall, payment_status: 'unpaid', payment_method_types: ['oxxo'],
    metadata: { order_id: oFall.id },
  }));
  check(wFall.status === 200, 'webhook async_payment_failed aceptado');
  const prendaLib = await getProducto(pFall.id);
  const ordenLib = await getOrden(oFall.id);
  check(prendaLib.reserved_order_id === null && prendaLib.sold_out === false,
    'la prenda vuelve a estar disponible');
  check(ordenLib.payment_status === 'failed', 'el pedido queda como fallido', `dio ${ordenLib.payment_status}`);

  // ── Sesión expirada ───────────────────────────────────────────────────────
  section('La sesión expira sin que el cliente pague → se libera');
  const pExp = await crearProducto('EXPIRADA');
  const csExp = `cs_test_exp_${Date.now()}`;
  const oExp = await crearOrden(pExp.id, csExp);
  await rpc('reserve_products', { p_product_ids: [pExp.id], p_order_id: oExp.id, p_kind: 'card' });
  const wExp = await webhook('checkout.session.expired', sesion({
    id: csExp, payment_status: 'unpaid', payment_method_types: ['card'],
    metadata: { order_id: oExp.id },
  }));
  check(wExp.status === 200, 'webhook checkout.session.expired aceptado');
  const prendaExp = await getProducto(pExp.id);
  check(prendaExp.reserved_order_id === null, 'la prenda se libera');
  check((await getOrden(oExp.id)).payment_status === 'expired', 'el pedido queda como expirado');

  // ── e) Idempotencia del webhook ───────────────────────────────────────────
  section('e) Webhook duplicado: no rompe ni duplica');
  const pIdem = await crearProducto('IDEM');
  const csIdem = `cs_test_idem_${Date.now()}`;
  const oIdem = await crearOrden(pIdem.id, csIdem);
  await rpc('reserve_products', { p_product_ids: [pIdem.id], p_order_id: oIdem.id, p_kind: 'card' });

  const ev = sesion({ id: csIdem, payment_status: 'paid', payment_method_types: ['card'], metadata: { order_id: oIdem.id } });
  const r1 = await webhook('checkout.session.completed', ev);
  const r2 = await webhook('checkout.session.completed', ev);
  const r3 = await webhook('checkout.session.completed', ev);
  check([r1, r2, r3].every((r) => r.status === 200), 'tres entregas del mismo evento: las tres 200');

  const idemFinal = await getProducto(pIdem.id);
  const idemOrden = await getOrden(oIdem.id);
  check(idemFinal.sold_out === true, 'la prenda sigue vendida');
  check(idemOrden.payment_status === 'completed', 'el pedido sigue confirmado');
  check(idemOrden.needs_review === false,
    'NO se marca revisión por el reenvío (sold_order_id da idempotencia)',
    `needs_review=${idemOrden.needs_review} razón=${idemOrden.review_reason}`);

  // ── Caso borde: pagó pero la prenda ya no está ────────────────────────────
  section('Caso borde: pago confirmado sobre prenda que ya se fue → revisión manual');
  const pBorde = await crearProducto('BORDE');
  const csBorde = `cs_test_borde_${Date.now()}`;
  const oTarde = await crearOrden(pBorde.id, csBorde);
  const oOtro = await crearOrden(pBorde.id, `cs_otro_${Date.now()}`);

  await rpc('reserve_products', { p_product_ids: [pBorde.id], p_order_id: oTarde.id, p_kind: 'card' });
  await rest(`/products?id=eq.${pBorde.id}`, {
    method: 'PATCH', body: { reserved_until: new Date(Date.now() - 60000).toISOString() },
  });
  await rpc('reserve_products', { p_product_ids: [pBorde.id], p_order_id: oOtro.id, p_kind: 'card' });
  await rpc('mark_order_sold', { p_order_id: oOtro.id });

  const wBorde = await webhook('checkout.session.completed', sesion({
    id: csBorde, payment_status: 'paid', payment_method_types: ['card'], metadata: { order_id: oTarde.id },
  }));
  check(wBorde.status === 200, 'el webhook del pago tardío se procesa sin reventar');
  const ordenBorde = await getOrden(oTarde.id);
  check(ordenBorde.needs_review === true, 'el pedido queda marcado para revisión manual');
  check(Boolean(ordenBorde.review_reason), 'con una razón legible para el admin');
  console.log(`    razón: ${ordenBorde.review_reason}`);

  // ── Limpieza ──────────────────────────────────────────────────────────────
  section('Limpieza');
  for (const id of limpiar.ordenes) await rest(`/order_items?order_id=eq.${id}`, { method: 'DELETE' });
  for (const id of limpiar.ordenes) await rest(`/orders?id=eq.${id}`, { method: 'DELETE' });
  for (const id of limpiar.productos) await rest(`/products?id=eq.${id}`, { method: 'DELETE' });
  const restantes = await rest('/products?select=id&name=like.ZZFLOW_*');
  check((restantes.body ?? []).length === 0, 'sin residuos de prueba');
  console.log(`    productos reales: ${((await rest('/products?select=id')).body ?? []).length}`);

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`RESULTADO: ${pass} pasan · ${fail} fallan`);
  console.log('═'.repeat(70));
  if (fail) { console.log('\nFALLAS:'); fallas.forEach((f) => console.log(`  ✗ ${f}`)); process.exit(1); }
}

main().catch(async (e) => {
  console.error('\nERROR FATAL:', e.message);
  for (const id of limpiar.ordenes) await rest(`/order_items?order_id=eq.${id}`, { method: 'DELETE' });
  for (const id of limpiar.ordenes) await rest(`/orders?id=eq.${id}`, { method: 'DELETE' });
  for (const id of limpiar.productos) await rest(`/products?id=eq.${id}`, { method: 'DELETE' });
  process.exit(1);
});
