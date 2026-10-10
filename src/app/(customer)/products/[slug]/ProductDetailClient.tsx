"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { useCart } from "@/context/CartContext";
import { resolveBeverageImage, resolveBeverageGallery } from "@/lib/product-images";

export interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem, getNextBulkDiscount } = useCart();
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
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number>(0);
  const [caseQuantity, setCaseQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const currentVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const hasConfirmedPrice = currentVariant.price_per_case !== null && currentVariant.price_per_case > 0;
  const isOutOfStock = currentVariant.stock_cases <= 0;

  // Gallery calculation
  const gallery = resolveBeverageGallery(
    product.slug,
    currentVariant?.variant_name,
    product.product_image_url
  );
  const activeImage = gallery[selectedGalleryIndex] || gallery[0];

  // Informational piece price equivalent
  const pieceEquivalent =
    hasConfirmedPrice && currentVariant.pieces_per_case && currentVariant.pieces_per_case > 0
      ? (currentVariant.price_per_case! / currentVariant.pieces_per_case).toFixed(
          (currentVariant.price_per_case! % currentVariant.pieces_per_case === 0) ? 0 : 2
        )
      : null;

  const nextBulk = getNextBulkDiscount(product.id, currentVariant.id, caseQuantity);

  const handleAddToCart = () => {
    if (!hasConfirmedPrice || isOutOfStock) return;
    addItem(product.id, currentVariant.id, caseQuantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-warmGray-500">
        <Link href="/products" className="hover:text-charcoal-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
        <span>/</span>
        <span>{product.category?.name || "Beverages"}</span>
        <span>/</span>
        <span className="text-charcoal-900 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-warmGray-200 shadow-sm">
        {/* Product Media Area */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center justify-center aspect-square bg-[#f6fbf2] rounded-2xl border border-warmGray-200/60 p-8 relative overflow-hidden">
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={`${product.name} - ${currentVariant.variant_name}`}
                className="max-h-full max-w-full object-contain transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <Package className="w-24 h-24 stroke-[1] text-warmGray-300 mb-3" />
                <p className="text-xs font-bold text-warmGray-400 uppercase tracking-widest">
                  {product.brand?.name} Seller Case
                </p>
                <span className="text-[11px] text-warmGray-400 mt-1">
                  Pack: {currentVariant.variant_name}
                </span>
              </div>
            )}

            {isOutOfStock && hasConfirmedPrice && (
              <div className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-charcoal-950 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Alternate Packaging Angles / Gallery Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={imgUrl}
                  type="button"
                  onClick={() => setSelectedGalleryIndex(idx)}
                  className={`relative w-16 h-16 rounded-xl border p-1 bg-brand-50/40 overflow-hidden flex-shrink-0 transition-all ${
                    idx === selectedGalleryIndex
                      ? "border-charcoal-950 ring-2 ring-charcoal-950/20 shadow-sm"
                      : "border-warmGray-200 opacity-60 hover:opacity-100 hover:border-warmGray-300"
                  }`}
                  title={`View angle ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Packaging angle ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Pricing */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brand">{product.brand?.name || "Beverage"}</Badge>
              {product.category && <Badge variant="neutral">{product.category.name}</Badge>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
              {product.name}
            </h1>

            <p className="text-sm text-warmGray-600 mt-3 leading-relaxed">
              {product.description || "Authorized authentic direct beverage case stock."}
            </p>

            {/* Variant / Size Selection */}
            {variants.length > 1 && (
              <div className="mt-6 pt-5 border-t border-warmGray-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-2">
                  Select Size / Pack Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setSelectedGalleryIndex(0);
                          setCaseQuantity(1);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-charcoal-950 text-white border-charcoal-950 shadow-sm"
                            : "bg-brand-50 text-charcoal-800 hover:bg-brand-100 border-warmGray-200"
                        }`}
                      >
                        {v.variant_name}
                        {v.price_per_case ? ` (₹${v.price_per_case})` : " (TBD)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Packaging Specifications */}
            <div className="grid grid-cols-2 gap-3 mt-6 p-4 rounded-xl bg-brand-50/40 border border-warmGray-200 text-xs">
              <div>
                <span className="text-warmGray-500 font-medium block">Pieces per Case:</span>
                <span className="font-bold text-charcoal-900 text-sm">
                  {currentVariant.pieces_per_case ? `${currentVariant.pieces_per_case} Units` : "Pending Confirmation"}
                </span>
              </div>
              <div>
                <span className="text-warmGray-500 font-medium block">Packaging Type:</span>
                <span className="font-bold text-charcoal-900 text-sm capitalize">
                  {currentVariant.packaging_type}
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="mt-6 pt-6 border-t border-warmGray-200">
              {hasConfirmedPrice ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                      Seller Price / Case:
                    </span>
                    <span className="text-3xl font-black text-charcoal-950 tracking-tight">
                      ₹{currentVariant.price_per_case?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-bold text-warmGray-500">/ case</span>
                  </div>

                  {pieceEquivalent && (
                    <p className="text-xs text-warmGray-500 mt-1 font-medium">
                      ₹{pieceEquivalent} / piece equivalent (informational)
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-700">Availability:</span>
                    {currentVariant.stock_cases > 0 ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {currentVariant.stock_cases} Cases in Warehouse
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Bulk Slabs if available */}
                  {product.bulk_prices && product.bulk_prices.length > 0 && (
                    <div className="mt-5 p-4 rounded-2xl bg-offer-50 border border-offer-200">
                      <div className="flex items-center gap-1.5 text-offer-800 text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-4 h-4 text-offer-600" />
                        Bulk Deal (Case Slabs)
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-charcoal-700 font-medium">
                          <span>1 – 4 Cases</span>
                          <span className="font-bold">₹{currentVariant.price_per_case} / case</span>
                        </div>
                        {product.bulk_prices.map((slab) => (
                          <div key={slab.id} className="flex justify-between text-offer-800 font-bold">
                            <span>{slab.minimum_quantity}+ Cases</span>
                            <span>₹{slab.price_per_case} / case</span>
                          </div>
                        ))}
                      </div>

                      {nextBulk && (
                        <div className="mt-3 p-2.5 rounded-xl bg-offer-100/90 border border-offer-300 text-offer-950 text-xs font-bold flex items-center gap-2 animate-pulse">
                          <span className="text-base">🎉</span>
                          <span>
                            Add {nextBulk.additionalCasesNeeded} more case{nextBulk.additionalCasesNeeded > 1 ? "s" : ""} to unlock ₹{nextBulk.nextTierPrice.toLocaleString("en-IN")}/case!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm mb-1 text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Rate Awaiting Central Confirmation
                  </div>
                  <p className="leading-relaxed">
                    This beverage variant is in the catalog, but current batch seller pricing is being verified. Please request price directly from operations.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-warmGray-200 space-y-3">
            {hasConfirmedPrice ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-charcoal-700 whitespace-nowrap">
                    Quantity:
                  </span>
                  <QuantitySelector
                    value={caseQuantity}
                    min={1}
                    unitLabel="cases"
                    onChange={setCaseQuantity}
                    disabled={isOutOfStock}
                  />
                </div>

                <Button
                  size="lg"
                  variant="primary"
                  className="flex-1 font-bold shadow-md"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  {addedToast ? (
                    <span className="inline-flex items-center gap-1.5 text-white">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      Added {caseQuantity} Case{caseQuantity > 1 ? "s" : ""} to Cart!
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
                size="lg"
                variant="outline"
                className="w-full font-bold text-warmGray-500 bg-warmGray-50 cursor-not-allowed"
                disabled
              >
                Price on Request — Cannot Order
              </Button>
            )}

            {addedToast && (
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="font-semibold">Cases reserved in cart.</span>
                <Link href="/cart" className="font-bold underline hover:text-emerald-950">
                  View Cart →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
