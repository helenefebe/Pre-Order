"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Product } from "./products";

export type CartItem = { id: string; quantity: number };
export type CartLine = { product: Product; quantity: number };

type CartContextValue = {
  ready: boolean;
  items: CartItem[];
  lines: CartLine[];
  count: number;
  total: number;
  add: (id: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "preorder-cart-v1";
export const MAX_QTY = 10;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load the saved cart once, in the browser
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (i): i is CartItem =>
                typeof i?.id === "string" &&
                Number.isInteger(i?.quantity) &&
                i.quantity > 0 &&
                !!getProduct(i.id)
            )
          );
        }
      }
    } catch {
      // ignore corrupted storage
    }
    setReady(true);
  }, []);

  // Save the cart whenever it changes
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be unavailable (private mode)
    }
  }, [items, ready]);

  const add = useCallback((id: string, quantity = 1) => {
    if (!getProduct(id)) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i
        );
      }
      return [...prev, { id, quantity: Math.min(MAX_QTY, quantity) }];
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const lines = useMemo<CartLine[]>(
    () =>
      items.flatMap((i) => {
        const product = getProduct(i.id);
        return product ? [{ product, quantity: i.quantity }] : [];
      }),
    [items]
  );

  const count = useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines]);
  const total = useMemo(() => lines.reduce((n, l) => n + l.product.price * l.quantity, 0), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({ ready, items, lines, count, total, add, setQuantity, remove, clear }),
    [ready, items, lines, count, total, add, setQuantity, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}