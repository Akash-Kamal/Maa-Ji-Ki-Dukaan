"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  ArrowRight,
  Package,
  RotateCw,
  Eye,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus, DeliveryAddress, OrderItem } from "@/types";

interface OrderSummaryItem {
  id: string;
  order_number: string;
  customer_id?: string;
  created_at: string;
  order_status: OrderStatus;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  subtotal: number;
  totalCases?: number;
  delivery_address: DeliveryAddress;
  items?: OrderItem[];
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reorderNotification, setReorderNotification] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch customer profile to get customer_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (!profile) {
          setIsLoading(false);
          return;
        }

        // Query orders strictly from Supabase PostgreSQL (RLS enforces customer isolation)
        const { data: dbOrders, error } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items(*)
          `)
          .eq("customer_id", profile.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to query customer orders:", error);
        } else if (dbOrders) {
          const formatted = dbOrders.map((o: any) => ({
            ...o,
            totalCases: (o.items || []).reduce(
              (acc: number, item: any) => acc + Number(item.quantity_cases || item.quantity || 0),
              0
            ),
          }));
          setOrders(formatted);
        }
      } catch (err) {
        console.error("Could not load customer orders from database:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleReorderOrder = (order: OrderSummaryItem) => {
    if (!order.items || order.items.length === 0) return;

    let itemsAdded = 0;
    order.items.forEach((item: any) => {
      if (item.product_id && item.variant_id) {
        addItem(
          item.product_id,
          item.variant_id,
          item.quantity_cases || item.quantity || 1
        );
        itemsAdded++;
      }
    });

    setReorderNotification(
      `Re-added ${itemsAdded} case pack${itemsAdded > 1 ? "s" : ""} from Order #${order.order_number} to your active cart.`
    );
    setTimeout(() => setReorderNotification(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-warmGray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
            Order History & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-warmGray-500 font-medium mt-0.5">
            Confirmed beverage cases, fulfillment status, and historical snapshots.
          </p>
        </div>
        <Link href="/products">
          <Button size="sm" variant="outline" className="flex items-center gap-1.5 self-start">
            <Package className="w-4 h-4" /> Place New Order
          </Button>
        </Link>
      </div>

      {/* Floating Reorder Toast */}
      {reorderNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-subtle animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{reorderNotification}</span>
          </div>
          <Link href="/cart">
            <Button size="sm" variant="primary">
              View Cart
            </Button>
          </Link>
        </div>
      )}

      {/* Order List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-warmGray-500 font-semibold gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          Loading orders from database...
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8 text-warmGray-400" />}
          title="No orders placed yet"
          description="Your verified business orders and delivery tracking will appear here once submitted."
          action={
            <Link href="/products">
              <Button size="md" variant="primary">
                Browse Seller Catalog
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card
                key={order.id}
                className="p-5 hover:border-warmGray-300 transition-all border border-warmGray-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Identifiers and Details */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-charcoal-900">
                        #{order.order_number}
                      </span>
                      <OrderStatusBadge status={order.order_status} />
                      <span className="text-[11px] font-semibold text-warmGray-500 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-md border border-warmGray-200">
                        {order.payment_method.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-warmGray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-warmGray-400" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span>
                        Destination:{" "}
                        <strong className="text-charcoal-800">
                          {order.delivery_address?.business_name || "Business Account"}
                        </strong>
                        , {order.delivery_address?.city || "New Delhi"}
                      </span>
                    </div>

                    {/* Snapshot preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="text-xs text-charcoal-700 bg-brand-50/50 p-2.5 rounded-xl border border-warmGray-200/80 inline-block">
                        <span className="font-semibold text-warmGray-500">Items: </span>
                        {order.items
                          .slice(0, 3)
                          .map(
                            (i: any) =>
                              `${i.product_name_snapshot} (${i.variant_snapshot || ""}) × ${
                                i.quantity_cases || i.quantity
                              }cs`
                          )
                          .join(", ")}
                        {order.items.length > 3 && ` +${order.items.length - 3} more`}
                      </div>
                    )}
                  </div>

                  {/* Right: Financials and Action Buttons */}
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-warmGray-100">
                    <div className="text-right">
                      <span className="text-xs text-warmGray-500 font-medium block">
                        Total Amount
                      </span>
                      <span className="text-lg font-black text-charcoal-900">
                        ₹{Number(order.total_amount || order.subtotal || 0).toLocaleString("en-IN")}
                      </span>
                      {order.totalCases !== undefined && (
                        <span className="text-[11px] font-semibold text-warmGray-500 block">
                          {order.totalCases} Case{order.totalCases !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Details
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleReorderOrder(order)}
                        className="flex items-center gap-1"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Reorder
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
