import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "../../../components/AddToCart";
import { getProduct } from "../../../lib/products";
import { formatNaira } from "../../../lib/format";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <>
      <Link href="/" className="back-link">← Back to shop</Link>
      <div className="detail">
        <div className="detail-media" style={{ background: product.color }}>
          <span>{product.emoji}</span>
        </div>
        <div className="detail-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="muted">{product.description}</p>
          <p className="detail-price">{formatNaira(product.price)}</p>
          <AddToCart productId={product.id} withQuantity />
          <div className="info-box">
            📦 <strong>Pre-order:</strong> {product.leadTime}. You'll get a confirmation email as soon as you check out.
          </div>
        </div>
      </div>
    </>
  );
}
