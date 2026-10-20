import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "../components/Providers";
import Header from "../components/Header";
import { SITE_NAME } from "../lib/site";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Pre-order from China`,
    template: `%s · ${SITE_NAME}`,
  },
  description: "Pre-order products from China and track every order in your account.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          <main className="container">{children}</main>
          <footer className="footer">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </footer>
        </Providers>
      </body>
    </html>
  );
}