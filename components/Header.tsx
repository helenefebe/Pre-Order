"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useCart } from "../lib/cart-context";
import { SITE_NAME } from "../lib/site";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { count } = useCart();

  const meta = user?.user_metadata ?? {};
  const displayName = (meta.full_name || meta.name || user?.email?.split("@")[0] || "Account") as string;
  const firstName = displayName.split(" ")[0];

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const linkClass = (href: string) => (pathname === href ? "active" : undefined);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          🛍️ {SITE_NAME}
        </Link>

        <nav className="nav" aria-label="Main">
          <Link href="/" className={linkClass("/")}>Shop</Link>
          <Link href="/orders" className={linkClass("/orders")}>My orders</Link>
          <Link href="/cart" className={linkClass("/cart")}>
            Cart
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
        </nav>

        <div className="user-box">
          {loading ? null : user ? (
            <>
              <span className="avatar" aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>
              <span className="user-name">Hi, {firstName}</span>
              <button type="button" className="btn" onClick={handleSignOut}>Log out</button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}