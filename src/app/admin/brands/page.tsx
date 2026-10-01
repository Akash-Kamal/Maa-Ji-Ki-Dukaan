"use client";

import React, { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
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
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  fetchAdminData,
  saveAdminBrand,
  deleteBrandSafely,
} from "@/lib/admin-data";
import type { Brand, Product } from "@/types";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: "",
    description: "",
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadBrands = () => {
    fetchAdminData().then((data) => {
      setBrands(data.brands);
      setProducts(data.products);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setBrandForm({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name,
      description: brand.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name.trim()) return;

    const brandToSave: Brand = {
      id: editingBrand ? editingBrand.id : `b-${brandForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: brandForm.name.trim(),
      logo_url: editingBrand ? editingBrand.logo_url : null,
      description: brandForm.description.trim() || null,
      is_active: editingBrand ? editingBrand.is_active : true,
      created_at: editingBrand ? editingBrand.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveAdminBrand(brandToSave);
    loadBrands();
    setIsModalOpen(false);
    setFeedback({
      type: "success",
      message: `Brand "${brandToSave.name}" ${editingBrand ? "updated" : "created"} successfully.`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteBrand = (brandId: string) => {
    const result = deleteBrandSafely(brandId);
    if (result.success) {
      loadBrands();
      setFeedback({ type: "success", message: result.message });
    } else {
      setFeedback({ type: "error", message: result.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Beverage Brands Portfolio"
        subtitle="Manage recognized company brands and manufacturer portfolios."
        action={{
          label: "Add Beverage Brand",
          onClick: handleOpenAdd,
        }}
      />

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-warmGray-500">&times;</button>
        </div>
      )}

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Brand Name</TableHeaderCell>
            <TableHeaderCell>Slug Identifier</TableHeaderCell>
            <TableHeaderCell>Manufacturer / Description</TableHeaderCell>
            <TableHeaderCell>Catalog Products</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell align="right">Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {brands.map((brand) => {
            const linkedCount = products.filter((p) => p.brand_id === brand.id).length;
            return (
              <TableRow key={brand.id}>
                <TableCell>
                  <span className="font-bold text-charcoal-900 text-xs block">
                    {brand.name}
                  </span>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-cream-100 px-2 py-0.5 rounded text-charcoal-700">
                    {brand.id}
                  </code>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-warmGray-600">
                    {brand.description || "Official manufacturer portfolio"}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" size="sm">
                    {linkedCount} {linkedCount === 1 ? "Product" : "Products"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="success" size="sm">Active Partner</Badge>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(brand)}
                      className="p-1.5 rounded-md hover:bg-cream-100 text-charcoal-700 hover:text-brand-600 transition-colors"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-warmGray-400 hover:text-red-600 transition-colors"
                      title={linkedCount > 0 ? "Cannot delete: products linked" : "Delete Brand"}
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

      {/* Brand Add/Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingBrand ? `Edit Brand: ${editingBrand.name}` : "Add Beverage Brand"}
        >
          <form onSubmit={handleSaveBrand} className="space-y-4">
            <Input
              label="Brand Name"
              placeholder="e.g. Coca-Cola or Red Bull"
              value={brandForm.name}
              onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
              required
            />

            <Input
              label="Manufacturer / Portfolio Description"
              placeholder="e.g. The Coca-Cola Company"
              value={brandForm.description}
              onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-warmGray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs font-bold">
                {editingBrand ? "Update Brand" : "Create Brand"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
