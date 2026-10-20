"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { useCart } from "../../lib/cart-context";
import { formatNaira } from "../../lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const { ready, items, lines, total, clear } = useCart();

  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Must be signed in to check out
  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/checkout");
  }, [loading, user, router]);

  // Pre-fill the name from the Google account
  useEffect(() => {
    if (!user) return;
    const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || "") as string;
    setForm((f) => (f.name ? f : { ...f, name: fullName }));
  }, [user]);

  function update(field: keyof typeof form) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || !session) return;
    setError("");

    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");

      setDone(true);
      clear();
      router.push(`/orders?placed=${encodeURIComponent(data.orderRef)}&email=${data.emailSent ? 1 : 0}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading || !user || !ready) return <div className="skeleton" style={{ height: 320 }} />;

  if (done) {
    return (
      <div className="empty">
        <div className="spinner" />
        <h1>Order placed! 🎉</h1>
        <p className="muted">Taking you to your orders…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🛒</div>
        <h1>Your cart is empty</h1>
        <p className="muted">Add something to your cart before checking out.</p>
        <Link href="/" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Checkout</h1>
      <div className="two-col">
        <form className="card form-card" onSubmit={handleSubmit}>
          <h2>Delivery details</h2>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" autoComplete="name" required maxLength={100} value={form.name} onChange={update("name")} />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="08012345678" required maxLength={20} value={form.phone} onChange={update("phone")} />
            </div>
            <div className="field">
              <label htmlFor="city">City / State</label>
              <input id="city" name="city" autoComplete="address-level2" required maxLength={80} value={form.city} onChange={update("city")} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="address">Delivery address</label>
            <textarea id="address" name="address" rows={3} autoComplete="street-address" required maxLength={300} value={form.address} onChange={update("address")} />
          </div>

          <p className="muted small">
            Confirmation will be sent to <strong>{user.email}</strong>. No payment is taken on this page.
          </p>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Placing your order…" : `Place pre-order · ${formatNaira(total)}`}
          </button>
        </form>

        <aside className="card summary">
          <h2>Your items</h2>
          {lines.map(({ product, quantity }) => (
            <div className="summary-row" key={product.id}>
              <span>{product.emoji} {product.name} × {quantity}</span>
              <span>{formatNaira(product.price * quantity)}</span>
            </div>
          ))}
          <div className="summary-row summary-total"><span>Total</span><span>{formatNaira(total)}</span></div>
          <Link href="/cart" className="btn-link">← Edit cart</Link>
        </aside>
      </div>
    </>
  );
}