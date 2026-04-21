"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string | number;
  name: string;
  description: string;
  priceEach: number;
  quantity: number;
}

export interface AddToCartItem {
  id?: string | number;
  name: string;
  description?: string;
  price?: string;   // "$4.99" format
  quantity?: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  savedItems: CartItem[];
  /** Sum of all item quantities — used for the navbar badge */
  totalItems: number;
  subtotal: number;
  /** Alias for subtotal */
  cartTotal: number;
  addToCart: (item: AddToCartItem) => void;
  updateQuantity: (id: string | number, qty: number) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  saveForLater: (id: string | number) => void;
  moveToCart: (id: string | number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "na_cart_items";
const SAVED_STORAGE_KEY = "na_saved_items";

function parsePrice(price?: string): number {
  if (!price) return 0;
  const num = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) setCartItems(JSON.parse(storedCart));
      const storedSaved = localStorage.getItem(SAVED_STORAGE_KEY);
      if (storedSaved) setSavedItems(JSON.parse(storedSaved));
    } catch {
      // ignore malformed data
    }
    setHydrated(true);
  }, []);

  // Persist cart to localStorage whenever it changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedItems));
  }, [savedItems, hydrated]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal   = cartItems.reduce((sum, item) => sum + item.priceEach * item.quantity, 0);

  function addToCart(incoming: AddToCartItem) {
    const effectiveId = incoming.id ?? incoming.name;
    const priceEach = parsePrice(incoming.price);
    const addQty = incoming.quantity ?? 1;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === effectiveId);
      if (existing) {
        return prev.map((i) =>
          i.id === effectiveId ? { ...i, quantity: i.quantity + addQty } : i
        );
      }
      return [
        ...prev,
        {
          id: effectiveId,
          name: incoming.name,
          description: incoming.description ?? "",
          priceEach,
          quantity: addQty,
        },
      ];
    });
  }

  function updateQuantity(id: string | number, qty: number) {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  }

  function removeFromCart(id: string | number) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCartItems([]);
  }

  function saveForLater(id: string | number) {
    const target = cartItems.find((i) => i.id === id);
    if (!target) return;
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    setSavedItems((prev) => [...prev, { ...target, quantity: 1 }]);
  }

  function moveToCart(id: string | number) {
    const target = savedItems.find((i) => i.id === id);
    if (!target) return;
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    setCartItems((prev) => [...prev, target]);
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        totalItems,
        subtotal,
        cartTotal: subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        saveForLater,
        moveToCart,
      }}
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
