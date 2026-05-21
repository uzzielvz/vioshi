'use client';

import { useEffect } from 'react';
import { useCart } from '@/store/cartStore';

// Rendered inside the Server Component success page.
// Clears localStorage cart once the order is confirmed.
export default function ClearCartOnMount() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
