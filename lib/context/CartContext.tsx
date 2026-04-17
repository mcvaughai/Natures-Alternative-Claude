"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  description: string;
  priceEach: number;
  quantity: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  savedItems: CartItem[];
  /** Sum of all item quantities — used for the navbar badge */
  totalItems: number;
  subtotal: number;
  updateQuantity: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  saveForLater: (id: number) => void;
  moveToCart: (id: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// Initial cart: 3 items, total quantity = 4 (matches "Cart (4)" in spec)
const INITIAL_CART: CartItem[] = [
  {
    id: 1,
    name: "Product",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    priceEach: 4.20,
    quantity: 2,
  },
  {
    id: 2,
    name: "Product",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    priceEach: 2.20,
    quantity: 1,
  },
  {
    id: 3,
    name: "Product",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    priceEach: 1.80,
    quantity: 1,
  },
];
// Subtotal check: (4.20×2) + (2.20×1) + (1.80×1) = 8.40 + 2.20 + 1.80 = $12.40 ✓

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal   = cartItems.reduce((sum, item) => sum + item.priceEach * item.quantity, 0);

  function updateQuantity(id: number, qty: number) {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  }

  function removeFromCart(id: number) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  function saveForLater(id: number) {
    const target = cartItems.find((i) => i.id === id);
    if (!target) return;
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    setSavedItems((prev) => [...prev, { ...target, quantity: 1 }]);
  }

  function moveToCart(id: number) {
    const target = savedItems.find((i) => i.id === id);
    if (!target) return;
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    setCartItems((prev) => [...prev, target]);
  }

  return (
    <CartContext.Provider
      value={{ cartItems, savedItems, totalItems, subtotal, updateQuantity, removeFromCart, saveForLater, moveToCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
