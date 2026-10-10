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
  saveAdminCategory,
  deleteCategorySafely,
} from "@/lib/admin-data";
import type { Category, Product } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    slug: "",
    sort_order: 1,
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadCategories = () => {
    fetchAdminData().then((data) => {
      setCategories(data.categories);
      setProducts(data.products);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCatForm({
      name: "",
      slug: "",
      sort_order: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      sort_order: cat.sort_order,
    });
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    const slug = catForm.slug.trim() || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const catToSave: Category = {
      id: editingCategory ? editingCategory.id : `cat-${slug}`,
      name: catForm.name.trim(),
      slug: slug,
      image_url: editingCategory ? editingCategory.image_url : null,
      is_active: editingCategory ? editingCategory.is_active : true,
      sort_order: Number(catForm.sort_order) || 1,
      created_at: editingCategory ? editingCategory.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveAdminCategory(catToSave);
    loadCategories();
    setIsModalOpen(false);
    setFeedback({
      type: "success",
      message: `Category "${catToSave.name}" ${editingCategory ? "updated" : "created"} successfully.`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const result = deleteCategorySafely(categoryId);
    if (result.success) {
      loadCategories();
      setFeedback({ type: "success", message: result.message });
    } else {
      setFeedback({ type: "error", message: result.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Beverage Categories"
        subtitle="Manage master beverage classifications (Energy Drinks, Soft Drinks, Juices, etc.)."
        action={{
          label: "Add Category",
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
            <TableHeaderCell>Priority Order</TableHeaderCell>
            <TableHeaderCell>Category Name</TableHeaderCell>
            <TableHeaderCell>Slug Identifier</TableHeaderCell>
            <TableHeaderCell>Catalog Products</TableHeaderCell>
            <TableHeaderCell>Catalog Status</TableHeaderCell>
            <TableHeaderCell align="right">Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {categories
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((cat) => {
              const linkedCount = products.filter((p) => p.category_id === cat.id).length;
              return (
                <TableRow key={cat.id}>
                  <TableCell>
                    <span className="font-bold text-charcoal-700 text-xs">
                      #{cat.sort_order}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-charcoal-900 text-xs">
                      {cat.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-brand-50 px-2 py-0.5 rounded text-charcoal-700 border border-warmGray-200">
                      {cat.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">
                      {linkedCount} {linkedCount === 1 ? "Product" : "Products"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">Active Category</Badge>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-md hover:bg-brand-50 text-charcoal-700 hover:text-brand-600 transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-warmGray-400 hover:text-red-600 transition-colors"
                        title={linkedCount > 0 ? "Cannot delete: products linked" : "Delete Category"}
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

      {/* Category Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? `Edit Category: ${editingCategory.name}` : "Add Beverage Category"}
        >
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <Input
              label="Category Name"
              placeholder="e.g. Energy Drinks"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Slug Identifier (Optional)"
                placeholder="e.g. energy-drinks"
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                helperText="URL key (auto-generated if blank)"
              />

              <Input
                label="Sort Order Rank"
                type="number"
                min={1}
                value={catForm.sort_order}
                onChange={(e) => setCatForm({ ...catForm, sort_order: Number(e.target.value) })}
                required
                helperText="Display priority on customer home"
              />
            </div>

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
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
