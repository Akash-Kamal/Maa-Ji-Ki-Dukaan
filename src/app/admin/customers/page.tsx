"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Eye,
  ShieldCheck,
  CheckCircle2,
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
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  fetchAdminData,
  saveAdminCustomer,
  toggleCustomerActive,
} from "@/lib/admin-data";
import type { Profile, UserRole } from "@/types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);

  // New Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    business_name: "",
    owner_name: "",
    phone: "",
    email: "",
    role: "retailer",
    business_type: "Retail Shop",
    gstin: "",
    address: "",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    credit_limit: 50000,
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData().then((data) => {
      setCustomers(data.customers);
      setLoading(false);
    });
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.business_name.toLowerCase().includes(search.toLowerCase()) ||
      c.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || c.role === roleFilter;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? c.is_active
        : !c.is_active;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleActive = (customerId: string) => {
    toggleCustomerActive(customerId);
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, is_active: !c.is_active } : c))
    );
    setFeedback("Customer status updated successfully.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.business_name.trim() || !newCustomerForm.phone.trim()) {
      return;
    }

    const newId = `cust-${Date.now()}`;
    const newCustomer = {
      id: newId,
      business_name: newCustomerForm.business_name.trim(),
      owner_name: newCustomerForm.owner_name.trim() || "Proprietor",
      phone: newCustomerForm.phone.trim(),
      email: newCustomerForm.email.trim() || `${newCustomerForm.phone}@customer.local`,
      role: newCustomerForm.role as UserRole,
      business_type: newCustomerForm.business_type,
      gstin: newCustomerForm.gstin.trim() || null,
      address: newCustomerForm.address.trim(),
      city: newCustomerForm.city.trim(),
      state: newCustomerForm.state.trim(),
      pincode: newCustomerForm.pincode.trim(),
      credit_limit: Number(newCustomerForm.credit_limit) || 0,
      outstanding_amount: 0,
      is_active: true,
    };
    saveAdminCustomer(newCustomer);
    setCustomers((prev) => [...prev, newCustomer as any]);
    setIsAddModalOpen(false);
    setNewCustomerForm({
      business_name: "",
      owner_name: "",
      phone: "",
      email: "",
      role: "retailer",
      business_type: "Retail Shop",
      gstin: "",
      address: "",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
      credit_limit: 50000,
    });
    setFeedback("New customer added successfully!");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Direct Retail Partners"
        subtitle="Manage 20–30 authorized shopkeeper & distributor accounts with customized credit terms."
        action={{
          label: "Add Customer Partner",
          onClick: () => setIsAddModalOpen(true),
        }}
      />

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Target Capacity Indicator */}
      <div className="p-4 rounded-xl bg-charcoal-900 text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>Active Partner Accounts: <strong>{customers.filter((c) => c.is_active).length}</strong> / 30 Target Capacity</span>
        </div>
        <span className="text-warmGray-400 text-[11px]">
          Strict 1-to-1 Seller Model — Controlled verified accounts only
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-warmGray-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warmGray-400" />
          <input
            type="text"
            placeholder="Search business, owner, phone, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-warmGray-300 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-warmGray-300 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Roles</option>
            <option value="retailer">Retail Shop</option>
            <option value="distributor">Distributor</option>
            <option value="vendor">Vendor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="rounded-lg border border-warmGray-300 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-brand-600" />}
          title={search || roleFilter !== "all" ? "No matching customers found" : "No partner customers registered"}
          description="Click 'Add Customer Partner' to authorize a new retail shop or distributor account."
        />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Business & Owner</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>City / Region</TableHeaderCell>
              <TableHeaderCell>Credit Limit</TableHeaderCell>
              <TableHeaderCell>Outstanding</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell align="right">Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((cust) => (
              <TableRow key={cust.id}>
                <TableCell>
                  <span className="font-bold text-charcoal-900 block text-xs">
                    {cust.business_name}
                  </span>
                  <span className="text-[11px] text-warmGray-500">
                    {cust.owner_name}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="brand" size="sm" className="capitalize">
                    {cust.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-charcoal-800 font-semibold block">{cust.phone}</span>
                  {cust.email && <span className="text-[10px] text-warmGray-500">{cust.email}</span>}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-charcoal-800">{cust.city || "Delhi"}</span>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-charcoal-900 text-xs">
                    ₹{(cust.credit_limit || 0).toLocaleString("en-IN")}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      (cust.outstanding_amount || 0) > 0
                        ? "font-bold text-brand-600 text-xs"
                        : "text-emerald-700 font-bold text-xs"
                    }
                  >
                    ₹{(cust.outstanding_amount || 0).toLocaleString("en-IN")}
                  </span>
                </TableCell>
                <TableCell>
                  {cust.is_active ? (
                    <Badge variant="success" size="sm">Active</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/admin/customers/${cust.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-warmGray-300 hover:border-brand-500 hover:text-brand-600 bg-white text-xs font-bold text-charcoal-800 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(cust.id)}
                      className={`text-xs px-2.5 py-1 rounded-md font-bold transition-colors ${
                        cust.is_active
                          ? "bg-warmGray-100 text-charcoal-700 hover:bg-warmGray-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {cust.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Verified Customer"
        >
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Business / Store Name"
                placeholder="e.g. Aggarwal Kirana Store"
                value={newCustomerForm.business_name}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, business_name: e.target.value })
                }
                required
              />
              <Input
                label="Owner / Proprietor Name"
                placeholder="e.g. Ramesh Aggarwal"
                value={newCustomerForm.owner_name}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, owner_name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Phone"
                placeholder="e.g. 9811234567"
                value={newCustomerForm.phone}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })
                }
                required
              />
              <Input
                label="Email (Optional)"
                type="email"
                placeholder="e.g. store@shop.com"
                value={newCustomerForm.email}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, email: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Account Role
                </label>
                <select
                  value={newCustomerForm.role}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, role: e.target.value })
                  }
                  className="w-full rounded-lg border border-warmGray-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="retailer">Retail Shop</option>
                  <option value="distributor">Distributor</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>

              <Input
                label="GSTIN (Optional)"
                placeholder="07AAAAA0000A1Z5"
                value={newCustomerForm.gstin}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                value={newCustomerForm.city}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, city: e.target.value })
                }
              />
              <Input
                label="State"
                value={newCustomerForm.state}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, state: e.target.value })
                }
              />
              <Input
                label="Credit Limit (₹)"
                type="number"
                min={0}
                value={newCustomerForm.credit_limit}
                onChange={(e) =>
                  setNewCustomerForm({
                    ...newCustomerForm,
                    credit_limit: Number(e.target.value),
                  })
                }
              />
            </div>

            <Input
              label="Shop Address / Godown"
              placeholder="Plot/Shop number, Market area"
              value={newCustomerForm.address}
              onChange={(e) =>
                setNewCustomerForm({ ...newCustomerForm, address: e.target.value })
              }
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-warmGray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs font-bold">
                Save Partner Account
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
