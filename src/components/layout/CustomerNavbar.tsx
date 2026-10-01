"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Layers,
  FileText,
  Home,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function CustomerNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCases, isHydrated } = useCart();

  const desktopLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/products", icon: Package },
    { label: "Categories", href: "/categories/soft-drinks", icon: Layers },
    { label: "Orders", href: "/orders", icon: FileText },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const mobileBottomLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/products", icon: Package },
    { label: "Cart", href: "/cart", icon: ShoppingBag, badge: totalCases },
    { label: "Orders", href: "/orders", icon: FileText },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-warmGray-200">
        {/* Top Wholesale Assurance Bar */}
        <div className="bg-charcoal-900 text-cream-100 text-[11px] py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span>Central Wholesaler Direct Portal — Verified Retailers & Distributors Only</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <BrandLogo href="/" size="md" />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {desktopLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-charcoal-800 hover:bg-cream-100 transition-colors"
                aria-label="View Wholesale Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {isHydrated && totalCases > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-brand-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-in zoom-in-50">
                    {totalCases}
                  </span>
                )}
              </Link>

              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warmGray-300 text-xs font-bold text-charcoal-800 hover:bg-cream-100 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Login
              </Link>

              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-colors shadow-sm"
              >
                Admin Panel
              </Link>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-charcoal-700 hover:bg-cream-100"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-warmGray-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top duration-150">
            {desktopLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    active
                      ? "bg-brand-50 text-brand-700 font-bold"
                      : "text-charcoal-800 hover:bg-cream-100"
                  }`}
                >
                  <Icon className="w-4 h-4 text-warmGray-500" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-warmGray-100">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-2.5 text-center text-xs font-bold bg-charcoal-900 text-white rounded-lg"
              >
                Partner Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Sticky for fast wholesale navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-warmGray-200 shadow-lg px-2 py-1 flex items-center justify-around">
        {mobileBottomLinks.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-bold transition-colors ${
                active ? "text-brand-600" : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && isHydrated && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 bg-brand-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
