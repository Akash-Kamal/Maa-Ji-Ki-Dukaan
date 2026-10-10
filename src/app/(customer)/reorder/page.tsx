"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCw,
  ArrowRight,
  Package,
  CheckCircle2,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";

interface ReorderCandidate {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  piecesPerCase: number | null;
  currentPricePerCase: number | null;
  isAvailable: boolean;
  stockCases: number;
  lastOrderedCases: number;
}

export default function ReorderPage() {
  const [candidates, setCandidates] = useState<ReorderCandidate[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function loadReorderItems() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch user profile to get customer_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (!profile) {
          setIsLoading(false);
          return;
        }

        // Fetch past orders and items for this customer from database
        const { data: customerOrders } = await supabase
          .from("orders")
          .select(`
            id,
            items:order_items(*)
          `)
          .eq("customer_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch live catalog to get latest prices and stock
        const catRes = await fetch("/api/catalog");
        const catJson = await catRes.json();
        const liveProducts: any[] = catJson.products || [];

        const orderItemsList: any[] = [];
        (customerOrders || []).forEach((o: any) => {
          if (o.items && Array.isArray(o.items)) {
            orderItemsList.push(...o.items);
          }
        });

        // Map items to unique product variants with current catalog state
        const itemMap = new Map<string, ReorderCandidate>();
        const initialQty: Record<string, number> = {};

        for (const item of orderItemsList) {
          const product = liveProducts.find(
            (p) => p.id === item.product_id || p.name === item.product_name_snapshot
          );
          if (!product) continue;

          const variant = (product.variants || []).find(
            (v: any) => v.id === item.variant_id || v.variant_name === item.variant_snapshot
          );
          if (!variant) continue;

          const key = `${product.id}-${variant.id}`;
          if (!itemMap.has(key)) {
            const lastCases = item.quantity_cases || item.quantity || 1;
            itemMap.set(key, {
              productId: product.id,
              variantId: variant.id,
              productName: product.name,
              variantName: variant.variant_name,
              piecesPerCase: variant.pieces_per_case || null,
              currentPricePerCase: variant.price_per_case,
              isAvailable:
                variant.is_active &&
                variant.price_per_case !== null &&
                variant.stock_cases > 0,
              stockCases: variant.stock_cases,
              lastOrderedCases: lastCases,
            });
            initialQty[key] = lastCases;
          }
        }

        setCandidates(Array.from(itemMap.values()));
        setQuantities(initialQty);
      } catch (err) {
        console.warn("Could not load reorder candidate items:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadReorderItems();
  }, []);

  const handleQuantityChange = (key: string, newQty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [key]: newQty,
    }));
  };

  const handleAddSingleItem = (candidate: ReorderCandidate) => {
    const key = `${candidate.productId}-${candidate.variantId}`;
    const qty = quantities[key] || candidate.lastOrderedCases || 1;

    addItem(candidate.productId, candidate.variantId, qty);
    setNotification(
      `Added ${qty} case${qty > 1 ? "s" : ""} of ${candidate.productName} (${candidate.variantName}) to cart.`
    );
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddAllAvailable = () => {
    let addedCount = 0;
    candidates
      .filter((c) => c.isAvailable)
      .forEach((candidate) => {
        const key = `${candidate.productId}-${candidate.variantId}`;
        const qty = quantities[key] || candidate.lastOrderedCases || 1;
        addItem(candidate.productId, candidate.variantId, qty);
        addedCount++;
      });

    if (addedCount > 0) {
      setNotification(`Added ${addedCount} items to your active cart.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-warmGray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
            Quick 1-Tap Reorder
          </h1>
          <p className="text-xs sm:text-sm text-warmGray-500 font-medium mt-0.5">
            Instant case restock based on your business ordering history.
          </p>
        </div>

        {candidates.some((c) => c.isAvailable) && (
          <Button
            size="md"
            variant="primary"
            onClick={handleAddAllAvailable}
            className="flex items-center gap-2 self-start"
          >
            <RotateCw className="w-4 h-4" /> Reorder All Available Cases
          </Button>
        )}
      </div>

      {/* Floating Success Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-subtle animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <Link href="/cart">
            <Button size="sm" variant="primary">
              View Cart
            </Button>
          </Link>
        </div>
      )}

      {/* Reorder Items Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-warmGray-500 font-semibold gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          Loading restock history from database...
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-warmGray-400" />}
          title="No past items available for reorder"
          description="Once you complete beverage orders, your past case packs will appear here for fast reordering."
          action={
            <Link href="/products">
              <Button size="md" variant="primary">
                Browse Seller Catalog
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((item) => {
            const key = `${item.productId}-${item.variantId}`;
            const currentQty = quantities[key] || item.lastOrderedCases || 1;
            const price = item.currentPricePerCase;

            return (
              <Card
                key={key}
                className="p-5 flex flex-col justify-between border border-warmGray-200 hover:border-warmGray-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-black text-charcoal-900 leading-tight">
                        {item.productName}
                      </h2>
                      <span className="text-xs font-semibold text-brand-600">
                        {item.variantName}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.isAvailable
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-warmGray-100 text-warmGray-600 border border-warmGray-200"
                      }`}
                    >
                      {item.isAvailable ? "In Stock" : "Unavailable"}
                    </span>
                  </div>

                  {/* Packaging data */}
                  <div className="text-xs text-warmGray-500 font-medium space-y-1 bg-brand-50/50 p-2.5 rounded-xl border border-warmGray-200/80">
                    <div className="flex justify-between">
                      <span>Packaging:</span>
                      <strong className="text-charcoal-800">
                        {item.piecesPerCase ? `${item.piecesPerCase} pcs / case` : "Case pack"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Price:</span>
                      <strong className="text-charcoal-900 font-bold">
                        {price !== null ? `₹${price} / case` : "Price on Request"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Ordered:</span>
                      <span className="text-charcoal-700">{item.lastOrderedCases} case(s)</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Quantity & Add to Cart */}
                <div className="pt-4 border-t border-warmGray-100 mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal-700">Cases to order:</span>
                    <QuantitySelector
                      value={currentQty}
                      onChange={(newQty) => handleQuantityChange(key, newQty)}
                      min={1}
                      max={item.stockCases > 0 ? Math.min(item.stockCases, 100) : 100}
                    />
                  </div>

                  <Button
                    size="sm"
                    variant={item.isAvailable ? "primary" : "outline"}
                    className="w-full flex items-center justify-center gap-1.5"
                    disabled={!item.isAvailable}
                    onClick={() => handleAddSingleItem(item)}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {item.isAvailable ? `Add ${currentQty} Case(s) to Cart` : "Out of Stock"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
