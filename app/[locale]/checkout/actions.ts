'use server';

import { createHmac } from 'crypto';
import { reconcileCartItems } from '@/lib/cart/reconcile';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { getSettings, isCardOnly, DEFERRED_PAYMENT_METHODS } from '@/lib/settings';
import { normalizePhone } from '@/lib/phone';
import { STANDARD_SHIPPING_COST, EXPRESS_SHIPPING_COST } from '@/lib/constants';
import { mapPickupPointRow, type PickupPointRow } from '@/lib/pickup';
import type { CartItem } from '@/types';
import type { PickupPoint } from '@/types/delivery';
import type Stripe from 'stripe';

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  deliveryMethod: 'home' | 'pickup';
  // Home delivery
  country?: string;
  address?: string;
  apartment?: string;
  colonia?: string;
  municipio?: string;
  state?: string;
  zipCode?: string;
  shippingMethod?: 'standard' | 'express';
  // Pickup
  pickupPointId?: string;
  pickupDate?: string;
  pickupTimeSlot?: 'morning' | 'afternoon' | 'evening' | '';
}

// ─── Result types ─────────────────────────────────────────────────────────────

export type PlaceOrderResult =
  | {
      success: true;
      clientSecret: string;
      sessionId: string;
      orderNumber: string;
      orderId: string;
      guestToken: string;
      /** Vencimiento de la reserva, para el contador del checkout. */
      reservedUntil: string;
      /** true si el monto superó el umbral y solo se ofrece tarjeta. */
      cardOnly: boolean;
    }
  | {
      success: false;
      error:
        | 'price_changed'
        | 'product_unavailable'
        | 'invalid_phone'
        | 'pickup_inactive'
        | 'order_insert_failed'
        | 'items_insert_failed'
        | 'stripe_error'
        | 'internal_error';
      message?: string;
      /** Nombres de las prendas que se agotaron, para decírselo al usuario. */
      unavailable?: string[];
    };

// ─── Actions ─────────────────────────────────────────────────────────────────

/** Sync cart lines from DB (fixes stale localStorage slug ids / old prices). */
export async function syncCartFromDbAction(
  cartItems: CartItem[]
): Promise<{ items: CartItem[] } | { error: string }> {
  if (cartItems.length === 0) return { items: [] };

  const supabase = createAdminClient();
  const reconciled = await reconcileCartItems(supabase, cartItems);

  if (!reconciled.ok) {
    return { error: reconciled.message };
  }

  return { items: reconciled.items };
}

/** Umbral y ventanas, para que el checkout muestre el aviso correcto. */
export async function getCheckoutSettingsAction() {
  const s = await getSettings();
  return {
    cardOnlyThreshold: s.card_only_threshold_mxn,
    cardReserveMinutes: s.card_reserve_minutes,
    voucherHours: s.voucher_hours,
  };
}

/** Active pickup points for checkout (public read via service role for consistency). */
export async function getActivePickupPointsAction(): Promise<PickupPoint[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pickup_points')
    .select(
      'id, name, address, city, state, type, additional_cost_mxn, available_hours, available_days, estimated_days, is_active, municipality, whatsapp, maps_url, transfer_day, is_dropoff'
    )
    .eq('is_active', true)
    .order('municipality', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data) {
    console.error('[checkout] pickup_points load failed', error);
    return [];
  }

  return (data as PickupPointRow[]).map(mapPickupPointRow);
}

export async function createCheckoutSessionAction(
  cartItems: CartItem[],
  formData: CheckoutFormData,
  locale: string
): Promise<PlaceOrderResult> {
  if (!process.env.ADMIN_SECRET) {
    return { success: false, error: 'internal_error', message: 'Missing ADMIN_SECRET' };
  }

  const supabase = createAdminClient();
  const settings = await getSettings();

  // Si hay sesión, el pedido se liga a la cuenta. Sin esto `orders.user_id`
  // queda null SIEMPRE, y como la RLS es `auth.uid() = user_id`, el dueño no
  // puede releer su propio pedido: "Mis Pedidos" sale vacío aunque haya
  // comprado con la sesión iniciada.
  const { data: { user } } = await createClient().auth.getUser();

  // ── 0. Teléfono: se normaliza ANTES de guardar nada ─────────────────────────
  const phone = normalizePhone(formData.phone);
  if (!phone.ok) {
    return { success: false, error: 'invalid_phone', message: phone.error };
  }

  const reconciled = await reconcileCartItems(supabase, cartItems);
  if (!reconciled.ok) {
    console.error('[checkout] reconcile failed:', reconciled.message);
    return { success: false, error: 'price_changed', message: reconciled.message };
  }
  cartItems = reconciled.items;

  // ── 1. Validate cart prices against DB ─────────────────────────────────────
  const productIds = cartItems.map((i) => i.productId);
  const { data: dbProducts, error: productsError } = await supabase
    .from('products')
    .select('id, price_mxn, name, sold_out')
    .in('id', productIds);

  if (productsError || !dbProducts) {
    console.error('[checkout] products query failed:', productsError?.message);
    return { success: false, error: 'internal_error', message: productsError?.message };
  }

  const priceMap = new Map(dbProducts.map((p) => [p.id, Number(p.price_mxn)]));

  for (const item of cartItems) {
    const dbPrice = priceMap.get(item.productId);
    if (dbPrice === undefined || Math.abs(dbPrice - item.price) > 0.01) {
      return { success: false, error: 'price_changed' };
    }
  }

  // Atajo barato: si ya está vendida, ni creamos el pedido.
  const yaVendidas = dbProducts.filter((p) => p.sold_out).map((p) => p.name);
  if (yaVendidas.length > 0) {
    return {
      success: false,
      error: 'product_unavailable',
      unavailable: yaVendidas,
      message: `Ya no está disponible: ${yaVendidas.join(', ')}`,
    };
  }

  // ── 2. Validate pickup point (if applicable) ────────────────────────────────
  let pickupAdditionalCost = 0;

  if (formData.deliveryMethod === 'pickup') {
    if (!formData.pickupPointId) {
      return { success: false, error: 'pickup_inactive', message: 'No pickup point selected' };
    }
    const { data: pp, error: ppError } = await supabase
      .from('pickup_points')
      .select('id, additional_cost_mxn')
      .eq('id', formData.pickupPointId)
      .eq('is_active', true)
      .single();

    if (ppError || !pp) {
      return { success: false, error: 'pickup_inactive', message: 'Pickup point not available' };
    }
    pickupAdditionalCost = Number(pp.additional_cost_mxn);
  }

  // ── 3. Calculate totals server-side (never trust client values) ─────────────
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (priceMap.get(item.productId) ?? 0) * item.quantity,
    0
  );

  let shippingCost: number;
  if (formData.deliveryMethod === 'home') {
    shippingCost = formData.shippingMethod === 'express'
      ? EXPRESS_SHIPPING_COST
      : STANDARD_SHIPPING_COST;
  } else {
    shippingCost = pickupAdditionalCost;
  }

  // Precios al público ya incluyen IVA. No se suma ni se muestra al cliente.
  const tax = 0;
  const total = Math.round((subtotal + shippingCost) * 100) / 100;

  // Regla de umbral, decidida en el SERVIDOR. Ocultar el botón no basta.
  const cardOnly = isCardOnly(total, settings);

  // ── 4. Persist shipping address ─────────────────────────────────────────────
  // Antes esto se capturaba y se tiraba: shipping_address_id quedaba null y un
  // pedido a domicilio no se podía enviar.
  let shippingAddressId: string | null = null;

  if (formData.deliveryMethod === 'home') {
    const { data: addr, error: addrError } = await supabase
      .from('addresses')
      .insert({
        // A propósito null incluso con sesión iniciada: esta dirección es del
        // pedido, no de la libreta del cliente. Ligarla metería direcciones en
        // /account/addresses que nadie pidió guardar.
        user_id: null,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: phone.e164,
        street: formData.address ?? '',
        apartment: formData.apartment || null,
        colony: formData.colonia || null,
        city: formData.municipio ?? '',
        state: formData.state ?? '',
        zip_code: formData.zipCode ?? '',
        country: formData.country || 'MX',
      })
      .select('id')
      .single();

    if (addrError || !addr) {
      return {
        success: false,
        error: 'order_insert_failed',
        message: `No se pudo guardar la dirección: ${addrError?.message}`,
      };
    }
    shippingAddressId = addr.id;
  }

  // ── 5. Insert order ─────────────────────────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id ?? null, // null = invitado; el guest_token es su única llave
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: phone.e164,
      subtotal_mxn: subtotal,
      tax_mxn: tax,
      shipping_mxn: shippingCost,
      discount_mxn: 0,
      total_mxn: total,
      status: 'pending',
      payment_method: null, // lo define Stripe según lo que elija el cliente
      payment_status: 'pending',
      delivery_method: formData.deliveryMethod,
      shipping_address_id: shippingAddressId,
      shipping_method: formData.deliveryMethod === 'home' ? (formData.shippingMethod ?? 'standard') : null,
      pickup_point_id: formData.deliveryMethod === 'pickup' ? formData.pickupPointId : null,
      pickup_date: formData.pickupDate || null,
      pickup_time_slot: formData.pickupTimeSlot || null,
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    if (shippingAddressId) await supabase.from('addresses').delete().eq('id', shippingAddressId);
    return {
      success: false,
      error: 'order_insert_failed',
      message: orderError?.message ?? 'Failed to create order',
    };
  }

  const rollback = async () => {
    await supabase.rpc('release_reservation', { p_order_id: order.id });
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    if (shippingAddressId) await supabase.from('addresses').delete().eq('id', shippingAddressId);
  };

  // ── 6. Insert order items (price snapshots) ─────────────────────────────────
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.productName,
    product_image: item.image,
    size: item.size ?? null,
    color: item.color ?? null,
    quantity: item.quantity,
    unit_price_mxn: priceMap.get(item.productId) ?? item.price,
    total_price_mxn: (priceMap.get(item.productId) ?? item.price) * item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    await rollback();
    return { success: false, error: 'items_insert_failed', message: itemsError.message };
  }

  // ── 7. RESERVA ATÓMICA ──────────────────────────────────────────────────────
  // Se toma AL INICIAR el checkout, no al confirmar el pago. Si se tomara al
  // confirmar, dos personas pagarían la misma prenda.
  //
  // Se reserva con ventana de tarjeta. Si el cliente elige OXXO/SPEI, el
  // webhook la extiende a voucher_hours cuando se emite el voucher.
  const { data: reservedUntil, error: reserveError } = await supabase.rpc('reserve_products', {
    p_product_ids: productIds,
    p_order_id: order.id,
    p_kind: 'card',
  });

  if (reserveError) {
    await rollback();
    const raw = reserveError.message ?? '';
    if (raw.includes('product_unavailable')) {
      const nombres = raw.split('product_unavailable:')[1]?.trim() ?? '';
      const lista = nombres ? nombres.split(', ').filter(Boolean) : [];
      return {
        success: false,
        error: 'product_unavailable',
        unavailable: lista,
        message: lista.length
          ? `Alguien más se adelantó con: ${lista.join(', ')}`
          : 'Alguien más se adelantó con una de las prendas',
      };
    }
    console.error('[checkout] reserve failed:', raw);
    return { success: false, error: 'internal_error', message: raw };
  }

  // ── 8. Stripe Checkout Session ──────────────────────────────────────────────
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: 'mxn',
      unit_amount: Math.round((priceMap.get(item.productId) ?? item.price) * 100),
      product_data: {
        name: item.productName,
        ...(item.image?.startsWith('http') ? { images: [item.image] } : {}),
      },
    },
  }));

  if (shippingCost > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'mxn',
        unit_amount: Math.round(shippingCost * 100),
        product_data: {
          name: formData.deliveryMethod === 'pickup' ? 'Costo de punto de entrega' : 'Envío',
        },
      },
    });
  }

  // Stripe no permite expires_at a menos de 30 minutos. Si la ventana de
  // reserva es más corta, la reserva vence antes que la sesión — y está bien:
  // `reserved_until` en la base es la autoridad, no Stripe. Un pago que llegue
  // después lo atrapa el caso borde de mark_order_sold (outcome=conflict).
  const sessionMinutes = Math.max(30, settings.card_reserve_minutes);

  // OXXO solo acepta vencimiento en DÍAS enteros (1–7), no en horas.
  const oxxoDays = Math.min(7, Math.max(1, Math.ceil(settings.voucher_hours / 24)));

  const origin = await getOriginUrl();

  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      // La API renombró 'embedded' a 'embedded_page' (verificado contra la API
      // real el 2026-09-14: 'embedded' devuelve error y la sesión no se crea).
      ui_mode: 'embedded_page',
      line_items: lineItems,
      customer_email: formData.email,
      expires_at: Math.floor(Date.now() / 1000) + sessionMinutes * 60,
      return_url: `${origin}/${locale}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      // Nada de payment_method_types: eso apagaría los métodos dinámicos.
      // Para la regla de umbral se excluyen los diferidos explícitamente.
      ...(cardOnly
        ? { excluded_payment_method_types: [...DEFERRED_PAYMENT_METHODS] }
        : { payment_method_options: { oxxo: { expires_after_days: oxxoDays } } }),
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        customer_email: formData.email,
      },
      payment_intent_data: {
        metadata: { order_id: order.id, order_number: order.order_number },
      },
    } as Stripe.Checkout.SessionCreateParams);
  } catch (stripeError) {
    await rollback();
    const message = stripeError instanceof Error ? stripeError.message : 'Stripe error';
    console.error('[checkout] stripe session failed:', message);
    return { success: false, error: 'stripe_error', message };
  }

  // ── 9. Save session + guest token ───────────────────────────────────────────
  const guestToken = createHmac('sha256', process.env.ADMIN_SECRET)
    .update(`${order.order_number}:${formData.email.toLowerCase()}`)
    .digest('hex');

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      stripe_session_id: session.id,
      payment_reference: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      guest_token: guestToken,
    })
    .eq('id', order.id);

  if (updateError) {
    console.error('[checkout] no se pudo guardar stripe_session_id:', updateError.message);
  }

  return {
    success: true,
    clientSecret: session.client_secret!,
    sessionId: session.id,
    orderNumber: order.order_number,
    orderId: order.id,
    guestToken,
    reservedUntil: String(reservedUntil),
    cardOnly,
  };
}

/** Libera la reserva cuando el usuario abandona el checkout a propósito. */
export async function cancelCheckoutAction(orderId: string): Promise<void> {
  if (!orderId) return;
  const supabase = createAdminClient();
  await supabase.rpc('release_reservation', { p_order_id: orderId });
  await supabase
    .from('orders')
    .update({ status: 'cancelled', payment_status: 'failed' })
    .eq('id', orderId)
    .eq('payment_status', 'pending');
}

async function getOriginUrl(): Promise<string> {
  const { headers } = await import('next/headers');
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https');
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

/**
 * Resuelve el número de pedido a partir del session_id de Stripe.
 *
 * Se verifica la sesión CONTRA STRIPE antes de devolver nada: el session_id
 * viaja en la URL de retorno, así que no basta con confiar en él. Nunca se
 * devuelve el guest_token al cliente — la página de éxito lo resuelve del lado
 * del servidor.
 */
export async function resolveCheckoutReturnAction(
  sessionId: string
): Promise<{ ok: true; orderNumber: string } | { ok: false; message: string }> {
  if (!sessionId.startsWith('cs_')) {
    return { ok: false, message: 'Identificador de pago inválido.' };
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.order_id;
    if (!orderId) {
      return { ok: false, message: 'Esta sesión de pago no corresponde a un pedido.' };
    }

    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .eq('stripe_session_id', sessionId)
      .single();

    if (!order) {
      return { ok: false, message: 'No encontramos tu pedido. Escríbenos y lo resolvemos.' };
    }

    return { ok: true, orderNumber: order.order_number };
  } catch (err) {
    console.error('[checkout] resolveCheckoutReturn falló:', err);
    return { ok: false, message: 'No pudimos confirmar tu pago. Revisa "Mis Pedidos".' };
  }
}
