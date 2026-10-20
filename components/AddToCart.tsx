"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_QTY, useCart } from "../lib/cart-context";

export default function AddToCart({
  productId,
  withQuantity = false,
}: {
  productId: string;
  withQuantity?: boolean;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    add(productId, qty);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="add-to-cart">
      {withQuantity && (
        <div className="qty">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}>
            +
          </button>
        </div>
      )}
      <button type="button" className={`btn btn-primary${added ? " is-added" : ""}`} onClick={handleAdd}>
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}