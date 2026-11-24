"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  calculateOrder,
  type CartItemInput,
  type OrderCalculation,
} from "@/lib/pricing";
import { useCatalogFilter } from "@/context/CatalogFilterContext";

interface PersistedCart {
  items: CartItemInput[];
  promoCode: string;
}

interface CartContextValue {
  items: CartItemInput[];
  promoCode: string;
  order: OrderCalculation;
  isOpen: boolean;
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
}

const STORAGE_KEY = "store101_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products } = useCatalogFilter();
  const [items, setItems] = useState<CartItemInput[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedCart>;
        if (Array.isArray(parsed.items)) {
          const sanitized = parsed.items.filter(
            (i): i is CartItemInput =>
              typeof i?.productId === "string" &&
              typeof i?.quantity === "number" &&
              i.quantity >= 1
          );
          setItems(sanitized);
        }
        if (typeof parsed.promoCode === "string") {
          setPromoCode(parsed.promoCode);
        }
      }
    } catch {
      // Fallback silenzioso
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: PersistedCart = { items, promoCode };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Fallback silenzioso
    }
  }, [items, promoCode, hydrated]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    const qty = Math.max(1, Math.min(20, Math.floor(quantity)));
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(20, i.quantity + qty) }
            : i
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
    // Evento funnel cookieless anonimo
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cart_add" }),
    }).catch(() => undefined);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    const clamped = Math.max(1, Math.min(20, Math.floor(quantity)));
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: clamped } : i
      )
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode("");
  }, []);

  const applyPromoCode = useCallback((code: string) => {
    setPromoCode(code.trim().toUpperCase());
  }, []);

  const removePromoCode = useCallback(() => {
    setPromoCode("");
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const order = useMemo(
    () => calculateOrder(items, promoCode, products),
    [items, promoCode, products]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      promoCode,
      order,
      isOpen,
      hydrated,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyPromoCode,
      removePromoCode,
    }),
    [
      items,
      promoCode,
      order,
      isOpen,
      hydrated,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyPromoCode,
      removePromoCode,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve essere usato dentro CartProvider");
  }
  return ctx;
}
