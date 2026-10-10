"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Truck,
  Eye,
  Save,
  CheckCircle2,
  History,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  saveAdminSettings,
  getAdminSettings,
} from "@/lib/admin-data";
import type { BusinessSettings, AdminAuditLog, PaymentMethod } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>(getAdminSettings());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData().then((data) => {
      if (data.settings) setSettings(data.settings);
      setAuditLogs(data.audit_logs);
      setLoading(false);
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    saveAdminSettings(settings);
    setIsSaving(false);
    setFeedback("Business settings and dispatch parameters saved successfully.");
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleTogglePaymentMethod = (method: PaymentMethod) => {
    const current = settings.allowed_payment_methods || [];
    const exists = current.includes(method);
    const updated = exists
      ? current.filter((m) => m !== method)
      : [...current, method];

    setSettings({ ...settings, allowed_payment_methods: updated });
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      <AdminHeader
        title="Seller Portal Settings & Audit"
        subtitle="Platform configuration, dispatch thresholds, and immutable admin audit trail."
      />

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {feedback}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Information Card */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-warmGray-200 pb-3">
            <Building2 className="w-5 h-5 text-brand-600" />
            <div>
              <h2 className="text-base font-bold text-charcoal-900">
                Seller Business Profile
              </h2>
              <p className="text-xs text-warmGray-500">
                Official entity name and trade details shown on invoices and retailer delivery notes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Seller Trading Name"
              value={settings.business_name}
              onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              required
            />
            <Input
              label="Commercial Tagline"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Contact Phone"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              required
            />
            <Input
              label="Official Email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              required
            />
            <Input
              label="Seller GSTIN"
              value={settings.gstin || ""}
              onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
              placeholder="07AAAAA0000A1Z5"
            />
          </div>

          <Input
            label="Central Warehouse / Dispatch Godown Address"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            required
          />
        </Card>

        {/* Order & Dispatch Parameters */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-warmGray-200 pb-3">
            <Truck className="w-5 h-5 text-brand-600" />
            <div>
              <h2 className="text-base font-bold text-charcoal-900">
                Order & Commercial Parameters
              </h2>
              <p className="text-xs text-warmGray-500">
                Define minimum case thresholds and permitted payment mechanisms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Order Quantity (Cases)"
              type="number"
              min={1}
              value={settings.minimum_order_cases}
              onChange={(e) =>
                setSettings({ ...settings, minimum_order_cases: Number(e.target.value) })
              }
              helperText="Minimum cases required in cart to checkout"
              required
            />
            <Input
              label="Standard Delivery Charge (₹)"
              type="number"
              min={0}
              value={settings.delivery_charge}
              onChange={(e) =>
                setSettings({ ...settings, delivery_charge: Number(e.target.value) })
              }
              helperText="Set to 0 for Free Delivery"
              required
            />
          </div>

          {/* Permitted Payment Methods */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
              Allowed Settlement Methods
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                [
                  { id: "cash_on_delivery", label: "Cash on Delivery" },
                  { id: "credit", label: "Seller Credit (Khata)" },
                  { id: "bank_transfer", label: "NEFT / RTGS" },
                  { id: "upi", label: "Direct UPI QR" },
                ] as const
              ).map((pm) => {
                const isChecked = (settings.allowed_payment_methods || []).includes(pm.id);
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => handleTogglePaymentMethod(pm.id)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      isChecked
                        ? "border-brand-600 bg-brand-50/60 text-brand-900 shadow-xs"
                        : "border-warmGray-200 bg-white text-charcoal-600 hover:border-warmGray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{pm.label}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Catalog Behavior Settings */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-warmGray-200 pb-3">
            <Eye className="w-5 h-5 text-brand-600" />
            <div>
              <h2 className="text-base font-bold text-charcoal-900">
                Catalog Display Preferences
              </h2>
              <p className="text-xs text-warmGray-500">
                Control customer-facing visibility and unpriced inventory presentation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price-on-Request Label"
              value={settings.price_on_request_badge || "Price on Request"}
              onChange={(e) =>
                setSettings({ ...settings, price_on_request_badge: e.target.value })
              }
              helperText="Badge displayed when case rate is unassigned"
            />

            <div className="p-3.5 rounded-xl border border-warmGray-200 bg-brand-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-charcoal-900 block">
                  Show Inactive / Archived Products
                </span>
                <span className="text-[11px] text-warmGray-500">
                  Allow customers to see archived items as out of stock
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.show_inactive_products}
                onChange={(e) =>
                  setSettings({ ...settings, show_inactive_products: e.target.checked })
                }
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-warmGray-300"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSaving}
            className="text-xs font-bold shadow-md"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Portal Settings
          </Button>
        </div>
      </form>

      {/* Admin Audit Trail Section */}
      <Card variant="default" padding="lg" className="space-y-4 mt-8">
        <div className="flex items-center justify-between border-b border-warmGray-200 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600" />
            <div>
              <h2 className="text-base font-bold text-charcoal-900">
                Administrative Audit Log ({auditLogs.length})
              </h2>
              <p className="text-xs text-warmGray-500">
                Immutable chronological log of sensitive changes: price alterations, stock adjustments, order workflows.
              </p>
            </div>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-warmGray-500 bg-brand-50/30 rounded-xl border border-dashed border-warmGray-200">
            No admin audit logs recorded in session yet. Modifications to prices, inventory, and orders will appear here automatically.
          </div>
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Timestamp</TableHeaderCell>
                <TableHeaderCell>Admin Account</TableHeaderCell>
                <TableHeaderCell>Action Performed</TableHeaderCell>
                <TableHeaderCell>Target Entity</TableHeaderCell>
                <TableHeaderCell>Change Snapshot</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {auditLogs.slice(0, 30).map((log) => {
                const dateStr = new Date(log.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const timeStr = new Date(log.created_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="text-xs font-bold text-charcoal-900 block">{dateStr}</span>
                      <span className="text-[10px] text-warmGray-500 font-mono">{timeStr}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-charcoal-800 font-semibold block">
                        {log.admin_email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.action.includes("PRICE") || log.action.includes("STOCK")
                            ? "brand"
                            : log.action.includes("DELETE")
                            ? "danger"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-charcoal-700 block capitalize">
                        {log.entity}
                      </span>
                      <span className="text-[10px] text-warmGray-400 font-mono">
                        {log.entity_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-mono text-charcoal-700 max-w-xs truncate bg-brand-50/50 p-1.5 rounded border border-warmGray-200">
                        {log.new_value
                          ? JSON.stringify(log.new_value)
                          : log.previous_value
                          ? `Prev: ${JSON.stringify(log.previous_value)}`
                          : "Action executed"}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
