"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Building2,
  Search,
  Wallet,
  Clock,
  Layers,
  Flame,
  Loader2,
} from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Product, Category } from "@/types";

export default function CustomerHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("auth_user_id", user.id)
            .single();

          if (data) {
            setProfile(data as Profile);
          }
        }

        // Fetch live database catalog
        const res = await fetch("/api/catalog");
        const json = await res.json();
        if (json.success) {
          setProducts(json.products || []);
          setCategories(json.categories || []);
        }
      } catch (err) {
        console.warn("Could not fetch user profile or catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Greeting determination based on time
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
      ? "Good afternoon"
      : "Good evening";

  const customerName = profile?.owner_name || profile?.business_name || null;

  // Filter products
  const confirmedProducts = products.filter(
    (p) => (p.price_per_case ?? p.base_price) !== null
  );

  // Offers & Bulk Deals: Products with bulk pricing (e.g. Red Bull)
  const bulkDealProducts = products.filter(
    (p) => p.bulk_prices && p.bulk_prices.length > 0
  );

  // Popular soft drinks
  const popularSoftDrinks = products
    .filter(
      (p) =>
        (p.category?.slug === "soft-drinks" || p.category_id?.includes("soft")) &&
        (p.price_per_case ?? p.base_price) !== null
    )
    .slice(0, 4);

  // Quick reorder candidates
  const recentlyOrderedProducts = confirmedProducts.slice(0, 3);

  // Financial credit data safely computed
  const creditLimit = profile?.credit_limit ?? null;
  const outstanding = profile?.outstanding_amount ?? null;
  const availableCredit =
    creditLimit !== null && outstanding !== null
      ? Math.max(0, creditLimit - outstanding)
      : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Welcome Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800 text-white p-6 sm:p-10 shadow-elevated">
        {/* Ambient aesthetic glow from official logo emerald & lime */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-12 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600/30 border border-brand-500/40 text-accent-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            Direct Seller Ordering Platform
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {customerName ? (
              <>
                {greeting},{" "}
                <span className="text-accent-400">{customerName}</span>!
              </>
            ) : (
              <>
                Direct Seller Beverages.{" "}
                <span className="text-accent-400">Direct From Source.</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-warmGray-300 font-normal leading-relaxed">
            Order confirmed beverage cases directly from central seller inventory. Every product is sold strictly by the box.
          </p>

          {/* Quick Search Form Inside Hero */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 max-w-lg pt-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmGray-400" />
              <input
                type="text"
                placeholder="Search Coke 250ml, Red Bull cases, Limca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-warmGray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white/15 transition-all"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>

          {/* Business Profile Credit Snapshot (if logged in) */}
          {profile && (
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-warmGray-300">
              <span className="text-white font-bold">{profile.business_name}</span>
              {availableCredit !== null && (
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Available Credit: ₹{availableCredit.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Next Delivery: Tomorrow Morning</span>
              </div>
            </div>
          )}
        </div>

        {/* Ambient Seller Trust Badges Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-warmGray-300 font-medium">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strict Box / Case Seller Pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-400 shrink-0" />
            <span>Genuine Authorized Inventory</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Direct Central Seller</span>
          </div>
        </div>
      </section>

      {/* Categories Fast Filter Carousel */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-extrabold text-charcoal-950 tracking-tight">
              Beverage Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="p-3 rounded-2xl bg-white border border-warmGray-200 hover:border-brand-500 hover:shadow-sm text-center transition-all group"
            >
              <span className="text-xs font-bold text-charcoal-900 group-hover:text-brand-600 block line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-warmGray-500 uppercase tracking-wider font-semibold">
                Seller Packs
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers & Bulk Deals Section */}
      {bulkDealProducts.length > 0 && (
        <section className="p-6 rounded-3xl bg-offer-50/80 border border-offer-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-offer-600" />
              <div>
                <h2 className="text-lg font-black text-charcoal-950 tracking-tight">
                  Tiered Bulk Case Deals
                </h2>
                <p className="text-xs text-offer-900 font-medium">
                  Automatic volume discounts when ordering multiple cases
                </p>
              </div>
            </div>
            <Badge variant="offer" size="md">
              Save up to ₹100 / Case
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bulkDealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Products (Confirmed Case Packs) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <div>
              <h2 className="text-lg font-black text-charcoal-950 tracking-tight">
                Confirmed Seller Packs
              </h2>
              <p className="text-xs text-warmGray-500 font-medium">
                Verified seller pricing ready for immediate warehouse fulfillment
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View Complete Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-warmGray-500 font-semibold">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            Loading catalog from database...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {confirmedProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Soft Drinks Showcase */}
      {popularSoftDrinks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-charcoal-950 tracking-tight">
                Fast-Moving Soft Drinks
              </h2>
              <p className="text-xs text-warmGray-500 font-medium">
                High turnover 250ml & 750ml bottle crates for retail shops
              </p>
            </div>
            <Link
              href="/categories/soft-drinks"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              See All Soft Drinks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularSoftDrinks.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Quick Reorder Strip for Returning Customer */}
      {profile && recentlyOrderedProducts.length > 0 && (
        <section className="p-6 rounded-3xl bg-white border border-warmGray-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <div>
                <h3 className="text-base font-black text-charcoal-950">
                  Quick Reorder for {profile.business_name}
                </h3>
                <p className="text-xs text-warmGray-500 font-medium">
                  Frequently restocked items ready for 1-tap cart addition
                </p>
              </div>
            </div>
            <Link
              href="/reorder"
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Order History & Reorder
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentlyOrderedProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-2xl bg-brand-50/50 border border-warmGray-200 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-charcoal-900 block line-clamp-1">
                    {product.name}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-700">
                    ₹{product.price_per_case ?? product.base_price}/case
                  </span>
                </div>
                <Link href={`/products/${product.slug}`}>
                  <Button size="sm" variant="outline">
                    Reorder
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
