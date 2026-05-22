'use server';

import { createHmac } from 'crypto';
import { reconcileCartItems } from '@/lib/cart/reconcile';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { TAX_RATE, STANDARD_SHIPPING_COST, EXPRESS_SHIPPING_COST } from '@/lib/constants';
import type { CartItem } from '@/types';

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
      paymentIntentId: string;
      orderNumber: string;
      orderId: string;
      guestToken: string;
    }
  | {
      success: false;
      error:
        | 'price_changed'
        | 'pickup_inactive'
        | 'order_insert_failed'
        | 'items_insert_failed'
        | 'stripe_error'
        | 'internal_error';
      message?: string;
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

export async function createPaymentIntentAction(
  cartItems: CartItem[],
  formData: CheckoutFormData
): Promise<PlaceOrderResult> {
  if (!process.env.ADMIN_SECRET) {
    return { success: false, error: 'internal_error', message: 'Missing ADMIN_SECRET' };
  }

  const supabase = createAdminClient();

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
    .select('id, price_mxn')
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

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

  // ── 4. Insert order ─────────────────────────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      email: formData.email,
      subtotal_mxn: subtotal,
      tax_mxn: tax,
      shipping_mxn: shippingCost,
      discount_mxn: 0,
      total_mxn: total,
      status: 'pending',
      payment_method: 'card',
      payment_status: 'pending',
      delivery_method: formData.deliveryMethod,
      shipping_method: formData.deliveryMethod === 'home' ? (formData.shippingMethod ?? 'standard') : null,
      pickup_point_id: formData.deliveryMethod === 'pickup' ? formData.pickupPointId : null,
      pickup_date: formData.pickupDate || null,
      pickup_time_slot: formData.pickupTimeSlot || null,
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    return {
      success: false,
      error: 'order_insert_failed',
      message: orderError?.message ?? 'Failed to create order',
    };
  }

  // ── 5. Insert order items (price snapshots) ─────────────────────────────────
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
    // Roll back the order so we don't leave orphaned rows
    await supabase.from('orders').delete().eq('id', order.id);
    return {
      success: false,
      error: 'items_insert_failed',
      message: itemsError.message,
    };
  }

  // ── 6. Create Stripe PaymentIntent ──────────────────────────────────────────
  // Stripe expects amounts in the smallest currency unit (centavos for MXN).
  const amountCentavos = Math.round(total * 100);

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: amountCentavos,
      currency: 'mxn',
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        customer_email: formData.email,
      },
      // Card-only in v1 — fewer moving parts while debugging E2E (re-enable automatic_payment_methods later).
      payment_method_types: ['card'],
    });
  } catch (stripeError) {
    // Roll back the order to avoid orphaned pending rows
    await supabase.from('orders').delete().eq('id', order.id);
    const message = stripeError instanceof Error ? stripeError.message : 'Stripe error';
    return { success: false, error: 'stripe_error', message };
  }

  // ── 7. Save payment_reference + guest_token ─────────────────────────────────
  const guestToken = createHmac('sha256', process.env.ADMIN_SECRET)
    .update(`${order.order_number}:${formData.email.toLowerCase()}`)
    .digest('hex');

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_reference: paymentIntent.id,
      guest_token: guestToken,
    })
    .eq('id', order.id);

  if (updateError) {
    // Non-fatal: order + intent exist. Log but don't fail — guest lookup will
    // not work, but the payment can still complete via webhook.
    console.error('[checkout] Failed to save payment_reference/guest_token:', updateError.message);
  }

  return {
    success: true,
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    orderNumber: order.order_number,
    orderId: order.id,
    guestToken,
  };
}
