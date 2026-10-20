"use client";

import Link from "next/link";
import { MAX_QTY, useCart } from "../../lib/cart-context";
import { formatNaira } from "../../lib/format";

export default function CartPage() {
  const { ready, lines, total, setQuantity, remove } = useCart();

  if (!ready) return <div className="skeleton" style={{ height: 240 }} />;

  if (lines.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🛒</div>
        <h1>Your cart is empty</h1>
        <p className="muted">Add something you like and it will show up here.</p>
        <Link href="/" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Your cart</h1>
      <div className="two-col">
        <section className="card">
          {lines.map(({ product, quantity }) => (
            <div className="cart-row" key={product.id}>
              <div className="thumb" style={{ background: product.color }}>{product.emoji}</div>
              <div className="cart-info">
                <Link href={`/product/${product.id}`}><strong>{product.name}</strong></Link>
                <span className="muted small">{formatNaira(product.price)} each</span>
                <button type="button" className="btn-link danger" onClick={() => remove(product.id)}>
                  Remove
                </button>
              </div>
              <div className="qty">
                <button type="button" aria-label={`Decrease ${product.name}`} onClick={() => setQuantity(product.id, quantity - 1)}>−</button>
                <span>{quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase ${product.name}`}
                  disabled={quantity >= MAX_QTY}
                  onClick={() => setQuantity(product.id, quantity + 1)}
                >
                  +
                </button>
              </div>
              <strong className="line-total">{formatNaira(product.price * quantity)}</strong>
            </div>
          ))}
        </section>

        <aside className="card summary">
          <h2>Order summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>{formatNaira(total)}</span></div>
          <div className="summary-row muted small"><span>Delivery</span><span>Confirmed after ordering</span></div>
          <div className="summary-row summary-total"><span>Total</span><span>{formatNaira(total)}</span></div>
          <Link href="/checkout" className="btn btn-primary btn-block">Proceed to checkout</Link>
          <p className="muted small center">You'll sign in with Google at the next step.</p>
        </aside>
      </div>
    </>
  );
}
