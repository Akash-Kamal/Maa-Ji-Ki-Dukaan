"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { DeliveryAddress, PaymentMethod, Profile } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartLines, totalCases, subtotalAmount, clearCart, isHydrated } = useCart();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [address, setAddress] = useState<DeliveryAddress>({
    business_name: "",
    owner_name: "",
    phone: "",
    address: "",
    city: "New Delhi",
    state: "Delhi",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load user profile on mount
  useEffect(() => {
    async function loadProfile() {
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
            const p = data as Profile;
            setProfile(p);
            setAddress({
              business_name: p.business_name || "",
              owner_name: p.owner_name || "",
              phone: p.phone || "",
              address: p.address || "",
              city: p.city || "New Delhi",
              state: p.state || "Delhi",
              pincode: p.pincode || "",
            });
          }
        } else {
          let session = null;
          try {
            session = JSON.parse(localStorage.getItem("mjd_active_session") || "null");
          } catch {}
          if (!session && typeof document !== "undefined") {
            const match = document.cookie.match(/mjd_session=([^;]+)/);
            if (match) {
              try {
                session = JSON.parse(decodeURIComponent(match[1]));
              } catch {}
            }
          }
          if (session) {
            setProfile({
              id: session.id,
              auth_user_id: session.id,
              business_name: session.business_name,
              owner_name: session.owner_name,
              email: session.email,
              phone: session.phone,
              gstin: session.gstin || null,
              business_type: session.role === "distributor" ? "Distributor" : "Retail Shop",
              role: (session.role === "admin" ? "admin" : session.role === "distributor" ? "distributor" : "retailer"),
              address: session.address,
              city: session.city || "New Delhi",
              state: session.state || "Delhi",
              pincode: session.pincode || "110075",
              credit_limit: session.credit_limit || 100000,
              outstanding_amount: session.outstanding_amount || 0,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setAddress({
              business_name: session.business_name || "",
              owner_name: session.owner_name || "",
              phone: session.phone || "",
              address: session.address || "",
              city: session.city || "New Delhi",
              state: session.state || "Delhi",
              pincode: session.pincode || "",
            });
          }
        }
      } catch (e) {
        console.warn("Could not load checkout profile:", e);
      }
    }
    loadProfile();
  }, []);

  const handleUseProfileAddress = () => {
    if (profile) {
      setAddress({
        business_name: profile.business_name || "",
        owner_name: profile.owner_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "New Delhi",
        state: profile.state || "Delhi",
        pincode: profile.pincode || "",
      });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (cartLines.length === 0) {
      setErrorMessage("Your cart is empty. Add cases before checkout.");
      return;
    }

    if (
      !address.business_name.trim() ||
      !address.owner_name.trim() ||
      !address.phone.trim() ||
      !address.address.trim() ||
      !address.pincode.trim()
    ) {
      setErrorMessage("Please complete all required delivery address fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        items: cartLines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          quantityCases: line.quantityCases,
        })),
        deliveryAddress: address,
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place wholesale order.");
      }

      // Clear wholesale cart
      clearCart();

      // Navigate to order confirmation
      router.push(`/orders/${encodeURIComponent(data.orderNumber)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred while placing order.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-8">
        <div className="h-8 bg-warmGray-200 rounded w-48 mb-4" />
        <div className="h-48 bg-warmGray-100 rounded-2xl" />
      </div>
    );
  }

  if (cartLines.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <div className="flex items-center gap-2 border-b border-warmGray-200 pb-4">
          <Link
            href="/cart"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
        </div>

        <div className="text-center py-16 bg-white rounded-3xl border border-warmGray-200 p-8 space-y-3">
          <h2 className="text-lg font-bold text-charcoal-900">Your cart is empty</h2>
          <p className="text-xs text-warmGray-500">
            Please add cases from the catalog before proceeding to checkout.
          </p>
          <Link href="/products" className="inline-block pt-2">
            <Button size="md" variant="primary" className="font-bold">
              Browse Wholesale Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Checkout Header */}
      <div className="flex items-center justify-between border-b border-warmGray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-950 tracking-tight">
            Wholesale Checkout
          </h1>
          <p className="text-xs text-warmGray-500 mt-0.5">
            Review delivery destination and confirm central case dispatch.
          </p>
        </div>
        <Link
          href="/cart"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Delivery Address & Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Card */}
          <Card variant="default" padding="lg" className="space-y-5">
            <div className="flex items-center justify-between border-b border-warmGray-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-extrabold text-charcoal-950">
                  Shop Delivery Address
                </h2>
              </div>

              {profile && (
                <button
                  type="button"
                  onClick={handleUseProfileAddress}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 underline"
                >
                  Use Profile Address
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Shop / Business Name"
                placeholder="e.g. Maa Durga General Store"
                value={address.business_name}
                onChange={(e) =>
                  setAddress({ ...address, business_name: e.target.value })
                }
                required
              />

              <Input
                label="Owner / Contact Person"
                placeholder="e.g. Akash Sharma"
                value={address.owner_name}
                onChange={(e) =>
                  setAddress({ ...address, owner_name: e.target.value })
                }
                required
              />

              <Input
                label="WhatsApp / Phone Number"
                placeholder="e.g. 9876543210"
                value={address.phone}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                required
              />

              <Input
                label="Pincode"
                placeholder="e.g. 110001"
                value={address.pincode}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
                required
              />
            </div>

            <Input
              label="Shop Address / Landmark"
              placeholder="e.g. Shop #4, Main Market, Near Metro Gate #2"
              value={address.address}
              onChange={(e) =>
                setAddress({ ...address, address: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                required
              />
              <Input
                label="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                required
              />
            </div>
          </Card>

          {/* Payment Method Card */}
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-warmGray-100 pb-3">
              <CreditCard className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-charcoal-950">
                Wholesale Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`flex flex-col p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  paymentMethod === "cash_on_delivery"
                    ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600"
                    : "border-warmGray-200 hover:bg-cream-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-charcoal-900">Cash on Delivery</span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cash_on_delivery"}
                    onChange={() => setPaymentMethod("cash_on_delivery")}
                    className="text-brand-600"
                  />
                </div>
                <span className="text-[11px] text-warmGray-500">
                  Pay cash at vehicle delivery after case inspection.
                </span>
              </label>

              <label
                className={`flex flex-col p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  paymentMethod === "credit"
                    ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600"
                    : "border-warmGray-200 hover:bg-cream-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-charcoal-900">Wholesale Credit</span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "credit"}
                    onChange={() => setPaymentMethod("credit")}
                    className="text-brand-600"
                  />
                </div>
                <span className="text-[11px] text-warmGray-500">
                  Post to verified ledger against approved credit limit.
                </span>
              </label>

              <label
                className={`flex flex-col p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  paymentMethod === "bank_transfer"
                    ? "border-brand-600 bg-brand-50/50 ring-1 ring-brand-600"
                    : "border-warmGray-200 hover:bg-cream-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-charcoal-900">Bank Transfer / NEFT</span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={() => setPaymentMethod("bank_transfer")}
                    className="text-brand-600"
                  />
                </div>
                <span className="text-[11px] text-warmGray-500">
                  Transfer directly to wholesaler current account.
                </span>
              </label>
            </div>

            {/* Order Dispatch Notes */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Dispatch / Gate Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Unload at godown gate #1, call 10 mins before arrival..."
                className="w-full rounded-xl border border-warmGray-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Order Review & Placement */}
        <div className="space-y-4">
          <Card variant="default" padding="lg" className="sticky top-20 border-warmGray-200 space-y-4">
            <h2 className="text-base font-extrabold text-charcoal-950 border-b border-warmGray-100 pb-3">
              Order Items ({totalCases} {totalCases === 1 ? "Case" : "Cases"})
            </h2>

            {/* Item Breakdown */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {cartLines.map((line) => (
                <div key={line.variantId} className="flex justify-between items-start text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-extrabold text-charcoal-900 block truncate">
                      {line.product.name} ({line.variant.variant_name})
                    </span>
                    <span className="text-warmGray-500 text-[11px]">
                      {line.quantityCases} {line.quantityCases === 1 ? "case" : "cases"} × ₹{line.effectivePricePerCase.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="font-bold text-charcoal-900 shrink-0">
                    ₹{line.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-warmGray-100 space-y-2 text-xs">
              <div className="flex justify-between text-charcoal-700">
                <span>Wholesale Cases:</span>
                <span className="font-bold">{totalCases} Cases</span>
              </div>
              <div className="flex justify-between text-charcoal-700">
                <span>Catalog Subtotal:</span>
                <span className="font-bold">₹{subtotalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-warmGray-500">
                <span>GST:</span>
                <span className="font-semibold text-charcoal-600">Calculated at Billing</span>
              </div>
              <div className="flex justify-between text-warmGray-500">
                <span>Wholesale Delivery:</span>
                <span className="font-semibold text-charcoal-600">To be confirmed</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-warmGray-200 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-warmGray-500 uppercase tracking-wider block">
                  Wholesale Total
                </span>
                <span className="text-2xl font-black text-charcoal-950 tracking-tight">
                  ₹{subtotalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                Guaranteed Lock
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full font-bold shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Place Wholesale Order
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-warmGray-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Direct B2B wholesaler dispatch guarantee</span>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
