"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
import { formatDate, formatNaira } from "../../lib/format";

type OrderItem = { id: string; name: string; emoji: string; price: number; quantity: number };
type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  city: string;
  items: OrderItem[];
};
type Banner = { ref: string; emailSent: boolean } | null;

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const userId = user?.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState<Banner>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/orders");
  }, [loading, user, router]);

  // Success banner after checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("placed");
    if (ref) {
      setBanner({ ref, emailSent: params.get("email") === "1" });
      window.history.replaceState(null, "", "/orders");
    }
  }, []);

  // Load this user's orders from the database
  useEffect(() => {
    if (!userId) return;
    let active = true;

    (async () => {
      setFetching(true);
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("id, created_at, status, total, city, items")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (fetchError) {
        setError("We couldn't load your orders. Please refresh the page.");
      } else {
        setOrders((data ?? []) as Order[]);
      }
      setFetching(false);
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  if (loading || !user) return <div className="skeleton" style={{ height: 240 }} />;

  return (
    <>
      <h1>My orders</h1>

      {banner && (
        <div className={`alert ${banner.emailSent ? "alert-success" : "alert-warn"}`} role="status">
          🎉 Order <strong>{banner.ref}</strong> placed!{" "}
          {banner.emailSent
            ? `A confirmation email is on its way to ${user.email}.`
            : "Your order is saved, but we couldn't send the confirmation email just now."}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {fetching ? (
        <div className="skeleton" style={{ height: 180 }} />
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p className="muted">When you place a pre-order, it will appear here.</p>
          <Link href="/" className="btn btn-primary">Start shopping</Link>
        </div>
      ) : (
        <div className="orders">
          {orders.map((order) => (
            <article className="card order-card" key={order.id}>
              <div className="order-head">
                <div>
                  <div className="order-ref">Order #{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className="muted small">
                    {formatDate(order.created_at)} · Delivery to {order.city}
                  </div>
                </div>
                <span className="status">{order.status}</span>
              </div>
              {order.items.map((item) => (
                <div className="order-line" key={item.id}>
                  <span>{item.emoji} {item.name} × {item.quantity}</span>
                  <span>{formatNaira(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="order-total">
                <span>Total</span>
                <span>{formatNaira(Number(order.total))}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}