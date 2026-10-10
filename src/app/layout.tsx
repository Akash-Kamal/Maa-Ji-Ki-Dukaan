import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maa Ji Ki Dukaan | Direct Seller Beverage Platform",
  description:
    "Direct Seller Ordering. Made Simple. Central beverage ordering portal for verified retailers, distributors, and vendors.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans antialiased text-charcoal-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
