import { formatNaira } from "./format";
import { SITE_NAME } from "./site";

type EmailLine = { name: string; quantity: number; price: number };

export type OrderEmail = {
  to: string;
  customerName: string;
  orderRef: string;
  lines: EmailLine[];
  total: number;
  address: string;
  city: string;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendOrderEmail(order: OrderEmail): Promise<boolean> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    console.warn("[mailgun] MAILGUN_API_KEY or MAILGUN_DOMAIN is missing, so the email was skipped.");
    return false;
  }

  const base = process.env.MAILGUN_API_BASE || "https://api.mailgun.net";
  const from = process.env.MAILGUN_FROM || `${SITE_NAME} <postmaster@${domain}>`;
  const firstName = order.customerName.split(" ")[0] || "there";

  const text = [
    `Hi ${firstName},`,
    "",
    `Thank you! We've received your pre-order (${order.orderRef}).`,
    "",
    ...order.lines.map((l) => `- ${l.name} x${l.quantity}: ${formatNaira(l.price * l.quantity)}`),
    "",
    `Total: ${formatNaira(order.total)}`,
    `Delivery to: ${order.address}, ${order.city}`,
    "",
    `You can see this order any time by signing in at ${SITE_NAME}.`,
  ].join("\n");

  const rows = order.lines
    .map(
      (l) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${esc(l.name)} &times; ${l.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatNaira(l.price * l.quantity)}</td>
      </tr>`
    )
    .join("");

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#14213d">
    <h2 style="color:#0f766e;margin-bottom:4px">Your pre-order is confirmed ✅</h2>
    <p>Hi ${esc(firstName)}, thank you! We've received your pre-order <strong>${esc(order.orderRef)}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}
      <tr><td style="padding:12px 0;font-weight:bold">Total</td>
      <td style="padding:12px 0;text-align:right;font-weight:bold">${formatNaira(order.total)}</td></tr>
    </table>
    <p><strong>Delivery to:</strong><br>${esc(order.address)}, ${esc(order.city)}</p>
    <p style="color:#5f6b7a;font-size:13px">You can see this order any time by signing in at ${esc(SITE_NAME)}.</p>
  </div>`;

  const form = new FormData();
  form.append("from", from);
  form.append("to", order.to);
  form.append("subject", `Your ${SITE_NAME} order ${order.orderRef} is confirmed`);
  form.append("text", text);
  form.append("html", html);

  try {
    const res = await fetch(`${base}/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`api:${apiKey}`).toString("base64"),
      },
      body: form,
    });

    if (!res.ok) {
      console.error("[mailgun] send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mailgun] request error:", err);
    return false;
  }
}