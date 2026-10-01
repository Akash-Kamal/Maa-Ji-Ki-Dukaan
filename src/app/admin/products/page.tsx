"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Package,
} from "lucide-react";
import { resolveBeverageImage } from "@/lib/product-images";
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
import { SearchBar } from "@/components/ui/SearchBar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  fetchAdminData,
  toggleProductActive,
  deleteProductSafely,
  saveAdminVariant,
} from "@/lib/admin-data";
import type { Product, ProductVariant, PackagingType, Brand, Category } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData().then((data) => {
      setProducts(data.products);
      setBrands(data.brands);
      setCategories(data.categories);
      setLoading(false);
    });
  }, []);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "review">("all");
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({
    "p-coke": true,
  });

  // Modal State for Quick Edit & Add Variant
  const [editingVariant, setEditingVariant] = useState<{
    product: Product;
    variant: ProductVariant;
  } | null>(null);

  const [addingVariantProduct, setAddingVariantProduct] = useState<Product | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: "product" | "variant";
    product: Product;
    variant?: ProductVariant;
  } | null>(null);

  // New Variant Form State
  const [newVariantForm, setNewVariantForm] = useState({
    variant_name: "",
    size: "",
    packaging_type: "bottle" as PackagingType,
    pieces_per_case: 24,
    price_per_case: "",
    stock_cases: 20,
    reorder_level_cases: 10,
    needs_review: false,
  });

  const toggleExpand = (productId: string) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.variants || []).some((v) => v.variant_name.toLowerCase().includes(search.toLowerCase()));

    const matchesBrand = selectedBrand === "all" || p.brand_id === selectedBrand;
    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory;

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? p.is_active
        : filterStatus === "inactive"
        ? !p.is_active
        : (p.variants || []).some((v) => v.needs_review || v.price_per_case === null);

    return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
  });

  // Toggle Product Active Status
  const handleToggleProductActive = (productId: string) => {
    toggleProductActive(productId);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_active: !p.is_active } : p))
    );
  };

  // Toggle Variant Active Status
  const handleToggleVariantActive = (productId: string, variantId: string) => {
    const prod = products.find((p) => p.id === productId);
    const variant = prod?.variants?.find((v) => v.id === variantId);
    if (variant) {
      const newActive = !variant.is_active;
      saveAdminVariant(productId, { id: variantId, is_active: newActive });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                variants: (p.variants || []).map((v) =>
                  v.id === variantId ? { ...v, is_active: newActive } : v
                ),
              }
            : p
        )
      );
    }
  };

  // Save Variant Edit
  const handleSaveVariantEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    const updated = editingVariant.variant;
    saveAdminVariant(editingVariant.product.id, updated);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingVariant.product.id
          ? {
              ...p,
              variants: (p.variants || []).map((v) =>
                v.id === updated.id ? { ...v, ...updated } : v
              ),
            }
          : p
      )
    );
    setEditingVariant(null);
  };

  // Handle Add Variant Submit
  const handleSaveNewVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingVariantProduct) return;

    const priceNum = newVariantForm.price_per_case ? Number(newVariantForm.price_per_case) : null;
    const newVariant: Partial<ProductVariant> & { id: string } = {
      id: `v-${Date.now()}`,
      product_id: addingVariantProduct.id,
      variant_name: newVariantForm.variant_name,
      slug: `${addingVariantProduct.slug}-${newVariantForm.variant_name.toLowerCase().replace(/\s+/g, "-")}`,
      size: newVariantForm.size || newVariantForm.variant_name,
      packaging_type: newVariantForm.packaging_type,
      pieces_per_case: Number(newVariantForm.pieces_per_case),
      price_per_case: priceNum,
      stock_cases: Number(newVariantForm.stock_cases),
      reserved_cases: 0,
      reorder_level_cases: Number(newVariantForm.reorder_level_cases),
      needs_review: priceNum === null || newVariantForm.needs_review,
      is_active: true,
    };

    saveAdminVariant(addingVariantProduct.id, newVariant);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === addingVariantProduct.id
          ? { ...p, variants: [...(p.variants || []), newVariant as ProductVariant] }
          : p
      )
    );

    setAddingVariantProduct(null);
    setNewVariantForm({
      variant_name: "",
      size: "",
      packaging_type: "bottle",
      pieces_per_case: 24,
      price_per_case: "",
      stock_cases: 20,
      reorder_level_cases: 10,
      needs_review: false,
    });
  };

  // Safe Deletion Handler
  const handleExecuteDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === "product") {
      deleteProductSafely(deleteConfirmation.product.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirmation.product.id));
    } else if (deleteConfirmation.type === "variant" && deleteConfirmation.variant) {
      // Toggle variant inactive safely
      const varId = deleteConfirmation.variant.id;
      saveAdminVariant(deleteConfirmation.product.id, {
        id: varId,
        is_active: false,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === deleteConfirmation.product.id
            ? {
                ...p,
                variants: (p.variants || []).map((v) =>
                  v.id === varId ? { ...v, is_active: false } : v
                ),
              }
            : p
        )
      );
    }
    setDeleteConfirmation(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Wholesale Master Catalog & Variants" subtitle="Loading catalog from database..." />
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Wholesale Master Catalog & Variants"
        subtitle="Manage beverage master products, bottle/can variants, pieces per case, and case pricing."
        action={{
          label: "Create Product / Image Intake",
          href: "/admin/products/new",
        }}
      />

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-warmGray-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-96">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search products, brands, or pack sizes (e.g. Coke, 250ml)..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive" | "review")}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-warmGray-300 bg-cream-50 text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="review">Needs Review / TBD Rates</option>
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-warmGray-300 bg-cream-50 text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-warmGray-300 bg-cream-50 text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products & Variants Master Table */}
      <div className="space-y-4">
        {filteredProducts.map((product) => {
          const variants = product.variants || [];
          const isExpanded = !!expandedProductIds[product.id];
          const hasReviewItems = variants.some((v) => v.needs_review || v.price_per_case === null);

          return (
            <div
              key={product.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
                product.is_active ? "border-warmGray-200 shadow-sm" : "border-warmGray-200 opacity-60 bg-cream-50/50"
              }`}
            >
              {/* Product Header Row */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-50/60 border-b border-warmGray-100">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(product.id)}
                    className="p-1 rounded-md text-warmGray-500 hover:bg-cream-200 transition-colors"
                    aria-label="Toggle variants"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-charcoal-800" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-charcoal-800" />
                    )}
                  </button>

                  <div className="w-12 h-12 shrink-0 rounded-xl bg-cream-50 border border-warmGray-200 overflow-hidden flex items-center justify-center p-1.5 shadow-2xs">
                    {(() => {
                      const img = resolveBeverageImage(product.slug, null, product.product_image_url);
                      return img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={product.name} className="w-full h-full object-contain" />
                      ) : (
                        <Package className="w-6 h-6 text-warmGray-400 stroke-[1.25]" />
                      );
                    })()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700">
                        {product.brand?.name}
                      </span>
                      <span className="text-warmGray-300">•</span>
                      <span className="text-xs font-medium text-warmGray-500">
                        {product.category?.name}
                      </span>
                      {hasReviewItems && (
                        <Badge variant="offer" size="sm" className="gap-1">
                          <AlertCircle className="w-3 h-3 text-offer-700" /> Needs Review
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-charcoal-950 mt-0.5">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Right Product Controls */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-warmGray-600 bg-white px-2.5 py-1 rounded-md border border-warmGray-200">
                    {variants.length} Pack Variant{variants.length !== 1 ? "s" : ""}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setAddingVariantProduct(product)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Variant
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleToggleProductActive(product.id)}
                    className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
                      product.is_active
                        ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        : "text-warmGray-400 border-warmGray-300 hover:bg-warmGray-100"
                    }`}
                    title={product.is_active ? "Deactivate Product" : "Activate Product"}
                  >
                    {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirmation({
                        type: "product",
                        product,
                      })
                    }
                    className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Variants Expansion Table */}
              {isExpanded && (
                <div className="p-3 sm:p-5">
                  <Table className="border-0 shadow-none">
                    <TableHead>
                      <tr>
                        <TableHeaderCell>Variant / Pack</TableHeaderCell>
                        <TableHeaderCell>Packaging</TableHeaderCell>
                        <TableHeaderCell>Pieces / Case</TableHeaderCell>
                        <TableHeaderCell>Wholesale Price / Case</TableHeaderCell>
                        <TableHeaderCell>Stock (Cases)</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </tr>
                    </TableHead>
                    <TableBody>
                      {variants.map((v) => {
                        const hasPrice = v.price_per_case !== null && v.price_per_case > 0;
                        const pieceEquivalent =
                          hasPrice && v.pieces_per_case
                            ? (v.price_per_case! / v.pieces_per_case).toFixed(
                                v.price_per_case! % v.pieces_per_case === 0 ? 0 : 2
                              )
                            : null;

                        return (
                          <TableRow key={v.id}>
                            <TableCell>
                              <span className="font-bold text-charcoal-950 block">
                                {v.variant_name}
                              </span>
                              {v.size && <span className="text-[11px] text-warmGray-500">Size: {v.size}</span>}
                            </TableCell>

                            <TableCell>
                              <span className="text-xs font-semibold capitalize text-charcoal-700 bg-warmGray-100 px-2 py-0.5 rounded">
                                {v.packaging_type}
                              </span>
                            </TableCell>

                            <TableCell>
                              {v.pieces_per_case ? (
                                <span className="text-xs font-bold text-charcoal-900 bg-cream-100 px-2 py-0.5 rounded border border-warmGray-200">
                                  {v.pieces_per_case} pcs / case
                                </span>
                              ) : (
                                <span className="text-xs text-amber-700 italic font-semibold">
                                  Pack TBD
                                </span>
                              )}
                            </TableCell>

                            <TableCell>
                              {hasPrice ? (
                                <div>
                                  <span className="text-sm font-black text-charcoal-950">
                                    ₹{v.price_per_case?.toLocaleString("en-IN")}{" "}
                                    <span className="text-[11px] font-normal text-warmGray-500">/ case</span>
                                  </span>
                                  {pieceEquivalent && (
                                    <span className="text-[11px] text-warmGray-500 block">
                                      ≈ ₹{pieceEquivalent}/pc equivalent
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-block">
                                  Rate Awaiting Admin
                                </span>
                              )}
                            </TableCell>

                            <TableCell>
                              <div>
                                <span className="font-bold text-charcoal-900 text-xs">
                                  {v.stock_cases} Cases
                                </span>
                                {v.stock_cases <= v.reorder_level_cases && (
                                  <span className="text-[10px] text-amber-700 font-semibold block">
                                    Reorder Level: {v.reorder_level_cases}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {v.needs_review ? (
                                  <Badge variant="offer" size="sm">
                                    Needs Review
                                  </Badge>
                                ) : (
                                  <Badge variant="success" size="sm">
                                    Confirmed
                                  </Badge>
                                )}
                                {!v.is_active && (
                                  <Badge variant="neutral" size="sm">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-xs"
                                  onClick={() => setEditingVariant({ product, variant: { ...v } })}
                                  title="Edit Variant"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-charcoal-700" />
                                </Button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleVariantActive(product.id, v.id)}
                                  className={`p-1.5 rounded text-xs transition-colors ${
                                    v.is_active ? "text-emerald-700 hover:bg-emerald-50" : "text-warmGray-400"
                                  }`}
                                  title={v.is_active ? "Deactivate" : "Activate"}
                                >
                                  {v.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirmation({
                                      type: "variant",
                                      product,
                                      variant: v,
                                    })
                                  }
                                  className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete Variant"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Edit Variant Modal */}
      {editingVariant && (
        <Modal
          isOpen={!!editingVariant}
          onClose={() => setEditingVariant(null)}
          title={`Edit Variant: ${editingVariant.product.name} — ${editingVariant.variant.variant_name}`}
          description="Adjust wholesale price per case, pieces per pack, stock in cases, and review status."
          maxWidth="md"
        >
          <form onSubmit={handleSaveVariantEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Variant Name"
                value={editingVariant.variant.variant_name}
                onChange={(e) =>
                  setEditingVariant({
                    ...editingVariant,
                    variant: { ...editingVariant.variant, variant_name: e.target.value },
                  })
                }
                required
              />

              <Input
                label="Size"
                value={editingVariant.variant.size || ""}
                onChange={(e) =>
                  setEditingVariant({
                    ...editingVariant,
                    variant: { ...editingVariant.variant, size: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Pieces / Case"
                type="number"
                min={1}
                value={editingVariant.variant.pieces_per_case ?? ""}
                onChange={(e) =>
                  setEditingVariant({
                    ...editingVariant,
                    variant: {
                      ...editingVariant.variant,
                      pieces_per_case: e.target.value ? Number(e.target.value) : null,
                    },
                  })
                }
                helperText="Total units inside 1 wholesale case"
              />

              <Input
                label="Wholesale Price / Case (₹)"
                type="number"
                min={0}
                placeholder="Leave blank if TBD"
                value={editingVariant.variant.price_per_case ?? ""}
                onChange={(e) =>
                  setEditingVariant({
                    ...editingVariant,
                    variant: {
                      ...editingVariant.variant,
                      price_per_case: e.target.value ? Number(e.target.value) : null,
                    },
                  })
                }
                helperText="Wholesale price per whole case"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Stock in Cases"
                type="number"
                min={0}
                value={editingVariant.variant.stock_cases}
                onChange={(e) =>
                  setEditingVariant({
                    ...editingVariant,
                    variant: {
                      ...editingVariant.variant,
                      stock_cases: Number(e.target.value),
                    },
                  })
                }
                helperText="Available case inventory"
              />

              <Input
                label="Reorder Level (Cases)"
                type="number"
                min={0}
                value={editingVariant.variant.reorder_level_cases}
                onChange={(e) =>
                  setEditingVariant({
                    ...editingVariant,
                    variant: {
                      ...editingVariant.variant,
                      reorder_level_cases: Number(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingVariant.variant.needs_review}
                  onChange={(e) =>
                    setEditingVariant({
                      ...editingVariant,
                      variant: { ...editingVariant.variant, needs_review: e.target.checked },
                    })
                  }
                  className="rounded border-warmGray-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Mark as &quot;Needs Review&quot; (Requires verification)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-warmGray-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingVariant(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Add Variant Modal */}
      {addingVariantProduct && (
        <Modal
          isOpen={!!addingVariantProduct}
          onClose={() => setAddingVariantProduct(null)}
          title={`Add New Pack Variant: ${addingVariantProduct.name}`}
          description="Create a new bottle/can case specification under this beverage lineup."
          maxWidth="md"
        >
          <form onSubmit={handleSaveNewVariant} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Variant / Size Label"
                placeholder="e.g. 500ml or Can 250ml"
                value={newVariantForm.variant_name}
                onChange={(e) => setNewVariantForm({ ...newVariantForm, variant_name: e.target.value })}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Packaging Type
                </label>
                <select
                  value={newVariantForm.packaging_type}
                  onChange={(e) =>
                    setNewVariantForm({ ...newVariantForm, packaging_type: e.target.value as PackagingType })
                  }
                  className="w-full rounded-lg border border-warmGray-300 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="bottle">Bottle (PET / Glass)</option>
                  <option value="can">Can (Aluminum)</option>
                  <option value="tetrapack">Tetrapack</option>
                  <option value="carton_case">Case Carton</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Pieces / Case"
                type="number"
                min={1}
                placeholder="e.g. 24 or 30"
                value={newVariantForm.pieces_per_case}
                onChange={(e) =>
                  setNewVariantForm({ ...newVariantForm, pieces_per_case: Number(e.target.value) })
                }
                required
                helperText="Case pack count"
              />

              <Input
                label="Wholesale Price / Case (₹)"
                type="number"
                min={0}
                placeholder="e.g. 600 (Leave empty if TBD)"
                value={newVariantForm.price_per_case}
                onChange={(e) =>
                  setNewVariantForm({ ...newVariantForm, price_per_case: e.target.value })
                }
                helperText="Wholesale rate per case"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Initial Stock (Cases)"
                type="number"
                min={0}
                value={newVariantForm.stock_cases}
                onChange={(e) =>
                  setNewVariantForm({ ...newVariantForm, stock_cases: Number(e.target.value) })
                }
                required
              />

              <Input
                label="Reorder Level (Cases)"
                type="number"
                min={0}
                value={newVariantForm.reorder_level_cases}
                onChange={(e) =>
                  setNewVariantForm({ ...newVariantForm, reorder_level_cases: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-warmGray-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddingVariantProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add Pack to Product
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <Modal
          isOpen={!!deleteConfirmation}
          onClose={() => setDeleteConfirmation(null)}
          title="Confirm Deletion"
          description="Are you sure you want to remove this catalog entry?"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-charcoal-700 leading-relaxed">
              {deleteConfirmation.type === "product" ? (
                <>
                  You are deleting <strong>{deleteConfirmation.product.name}</strong> and all associated pack variants. Existing historical order invoices will remain safe.
                </>
              ) : (
                <>
                  You are removing variant{" "}
                  <strong>{deleteConfirmation.variant?.variant_name}</strong> from{" "}
                  <strong>{deleteConfirmation.product.name}</strong>.
                </>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-warmGray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleExecuteDelete}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
