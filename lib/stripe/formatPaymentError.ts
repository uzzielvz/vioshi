import type { StripeError } from '@stripe/stripe-js';

/** Human-readable Stripe client error for checkout UI + console. */
export function formatStripeClientError(error: StripeError): string {
  const parts = [
    error.message,
    error.type ? `tipo: ${error.type}` : null,
    error.code ? `código: ${error.code}` : null,
    'decline_code' in error && error.decline_code
      ? `decline: ${String(error.decline_code)}`
      : null,
  ].filter(Boolean);

  return parts.join(' · ');
}

export function logCheckoutDebug(step: string, data?: unknown) {
  if (process.env.NODE_ENV !== 'development') return;
  if (data !== undefined) {
    console.info(`[checkout:stripe] ${step}`, data);
  } else {
    console.info(`[checkout:stripe] ${step}`);
  }
}
