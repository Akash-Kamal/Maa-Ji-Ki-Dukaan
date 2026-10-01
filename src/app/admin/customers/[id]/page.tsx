"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Percent,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Package,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
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
  saveAdminCustomer,
  saveCustomerPrice,
  deleteCustomerPrice,
} from "@/lib/admin-data";
import type { Profile, Order, CustomerPrice, Product } from "@/types";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = decodeURIComponent(params.id as string);

  const [customer, setCustomer] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Modal for Negotiated Pricing
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [pricingForm, setPricingForm] = useState({
    product_id: "",
    variant_id: "",
    price_per_case: "",
    minimum_quantity: 1,
  });

  // Edit Customer Commercial Terms
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    business_name: "",
    owner_name: "",
    phone: "",
    email: "",
    gstin: "",
    credit_limit: 0,
    outstanding_amount: 0,
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData().then((data) => {
      const found = data.customers.find((c) => c.id === customerId);
      if (found) {
        setCustomer(found);
        setProfileForm({
          business_name: found.business_name,
          owner_name: found.owner_name,
          phone: found.phone,
          email: found.email || "",
          gstin: found.gstin || "",
          credit_limit: found.credit_limit || 0,
          outstanding_amount: found.outstanding_amount || 0,
          address: found.address || "",
          city: found.city || "New Delhi",
          state: found.state || "Delhi",
          pincode: found.pincode || "110001",
        });
      }

      setOrders(
        data.orders.filter(
          (o) =>
            o.customer_id === customerId ||
            o.delivery_address?.phone === found?.phone ||
            (o.delivery_address?.business_name && found?.business_name && o.delivery_address.business_name.toLowerCase() === found.business_name.toLowerCase())
        )
      );

      setCustomerPrices(data.customer_prices.filter((cp) => cp.customer_id === customerId));

      const prods = data.products;
      setProducts(prods);
      if (prods.length > 0) {
        setPricingForm((prev) => ({
          ...prev,
          product_id: prods[0].id,
          variant_id: prods[0].variants?.[0]?.id || "",
        }));
      }
    });
  }, [customerId]);

  if (!customer) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center">
        <Building2 className="w-12 h-12 text-warmGray-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-charcoal-900">Partner Account Not Found</h2>
        <p className="text-xs text-warmGray-500">
          The requested customer profile &quot;{customerId}&quot; does not exist.
        </p>
        <Link href="/admin/customers">
          <Button variant="primary" size="sm" className="mt-4 text-xs font-bold">
            Back to Customer Directory
          </Button>
        </Link>
      </div>
    );
  }

  const availableCredit = (customer.credit_limit || 0) - (customer.outstanding_amount || 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveAdminCustomer({
      id: customer.id,
      business_name: profileForm.business_name.trim(),
      owner_name: profileForm.owner_name.trim(),
      phone: profileForm.phone.trim(),
      email: profileForm.email.trim(),
      gstin: profileForm.gstin.trim() || null,
      credit_limit: Number(profileForm.credit_limit) || 0,
      outstanding_amount: Number(profileForm.outstanding_amount) || 0,
      address: profileForm.address.trim(),
      city: profileForm.city.trim(),
      state: profileForm.state.trim(),
      pincode: profileForm.pincode.trim(),
    });

    setCustomer(updated);
    setIsEditProfileOpen(false);
    setFeedback("Customer details and commercial terms saved successfully.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveNegotiatedPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingForm.product_id || !pricingForm.price_per_case) return;

    const rate: CustomerPrice = {
      id: editingPriceId || `cp-${Date.now()}`,
      customer_id: customer.id,
      product_id: pricingForm.product_id,
      variant_id: pricingForm.variant_id || undefined,
      price: Number(pricingForm.price_per_case),
      price_per_case: Number(pricingForm.price_per_case),
      minimum_quantity: Number(pricingForm.minimum_quantity) || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveCustomerPrice(rate);
    setCustomerPrices((prev) => {
      const filtered = prev.filter((cp) => cp.id !== (editingPriceId || ""));
      return [...filtered, { ...rate, variant_id: rate.variant_id ?? null }];
    });
    setIsPricingModalOpen(false);
    setEditingPriceId(null);
    setFeedback("Negotiated wholesale price tier updated.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteNegotiatedPrice = (rateId: string) => {
    deleteCustomerPrice(rateId);
    setCustomerPrices((prev) => prev.filter((cp) => cp.id !== rateId));
    setFeedback("Negotiated rate deleted.");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div>
        <Link
          href="/admin/customers"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers Directory
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">
                {customer.business_name}
              </h1>
              <Badge variant={customer.is_active ? "success" : "neutral"} size="md">
                {customer.is_active ? "Active Partner" : "Inactive"}
              </Badge>
              <Badge variant="brand" size="md" className="capitalize">
                {customer.role}
              </Badge>
            </div>
            <p className="text-xs text-warmGray-500 mt-0.5">
              Proprietor: {customer.owner_name} &bull; Member since{" "}
              {new Date(customer.created_at).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs font-bold"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Customer & Credit
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Commercial Credit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" padding="md" className="border-l-4 border-l-charcoal-900">
          <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider block">
            Approved Credit Limit
          </span>
          <span className="text-2xl font-black text-charcoal-900 mt-1 block">
            ₹{(customer.credit_limit || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-warmGray-500 mt-0.5 block">
            Authorized rolling credit balance
          </span>
        </Card>

        <Card variant="default" padding="md" className="border-l-4 border-l-brand-600">
          <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider block">
            Current Outstanding
          </span>
          <span className={`text-2xl font-black mt-1 block ${
            (customer.outstanding_amount || 0) > 0 ? "text-brand-600" : "text-emerald-700"
          }`}>
            ₹{(customer.outstanding_amount || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-warmGray-500 mt-0.5 block">
            Unsettled wholesale order balance
          </span>
        </Card>

        <Card variant="default" padding="md" className="border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-bold text-warmGray-500 uppercase tracking-wider block">
            Available Credit
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ₹{Math.max(0, availableCredit).toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-warmGray-500 mt-0.5 block">
            Permitted for new case dispatches
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business & Address Info */}
        <div className="space-y-6">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 border-b border-warmGray-200 pb-2 mb-3">
              <Building2 className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                Business Details
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-warmGray-500 block">
                  Business Entity
                </span>
                <span className="font-bold text-charcoal-900">{customer.business_name}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-warmGray-500 block">
                  Proprietor
                </span>
                <span className="font-semibold text-charcoal-800">{customer.owner_name}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-warmGray-500 block">
                  Phone
                </span>
                <span className="font-semibold text-charcoal-800">{customer.phone}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-warmGray-500 block">
                  Email
                </span>
                <span className="font-semibold text-charcoal-800">{customer.email || "None"}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-warmGray-500 block">
                  GSTIN
                </span>
                <span className="font-mono font-bold text-charcoal-900">
                  {customer.gstin || "Unregistered / Composition"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-warmGray-500 block">
                  Business Type
                </span>
                <span className="font-semibold text-charcoal-800 capitalize">
                  {customer.business_type || "Retail Shop"}
                </span>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 border-b border-warmGray-200 pb-2 mb-3">
              <MapPin className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                Delivery Godown Address
              </h3>
            </div>

            <div className="text-xs space-y-1 text-charcoal-800">
              <span className="font-bold text-charcoal-900 block">
                {customer.address || "Address on file"}
              </span>
              <span className="block text-warmGray-700">
                {customer.city || "New Delhi"}, {customer.state || "Delhi"} - {customer.pincode || "110001"}
              </span>
            </div>
          </Card>
        </div>

        {/* Right Column: Negotiated Pricing & Order History (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Negotiated Customer-Specific Pricing */}
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between border-b border-warmGray-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-brand-600" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 block">
                    Private Negotiated Pricing ({customerPrices.length})
                  </h3>
                  <span className="text-[11px] text-warmGray-500">
                    Confidential rates overriding catalog prices exclusively for {customer.business_name}.
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs font-bold"
                onClick={() => {
                  setEditingPriceId(null);
                  setIsPricingModalOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Negotiated Rate
              </Button>
            </div>

            {customerPrices.length === 0 ? (
              <div className="p-6 text-center text-xs text-warmGray-500 bg-cream-50/50 rounded-xl border border-dashed border-warmGray-200">
                No negotiated rate sheet set for this account. Standard wholesale catalog rates apply.
              </div>
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Product & Variant</TableHeaderCell>
                    <TableHeaderCell>Standard Price</TableHeaderCell>
                    <TableHeaderCell>Negotiated Rate</TableHeaderCell>
                    <TableHeaderCell>Min Cases</TableHeaderCell>
                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {customerPrices.map((cp) => {
                    const prod = products.find((p) => p.id === cp.product_id);
                    const variant = (prod?.variants || []).find((v) => v.id === cp.variant_id);
                    const standardPrice = variant?.price_per_case || prod?.variants?.[0]?.price_per_case;

                    return (
                      <TableRow key={cp.id}>
                        <TableCell>
                          <span className="font-bold text-charcoal-900 block text-xs">
                            {prod?.name || cp.product_id}
                          </span>
                          <span className="text-[11px] text-warmGray-500">
                            {variant?.variant_name || "All Variants"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-warmGray-500">
                            {standardPrice ? `₹${standardPrice} / case` : "Price on Request"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-black text-brand-700 text-xs">
                            ₹{cp.price_per_case || cp.price} / case
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutral" size="sm">
                            {cp.minimum_quantity || 1}+ Cases
                          </Badge>
                        </TableCell>
                        <TableCell align="right">
                          <button
                            type="button"
                            onClick={() => handleDeleteNegotiatedPrice(cp.id)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Customer Orders History */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 border-b border-warmGray-200 pb-2 mb-3">
              <Package className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                Order History ({orders.length})
              </h3>
            </div>

            {orders.length === 0 ? (
              <div className="p-6 text-center text-xs text-warmGray-500 bg-cream-50/50 rounded-xl border border-dashed border-warmGray-200">
                No orders placed by this customer yet.
              </div>
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>Order #</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Cases</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell align="right">Action</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id || o.order_number}>
                      <TableCell>
                        <span className="font-mono font-bold text-xs text-charcoal-900">
                          #{o.order_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-charcoal-800">
                          {new Date(o.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-charcoal-900">
                          {(o.items || []).reduce((sum, item) => sum + (item.quantity_cases || item.quantity || 0), 0)} Cases
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-charcoal-900 text-xs">
                          ₹{(o.total_amount || 0).toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="brand" size="sm" className="capitalize">
                          {o.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell align="right">
                        <Link
                          href={`/admin/orders/${o.order_number}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-warmGray-300 hover:border-brand-500 text-xs font-bold text-charcoal-800"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Customer Profile Modal */}
      {isEditProfileOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditProfileOpen(false)}
          title="Edit Customer Profile & Commercial Terms"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Business Name"
                value={profileForm.business_name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, business_name: e.target.value })
                }
                required
              />
              <Input
                label="Proprietor / Owner"
                value={profileForm.owner_name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, owner_name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                required
              />
              <Input
                label="Email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="GSTIN"
                value={profileForm.gstin}
                onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })}
              />
              <Input
                label="Credit Limit (₹)"
                type="number"
                min={0}
                value={profileForm.credit_limit}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, credit_limit: Number(e.target.value) })
                }
              />
              <Input
                label="Outstanding (₹)"
                type="number"
                min={0}
                value={profileForm.outstanding_amount}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    outstanding_amount: Number(e.target.value),
                  })
                }
              />
            </div>

            <Input
              label="Shop Address"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-warmGray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add / Edit Negotiated Price Modal */}
      {isPricingModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPricingModalOpen(false)}
          title={`Set Negotiated Wholesale Rate for ${customer.business_name}`}
        >
          <form onSubmit={handleSaveNegotiatedPrice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Target Beverage Product
              </label>
              <select
                value={pricingForm.product_id}
                onChange={(e) => {
                  const pid = e.target.value;
                  const p = products.find((prod) => prod.id === pid);
                  setPricingForm({
                    ...pricingForm,
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
                Variant / Pack Size
              </label>
              <select
                value={pricingForm.variant_id}
                onChange={(e) => setPricingForm({ ...pricingForm, variant_id: e.target.value })}
                className="w-full rounded-lg border border-warmGray-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {products
                  .find((p) => p.id === pricingForm.product_id)
                  ?.variants?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.variant_name} ({v.pieces_per_case} pcs/case &bull; Std: {v.price_per_case ? `₹${v.price_per_case}` : "TBD"})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Negotiated Price / Case (₹)"
                type="number"
                min={1}
                placeholder="e.g. 580"
                value={pricingForm.price_per_case}
                onChange={(e) =>
                  setPricingForm({ ...pricingForm, price_per_case: e.target.value })
                }
                required
                helperText="Private rate per full case"
              />

              <Input
                label="Min Case Threshold"
                type="number"
                min={1}
                value={pricingForm.minimum_quantity}
                onChange={(e) =>
                  setPricingForm({ ...pricingForm, minimum_quantity: Number(e.target.value) })
                }
                helperText="Minimum cases to trigger rate"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-warmGray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPricingModalOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs font-bold">
                Save Negotiated Rate
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
