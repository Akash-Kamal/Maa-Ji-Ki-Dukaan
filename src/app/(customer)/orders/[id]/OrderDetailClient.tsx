"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  RotateCw,
  CheckCircle2,
  Calendar,
  Building2,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus, DeliveryAddress } from "@/types";

interface SnapshotItemRecord {
  id?: string;
  product_id?: string;
  variant_id?: string;
  product_name_snapshot: string;
  variant_snapshot: string;
  pieces_per_case_snapshot: number | null;
  quantity?: number;
  quantity_cases?: number;
  price_snapshot?: number;
  price_per_case_snapshot: number;
  subtotal: number;
}

interface OrderDetailRecord {
  id: string;
  order_number: string;
  created_at: string;
  order_status: OrderStatus;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  delivery_address: DeliveryAddress;
  notes?: string | null;
  items: SnapshotItemRecord[];
}

interface OrderDetailClientProps {
  orderIdentifier: string;
}

export function OrderDetailClient({ orderIdentifier }: OrderDetailClientProps) {
  const [order, setOrder] = useState<OrderDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [reorderStatus, setReorderStatus] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);

        // 1. First attempt via authenticated API route
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(orderIdentifier)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.order) {
              setOrder(data.order);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Fall through to direct Supabase query
        }

        // 2. Direct Supabase query with safe UUID checking
        const supabase = createClient();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);

        let query = supabase
          .from("orders")
          .select(`
            *,
            items:order_items(*)
          `);

        if (isUuid) {
          query = query.eq("id", orderIdentifier);
        } else {
          query = query.eq("order_number", orderIdentifier);
        }

        const { data: dbOrder, error } = await query.maybeSingle();

        if (error) {
          console.error("Database order fetch error:", error);
          setOrder(null);
        } else if (dbOrder) {
          setOrder(dbOrder);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.warn("Could not find order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderIdentifier]);

  const handleReorder = () => {
    if (!order || !order.items) return;

    let addedCount = 0;
    for (const item of order.items) {
      if (item.product_id && item.variant_id) {
        const cases = item.quantity_cases || item.quantity || 1;
        addItem(item.product_id, item.variant_id, cases);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      setReorderStatus(`Added ${addedCount} item(s) to cart.`);
    } else {
      setReorderStatus("Unable to reorder items from this order.");
    }

    setTimeout(() => setReorderStatus(null), 4000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8 animate-pulse">
        <div className="h-8 bg-warmGray-200 rounded w-48 mb-4" />
        <div className="h-64 bg-warmGray-100 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-charcoal-900">Order Not Found</h2>
        <p className="text-xs text-warmGray-500">The order #{orderIdentifier} could not be located.</p>
        <Link href="/orders">
          <Button size="sm" variant="primary">Return to Orders</Button>
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const totalCases = items.reduce(
    (acc: number, it: SnapshotItemRecord) => acc + (it.quantity_cases || it.quantity || 1),
    0
  );

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-warmGray-200 pb-4">
        <Link
          href="/orders"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
        </Link>
        <Link href="/products" className="text-xs font-bold text-charcoal-700 hover:text-brand-600 flex items-center gap-1">
          <ShoppingBag className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      {/* Order Success / Status Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-brand-950 text-white border border-charcoal-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
                Order Confirmed
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Order #{order.order_number}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.order_status || "pending"} />
            <Button
              size="sm"
              variant="outline"
              onClick={handleReorder}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Reorder Cases
            </Button>
          </div>
        </div>

        <p className="text-xs text-warmGray-300 flex items-center gap-1.5 pt-1">
          <Calendar className="w-3.5 h-3.5 text-warmGray-400" />
          Recorded on {formattedDate} • Central warehouse dispatch pending approval
        </p>
      </div>

      {reorderStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reorderStatus}</span>
          </div>
          <Link href="/cart" className="font-bold underline text-emerald-950">
            View Cart →
          </Link>
        </div>
      )}

      {/* Historical Order Items Snapshot Table */}
      <Card variant="default" padding="lg" className="space-y-4">
        <div className="flex items-center justify-between border-b border-warmGray-100 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-extrabold text-charcoal-950">
              Purchased Case Lineup ({totalCases} {totalCases === 1 ? "Case" : "Cases"})
            </h2>
          </div>
          <span className="text-[11px] font-bold text-warmGray-500 bg-brand-50 px-2.5 py-0.5 rounded border border-warmGray-200">
            Historical Price Snapshot Protected
          </span>
        </div>

        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Beverage & Pack Size</TableHeaderCell>
              <TableHeaderCell>Pieces / Case</TableHeaderCell>
              <TableHeaderCell>Seller Price / Case</TableHeaderCell>
              <TableHeaderCell>Order Quantity</TableHeaderCell>
              <TableHeaderCell>Line Total</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {items.map((it: SnapshotItemRecord, idx: number) => {
              const pcs = it.pieces_per_case_snapshot;
              const cases = it.quantity_cases || it.quantity || 1;
              const pricePerCase = it.price_per_case_snapshot || it.price_snapshot || 0;
              const subtotal = it.subtotal || pricePerCase * cases;

              return (
                <TableRow key={it.id || idx}>
                  <TableCell>
                    <span className="font-black text-charcoal-950 block">
                      {it.product_name_snapshot}
                    </span>
                    <span className="text-xs text-warmGray-500 font-semibold">
                      Pack: {it.variant_snapshot}
                    </span>
                  </TableCell>

                  <TableCell>
                    {pcs ? (
                      <span className="text-xs font-semibold text-charcoal-800 bg-brand-50 px-2 py-0.5 rounded border border-warmGray-200">
                        {pcs} pcs / case
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-extrabold text-charcoal-900">
                      ₹{pricePerCase?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-warmGray-500 block">/ case</span>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-black text-charcoal-950">
                      {cases} {cases === 1 ? "Case" : "Cases"}
                    </span>
                    {pcs && (
                      <span className="text-[10px] text-warmGray-500 block">
                        ({cases * pcs} pcs total)
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="text-sm font-black text-charcoal-950">
                      ₹{subtotal?.toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Order Calculations Summary */}
        <div className="pt-4 border-t border-warmGray-100 flex flex-col sm:flex-row sm:justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-charcoal-700">
              <span>Catalog Subtotal:</span>
              <span className="font-extrabold">₹{order.subtotal?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-warmGray-500">
              <span>GST:</span>
              <span className="font-semibold text-charcoal-600">Calculated at Billing</span>
            </div>
            <div className="flex justify-between text-warmGray-500">
              <span>Freight / Delivery:</span>
              <span className="font-semibold text-charcoal-600">To be confirmed</span>
            </div>
            <div className="pt-2 border-t border-warmGray-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-warmGray-500 uppercase tracking-wider">
                Total Amount:
              </span>
              <span className="text-xl font-black text-charcoal-950">
                ₹{order.total_amount?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Delivery & Payment Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Delivery Address Card */}
        <Card variant="default" padding="lg" className="space-y-3">
          <div className="flex items-center gap-2 border-b border-warmGray-100 pb-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-extrabold text-charcoal-950">
              Delivery Destination
            </h3>
          </div>

          <div className="text-xs space-y-1 text-charcoal-800">
            <span className="font-black text-sm block">
              {order.delivery_address?.business_name || "Business Shop"}
            </span>
            <p className="text-warmGray-600">Attn: {order.delivery_address?.owner_name}</p>
            <p className="text-warmGray-600">Phone: {order.delivery_address?.phone}</p>
            <p className="text-charcoal-800 pt-1 leading-relaxed">
              {order.delivery_address?.address}
            </p>
            <p className="text-warmGray-600">
              {order.delivery_address?.city}, {order.delivery_address?.state} —{" "}
              {order.delivery_address?.pincode}
            </p>
          </div>
        </Card>

        {/* Payment & Logistics Card */}
        <Card variant="default" padding="lg" className="space-y-3">
          <div className="flex items-center gap-2 border-b border-warmGray-100 pb-2">
            <CreditCard className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-extrabold text-charcoal-950">
              Payment & Dispatch Terms
            </h3>
          </div>

          <div className="text-xs space-y-2 text-charcoal-800">
            <div>
              <span className="text-warmGray-500 block">Payment Method:</span>
              <span className="font-extrabold capitalize">
                {order.payment_method?.replace(/_/g, " ") || "Cash on Delivery"}
              </span>
            </div>

            <div>
              <span className="text-warmGray-500 block">Payment Status:</span>
              <span className="font-extrabold capitalize text-brand-700">
                {order.payment_status?.replace(/_/g, " ") || "Pending"}
              </span>
            </div>

            {order.notes && (
              <div className="pt-1">
                <span className="text-warmGray-500 block">Dispatch Notes:</span>
                <p className="italic text-warmGray-700 bg-warmGray-50 p-2 rounded-lg border border-warmGray-200 mt-0.5">
                  &ldquo;{order.notes}&rdquo;
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Seller Guarantee Callout */}
      <div className="p-4 rounded-2xl bg-brand-50/70 border border-warmGray-200 text-xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="text-charcoal-800 leading-relaxed">
          Historical invoice protection: Case quantities and unit prices recorded at order placement are permanently locked and will never fluctuate regardless of future supplier tariff updates.
        </p>
      </div>
    </div>
  );
}
