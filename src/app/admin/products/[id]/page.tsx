"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  CheckCircle2,
  AlertCircle,
  Package,
  Eye,
} from "lucide-react";
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
import { Modal } from "@/components/ui/Modal";
import {
  fetchAdminData,
  saveAdminProduct,
  saveAdminVariant,
} from "@/lib/admin-data";
import type { Product, ProductVariant, PackagingType, Brand, Category } from "@/types";

export default function AdminEditProductPage() {
  const params = useParams();
  const productId = decodeURIComponent(params.id as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Master form fields
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Variant editing state
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [variantForm, setVariantForm] = useState({
    variant_name: "",
    size: "",
    packaging_type: "bottle" as PackagingType,
    pieces_per_case: 24,
    price_per_case: "" as string | number,
    stock_cases: 20,
    reorder_level_cases: 10,
    needs_review: false,
    is_active: true,
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAdminData().then((data) => {
      setBrands(data.brands);
      setCategories(data.categories);
      const found = data.products.find((p) => p.id === productId || p.slug === productId);
      if (found) {
        setProduct(found);
        setName(found.name);
        setBrandId(found.brand_id || "");
        setCategoryId(found.category_id || "");
        setDescription(found.description || "");
        setImageUrl(found.product_image_url || "");
        setIsActive(found.is_active);
      }
    });
  }, [productId]);

  if (!product) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center">
        <Package className="w-12 h-12 text-warmGray-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-charcoal-900">Product Not Found</h2>
        <p className="text-xs text-warmGray-500">
          The requested product ID &quot;{productId}&quot; does not exist in the active catalog.
        </p>
        <Link href="/admin/products" prefetch={false}>
          <Button variant="outline" size="sm" className="mt-4">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  // Handle Master Product Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const selectedBrand = brands.find((b) => b.id === brandId);
      const selectedCategory = categories.find((c) => c.id === categoryId);

      const updated = saveAdminProduct({
        ...product,
        name,
        brand_id: brandId || null,
        category_id: categoryId || null,
        description: description.trim() || null,
        product_image_url: imageUrl.trim() || null,
        is_active: isActive,
        brand: selectedBrand || null,
        category: selectedCategory || null,
      });

      setProduct(updated);
      setFeedback({
        type: "success",
        message: `Product "${updated.name}" updated successfully. Changes are live in seller catalog.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update product.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Variant Modal
  const openEditVariant = (v: ProductVariant) => {
    setEditingVariant(v);
    setVariantForm({
      variant_name: v.variant_name,
      size: v.size || "",
      packaging_type: v.packaging_type,
      pieces_per_case: v.pieces_per_case || 24,
      price_per_case: v.price_per_case ?? "",
      stock_cases: v.stock_cases,
      reorder_level_cases: v.reorder_level_cases,
      needs_review: v.needs_review,
      is_active: v.is_active,
    });
  };

  // Open Add Variant Modal
  const openAddVariant = () => {
    setIsAddingVariant(true);
    setVariantForm({
      variant_name: "",
      size: "",
      packaging_type: "bottle",
      pieces_per_case: 24,
      price_per_case: "",
      stock_cases: 30,
      reorder_level_cases: 10,
      needs_review: false,
      is_active: true,
    });
  };

  // Save Variant Submission
  const handleSaveVariantModal = (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum =
      variantForm.price_per_case === "" || variantForm.price_per_case === null
        ? null
        : Number(variantForm.price_per_case);

    if (editingVariant) {
      // Update existing variant
      const saved = saveAdminVariant(product.id, {
        id: editingVariant.id,
        variant_name: variantForm.variant_name,
        size: variantForm.size || variantForm.variant_name,
        packaging_type: variantForm.packaging_type,
        pieces_per_case: Number(variantForm.pieces_per_case),
        price_per_case: priceNum,
        stock_cases: Number(variantForm.stock_cases),
        reorder_level_cases: Number(variantForm.reorder_level_cases),
        needs_review: priceNum === null || variantForm.needs_review,
        is_active: variantForm.is_active,
      });

      if (saved) {
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                variants: (prev.variants || []).map((v) => (v.id === saved.id ? saved : v)),
              }
            : null
        );
      }
      setEditingVariant(null);
    } else if (isAddingVariant) {
      // Add new variant
      const newVarId = `v-${product.slug}-${Date.now().toString(36)}`;
      const saved = saveAdminVariant(product.id, {
        id: newVarId,
        variant_name: variantForm.variant_name,
        slug: `${product.slug}-${variantForm.variant_name.toLowerCase().replace(/\s+/g, "-")}`,
        size: variantForm.size || variantForm.variant_name,
        packaging_type: variantForm.packaging_type,
        pieces_per_case: Number(variantForm.pieces_per_case),
        price_per_case: priceNum,
        stock_cases: Number(variantForm.stock_cases),
        reserved_cases: 0,
        reorder_level_cases: Number(variantForm.reorder_level_cases),
        needs_review: priceNum === null || variantForm.needs_review,
        is_active: variantForm.is_active,
      });

      if (saved) {
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                variants: [...(prev.variants || []), saved],
              }
            : null
        );
      }
      setIsAddingVariant(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/admin/products"
          prefetch={false}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-warmGray-500 hover:text-charcoal-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product Catalog
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-charcoal-950 tracking-tight">
              Edit {product.name}
            </h1>
            <p className="text-xs text-warmGray-500 mt-0.5">
              SKU ID: <span className="font-mono">{product.id}</span> • Slug: &quot;{product.slug}&quot;
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/products/${product.slug}`} target="_blank">
              <Button size="sm" variant="outline" className="text-xs font-bold">
                <Eye className="w-3.5 h-3.5 mr-1" />
                View in Store
              </Button>
            </Link>
            <Button
              type="submit"
              form="product-master-form"
              size="sm"
              variant="primary"
              isLoading={isSaving}
              className="text-xs font-bold shadow-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Save Product Changes
            </Button>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid: Left = Master Information, Right = Media & Status */}
      <form id="product-master-form" onSubmit={handleSaveProduct} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Master Details Card */}
          <div className="lg:col-span-2 space-y-4">
            <Card variant="default" padding="lg" className="space-y-4 shadow-xs">
              <h2 className="text-sm font-extrabold text-charcoal-900 uppercase tracking-wider border-b border-warmGray-100 pb-2">
                Product Information
              </h2>

              <Input
                label="Product Commercial Title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Coca-Cola Original Taste"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                    Brand Portfolio
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full rounded-lg border border-warmGray-300 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 font-medium focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">Select Brand...</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                    Category Line
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-warmGray-300 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 font-medium focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                  Commercial Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Packaging information, specifications, and beverage profile..."
                  className="w-full rounded-lg border border-warmGray-300 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </Card>
          </div>

          {/* Media & Status Card */}
          <div className="space-y-4">
            <Card variant="default" padding="lg" className="space-y-4 shadow-xs">
              <h2 className="text-sm font-extrabold text-charcoal-900 uppercase tracking-wider border-b border-warmGray-100 pb-2">
                Catalog Status & Asset
              </h2>

              <div className="p-3 rounded-lg bg-brand-50/50 border border-warmGray-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-warmGray-300 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block">
                      Active in Seller Catalog
                    </span>
                    <span className="text-[10px] text-warmGray-500 block">
                      When disabled, product is hidden from customer browsing.
                    </span>
                  </div>
                </label>
              </div>

              <Input
                label="Product Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/products/coke.png or https://..."
              />

              {imageUrl && (
                <div className="p-2 border border-warmGray-200 rounded-xl bg-white text-center">
                  <span className="text-[10px] font-bold text-warmGray-400 block mb-1">
                    Image Preview
                  </span>
                  <div className="w-full h-32 relative flex items-center justify-center bg-warmGray-50 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </form>

      {/* Product Variants Matrix Card */}
      <Card variant="default" padding="lg" className="space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warmGray-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-charcoal-950">
              Product Pack Variants (Strictly Cases/Boxes)
            </h2>
            <p className="text-xs text-warmGray-500 mt-0.5">
              Each pack variant defines packaging size, pieces per case, case price, and live inventory.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={openAddVariant}
            className="text-xs font-bold border-brand-300 text-brand-700 hover:bg-brand-50"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Pack Size
          </Button>
        </div>

        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Pack Size</TableHeaderCell>
              <TableHeaderCell>Packaging</TableHeaderCell>
              <TableHeaderCell>Pieces / Case</TableHeaderCell>
              <TableHeaderCell>Seller Price / Case</TableHeaderCell>
              <TableHeaderCell>Stock Cases</TableHeaderCell>
              <TableHeaderCell>Reorder Level</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {(product.variants || []).map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <span className="font-extrabold text-xs text-charcoal-900 bg-brand-50 px-2 py-0.5 rounded border border-warmGray-200">
                    {v.variant_name}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-warmGray-700 capitalize">
                    {v.packaging_type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold text-charcoal-800">
                    {v.pieces_per_case ? `${v.pieces_per_case} pcs / case` : "—"}
                  </span>
                </TableCell>
                <TableCell>
                  {v.price_per_case !== null ? (
                    <span className="font-black text-xs text-charcoal-950">
                      ₹{v.price_per_case.toLocaleString("en-IN")} / case
                    </span>
                  ) : (
                    <Badge variant="offer" size="sm">
                      Price on Request
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold text-charcoal-900">
                    {v.stock_cases} cases
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-warmGray-600">
                    {v.reorder_level_cases} cases
                  </span>
                </TableCell>
                <TableCell>
                  {v.is_active ? (
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditVariant(v)}
                    className="text-xs font-bold h-7 px-2.5 text-brand-600 hover:text-brand-700"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Edit / Add Variant Modal */}
      {(editingVariant || isAddingVariant) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setEditingVariant(null);
            setIsAddingVariant(false);
          }}
          title={editingVariant ? `Edit Pack Size: ${editingVariant.variant_name}` : "Add New Pack Variant"}
        >
          <form onSubmit={handleSaveVariantModal} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Pack Size / Variant Name"
                value={variantForm.variant_name}
                onChange={(e) => setVariantForm({ ...variantForm, variant_name: e.target.value })}
                required
                placeholder="e.g. 250ml or Can 330ml"
              />
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                  Packaging Type
                </label>
                <select
                  value={variantForm.packaging_type}
                  onChange={(e) =>
                    setVariantForm({
                      ...variantForm,
                      packaging_type: e.target.value as PackagingType,
                    })
                  }
                  className="w-full rounded-lg border border-warmGray-300 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 font-medium focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="bottle">Bottle</option>
                  <option value="can">Can</option>
                  <option value="carton_case">Carton Case</option>
                  <option value="tetrapack">Tetrapack</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Pieces Per Case"
                type="number"
                min={1}
                value={variantForm.pieces_per_case}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, pieces_per_case: Number(e.target.value) })
                }
                required
                placeholder="e.g. 24 or 30"
              />
              <Input
                label="Price Per Case (₹) (Leave blank for TBD)"
                type="number"
                min={0}
                value={variantForm.price_per_case}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, price_per_case: e.target.value })
                }
                placeholder="e.g. 600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Stock Quantity (Cases)"
                type="number"
                min={0}
                value={variantForm.stock_cases}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, stock_cases: Number(e.target.value) })
                }
                required
                placeholder="e.g. 50"
              />
              <Input
                label="Reorder Level (Cases)"
                type="number"
                min={1}
                value={variantForm.reorder_level_cases}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, reorder_level_cases: Number(e.target.value) })
                }
                required
                placeholder="e.g. 10"
              />
            </div>

            <div className="p-3 bg-brand-50/50 rounded-lg space-y-2 border border-warmGray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={variantForm.is_active}
                  onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-warmGray-300 focus:ring-brand-500"
                />
                <span className="text-xs font-bold text-charcoal-900">
                  Active (Orderable in Store)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={variantForm.needs_review}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, needs_review: e.target.checked })
                  }
                  className="w-4 h-4 text-brand-600 rounded border-warmGray-300 focus:ring-brand-500"
                />
                <span className="text-xs font-bold text-charcoal-900">
                  Mark as Needs Review / Price on Request
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingVariant(null);
                  setIsAddingVariant(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-bold">
                Save Pack Size
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
