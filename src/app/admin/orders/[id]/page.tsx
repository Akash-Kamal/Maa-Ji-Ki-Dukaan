"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Building2,
  Phone,
  CheckCircle2,
  FileText,
  Printer,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import { fetchAdminData, updateOrderStatus } from "@/lib/admin-data";
import type { Order, OrderStatus } from "@/types";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = decodeURIComponent(params.id as string);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState<{
    targetStatus: OrderStatus;
    title: string;
    description: string;
    isDestructive?: boolean;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadOrderData() {
      try {
        // 1. Check local admin data cache
        const data = await fetchAdminData();
        const found = data.orders.find(
          (o) => o.order_number === orderId || o.id === orderId
        );
        if (found && isMounted) {
          setOrder(found);
          setLoading(false);
          return;
        }

        // 2. Fallback to direct order API
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.order && isMounted) {
            setOrder(json.order);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load order detail:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrderData();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-24 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-base font-bold text-charcoal-800">Loading Order #{orderId}...</h2>
        <p className="text-xs text-warmGray-500">Retrieving seller distribution details from PostgreSQL.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center">
        <Package className="w-12 h-12 text-warmGray-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-charcoal-900">Order Not Found</h2>
        <p className="text-xs text-warmGray-500">
          The requested order #{orderId} could not be found in active records.
        </p>
        <Link href="/admin/orders" prefetch={false}>
          <Button variant="primary" size="sm" className="mt-4 text-xs font-bold">
            Back to Orders Queue
          </Button>
        </Link>
      </div>
    );
  }

  const totalCases = (order.items || []).reduce(
    (sum, item) => sum + (item.quantity_cases || item.quantity || 0),
    0
  );

  const handleApplyStatusChange = () => {
    if (!statusModal || !order) return;

    const result = updateOrderStatus(order.id, statusModal.targetStatus);
    if (result.success && result.order) {
      setOrder(result.order);
      setFeedback({ type: "success", message: `Order status updated to "${statusModal.targetStatus}" successfully.` });
    } else {
      setFeedback({ type: "error", message: "Failed to update order status. Please try again." });
    }
    setStatusModal(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="offer">New Order (Pending Review)</Badge>;
      case "confirmed":
        return <Badge variant="brand">Order Confirmed</Badge>;
      case "packing":
        return <Badge variant="brand">Packing / Processing</Badge>;
      case "dispatched":
        return <Badge variant="brand">Dispatched / Out for Delivery</Badge>;
      case "delivered":
        return <Badge variant="success">Delivered & Closed</Badge>;
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            prefetch={false}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders Queue
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">
              Order #{order.order_number}
            </h1>
            {getStatusBadge(order.order_status)}
          </div>
          <p className="text-xs text-warmGray-500 mt-0.5">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs font-bold"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5 mr-1" /> Print Invoice
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-warmGray-500 hover:text-charcoal-900"
          >
            &times;
          </button>
        </div>
      )}

      {/* Dispatch & Status Workflow Control */}
      <Card variant="default" padding="md" className="border-l-4 border-l-brand-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
              Fulfillment Pipeline
            </span>
            <p className="text-xs text-warmGray-500 mt-0.5">
              Advance this order through warehouse dispatch. Stock reservation and deduction will sync automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order.order_status === "pending" && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs font-bold"
                onClick={() =>
                  setStatusModal({
                    targetStatus: "confirmed",
                    title: "Confirm Order",
                    description: `Confirm Order #${order.order_number}? This will reserve ${totalCases} cases in warehouse stock.`,
                  })
                }
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm Order
              </Button>
            )}

            {(order.order_status === "pending" || order.order_status === "confirmed") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs font-bold border-brand-500 text-brand-700 hover:bg-brand-50"
                onClick={() =>
                  setStatusModal({
                    targetStatus: "packing",
                    title: "Move to Packing / Processing",
                    description: `Send Order #${order.order_number} to godown loading dock for crate picking?`,
                  })
                }
              >
                <Package className="w-3.5 h-3.5 mr-1" /> Mark Packing
              </Button>
            )}

            {order.order_status === "packing" && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white"
                onClick={() =>
                  setStatusModal({
                    targetStatus: "dispatched",
                    title: "Dispatch Order",
                    description: `Dispatch Order #${order.order_number}? This will finalize warehouse physical stock deduction for ${totalCases} cases.`,
                  })
                }
              >
                <Truck className="w-3.5 h-3.5 mr-1" /> Mark Dispatched
              </Button>
            )}

            {order.order_status === "dispatched" && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() =>
                  setStatusModal({
                    targetStatus: "delivered",
                    title: "Complete & Mark Delivered",
                    description: `Confirm delivery of Order #${order.order_number} to retailer godown?`,
                  })
                }
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm Delivered
              </Button>
            )}

            {order.order_status !== "cancelled" && order.order_status !== "delivered" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() =>
                  setStatusModal({
                    targetStatus: "cancelled",
                    title: `Cancel Order #${order.order_number}`,
                    description: "Are you sure you want to cancel this order? Any reserved inventory cases will be released back to available stock immediately.",
                    isDestructive: true,
                  })
                }
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel Order
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Line Items Snapshot & Financials (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between border-b border-warmGray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-charcoal-900">
                  Purchased Items Snapshot ({order.items?.length || 0} Products)
                </h3>
              </div>
              <span className="text-[11px] text-warmGray-500 font-semibold">
                Permanent Historical Snapshot
              </span>
            </div>

            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Product & Variant</TableHeaderCell>
                  <TableHeaderCell>Pieces / Case</TableHeaderCell>
                  <TableHeaderCell>Rate / Case</TableHeaderCell>
                  <TableHeaderCell>Cases Ordered</TableHeaderCell>
                  <TableHeaderCell align="right">Total (₹)</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {(order.items || []).map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <span className="font-bold text-charcoal-900 block text-xs">
                        {item.product_name_snapshot || item.product?.name || "Product"}
                      </span>
                      <span className="text-[11px] text-warmGray-500 font-mono">
                        {item.variant_snapshot || item.variant?.variant_name || "Standard Pack"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-charcoal-800 font-medium">
                        {item.pieces_per_case_snapshot || item.variant?.pieces_per_case || 24} pcs / case
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-charcoal-900 text-xs">
                        ₹{(item.price_per_case_snapshot || item.price_snapshot || 0).toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {item.quantity_cases || item.quantity || 1} Cases
                      </Badge>
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-bold text-charcoal-900 text-xs">
                        ₹{(item.subtotal || 0).toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Financial Summary */}
            <div className="border-t border-warmGray-200 pt-4 mt-4 flex justify-end">
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex items-center justify-between text-warmGray-600">
                  <span>Gross Subtotal</span>
                  <span className="font-bold text-charcoal-900">
                    ₹{(order.subtotal || order.total_amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-warmGray-600">
                  <span>Delivery Surcharge</span>
                  <span className="font-bold text-emerald-700">
                    {(order.delivery_charge || 0) === 0 ? "FREE" : `₹${order.delivery_charge}`}
                  </span>
                </div>

                {(order.discount || 0) > 0 && (
                  <div className="flex items-center justify-between text-brand-600">
                    <span>Negotiated Volume Savings</span>
                    <span className="font-bold">-₹{order.discount}</span>
                  </div>
                )}

                <div className="border-t border-warmGray-200 pt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-charcoal-900">Total Invoice Amount</span>
                  <span className="font-black text-brand-700 text-base">
                    ₹{(order.total_amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Customer & Delivery Information (1 col) */}
        <div className="space-y-6">
          {/* Customer Profile */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 border-b border-warmGray-200 pb-2 mb-3">
              <Building2 className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                Customer Partner
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-warmGray-500 block">
                  Business Name
                </span>
                <span className="font-bold text-charcoal-900 text-sm">
                  {order.delivery_address?.business_name || order.customer?.business_name || "Retail Partner"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-warmGray-500 block">
                  Proprietor / Contact
                </span>
                <span className="font-semibold text-charcoal-800">
                  {order.delivery_address?.owner_name || order.customer?.owner_name || "Store Owner"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-charcoal-800 font-semibold pt-1">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                <span>{order.delivery_address?.phone || order.customer?.phone || "Phone on file"}</span>
              </div>
            </div>
          </Card>

          {/* Delivery Godown */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 border-b border-warmGray-200 pb-2 mb-3">
              <MapPin className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                Godown Delivery Destination
              </h3>
            </div>

            <div className="text-xs space-y-1 text-charcoal-800">
              <span className="font-bold text-charcoal-900 block">
                {order.delivery_address?.address || "Shop / Godown Address"}
              </span>
              <span className="block text-warmGray-700">
                {order.delivery_address?.city || "New Delhi"}, {order.delivery_address?.state || "Delhi"} - {order.delivery_address?.pincode || "110001"}
              </span>
            </div>
          </Card>

          {/* Commercial & Payment Terms */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 border-b border-warmGray-200 pb-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                Commercial Terms
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-warmGray-600">Payment Option</span>
                <span className="font-bold text-charcoal-900 capitalize">
                  {(order.payment_method || "cash_on_delivery").replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-warmGray-600">Settlement Status</span>
                <span className={`font-bold capitalize ${
                  order.payment_status === "paid" ? "text-emerald-700" : "text-amber-700"
                }`}>
                  {order.payment_status || "Pending"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-warmGray-600">Total Cases</span>
                <span className="font-bold text-charcoal-900">
                  {totalCases} Cases
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {statusModal && (
        <Modal
          isOpen={true}
          onClose={() => setStatusModal(null)}
          title={statusModal.title}
        >
          <div className="space-y-4">
            <p className="text-xs text-charcoal-700">
              {statusModal.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-warmGray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusModal(null)}
                className="text-xs font-bold"
              >
                Dismiss
              </Button>
              <Button
                type="button"
                variant={statusModal.isDestructive ? "secondary" : "primary"}
                size="sm"
                onClick={handleApplyStatusChange}
                className={`text-xs font-bold ${
                  statusModal.isDestructive ? "bg-red-600 hover:bg-red-700 text-white" : ""
                }`}
              >
                Confirm Update
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
