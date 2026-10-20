import ProductCard from "../components/ProductCard";
import { products } from "../lib/products";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Pre-order from China, delivered to your door</h1>
        <p>Pick what you want, check out in minutes, and track every pre-order in your account.</p>
        <a href="#shop" className="btn btn-primary">Browse products</a>
      </section>

      <section id="shop">
        <h2 className="section-title">Shop</h2>
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}