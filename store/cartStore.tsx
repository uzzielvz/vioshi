"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Cart, CartItem } from "@/types";
import { uniquePieces } from "@/lib/cart/uniquePieces";
import { STORAGE_KEYS, STANDARD_SHIPPING_COST } from "@/lib/constants";

interface CartContextType {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateShippingCost: (cost: number) => void;
  replaceItems: (items: CartItem[]) => void;
  clearCart: () => void;
  itemCount: number;
  /** True once the saved cart was read from localStorage. Child effects run
   * before this provider's, so anything that acts on an empty cart waits for it. */
  isReady: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
};

// Pure function — no component state, safe to live outside the component
// prevShipping preserves any custom shipping cost set by checkout
function calculateTotals(items: CartItem[], prevShipping: number = STANDARD_SHIPPING_COST): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = 0; // IVA incluido en el precio; no se cobra ni se muestra
  const shipping = items.length > 0 ? prevShipping : 0;
  const total = subtotal + shipping;

  return { items, subtotal, tax, shipping, total };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (savedCart) {
        try {
          const saved = JSON.parse(savedCart) as Cart;
          // Bags saved when they still had +/- buttons may hold quantity 2.
          const items = uniquePieces(Array.isArray(saved.items) ? saved.items : []);
          setCart(calculateTotals(items, saved.shipping ?? STANDARD_SHIPPING_COST));
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addItem = useCallback((newItem: CartItem) => {
    setCart((prevCart) => {
      // One piece per product. A second add neither duplicates the row nor bumps quantity.
      if (prevCart.items.some((item) => item.productId === newItem.productId)) {
        return prevCart;
      }

      return calculateTotals(
        [...prevCart.items, { ...newItem, quantity: 1 }],
        prevCart.shipping
      );
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.id !== itemId);
      return calculateTotals(updatedItems, prevCart.shipping);
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      return calculateTotals(updatedItems, prevCart.shipping);
    });
  }, [removeItem]);

  const updateShippingCost = useCallback((cost: number) => {
    setCart((prevCart) => {
      const shipping = prevCart.items.length > 0 ? cost : 0;
      const total = prevCart.subtotal + shipping;

      return {
        ...prevCart,
        shipping,
        total,
      };
    });
  }, []);

  const replaceItems = useCallback((items: CartItem[]) => {
    setCart((prevCart) => calculateTotals(uniquePieces(items), prevCart.shipping));
  }, []);

  const clearCart = useCallback(() => {
    setCart(initialCart);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        updateShippingCost,
        replaceItems,
        clearCart,
        itemCount,
        isReady: isInitialized,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

