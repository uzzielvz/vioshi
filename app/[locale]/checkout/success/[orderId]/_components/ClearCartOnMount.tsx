'use client';

import { useEffect } from 'react';
import { useCart } from '@/store/cartStore';

// Rendered inside the Server Component success page.
// Clears localStorage cart once the order is confirmed.
export default function ClearCartOnMount() {
  const { clearCart, isReady } = useCart();
  useEffect(() => {
    // Clearing before the provider loads localStorage would be overwritten by the saved cart.
    if (!isReady) return;
    sessionStorage.removeItem('viogi_checkout_payment');
    sessionStorage.removeItem('viogi_pending_order');
    clearCart();
  }, [clearCart, isReady]);
  return null;
}
