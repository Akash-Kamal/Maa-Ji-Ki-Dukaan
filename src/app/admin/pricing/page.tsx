"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Percent,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import {
  fetchAdminData,
  saveBulkPriceTier,
  deleteBulkPriceTier,
  saveCustomerPrice,
  deleteCustomerPrice,
} from "@/lib/admin-data";
import type { BulkPrice, CustomerPrice, Product, Profile } from "@/types";

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<"bulk" | "customer" | "standard">("bulk");
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [bulkPrices, setBulkPrices] = useState<BulkPrice[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);

  // Bulk Tier Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingBulkTierId, setEditingBulkTierId] = useState<string | null>(null);
  const [bulkForm, setBulkForm] = useState({
    product_id: "",
    minimum_quantity: 5,
    price_per_case: "",
  });

  // Customer Rate Modal
  const [isCustomerRateModalOpen, setIsCustomerRateModalOpen] = useState(false);
  const [editingCustomerRateId, setEditingCustomerRateId] = useState<string | null>(null);
  const [customerRateForm, setCustomerRateForm] = useState({
    customer_id: "",
    product_id: "",
    variant_id: "",
    price_per_case: "",
    minimum_quantity: 1,
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = useCallback(() => {
    fetchAdminData().then((data) => {
      const prods = data.products;
      const custs = data.customers;
      const bulks = data.bulk_prices;
      const custPrices = data.customer_prices;

      setProducts(prods);
      setCustomers(custs);
      setBulkPrices(bulks);
      setCustomerPrices(custPrices);
      setLoading(false);

      if (prods.length > 0) {
        setBulkForm((prev) => (prev.product_id ? prev : { ...prev, product_id: prods[0].id }));
      }
      if (custs.length > 0 && prods.length > 0) {
        setCustomerRateForm((prev) =>
          prev.customer_id
            ? prev
            : {
                ...prev,
                customer_id: custs[0].id,
                product_id: prods[0].id,
                variant_id: prods[0].variants?.[0]?.id || "",
              }
        );
      }
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveBulkTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkForm.product_id || !bulkForm.price_per_case) return;

    const tier: BulkPrice = {
      id: editingBulkTierId || `bp-${Date.now()}`,
      product_id: bulkForm.product_id,
      minimum_quantity: Number(bulkForm.minimum_quantity),
      price_per_case: Number(bulkForm.price_per_case),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveBulkPriceTier(tier);
    loadData();
    setIsBulkModalOpen(false);
    setEditingBulkTierId(null);
    setFeedback("Volume bulk tier saved successfully.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteBulkTier = (tierId: string) => {
    deleteBulkPriceTier(tierId);
    loadData();
    setFeedback("Bulk pricing tier deleted.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveCustomerRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerRateForm.customer_id || !customerRateForm.product_id || !customerRateForm.price_per_case) return;

    const rate: CustomerPrice = {
      id: editingCustomerRateId || `cp-${Date.now()}`,
      customer_id: customerRateForm.customer_id,
      product_id: customerRateForm.product_id,
      variant_id: customerRateForm.variant_id || undefined,
      price: Number(customerRateForm.price_per_case),
      price_per_case: Number(customerRateForm.price_per_case),
      minimum_quantity: Number(customerRateForm.minimum_quantity) || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveCustomerPrice(rate);
    loadData();
    setIsCustomerRateModalOpen(false);
    setEditingCustomerRateId(null);
    setFeedback("Customer negotiated rate sheet saved.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteCustomerRate = (rateId: string) => {
    deleteCustomerPrice(rateId);
    loadData();
    setFeedback("Customer rate deleted.");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Wholesale Pricing Matrix"
        subtitle="Configure volume tier slabs and personalized rate sheets per retail account."
      />

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-warmGray-200">
        <button
          onClick={() => setActiveTab("bulk")}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "bulk"
              ? "border-brand-600 text-brand-700 bg-brand-50/50"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          Volume Bulk Slabs ({bulkPrices.length})
        </button>
        <button
          onClick={() => setActiveTab("customer")}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "customer"
              ? "border-brand-600 text-brand-700 bg-brand-50/50"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Customer-Specific Negotiated Rates ({customerPrices.length})
        </button>
        <button
          onClick={() => setActiveTab("standard")}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "standard"
              ? "border-brand-600 text-brand-700 bg-brand-50/50"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Standard Catalog Rates Overview
        </button>
      </div>

      {activeTab === "bulk" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-warmGray-200 shadow-xs">
            <div>
              <p className="text-xs font-bold text-charcoal-900">
                Automatic Volume Discounts (Available to All Verified Customers)
              </p>
              <p className="text-[11px] text-warmGray-500">
                Bulk pricing tiers automatically apply in cart when the minimum case order threshold is met. All units are CASES.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="text-xs font-bold whitespace-nowrap"
              onClick={() => {
                setEditingBulkTierId(null);
                setIsBulkModalOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Volume Slab
            </Button>
          </div>

          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Beverage Product</TableHeaderCell>
                <TableHeaderCell>Standard Case Rate</TableHeaderCell>
                <TableHeaderCell>Minimum Case Requirement</TableHeaderCell>
                <TableHeaderCell>Tier Wholesale Price</TableHeaderCell>
                <TableHeaderCell>Savings per Case</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {bulkPrices.map((slab) => {
                const prod = products.find((p) => p.id === slab.product_id);
                const standardPrice = prod?.variants?.[0]?.price_per_case;
                const savings = standardPrice ? Math.max(0, standardPrice - slab.price_per_case) : 0;

                return (
                  <TableRow key={slab.id}>
                    <TableCell>
                      <span className="font-bold text-charcoal-900 block text-xs">
                        {prod?.name || slab.product_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-warmGray-600">
                        {standardPrice ? `₹${standardPrice} / case` : "Price on Request"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {slab.minimum_quantity}+ Cases
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-brand-700 text-xs">
                        ₹{slab.price_per_case} / case
                      </span>
                    </TableCell>
                    <TableCell>
                      {savings > 0 ? (
                        <span className="text-xs font-bold text-emerald-700">
                          ₹{savings} / case discount
                        </span>
                      ) : (
                        <span className="text-xs text-warmGray-400">Custom Slab</span>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <button
                        type="button"
                        onClick={() => handleDeleteBulkTier(slab.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 p-1"
                        title="Delete Slab"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === "customer" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-warmGray-200 shadow-xs">
            <div>
              <p className="text-xs font-bold text-charcoal-900">
                Private Negotiated Rate Sheets (Strict Customer Isolation)
              </p>
              <p className="text-[11px] text-warmGray-500">
                Customer-specific rates override standard catalog base prices exclusively for the assigned account. Fully private and isolated via server RLS.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="text-xs font-bold whitespace-nowrap"
              onClick={() => {
                setEditingCustomerRateId(null);
                setIsCustomerRateModalOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Negotiated Rate
            </Button>
          </div>

          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Target Customer Shop</TableHeaderCell>
                <TableHeaderCell>Product & Variant</TableHeaderCell>
                <TableHeaderCell>Standard Price</TableHeaderCell>
                <TableHeaderCell>Negotiated Rate</TableHeaderCell>
                <TableHeaderCell>Min Cases</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {customerPrices.map((rate) => {
                const customer = customers.find((c) => c.id === rate.customer_id);
                const prod = products.find((p) => p.id === rate.product_id);
                const variant = (prod?.variants || []).find((v) => v.id === rate.variant_id);
                const standardPrice = variant?.price_per_case || prod?.variants?.[0]?.price_per_case;

                return (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <span className="font-bold text-charcoal-900 block text-xs">
                        {customer?.business_name || rate.customer_id}
                      </span>
                      <span className="text-[10px] text-warmGray-500">
                        {customer?.owner_name} &bull; {customer?.city || "Delhi"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-charcoal-800 block">
                        {prod?.name || rate.product_id}
                      </span>
                      <span className="text-[10px] text-warmGray-500">
                        {variant?.variant_name || "All Variants"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-warmGray-500">
                        {standardPrice ? `₹${standardPrice}` : "TBD"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-brand-700 text-xs">
                        ₹{rate.price_per_case || rate.price} / case
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {rate.minimum_quantity || 1}+ Cases
                      </Badge>
                    </TableCell>
                    <TableCell align="right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomerRate(rate.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 p-1"
                        title="Delete Negotiated Rate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === "standard" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-warmGray-200 text-xs text-warmGray-600">
            Standard baseline rates per case. To modify standard pricing, open any product in <Link href="/admin/products" className="text-brand-600 font-bold underline">Product Management</Link>.
          </div>

          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Variant</TableHeaderCell>
                <TableHeaderCell>Packaging</TableHeaderCell>
                <TableHeaderCell>Pieces / Case</TableHeaderCell>
                <TableHeaderCell>Standard Rate / Case</TableHeaderCell>
                <TableHeaderCell>Unit Price Equiv.</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {products.flatMap((prod) =>
                (prod.variants || []).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <span className="font-bold text-charcoal-900 text-xs">{prod.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-charcoal-800 font-semibold">{v.variant_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-warmGray-600 capitalize">{v.packaging_type}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-charcoal-900 font-semibold">{v.pieces_per_case} pcs</span>
                    </TableCell>
                    <TableCell>
                      {v.price_per_case ? (
                        <span className="font-bold text-charcoal-900 text-xs">
                          ₹{v.price_per_case} / case
                        </span>
                      ) : (
                        <Badge variant="offer" size="sm">Price on Request</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {v.price_per_case && v.pieces_per_case ? (
                        <span className="text-xs text-warmGray-500 font-mono">
                          ₹{(v.price_per_case / v.pieces_per_case).toFixed(1)} / pc
                        </span>
                      ) : (
                        <span className="text-xs text-warmGray-400">&mdash;</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Bulk Tier Modal */}
      {isBulkModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsBulkModalOpen(false)}
          title="Add Volume Bulk Pricing Slab"
        >
          <form onSubmit={handleSaveBulkTier} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Target Product
              </label>
              <select
                value={bulkForm.product_id}
                onChange={(e) => setBulkForm({ ...bulkForm, product_id: e.target.value })}
                className="w-full rounded-lg border border-warmGray-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Minimum Case Order"
                type="number"
                min={2}
                value={bulkForm.minimum_quantity}
                onChange={(e) => setBulkForm({ ...bulkForm, minimum_quantity: Number(e.target.value) })}
                required
                helperText="Threshold cases to unlock rate"
              />

              <Input
                label="Wholesale Rate / Case (₹)"
                type="number"
                min={1}
                placeholder="e.g. 2950"
                value={bulkForm.price_per_case}
                onChange={(e) => setBulkForm({ ...bulkForm, price_per_case: e.target.value })}
                required
                helperText="Discounted case price"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-warmGray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBulkModalOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs font-bold">
                Save Bulk Slab
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Customer Rate Modal */}
      {isCustomerRateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCustomerRateModalOpen(false)}
          title="Add Customer-Specific Negotiated Rate"
        >
          <form onSubmit={handleSaveCustomerRate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Target Verified Customer
              </label>
              <select
                value={customerRateForm.customer_id}
                onChange={(e) => setCustomerRateForm({ ...customerRateForm, customer_id: e.target.value })}
                className="w-full rounded-lg border border-warmGray-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name} ({c.owner_name} &bull; {c.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Product
                </label>
                <select
                  value={customerRateForm.product_id}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const p = products.find((prod) => prod.id === pid);
                    setCustomerRateForm({
                      ...customerRateForm,
                      product_id: pid,
                      variant_id: p?.variants?.[0]?.id || "",
                    });
                  }}
                  className="w-full rounded-lg border border-warmGray-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Pack Variant
                </label>
                <select
                  value={customerRateForm.variant_id}
                  onChange={(e) => setCustomerRateForm({ ...customerRateForm, variant_id: e.target.value })}
                  className="w-full rounded-lg border border-warmGray-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {products
                    .find((p) => p.id === customerRateForm.product_id)
                    ?.variants?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.variant_name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Negotiated Price / Case (₹)"
                type="number"
                min={1}
                placeholder="e.g. 580"
                value={customerRateForm.price_per_case}
                onChange={(e) =>
                  setCustomerRateForm({ ...customerRateForm, price_per_case: e.target.value })
                }
                required
                helperText="Custom rate per full case"
              />

              <Input
                label="Min Case Quantity"
                type="number"
                min={1}
                value={customerRateForm.minimum_quantity}
                onChange={(e) =>
                  setCustomerRateForm({
                    ...customerRateForm,
                    minimum_quantity: Number(e.target.value),
                  })
                }
                helperText="Minimum cases to trigger rate"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-warmGray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomerRateModalOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs font-bold">
                Save Private Rate
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
