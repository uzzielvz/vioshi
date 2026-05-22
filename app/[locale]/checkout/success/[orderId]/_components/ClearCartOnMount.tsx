'use client';

import { useEffect } from 'react';
import { useCart } from '@/store/cartStore';

// Rendered inside the Server Component success page.
// Clears localStorage cart once the order is confirmed.
export default function ClearCartOnMount() {
  const { clearCart } = useCart();
  useEffect(() => {
    sessionStorage.removeItem('viogi_checkout_payment');
    sessionStorage.removeItem('viogi_pending_order');
    clearCart();
  }, [clearCart]);
  return null;
}
