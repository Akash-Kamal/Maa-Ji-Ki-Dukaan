"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Package,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Product, Category, Brand } from "@/types";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("search") || "";
  const initialCat = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "name_asc">("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load live database catalog on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch("/api/catalog");
        const json = await res.json();
        if (json.success) {
          setProducts(json.products || []);
          setCategories(json.categories || []);
          setBrands(json.brands || []);
        }
      } catch (err) {
        console.error("Failed to fetch database catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Sync with searchParams if they change
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search");
    if (q) setSearch(q);
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const br = searchParams.get("brand");
    if (br) setSelectedBrand(br);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category Filter
      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;

      // 2. Brand Filter
      const matchesBrand =
        selectedBrand === "all" || product.brand_id === selectedBrand;

      // 3. Availability Filter
      const matchesStock = !inStockOnly || (product.stock_cases ?? 0) > 0;

      // 4. Multi-token comprehensive search across Name, Brand, Category, Variant, Size
      if (!search.trim()) {
        return matchesCategory && matchesBrand && matchesStock;
      }

      const searchTokens = search.toLowerCase().trim().split(/\s+/);
      const variantNames = (product.variants || [])
        .map((v) => `${v.variant_name} ${v.size || ""}`)
        .join(" ");

      const searchableCorpus = `
        ${product.name}
        ${product.brand?.name || ""}
        ${product.category?.name || ""}
        ${product.size || ""}
        ${variantNames}
      `.toLowerCase();

      const matchesSearch = searchTokens.every((token) =>
        searchableCorpus.includes(token)
      );

      return matchesCategory && matchesBrand && matchesStock && matchesSearch;
    });
  }, [products, search, selectedCategory, selectedBrand, inStockOnly]);

  // Sort logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price_asc") {
      list.sort((a, b) => {
        const pA = a.price_per_case ?? 999999;
        const pB = b.price_per_case ?? 999999;
        return pA - pB;
      });
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => {
        const pA = a.price_per_case ?? -1;
        const pB = b.price_per_case ?? -1;
        return pB - pA;
      });
    } else if (sortBy === "name_asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredProducts, sortBy]);

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedBrand !== "all" ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setInStockOnly(false);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Search Bar Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
              Seller Beverage Catalog
            </h1>
            <p className="text-xs sm:text-sm text-warmGray-500 font-medium mt-0.5">
              Direct case ordering for verified retail and business partners.
            </p>
          </div>
          <div className="text-xs font-bold text-warmGray-500 bg-brand-50 border border-warmGray-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {loading ? "Loading..." : `${sortedProducts.length} Products Available`}
          </div>
        </div>

        {/* Global Search Component */}
        <div className="max-w-xl">
          <SearchBar
            placeholder="Search beverages (e.g. Red Bull 250ml, Coke 250ml)..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl border border-warmGray-200 p-3 sm:p-4 shadow-subtle space-y-3">
        {/* Primary Row: Horizontal Categories Carousel + Mobile Filter Trigger */}
        <div className="flex items-center justify-between gap-2">
          {/* Categories Pill Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === "all"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white border border-warmGray-200 text-charcoal-700 hover:bg-brand-50"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-white border border-warmGray-200 text-charcoal-700 hover:bg-brand-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Mobile Filter Sheet Trigger */}
          <div className="sm:hidden shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMobileFilterOpen(true)}
              className="text-xs font-bold flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Secondary Row: Brands, Stock, and Sort (Desktop) */}
        <div className="hidden sm:flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-warmGray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider mr-1">
              Brands:
            </span>
            <button
              onClick={() => setSelectedBrand("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                selectedBrand === "all"
                  ? "bg-brand-600 text-white"
                  : "bg-brand-50 text-charcoal-700 hover:bg-brand-100 border border-warmGray-200"
              }`}
            >
              All Brands
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  selectedBrand === brand.id
                    ? "bg-brand-600 text-white"
                    : "bg-brand-50 text-charcoal-700 hover:bg-brand-100 border border-warmGray-200"
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              In Stock Only
            </label>

            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-warmGray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "featured" | "price_asc" | "price_desc" | "name_asc")}
                aria-label="Sort products"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-warmGray-300 bg-white text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="featured">Featured Packs</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Summary */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-warmGray-600 pt-1">
          <span className="font-semibold text-charcoal-800">Active Filters:</span>
          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-charcoal-800 px-2 py-0.5 rounded-md border border-warmGray-200 font-semibold">
              Category: {categories.find((c) => c.id === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory("all")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedBrand !== "all" && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-charcoal-800 px-2 py-0.5 rounded-md border border-warmGray-200 font-semibold">
              Brand: {brands.find((b) => b.id === selectedBrand)?.name}
              <button onClick={() => setSelectedBrand("all")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-charcoal-800 px-2 py-0.5 rounded-md border border-warmGray-200 font-semibold">
              In Stock Only
              <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-brand-600 hover:text-brand-700 underline font-semibold ml-1"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Product Grid or Empty State */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-warmGray-500 font-semibold">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          Loading seller catalog from database...
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="w-8 h-8 text-warmGray-400" />}
          title="No beverage products matched your criteria"
          description="Try broadening your search term or clearing active brand and category filters."
          action={
            <Button size="md" variant="primary" onClick={resetAllFilters}>
              Reset All Filters
            </Button>
          }
        />
      )}

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 sm:hidden animate-fade-in">
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-warmGray-200">
              <h2 className="text-lg font-black text-charcoal-900">Filters & Sort</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-warmGray-500 hover:bg-brand-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sort In Mobile Sheet */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products mobile"
                className="w-full p-2.5 rounded-xl border border-warmGray-300 text-sm font-semibold bg-white"
              >
                <option value="featured">Featured Packs</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

            {/* Category In Mobile Sheet */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    selectedCategory === "all"
                      ? "bg-brand-600 text-white"
                      : "bg-brand-50 text-charcoal-800"
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      selectedCategory === c.id
                        ? "bg-brand-600 text-white"
                        : "bg-brand-50 text-charcoal-800"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand In Mobile Sheet */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                Brands
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedBrand("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    selectedBrand === "all"
                      ? "bg-brand-600 text-white"
                      : "bg-brand-50 text-charcoal-800"
                  }`}
                >
                  All
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      selectedBrand === b.id
                        ? "bg-brand-600 text-white"
                        : "bg-brand-50 text-charcoal-800"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-2 border-t border-warmGray-200">
              <label className="flex items-center justify-between text-sm font-bold text-charcoal-900 cursor-pointer">
                <span>In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-5 h-5 rounded text-brand-600"
                />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  resetAllFilters();
                  setMobileFilterOpen(false);
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters ({sortedProducts.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-warmGray-500 font-semibold gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
          Loading Seller Catalog...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
