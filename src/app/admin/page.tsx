"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  Users,
  Package,
  AlertTriangle,
  IndianRupee,
  ArrowRight,
  Plus,
  Warehouse,
  ShieldCheck,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { fetchAdminData } from "@/lib/admin-data";
import type { Product, Order, Profile } from "@/types";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData().then((data) => {
      setProducts(data.products);
      setOrders(data.orders);
      setCustomers(data.customers);
      setLoading(false);
    });
  }, []);

  // Compute live operational metrics (never hardcoded)
  const todayStr = new Date().toISOString().split("T")[0];
  const ordersToday = orders.filter(
    (o) => o.created_at && o.created_at.startsWith(todayStr)
  ).length;

  const pendingOrders = orders.filter(
    (o) => o.order_status === "pending" || o.order_status === "confirmed"
  ).length;

  const activeCustomers = customers.filter((c) => c.is_active).length;

  const activeProducts = products.filter((p) => p.is_active).length;

  // Flatten all active variants to check for low stock
  const allVariants = products.flatMap((p) =>
    (p.variants || []).map((v) => ({
      productId: p.id,
      productName: p.name,
      brandName: p.brand?.name || "",
      variantId: v.id,
      variantName: v.variant_name,
      stockCases: v.stock_cases,
      reorderLevel: v.reorder_level_cases,
      isActive: v.is_active && p.is_active,
    }))
  );

  const lowStockVariants = allVariants.filter(
    (v) => v.isActive && v.stockCases <= v.reorderLevel
  );

  const totalOutstanding = customers.reduce(
    (sum, c) => sum + (c.outstanding_amount || 0),
    0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Owner Operations Dashboard" subtitle="Loading live data from database..." />
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <AdminHeader
        title="Owner Operations Dashboard"
        subtitle="Live wholesale distribution metrics, case dispatch pipeline, and inventory status."
        action={{
          label: "Add Product",
          href: "/admin/products/new",
        }}
      />

      {/* Target Focus Assurance Banner */}
      <div className="rounded-2xl bg-charcoal-900 text-white p-5 border border-charcoal-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Centralized Wholesale Distribution: Direct-to-Retailer
            </h3>
            <p className="text-xs text-warmGray-400 mt-0.5">
              Verified business accounts with commercial credit facilities and whole-case supply dispatch.
            </p>
          </div>
        </div>

        {/* 4 Quick Actions Header Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/products/new">
            <Button size="sm" variant="primary" className="text-xs font-bold">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Product
            </Button>
          </Link>
          <Link href="/admin/customers">
            <Button size="sm" variant="secondary" className="text-xs font-bold bg-charcoal-800 text-white hover:bg-charcoal-700 border-charcoal-700">
              <Users className="w-3.5 h-3.5 mr-1" />
              Add Customer
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button size="sm" variant="secondary" className="text-xs font-bold bg-charcoal-800 text-white hover:bg-charcoal-700 border border-charcoal-700">
              <ClipboardList className="w-3.5 h-3.5 mr-1" />
              View Orders
            </Button>
          </Link>
          <Link href="/admin/inventory">
            <Button size="sm" variant="secondary" className="text-xs font-bold bg-charcoal-800 text-white hover:bg-charcoal-700 border border-charcoal-700">
              <Warehouse className="w-3.5 h-3.5 mr-1" />
              Update Stock
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Key Operational Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Orders Today */}
        <Card variant="default" padding="sm" className="hover:border-warmGray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider">
              Orders Today
            </span>
            <ClipboardList className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 mt-2">
            {ordersToday}
          </p>
          <p className="text-[11px] text-warmGray-500 mt-1">Total incoming</p>
        </Card>

        {/* 2. Pending Orders */}
        <Card variant="default" padding="sm" className="hover:border-warmGray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider">
              Pending Orders
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 mt-2">
            {pendingOrders}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Needs Dispatch</p>
        </Card>

        {/* 3. Total Customers */}
        <Card variant="default" padding="sm" className="hover:border-warmGray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider">
              Active Shops
            </span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 mt-2">
            {activeCustomers}
          </p>
          <p className="text-[11px] text-warmGray-500 mt-1">Target 20–30</p>
        </Card>

        {/* 4. Active Products */}
        <Card variant="default" padding="sm" className="hover:border-warmGray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider">
              Active SKUs
            </span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 mt-2">
            {activeProducts}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">In Catalog</p>
        </Card>

        {/* 5. Low Stock */}
        <Card
          variant="default"
          padding="sm"
          className={`hover:border-warmGray-300 transition-colors ${
            lowStockVariants.length > 0 ? "border-amber-300 bg-amber-50/20" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider">
              Low Stock
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 mt-2">
            {lowStockVariants.length}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Variants below par</p>
        </Card>

        {/* 6. Outstanding */}
        <Card variant="default" padding="sm" className="hover:border-warmGray-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider">
              Outstanding
            </span>
            <IndianRupee className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-charcoal-900 mt-2">
            ₹{(totalOutstanding / 1000).toFixed(0)}k
          </p>
          <p className="text-[11px] text-warmGray-500 mt-1">Total Ledger</p>
        </Card>
      </div>

      {/* Main Grid: Recent Orders (Left 2/3) + Low Stock Alerts (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Queue */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-charcoal-950 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-brand-600" />
              Recent Wholesale Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card variant="default" padding="none" className="overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-warmGray-500">
                No orders logged yet. Customer orders placed in store will populate here.
              </div>
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Order #</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Cases</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {orders.slice(0, 5).map((order) => {
                    const casesCount =
                      order.items?.reduce(
                        (sum, item) => sum + (item.quantity_cases || item.quantity || 0),
                        0
                      ) || 1;

                    return (
                      <TableRow key={order.order_number}>
                        <TableCell>
                          <span className="font-mono font-bold text-xs text-charcoal-950">
                            {order.order_number}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-xs text-charcoal-900 block truncate max-w-[140px]">
                            {order.delivery_address?.business_name || "Retail Partner"}
                          </span>
                          <span className="text-[10px] text-warmGray-500">
                            {order.delivery_address?.owner_name || "Akash Aggarwal"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-charcoal-800">
                            {casesCount} cases
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-xs text-charcoal-950">
                            ₹{order.total_amount?.toLocaleString("en-IN")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.order_status} />
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] text-warmGray-500 whitespace-nowrap">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "Today"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/orders/${encodeURIComponent(order.order_number)}`}>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* Low Stock Alerts & Fast Replenish */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-charcoal-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Low Stock Alerts
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Manage Inventory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card variant="default" padding="sm" className="space-y-2">
            {lowStockVariants.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-700 font-semibold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>All product variants are above warehouse reorder threshold.</span>
              </div>
            ) : (
              <div className="divide-y divide-warmGray-100">
                {lowStockVariants.slice(0, 6).map((variant) => (
                  <div
                    key={`${variant.productId}-${variant.variantId}`}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-charcoal-900 leading-tight">
                        {variant.productName}
                      </p>
                      <p className="text-[11px] text-warmGray-500">
                        {variant.variantName} • Reorder level: {variant.reorderLevel} cases
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-amber-700 text-xs block">
                        {variant.stockCases} Cases
                      </span>
                      <Link href="/admin/inventory">
                        <span className="text-[10px] font-bold text-brand-600 hover:underline">
                          + Stock
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
