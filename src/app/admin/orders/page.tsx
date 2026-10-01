"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Eye,
  Filter,
  Package,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchAdminData } from "@/lib/admin-data";
import type { Order, OrderStatus } from "@/types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData().then((data) => {
      setOrders(data.orders);
      setLoading(false);
    });
  }, []);

  const filteredOrders = orders.filter((o) => {
    const orderNum = (o.order_number || "").toLowerCase();
    const customer = (o.delivery_address?.business_name || o.customer?.business_name || "").toLowerCase();
    const matchesSearch = orderNum.includes(search.toLowerCase()) || customer.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "new"
        ? o.order_status === "pending"
        : statusFilter === "processing"
        ? o.order_status === "packing"
        : o.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="offer" size="sm">New (Pending)</Badge>;
      case "confirmed":
        return <Badge variant="brand" size="sm">Confirmed</Badge>;
      case "packing":
        return <Badge variant="brand" size="sm">Processing</Badge>;
      case "dispatched":
        return <Badge variant="brand" size="sm">Dispatched</Badge>;
      case "delivered":
        return <Badge variant="success" size="sm">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="text-emerald-700 font-bold text-xs">Paid</span>;
      case "pending":
        return <span className="text-amber-700 font-bold text-xs">Pending</span>;
      case "failed":
        return <span className="text-red-700 font-bold text-xs">Failed</span>;
      default:
        return <span className="text-warmGray-600 text-xs capitalize">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Wholesale Case Orders" subtitle="Loading orders from database..." />
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Wholesale Case Orders"
        subtitle="Manage dispatch pipeline, invoice statuses, and pending retailer orders."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-warmGray-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warmGray-400" />
          <input
            type="text"
            placeholder="Search by order # or shop name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-warmGray-300 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-warmGray-500 hidden sm:block" />
          <span className="text-xs font-bold text-warmGray-600 hidden sm:block">Status:</span>
          {[
            { id: "all", label: "All Orders" },
            { id: "new", label: "New" },
            { id: "confirmed", label: "Confirmed" },
            { id: "processing", label: "Processing" },
            { id: "dispatched", label: "Dispatched" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-cream-100 text-charcoal-700 hover:bg-cream-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-6 h-6 text-brand-600" />}
          title={search || statusFilter !== "all" ? "No matching orders found" : "No wholesale orders in queue"}
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search query or status filter to see other orders."
              : "Incoming retailer case orders and dispatch statuses will be logged here."
          }
        />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Order Number</TableHeaderCell>
              <TableHeaderCell>Customer Shop</TableHeaderCell>
              <TableHeaderCell>Date & Time</TableHeaderCell>
              <TableHeaderCell>Total Cases</TableHeaderCell>
              <TableHeaderCell>Total Value</TableHeaderCell>
              <TableHeaderCell>Payment</TableHeaderCell>
              <TableHeaderCell>Order Status</TableHeaderCell>
              <TableHeaderCell align="right">Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => {
              const customerName =
                order.delivery_address?.business_name ||
                order.customer?.business_name ||
                "Verified Partner Store";
              const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const formattedTime = new Date(order.created_at).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const totalCases = (order.items || []).reduce(
                (sum, item) => sum + (item.quantity_cases || item.quantity || 0),
                0
              );

              return (
                <TableRow key={order.id || order.order_number}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-charcoal-900 block">
                      #{order.order_number}
                    </span>
                    <span className="text-[10px] text-warmGray-500">
                      {order.items?.length || 0} line {order.items?.length === 1 ? "item" : "items"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-charcoal-900 block text-xs">
                      {customerName}
                    </span>
                    <span className="text-[11px] text-warmGray-500">
                      {order.delivery_address?.city || "Delhi NCR"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-charcoal-900 font-semibold block">{formattedDate}</span>
                    <span className="text-[10px] text-warmGray-500">{formattedTime}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">
                      <Package className="w-3 h-3 mr-1 text-warmGray-600" />
                      {totalCases} Cases
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-black text-charcoal-900 text-xs">
                      ₹{(order.total_amount || 0).toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-charcoal-800 capitalize block">
                        {(order.payment_method || "cash_on_delivery").replace(/_/g, " ")}
                      </span>
                      {getPaymentBadge(order.payment_status || "pending")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.order_status)}
                  </TableCell>
                  <TableCell align="right">
                    <Link
                      href={`/admin/orders/${order.order_number}`}
                      prefetch={false}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-warmGray-300 hover:border-brand-500 hover:text-brand-600 bg-white text-xs font-bold text-charcoal-800 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Order
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
