"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Cart, CartItem } from "@/types";
import { STORAGE_KEYS, TAX_RATE, STANDARD_SHIPPING_COST } from "@/lib/constants";

interface CartContextType {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateShippingCost: (cost: number) => void;
  replaceItems: (items: CartItem[]) => void;
  clearCart: () => void;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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
  const tax = subtotal * TAX_RATE;
  const shipping = items.length > 0 ? prevShipping : 0;
  const total = subtotal + tax + shipping;

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
          setCart(JSON.parse(savedCart));
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
      const existingItemIndex = prevCart.items.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.color === newItem.color &&
          item.size === newItem.size
      );

      let updatedItems: CartItem[];

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        };
      } else {
        // New item, add to cart
        updatedItems = [...prevCart.items, newItem];
      }

      return calculateTotals(updatedItems, prevCart.shipping);
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
      const total = prevCart.subtotal + prevCart.tax + shipping;

      return {
        ...prevCart,
        shipping,
        total,
      };
    });
  }, []);

  const replaceItems = useCallback((items: CartItem[]) => {
    setCart((prevCart) => calculateTotals(items, prevCart.shipping));
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

