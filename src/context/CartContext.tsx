"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Product, ProductVariant, CustomerPrice, BulkPrice } from "@/types";

export interface CartItem {
  productId: string;
  variantId: string;
  quantityCases: number;
}

export interface ResolvedCartLine {
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantityCases: number;
  piecesPerCase: number | null;
  totalPieces: number | null;
  standardPricePerCase: number;
  effectivePricePerCase: number;
  pieceEquivalent: string | null;
  pricingSource: "customer" | "bulk" | "standard";
  bulkSavingsPerCase: number;
  subtotal: number;
  isAvailable: boolean;
  availableStock: number;
}

export interface NextBulkDiscount {
  neededQuantity: number;
  additionalCasesNeeded: number;
  nextTierPrice: number;
  potentialSavingsTotal: number;
}

interface CartContextType {
  items: CartItem[];
  cartLines: ResolvedCartLine[];
  totalCases: number;
  itemCount: number;
  subtotalAmount: number;
  addItem: (productId: string, variantId: string, quantityCases: number) => void;
  updateQuantity: (variantId: string, quantityCases: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  isHydrated: boolean;
  refreshCatalog: () => Promise<void>;
  getNextBulkDiscount: (productId: string, variantId: string, currentQuantity: number) => NextBulkDiscount | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "mjkd_wholesale_cart_v1";

/**
 * Priority Pricing Resolver:
 * 1. Customer-Specific Negotiated Price (customer_prices)
 * 2. Bulk Tier Price (bulk_prices)
 * 3. Standard Variant Price (price_per_case)
 */
export function resolveEffectivePrice({
  variant,
  product,
  quantityCases,
  customerPrices = [],
}: {
  variant: ProductVariant;
  product: Product;
  quantityCases: number;
  customerPrices?: CustomerPrice[];
}): {
  effectivePrice: number;
  source: "customer" | "bulk" | "standard";
  bulkSavings: number;
} {
  const standardPrice = variant.price_per_case ?? 0;

  // 1. Customer-specific negotiated price
  const custom = customerPrices.find(
    (cp) =>
      (cp.variant_id === variant.id || cp.product_id === product.id) &&
      quantityCases >= (cp.minimum_quantity || 1)
  );
  if (custom && custom.price > 0) {
    return {
      effectivePrice: custom.price,
      source: "customer",
      bulkSavings: Math.max(0, standardPrice - custom.price),
    };
  }

  // 2. Bulk pricing tier for product/variant
  const bulkTiers = (product.bulk_prices || [])
    .filter((bp: BulkPrice) => quantityCases >= bp.minimum_quantity)
    .sort((a: BulkPrice, b: BulkPrice) => b.minimum_quantity - a.minimum_quantity);

  if (bulkTiers.length > 0 && bulkTiers[0].price_per_case > 0) {
    const tierPrice = bulkTiers[0].price_per_case;
    return {
      effectivePrice: tierPrice,
      source: "bulk",
      bulkSavings: Math.max(0, standardPrice - tierPrice),
    };
  }

  // 3. Standard variant wholesale price
  return {
    effectivePrice: standardPrice,
    source: "standard",
    bulkSavings: 0,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Function to refresh catalog from Supabase API
  const refreshCatalog = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog");
      const json = await res.json();
      if (json.success) {
        setCatalogProducts(json.products || []);
        setCustomerPrices(json.customerPrices || []);
      }
    } catch (e) {
      console.error("Failed to load catalog into cart:", e);
    }
  }, []);

  // Fetch catalog on mount
  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (item) =>
                item.variantId &&
                typeof item.quantityCases === "number" &&
                item.quantityCases > 0
            )
          );
        }
      }
    } catch (e) {
      console.error("Failed to restore cart from storage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage whenever items change (after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist cart:", e);
    }
  }, [items, isHydrated]);

  const addItem = useCallback((productId: string, variantId: string, quantityCases: number) => {
    if (quantityCases <= 0) return;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.variantId === variantId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantityCases: updated[existingIndex].quantityCases + quantityCases,
        };
        return updated;
      }
      return [...prev, { productId, variantId, quantityCases }];
    });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantityCases: number) => {
    if (quantityCases <= 0) {
      setItems((prev) => prev.filter((i) => i.variantId !== variantId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantityCases } : i))
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Next bulk discount tier finder
  const getNextBulkDiscount = useCallback(
    (productId: string, variantId: string, currentQuantity: number): NextBulkDiscount | null => {
      const product = catalogProducts.find((p) => p.id === productId);
      if (!product || !product.bulk_prices || product.bulk_prices.length === 0) {
        return null;
      }

      const variant = product.variants?.find((v) => v.id === variantId);
      const standardPrice = variant?.price_per_case ?? product.price_per_case ?? 0;

      // Find next tier with minimum_quantity > currentQuantity
      const nextTiers = product.bulk_prices
        .filter((bp) => bp.minimum_quantity > currentQuantity)
        .sort((a, b) => a.minimum_quantity - b.minimum_quantity);

      if (nextTiers.length === 0) return null;

      const nextTier = nextTiers[0];
      const additional = nextTier.minimum_quantity - currentQuantity;
      const savingsPerCase = Math.max(0, standardPrice - nextTier.price_per_case);

      return {
        neededQuantity: nextTier.minimum_quantity,
        additionalCasesNeeded: additional,
        nextTierPrice: nextTier.price_per_case,
        potentialSavingsTotal: savingsPerCase * nextTier.minimum_quantity,
      };
    },
    [catalogProducts]
  );

  // Compute resolved cart lines from live database catalog
  const cartLines: ResolvedCartLine[] = items
    .map((item) => {
      const product = catalogProducts.find((p) => p.id === item.productId);
      if (!product) return null;

      const variant =
        product.variants?.find((v) => v.id === item.variantId) ||
        (product.variants && product.variants.length > 0 ? product.variants[0] : null);

      if (!variant) return null;

      const pricing = resolveEffectivePrice({
        variant,
        product,
        quantityCases: item.quantityCases,
        customerPrices,
      });

      const piecesPerCase = variant.pieces_per_case || null;
      const totalPieces = piecesPerCase ? piecesPerCase * item.quantityCases : null;
      const subtotal = pricing.effectivePrice * item.quantityCases;

      const pieceEquivalent =
        piecesPerCase && pricing.effectivePrice > 0
          ? (pricing.effectivePrice / piecesPerCase).toFixed(
              pricing.effectivePrice % piecesPerCase === 0 ? 0 : 2
            )
          : null;

      const isAvailable = variant.is_active && variant.stock_cases >= item.quantityCases;

      return {
        productId: product.id,
        variantId: variant.id,
        product,
        variant,
        quantityCases: item.quantityCases,
        piecesPerCase,
        totalPieces,
        standardPricePerCase: variant.price_per_case ?? 0,
        effectivePricePerCase: pricing.effectivePrice,
        pieceEquivalent,
        pricingSource: pricing.source,
        bulkSavingsPerCase: pricing.bulkSavings,
        subtotal,
        isAvailable,
        availableStock: variant.stock_cases,
      };
    })
    .filter((line): line is ResolvedCartLine => line !== null);

  const totalCases = cartLines.reduce((acc, l) => acc + l.quantityCases, 0);
  const itemCount = cartLines.length;
  const subtotalAmount = cartLines.reduce((acc, l) => acc + l.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartLines,
        totalCases,
        itemCount,
        subtotalAmount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isHydrated,
        refreshCatalog,
        getNextBulkDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
