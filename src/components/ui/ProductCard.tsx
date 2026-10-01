"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package, ShieldAlert, Check } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { QuantitySelector } from "./QuantitySelector";
import { useCart } from "@/context/CartContext";
import { resolveBeverageImage } from "@/lib/product-images";

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, variant: ProductVariant, casesQuantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addItem } = useCart();
  // If product has variants, default to first active variant
  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [
        {
          id: `v-${product.id}`,
          product_id: product.id,
          variant_name: product.size || "Standard",
          slug: product.slug,
          size: product.size || null,
          packaging_type: "bottle" as const,
          pieces_per_case: product.pieces_per_case || null,
          price_per_case: product.price_per_case ?? product.base_price ?? null,
          stock_cases: product.stock_cases ?? product.stock_quantity ?? 0,
          reserved_cases: 0,
          reorder_level_cases: 10,
          needs_review: (product.price_per_case ?? product.base_price) === null,
          is_active: product.is_active,
          created_at: product.created_at,
          updated_at: product.updated_at,
        },
      ];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0].id);
  const [caseQuantity, setCaseQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);

  const currentVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const hasConfirmedPrice = currentVariant.price_per_case !== null && currentVariant.price_per_case > 0;
  const isOutOfStock = currentVariant.stock_cases <= 0;

  // Calculate informational per-piece price equivalent
  const pieceEquivalent =
    hasConfirmedPrice && currentVariant.pieces_per_case && currentVariant.pieces_per_case > 0
      ? (currentVariant.price_per_case! / currentVariant.pieces_per_case).toFixed(
          (currentVariant.price_per_case! % currentVariant.pieces_per_case === 0) ? 0 : 2
        )
      : null;

  const handleAdd = () => {
    if (!hasConfirmedPrice || isOutOfStock) return;
    addItem(product.id, currentVariant.id, caseQuantity);
    if (onAddToCart) {
      onAddToCart(product, currentVariant, caseQuantity);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1500);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-warmGray-200/90 bg-white p-4 shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          {product.brand?.name ? (
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
              {product.brand.name}
            </span>
          ) : (
            <span />
          )}

          {currentVariant.pieces_per_case ? (
            <span className="text-[11px] font-bold text-charcoal-700 bg-cream-100 px-2 py-0.5 rounded-md border border-warmGray-200">
              {currentVariant.pieces_per_case} pcs / case
            </span>
          ) : (
            <Badge variant="offer" size="sm">
              Pack TBD
            </Badge>
          )}
        </div>

        {/* Product Image / Thumbnail */}
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[4/3] w-full rounded-xl bg-[#f6fbf2] border border-warmGray-200/60 overflow-hidden mb-3 group-hover:bg-[#edf7e6] transition-colors"
        >
          {(() => {
            const displayImage = resolveBeverageImage(
              product.slug,
              currentVariant?.variant_name,
              product.product_image_url
            );
            return displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt={product.name}
                className="h-full w-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-warmGray-400">
                <Package className="w-10 h-10 stroke-[1.25] text-warmGray-300 mb-1" />
                <span className="text-[11px] font-medium text-warmGray-400">
                  {product.brand?.name || "Wholesale Case"}
                </span>
              </div>
            );
          })()}

          {isOutOfStock && hasConfirmedPrice && (
            <div className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-charcoal-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                Out of Stock
              </span>
            </div>
          )}
        </Link>

        {/* Product Title */}
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-extrabold text-charcoal-950 group-hover:text-brand-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Variant / Size Selector Chips if multiple variants exist */}
        {variants.length > 1 ? (
          <div className="mt-2.5">
            <span className="text-[10px] font-bold text-warmGray-500 uppercase tracking-wider block mb-1">
              Available Packs:
            </span>
            <div className="flex flex-wrap gap-1">
              {variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setCaseQuantity(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                      isSelected
                        ? "bg-charcoal-900 text-white shadow-sm"
                        : "bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-warmGray-200"
                    }`}
                  >
                    {v.variant_name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs font-semibold text-warmGray-600 mt-1">
            Pack: {currentVariant.variant_name}
          </p>
        )}
      </div>

      {/* Pricing & Case-Based Purchase Controls */}
      <div className="pt-3 border-t border-warmGray-100 mt-3">
        {hasConfirmedPrice ? (
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-charcoal-600">₹</span>
              <span className="text-xl font-black text-charcoal-950 tracking-tight">
                {currentVariant.price_per_case?.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-bold text-warmGray-500 ml-1">
                / case
              </span>
            </div>

            {pieceEquivalent && (
              <p className="text-[11px] text-warmGray-500 font-medium mt-0.5">
                ₹{pieceEquivalent} / piece equivalent
              </p>
            )}
          </div>
        ) : (
          <div className="mb-3 rounded-lg bg-amber-50/80 p-2 border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Rate Awaiting Wholesaler Confirmation</span>
            </div>
            <p className="text-[10px] text-amber-700/80 mt-0.5">
              Price on request from central desk.
            </p>
          </div>
        )}

        {hasConfirmedPrice ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-charcoal-700">Order:</span>
              <QuantitySelector
                size="sm"
                value={caseQuantity}
                unitLabel="cases"
                onChange={setCaseQuantity}
                disabled={isOutOfStock}
              />
            </div>

            <Button
              size="sm"
              variant="primary"
              className="w-full text-xs font-bold shadow-sm"
              disabled={isOutOfStock}
              onClick={handleAdd}
            >
              {addedToast ? (
                <span className="inline-flex items-center gap-1 text-white">
                  <Check className="w-3.5 h-3.5" /> Added {caseQuantity} Case{caseQuantity > 1 ? "s" : ""}
                </span>
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                `Add ${caseQuantity} Case${caseQuantity > 1 ? "s" : ""} to Cart`
              )}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs font-semibold text-warmGray-500 bg-warmGray-50"
            disabled
          >
            Price on Request
          </Button>
        )}
      </div>
    </div>
  );
}
