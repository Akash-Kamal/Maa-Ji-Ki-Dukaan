"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Package,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { resolveBeverageImage } from "@/lib/product-images";

export default function CartPage() {
  const {
    cartLines,
    totalCases,
    subtotalAmount,
    updateQuantity,
    removeItem,
    clearCart,
    isHydrated,
  } = useCart();

  if (!isHydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-8">
        <div className="h-8 bg-warmGray-200 rounded w-48 mb-4" />
        <div className="h-32 bg-warmGray-100 rounded-2xl" />
        <div className="h-32 bg-warmGray-100 rounded-2xl" />
      </div>
    );
  }

  if (cartLines.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="flex items-center justify-between border-b border-warmGray-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-charcoal-950 tracking-tight">
              Seller Order Cart
            </h1>
            <p className="text-xs text-warmGray-500 mt-0.5">
              Seller case orders prepared for central dispatch.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
        </div>

        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-brand-600" />}
          title="Your order cart is empty"
          description="Browse beverages in the confirmed seller catalog and order by case for central dispatch."
          action={
            <Link href="/products">
              <Button size="md" variant="primary" className="font-bold shadow-sm">
                Browse Seller Catalog
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warmGray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-charcoal-950 tracking-tight">
              Seller Case Cart
            </h1>
            <span className="text-xs font-extrabold bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-200">
              {totalCases} {totalCases === 1 ? "Case" : "Cases"}
            </span>
          </div>
          <p className="text-xs text-warmGray-500 mt-0.5">
            Primary ordering unit: <strong className="text-charcoal-800">CASE / BOX</strong>. Direct central dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Adding Cases
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearCart}
            className="text-xs text-warmGray-500 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Main Grid: Cart Items (Left) & Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-3.5">
          {cartLines.map((line) => {
            return (
              <Card
                key={line.variantId}
                variant="default"
                padding="md"
                className="relative overflow-hidden hover:border-warmGray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-brand-50/40 border border-warmGray-200 p-2 flex items-center justify-center overflow-hidden">
                      {(() => {
                        const lineImage = resolveBeverageImage(
                          line.product.slug,
                          line.variant.variant_name,
                          line.product.product_image_url
                        );
                        return lineImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={lineImage}
                            alt={line.product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-warmGray-300" />
                        );
                      })()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700">
                          {line.product.brand?.name}
                        </span>
                        {line.pricingSource === "bulk" && (
                          <Badge variant="offer" size="sm">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Bulk Tier Applied
                          </Badge>
                        )}
                        {line.pricingSource === "customer" && (
                          <Badge variant="success" size="sm">
                            Custom Rate
                          </Badge>
                        )}
                      </div>

                      <Link
                        href={`/products/${line.product.slug}`}
                        className="text-sm font-extrabold text-charcoal-950 hover:text-brand-600 truncate block mt-0.5"
                      >
                        {line.product.name} — {line.variant.variant_name}
                      </Link>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-warmGray-500 mt-1 font-medium">
                        {line.piecesPerCase && (
                          <span className="text-charcoal-700 font-semibold bg-brand-50 px-1.5 py-0.5 rounded border border-warmGray-200 text-[11px]">
                            {line.piecesPerCase} pcs / case
                          </span>
                        )}
                        {line.totalPieces && (
                          <span className="text-warmGray-600 text-[11px]">
                            {line.quantityCases} {line.quantityCases === 1 ? "case" : "cases"} ={" "}
                            <strong className="text-charcoal-800">{line.totalPieces} pcs total</strong>
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-black text-charcoal-950">
                          ₹{line.effectivePricePerCase.toLocaleString("en-IN")}{" "}
                          <span className="text-xs font-bold text-warmGray-500">/ case</span>
                        </span>
                        {line.pieceEquivalent && (
                          <span className="text-[11px] text-warmGray-500">
                            (₹{line.pieceEquivalent} / piece)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Selector & Line Subtotal */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-warmGray-100">
                    <div className="flex items-center gap-2">
                      <QuantitySelector
                        size="sm"
                        value={line.quantityCases}
                        min={1}
                        unitLabel="cases"
                        onChange={(newVal) => updateQuantity(line.variantId, newVal)}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(line.variantId)}
                        className="p-1.5 text-warmGray-400 hover:text-red-600 rounded-lg hover:bg-brand-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-warmGray-500 uppercase tracking-wider block">
                        Line Subtotal:
                      </span>
                      <span className="text-base font-black text-charcoal-950 tracking-tight">
                        ₹{line.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {!line.isAvailable && (
                  <div className="mt-3 p-2 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-1.5 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Requested cases exceed warehouse stock ({line.availableStock} cases available).</span>
                  </div>
                )}
              </Card>
            );
          })}

          {/* Seller Dispatch Assurance Banner */}
          <div className="p-3.5 rounded-xl bg-brand-50/70 border border-warmGray-200 text-charcoal-800 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="leading-relaxed">
              Seller orders are packed and dispatched in original factory cases. All pricing locked upon central approval.
            </span>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="space-y-4">
          <Card variant="default" padding="lg" className="sticky top-20 border-warmGray-200 space-y-4">
            <h2 className="text-base font-extrabold text-charcoal-950 border-b border-warmGray-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-charcoal-700">
                <span>Total Cases:</span>
                <span className="font-extrabold text-charcoal-950 text-sm">
                  {totalCases} {totalCases === 1 ? "Case" : "Cases"}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-700">
                <span>Catalog Subtotal:</span>
                <span className="font-extrabold text-charcoal-950 text-sm">
                  ₹{subtotalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-500 pt-1 border-t border-warmGray-100">
                <span>GST (Tax):</span>
                <span className="font-semibold text-charcoal-600">Calculated at Billing</span>
              </div>

              <div className="flex justify-between text-charcoal-500">
                <span>Freight / Delivery:</span>
                <span className="font-semibold text-charcoal-600">To be confirmed</span>
              </div>
            </div>

            <div className="pt-3 border-t border-warmGray-200 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-warmGray-500 block uppercase tracking-wider">
                  Estimated Total
                </span>
                <span className="text-2xl font-black text-charcoal-950 tracking-tight">
                  ₹{subtotalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                B2B Rate
              </span>
            </div>

            <Link href="/checkout" className="block pt-2">
              <Button size="lg" variant="primary" className="w-full font-bold shadow-md">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <p className="text-[11px] text-warmGray-500 text-center leading-normal">
              Final seller invoice will be confirmed by central dispatch before vehicle leaves warehouse.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
