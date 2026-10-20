import Link from "next/link";
import type { Product } from "../lib/products";
import { formatNaira } from "../lib/format";
import AddToCart from "./AddToCart";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card product-card">
      <Link
        href={`/product/${product.id}`}
        className="product-media"
        style={{ background: product.color }}
        aria-label={`View ${product.name}`}
      >
        <span>{product.emoji}</span>
      </Link>
      <div className="product-body">
        <p className="eyebrow">{product.category}</p>
        <h3>
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="muted small">{product.leadTime}</p>
        <div className="product-foot">
          <strong className="price">{formatNaira(product.price)}</strong>
          <AddToCart productId={product.id} />
        </div>
      </div>
    </article>
  );
}