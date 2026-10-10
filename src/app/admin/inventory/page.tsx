"use client";

import React, { useState, useEffect } from "react";
import {
  Warehouse,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { SearchBar } from "@/components/ui/SearchBar";
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
  adjustInventoryStock,
} from "@/lib/admin-data";
import type { Product, InventoryMovement } from "@/types";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "out">("all");
  const [loading, setLoading] = useState(true);

  // Adjustment Modal State
  const [adjustingItem, setAdjustingItem] = useState<{
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    currentStock: number;
  } | null>(null);

  const [adjustmentAmount, setAdjustmentAmount] = useState<number | "">("");
  const [adjustmentReason, setAdjustmentReason] = useState("New warehouse shipment arrival");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const refreshData = () => {
    fetchAdminData().then((data) => {
      setProducts(data.products);
      setMovements(data.inventory_movements);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Flatten products with variants
  const inventoryRows = products.flatMap((p) => {
    const variants = p.variants || [];
    return variants.map((v) => {
      const availableCases = Math.max(0, v.stock_cases - (v.reserved_cases || 0));
      return {
        productId: p.id,
        productName: p.name,
        brandName: p.brand?.name || "",
        categoryName: p.category?.name || "",
        variantId: v.id,
        variantName: v.variant_name,
        piecesPerCase: v.pieces_per_case,
        stockCases: v.stock_cases,
        reservedCases: v.reserved_cases || 0,
        availableCases,
        reorderLevelCases: v.reorder_level_cases,
        needsReview: v.needs_review,
        isActive: v.is_active && p.is_active,
      };
    });
  }).filter((row) => {
    const matchesSearch =
      row.productName.toLowerCase().includes(search.toLowerCase()) ||
      row.brandName.toLowerCase().includes(search.toLowerCase()) ||
      row.variantName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "low"
        ? row.stockCases > 0 && row.stockCases <= row.reorderLevelCases
        : row.stockCases <= 0;

    return matchesSearch && matchesStatus;
  });

  const totalCasesOnHand = inventoryRows.reduce((sum, r) => sum + r.stockCases, 0);
  const totalReservedCases = inventoryRows.reduce((sum, r) => sum + r.reservedCases, 0);
  const totalAvailableCases = Math.max(0, totalCasesOnHand - totalReservedCases);

  const handleQuickAdjust = (
    productId: string,
    variantId: string,
    delta: number,
    reason: string
  ) => {
    const result = adjustInventoryStock({
      productId,
      variantId,
      adjustmentCases: delta,
      reason,
      adminEmail: "admin@maajikidukaan.com",
    });

    if (result.success) {
      setFeedback({ type: "success", message: `Stock adjusted. New stock: ${result.newStock} cases.` });
      refreshData();
    } else {
      setFeedback({ type: "error", message: "Stock adjustment failed. Please try again." });
    }
  };

  const handleCustomAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjustmentAmount === "" || adjustmentAmount === 0) return;

    const delta = Number(adjustmentAmount);
    const result = adjustInventoryStock({
      productId: adjustingItem.productId,
      variantId: adjustingItem.variantId,
      adjustmentCases: delta,
      reason: adjustmentReason.trim() || "Manual warehouse audit",
      adminEmail: "admin@maajikidukaan.com",
    });

    if (result.success) {
      setFeedback({ type: "success", message: `Stock adjusted. New stock: ${result.newStock} cases.` });
      setAdjustingItem(null);
      setAdjustmentAmount("");
      refreshData();
    } else {
      setFeedback({ type: "error", message: "Stock adjustment failed. Please try again." });
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Warehouse Inventory & Stock Adjustments"
        subtitle="Primary ordering unit: Strictly CASES / BOXES. Tracks stock reservations and audit movements."
      />

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-charcoal-900 text-white flex items-center justify-between border border-charcoal-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-warmGray-400 block">
              Physical Stock on Hand
            </span>
            <span className="text-xl font-black text-white mt-1 block">
              {totalCasesOnHand} Cases
            </span>
          </div>
          <Warehouse className="w-6 h-6 text-brand-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-charcoal-900 text-white flex items-center justify-between border border-charcoal-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-warmGray-400 block">
              Reserved for Orders
            </span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              {totalReservedCases} Cases
            </span>
          </div>
          <span className="text-xs text-warmGray-400">Dispatch Pipeline</span>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-900 text-white flex items-center justify-between border border-charcoal-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-warmGray-400 block">
              Available to Order
            </span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {totalAvailableCases} Cases
            </span>
          </div>
          <span className="text-xs text-emerald-500 font-semibold">Stock - Reserved</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search variant inventory..."
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === "all"
                ? "bg-charcoal-900 text-white"
                : "bg-white border border-warmGray-300 text-charcoal-700 hover:bg-brand-50"
            }`}
          >
            All ({inventoryRows.length})
          </button>
          <button
            onClick={() => setStatusFilter("low")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === "low"
                ? "bg-amber-600 text-white"
                : "bg-white border border-warmGray-300 text-charcoal-700 hover:bg-brand-50"
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setStatusFilter("out")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === "out"
                ? "bg-red-600 text-white"
                : "bg-white border border-warmGray-300 text-charcoal-700 hover:bg-brand-50"
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Main Inventory Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Product & Brand</TableHeaderCell>
            <TableHeaderCell>Pack Variant</TableHeaderCell>
            <TableHeaderCell>Pieces / Case</TableHeaderCell>
            <TableHeaderCell>Stock (Cases)</TableHeaderCell>
            <TableHeaderCell>Reserved</TableHeaderCell>
            <TableHeaderCell>Available</TableHeaderCell>
            <TableHeaderCell>Reorder Level</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Stock Adjustment</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {inventoryRows.map((item) => {
            const isLow = item.stockCases > 0 && item.stockCases <= item.reorderLevelCases;
            const isOut = item.stockCases <= 0;

            return (
              <TableRow key={item.variantId}>
                <TableCell>
                  <span className="font-bold text-xs text-charcoal-950 block">
                    {item.productName}
                  </span>
                  <span className="text-[11px] text-brand-700 font-semibold">
                    {item.brandName}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="font-extrabold text-xs text-charcoal-800 bg-brand-50 px-2 py-0.5 rounded border border-warmGray-200">
                    {item.variantName}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-charcoal-700 font-medium">
                    {item.piecesPerCase ? `${item.piecesPerCase} pcs` : "—"}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-sm font-black text-charcoal-950">
                    {item.stockCases}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-xs font-semibold text-amber-700">
                    {item.reservedCases > 0 ? `${item.reservedCases} cases` : "0"}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-xs font-black text-emerald-800">
                    {item.availableCases} cases
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-xs font-medium text-warmGray-600">
                    {item.reorderLevelCases} cases
                  </span>
                </TableCell>

                <TableCell>
                  {isOut ? (
                    <Badge variant="danger" size="sm">
                      Out of Stock
                    </Badge>
                  ) : isLow ? (
                    <Badge variant="offer" size="sm">
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      In Stock
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickAdjust(
                          item.productId,
                          item.variantId,
                          10,
                          "Quick delivery intake (+10 cases)"
                        )
                      }
                      title="Add 10 cases"
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-xs font-bold transition-colors"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickAdjust(
                          item.productId,
                          item.variantId,
                          -5,
                          "Stock adjustment / audit (-5 cases)"
                        )
                      }
                      title="Deduct 5 cases"
                      className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded text-xs font-bold transition-colors"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAdjustingItem({
                          productId: item.productId,
                          productName: item.productName,
                          variantId: item.variantId,
                          variantName: item.variantName,
                          currentStock: item.stockCases,
                        })
                      }
                      className="px-2.5 py-1 bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-800 rounded text-xs font-bold transition-colors"
                    >
                      Custom
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Inventory Movement History Section */}
      <div className="pt-4 border-t border-warmGray-200 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-charcoal-950 flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" />
            Inventory Movement & Stock Adjustment Log
          </h2>
          <span className="text-xs text-warmGray-500 font-medium">
            {movements.length} logged entries
          </span>
        </div>

        <Card variant="default" padding="none" className="overflow-hidden">
          {movements.length === 0 ? (
            <div className="p-8 text-center text-xs text-warmGray-500">
              No manual stock adjustments logged yet. Quick and custom inventory adjustments will record an audit trail here.
            </div>
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Product / Variant</TableHeaderCell>
                  <TableHeaderCell>Previous Stock</TableHeaderCell>
                  <TableHeaderCell>Adjustment</TableHeaderCell>
                  <TableHeaderCell>New Stock</TableHeaderCell>
                  <TableHeaderCell>Reason / Note</TableHeaderCell>
                  <TableHeaderCell>Admin</TableHeaderCell>
                  <TableHeaderCell>Timestamp</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {movements.slice(0, 10).map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>
                      <span className="font-bold text-xs text-charcoal-900 block">
                        {mov.product_name || mov.product_id}
                      </span>
                      <span className="text-[11px] text-warmGray-500">
                        {mov.variant_name || mov.variant_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-charcoal-700 font-medium">
                        {mov.previous_stock} cases
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-black ${
                          mov.adjustment > 0 ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {mov.adjustment > 0 ? `+${mov.adjustment}` : mov.adjustment} cases
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-extrabold text-charcoal-950">
                        {mov.new_stock} cases
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-charcoal-800">
                        {mov.reason}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-warmGray-600">
                        {mov.admin_email || "Admin"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-warmGray-500 whitespace-nowrap">
                        {new Date(mov.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Custom Adjustment Modal */}
      {adjustingItem && (
        <Modal
          isOpen={true}
          onClose={() => setAdjustingItem(null)}
          title={`Adjust Inventory: ${adjustingItem.productName} (${adjustingItem.variantName})`}
        >
          <form onSubmit={handleCustomAdjustSubmit} className="space-y-4">
            <div className="p-3 bg-brand-50/50 rounded-lg text-xs flex justify-between items-center border border-warmGray-200">
              <span className="font-bold text-charcoal-700">Current Stock on Hand:</span>
              <span className="font-black text-charcoal-950 text-sm">
                {adjustingItem.currentStock} Cases
              </span>
            </div>

            <div>
              <Input
                label="Adjustment (Enter positive number to add, negative to deduct)"
                type="number"
                value={adjustmentAmount}
                onChange={(e) =>
                  setAdjustmentAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                required
                placeholder="e.g. 25 or -10"
              />
              {adjustmentAmount !== "" && (
                <p className="text-xs text-warmGray-600 mt-1.5 font-medium">
                  Resulting Stock:{" "}
                  <span className="font-bold text-charcoal-900">
                    {adjustingItem.currentStock + Number(adjustmentAmount)} cases
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                Adjustment Reason / Order Invoice Ref
              </label>
              <textarea
                rows={2}
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                required
                placeholder="e.g. Shipment received from factory godown, damaged stock write-off..."
                className="w-full rounded-lg border border-warmGray-300 bg-white px-3.5 py-2 text-sm text-charcoal-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAdjustingItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-bold">
                Apply Stock Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
