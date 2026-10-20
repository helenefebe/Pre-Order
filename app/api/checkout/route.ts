import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProduct } from "../../../lib/products";
import { sendOrderEmail } from "../../../lib/mailgun";

type IncomingBody = {
  customer?: Record<string, unknown>;
  items?: { id?: unknown; quantity?: unknown }[];
};

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Server is missing Supabase settings." }, { status: 500 });
  }

  // 1) Who is ordering? Verify their Google/Supabase session.
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user || !user.email) {
    return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  // 2) Validate the request
  const body = (await request.json().catch(() => null)) as IncomingBody | null;

  const name = clean(body?.customer?.name, 100);
  const phone = clean(body?.customer?.phone, 20);
  const address = clean(body?.customer?.address, 300);
  const city = clean(body?.customer?.city, 80);

  if (!name || !address || !city || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Please fill in all delivery details." }, { status: 400 });
  }

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const lines: { id: string; name: string; emoji: string; price: number; quantity: number }[] = [];

  for (const raw of rawItems) {
    const product = typeof raw?.id === "string" ? getProduct(raw.id) : undefined;
    const quantity = Number(raw?.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) continue;
    lines.push({
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      price: product.price,
      quantity,
    });
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  // 3) Save the order (row-level security makes sure it belongs to this user)
  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      email: user.email,
      customer_name: name,
      phone,
      address,
      city,
      items: lines,
      total,
    })
    .select("id")
    .single();

  if (insertError || !order) {
    console.error("[checkout] insert failed:", insertError);
    return NextResponse.json({ error: "We couldn't save your order. Please try again." }, { status: 500 });
  }

  const orderRef = String(order.id).slice(0, 8).toUpperCase();

  // 4) Confirmation email (the order is already saved even if this fails)
  const emailSent = await sendOrderEmail({
    to: user.email,
    customerName: name,
    orderRef,
    lines,
    total,
    address,
    city,
  });

  return NextResponse.json({ orderId: order.id, orderRef, emailSent });
}