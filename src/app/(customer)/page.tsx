"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Flame,
  Loader2,
  Truck,
  ShieldCheck,
  CreditCard,
  Building2,
  Tag,
  Zap,
  Droplets,
  Award,
} from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdvertisementSlider } from "@/components/ui/AdvertisementSlider";
import { BrandAdvertSlider } from "@/components/ui/BrandAdvertSlider";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Product, Category, Brand } from "@/types";

export default function CustomerHomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
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
          setBrands(json.brands || []);
        }
      } catch (err) {
        console.warn("Could not fetch user profile or catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products with confirmed case price
  const confirmedProducts = products.filter(
    (p) => (p.price_per_case ?? p.base_price) !== null
  );

  // Offers & Bulk Deals: Products with bulk pricing
  const bulkDealProducts = products.filter(
    (p) => p.bulk_prices && p.bulk_prices.length > 0
  );

  // Cold Drinks (Soft Drinks)
  const coldDrinks = products.filter(
    (p) =>
      p.category?.slug === "soft-drinks" ||
      p.category_id?.includes("soft") ||
      p.category_id === "c0000000-0000-0000-0000-000000000002"
  );

  // Energy Drinks
  const energyDrinks = products.filter(
    (p) =>
      p.category?.slug === "energy-drinks" ||
      p.category_id?.includes("energy") ||
      p.category_id === "c0000000-0000-0000-0000-000000000001"
  );

  // Water Store
  const waterProducts = products.filter(
    (p) =>
      p.category?.slug === "water" ||
      p.category_id?.includes("water") ||
      p.category_id === "c0000000-0000-0000-0000-000000000003"
  );

  // Quick reorder candidates
  const recentlyOrderedProducts = confirmedProducts.slice(0, 3);

  // Visual Category Card Mapping (ROS Retail Style)
  const categoryCardDetails: Record<string, { image: string; label: string }> = {
    "soft-drinks": {
      image: "/images/products/coca_cola_original_taste_can_300ml.jpg",
      label: "Cold Drinks",
    },
    "energy-drinks": {
      image: "/images/products/panther_energy_drink.jpg",
      label: "Energy Drinks",
    },
    water: {
      image: "/images/products/bisleri_water_1l_x12.jpg",
      label: "Water Store",
    },
    juices: {
      image: "/images/products/fanta_orange_750ml.jpg",
      label: "Juices & Drinks",
    },
    soda: {
      image: "/images/products/lahori_zeera_250ml.jpg",
      label: "Soda & Ethnic",
    },
    "sports-drinks": {
      image: "/images/products/campa_energy_gold_boost_250ml.jpg",
      label: "Sports Drinks",
    },
    "other-beverages": {
      image: "/images/products/cream_bell_kesar_badam.jpg",
      label: "Other Beverages",
    },
  };

  // Special Offers Card data (ROS Retail Style)
  const specialOfferCategories = [
    {
      id: "so-cold-drinks",
      title: "Cold Drinks",
      href: "/categories/soft-drinks",
      image: "/images/products/coca_cola_original_taste_can_300ml.jpg",
      badge: "Save up to ₹80",
    },
    {
      id: "so-energy",
      title: "Energy Drinks",
      href: "/categories/energy-drinks",
      image: "/images/products/red_bull_energy_drink_250ml.jpg",
      badge: "Bulk Discounts",
    },
    {
      id: "so-water",
      title: "Water Store",
      href: "/categories/water",
      image: "/images/products/bisleri_water_1l_x12.jpg",
      badge: "Best Case Rates",
    },
    {
      id: "so-lahori",
      title: "Soda & Ethnic",
      href: "/categories/soda",
      image: "/images/products/lahori_zeera_250ml.jpg",
      badge: "Fast Moving",
    },
    {
      id: "so-juices",
      title: "Juices & Drinks",
      href: "/categories/juices",
      image: "/images/products/fanta_orange_750ml.jpg",
      badge: "Summer Offers",
    },
    {
      id: "so-sports",
      title: "Sports Drinks",
      href: "/categories/sports-drinks",
      image: "/images/products/campa_energy_gold_boost_250ml.jpg",
      badge: "Direct Bottler",
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Top Hero Promotional Banner (ROS Retail Style) */}
      <AdvertisementSlider />

      {/* 2. Shop By Category (ROS Retail Centered Section) */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-center text-charcoal-900 tracking-tight my-4">
          Shop By Category
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 sm:gap-4">
          {categories.map((cat) => {
            const detail = categoryCardDetails[cat.slug] || {
              image: "/images/products/coca_cola_original_taste_250ml.jpg",
              label: cat.name,
            };
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-[#e2eaf2] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all text-center"
              >
                {/* Upper Image Box */}
                <div className="aspect-square w-full p-2.5 sm:p-3 flex items-center justify-center bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={detail.image}
                    alt={cat.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Bottom Light Blue Tinted Ribbon (ROS Retail Style) */}
                <div className="bg-[#f0f7fd] border-t border-[#e2eaf2] py-2 px-1 text-center">
                  <span className="text-[11px] sm:text-xs font-bold text-charcoal-800 group-hover:text-brand-600 line-clamp-1 block">
                    {detail.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Special Offers (ROS Retail Centered Section) */}
      <section className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-center text-charcoal-900 tracking-tight my-4">
          Special Offers
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-4">
          {specialOfferCategories.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col justify-between rounded-xl border border-[#e2eaf2] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all text-center"
            >
              {/* Product Visual Container */}
              <div className="aspect-square w-full p-2.5 sm:p-3 flex items-center justify-center bg-white relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Bottom Light Blue Tinted Ribbon (ROS Retail Style) */}
              <div className="bg-[#f0f7fd] border-t border-[#e2eaf2] py-2 px-1 text-center">
                <span className="text-[11px] sm:text-xs font-bold text-charcoal-800 group-hover:text-brand-600 line-clamp-1 block">
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Middle In-Stream Advertisement Banner Area (ROS Retail Style) */}
      <BrandAdvertSlider />

      {/* 5. Cold Drinks Department Showcase (ROS Retail Style) */}
      {coldDrinks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-warmGray-200 pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
              Cold Drinks
            </h2>
            <Link
              href="/categories/soft-drinks"
              className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
            {coldDrinks.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Energy Drinks Department Showcase (ROS Retail Style) */}
      {energyDrinks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-warmGray-200 pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
              Energy Drinks
            </h2>
            <Link
              href="/categories/energy-drinks"
              className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
            {energyDrinks.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Water Store Department Showcase (ROS Retail Style) */}
      {waterProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-warmGray-200 pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
              Water Store
            </h2>
            <Link
              href="/categories/water"
              className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
            {waterProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Quick Reorder Strip for Returning Customer */}
      {profile && recentlyOrderedProducts.length > 0 && (
        <section className="p-5 sm:p-6 rounded-2xl bg-white border border-warmGray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm sm:text-base font-black text-charcoal-950">
                Quick Reorder for {profile.business_name}
              </h3>
            </div>
            <Link
              href="/reorder"
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Order History →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentlyOrderedProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-xl bg-brand-50/50 border border-warmGray-200 flex items-center justify-between gap-3"
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
