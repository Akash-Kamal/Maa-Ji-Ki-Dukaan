"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  LayoutGrid,
  User,
  Menu,
  X,
  Layers,
  FileText,
  Home,
  ShieldCheck,
  Package,
  Search,
  MapPin,
  Phone,
  ChevronDown,
  Sparkles,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function CustomerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const { totalCases, subtotalAmount, isHydrated } = useCart();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/products?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
    }
  };

  const categoryNavItems = [
    { label: "All Products", href: "/products" },
    { label: "Cold Drinks", href: "/categories/soft-drinks" },
    { label: "Energy Drinks", href: "/categories/energy-drinks" },
    { label: "Water Store", href: "/categories/water" },
    { label: "Juices & Drinks", href: "/categories/juices" },
    { label: "Soda & Sparklers", href: "/categories/soda" },
    { label: "Quick Reorder", href: "/reorder" },
  ];

  const mobileBottomLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Category", href: "/products", icon: LayoutGrid },
    { label: "Search", href: "/products", icon: Search },
    { label: "Order", href: "/orders", icon: Package },
    { label: "Basket", href: "/cart", icon: ShoppingCart, badge: totalCases },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-warmGray-200 shadow-sm">
        {/* 1. Topmost Utility & Support Bar (ROS Retail Style) */}
        <div className="bg-[#112338] text-warmGray-300 text-[11px] py-1.5 px-4 font-medium border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="tel:+918383092211"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Phone className="w-3 h-3 text-brand-400" />
                <span>Helpline: +91 83830 92211</span>
              </a>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="hidden sm:flex items-center gap-1 text-emerald-400 font-semibold">
                <Truck className="w-3 h-3" />
                Same-Day Wholesale Dispatch Available
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-accent-300 font-semibold cursor-pointer hover:text-white">
                <MapPin className="w-3 h-3 text-accent-400" />
                <span>Delhi NCR (Pincode: 110075)</span>
              </div>
              <span className="text-white/20">|</span>
              <Link href="/admin" className="text-brand-300 hover:text-white transition-colors font-bold">
                Seller Admin
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Main Header with Brand, Search & Cart (ROS Retail Style) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Logo */}
            <div className="shrink-0">
              <BrandLogo href="/" size="md" />
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-2">
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                    placeholder="Search for Beverages, Brands (Coke, Red Bull, Limca, Bisleri)..."
                    className="w-full pl-4 pr-10 py-2.5 text-xs bg-warmGray-50 border border-warmGray-300 rounded-l-xl text-charcoal-900 placeholder:text-warmGray-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-inner"
                  />
                  {navSearch && (
                    <button
                      type="button"
                      onClick={() => setNavSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-warmGray-400 hover:text-charcoal-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-r-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Right: Actions (Location, Account & Cart) */}
            <div className="flex items-center gap-3">
              {/* Account Link */}
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-charcoal-700 hover:bg-warmGray-100 transition-colors border border-warmGray-200"
              >
                <User className="w-4 h-4 text-brand-600" />
                <div className="text-left leading-tight">
                  <span className="block text-[10px] text-warmGray-500 font-normal">Sign In</span>
                  <span>My Account</span>
                </div>
              </Link>

              {/* Cart Button with Total Amount Preview */}
              <Link
                href="/cart"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all text-brand-900 font-bold text-xs shadow-sm"
                aria-label="View Order Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-brand-700" />
                  {isHydrated && totalCases > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 bg-brand-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                      {totalCases}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <span className="block text-[10px] text-brand-700 font-normal">
                    {totalCases} {totalCases === 1 ? "case" : "cases"}
                  </span>
                  <span className="text-charcoal-950 font-black">
                    ₹{subtotalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-charcoal-700 hover:bg-warmGray-100"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Row */}
          <div className="md:hidden mt-2.5">
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search Coke, Red Bull, Bisleri..."
                className="w-full pl-3.5 pr-9 py-2 text-xs bg-warmGray-50 border border-warmGray-300 rounded-l-lg text-charcoal-900 placeholder:text-warmGray-400 focus:outline-none focus:border-brand-600 focus:bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-r-lg text-xs font-bold"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* 3. Secondary Category Navigation Bar (ROS Retail Style) */}
        <div className="hidden md:block bg-charcoal-900 text-white border-t border-charcoal-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Category Mega-Menu Trigger */}
            <div className="flex items-center">
              <Link
                href="/products"
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-80" />
              </Link>
            </div>

            {/* Horizontal Category Nav Links */}
            <nav className="flex items-center gap-1 overflow-x-auto py-1">
              {categoryNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap ${
                      active
                        ? "text-brand-300 bg-white/10"
                        : "text-warmGray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Tag */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-accent-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span>Wholesale Bulk Pricing</span>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-warmGray-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top duration-150">
            <div className="text-[10px] font-bold text-warmGray-400 uppercase tracking-wider px-3 py-1">
              Store Navigation
            </div>
            {categoryNavItems.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                    active
                      ? "bg-brand-50 text-brand-700 font-bold"
                      : "text-charcoal-800 hover:bg-warmGray-50"
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-warmGray-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-2 text-center text-xs font-bold bg-charcoal-900 text-white rounded-lg"
              >
                Partner Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (ROS Retail Style) */}
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
                {item.label === "Basket" && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {isHydrated ? totalCases : 0}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Floating WhatsApp Action Button (ROS Retail Style) */}
      <aside aria-label="WhatsApp Contact Desk">
        <a
          href="https://wa.me/918383092211?text=Namaste%20Maa%20Ji,%20%20I%20want%20to%20inquire%20about%20wholesale%20beverage%20cases"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Wholesale Desk on WhatsApp"
          className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-950/25 hover:scale-105 active:scale-95 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </aside>
    </>
  );
}
