'use server';

import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getClientIpFromHeaders } from '@/lib/rate-limit';

/**
 * Seller applications. Approving one is an ADMIN act: this action only leaves a
 * `pending` row. It never creates a `stores` row and never auto-approves.
 *
 * Writes go through service_role because `store_applications` has RLS on with
 * zero policies — anon cannot read other people's applications (0016).
 */

const APPLICATION_RATE_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000 };

/** Guards against a pasted essay blowing up the row; the form has no maxLength. */
const MAX_LENGTHS = {
  fullName: 120,
  email: 160,
  phone: 40,
  brandName: 120,
  website: 300,
  instagram: 120,
  productType: 40,
  experience: 40,
  message: 4000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SellerApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  brandName: string;
  website: string;
  instagram: string;
  productType: string;
  experience: string;
  message: string;
}

/**
 * Error codes, not copy: the client maps them to i18n so the message follows
 * the active locale.
 */
export type SellerApplicationResult =
  | { ok: true }
  | { ok: false; code: 'invalid' | 'rate_limited' | 'failed' };

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function submitSellerApplication(
  input: SellerApplicationInput
): Promise<SellerApplicationResult> {
  const fullName    = clean(input.fullName,    MAX_LENGTHS.fullName);
  const email       = clean(input.email,       MAX_LENGTHS.email);
  const phone       = clean(input.phone,       MAX_LENGTHS.phone);
  const brandName   = clean(input.brandName,   MAX_LENGTHS.brandName);
  const website     = clean(input.website,     MAX_LENGTHS.website);
  const instagram   = clean(input.instagram,   MAX_LENGTHS.instagram);
  const productType = clean(input.productType, MAX_LENGTHS.productType);
  const experience  = clean(input.experience,  MAX_LENGTHS.experience);
  const message     = clean(input.message,     MAX_LENGTHS.message);

  const required = [fullName, email, phone, brandName, productType, experience, message];
  if (required.some((value) => value.length === 0) || !EMAIL_RE.test(email)) {
    return { ok: false, code: 'invalid' };
  }

  const ip = getClientIpFromHeaders(headers());
  const { success } = checkRateLimit(`seller-application:${ip}`, APPLICATION_RATE_LIMIT);
  if (!success) {
    return { ok: false, code: 'rate_limited' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('store_applications').insert({
    full_name:    fullName,
    email,
    phone,
    brand_name:   brandName,
    website:      website || null,
    instagram:    instagram || null,
    product_type: productType,
    experience,
    message,
    status:       'pending',
  });

  if (error) {
    console.error('[store_applications] insert falló:', error.message);
    return { ok: false, code: 'failed' };
  }

  return { ok: true };
}
