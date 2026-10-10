"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Save,
  ShieldAlert,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { fetchAdminData, saveAdminProduct } from "@/lib/admin-data";
import { uploadProductImage, validateImageFile } from "@/lib/storage";
import { useRouter } from "next/navigation";
import type { ProductImageAnalysisResult, PackagingType, Product, ProductVariant, Brand, Category } from "@/types";

interface VariantFormInput {
  variant_name: string;
  size: string;
  packaging_type: PackagingType;
  pieces_per_case: number | "";
  price_per_case: number | ""; // Wholesale price per case (strictly manual)
  stock_cases: number | ""; // Case inventory (strictly manual)
  reorder_level_cases: number;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<ProductImageAnalysisResult | null>(null);

  // Product Master Form Fields
  const [productData, setProductData] = useState({
    brand_id: "",
    category_id: "",
    name: "",
    description: "",
  });

  // Multiple Variants Support (Section 8 & 10)
  const [variants, setVariants] = useState<VariantFormInput[]>([
    {
      variant_name: "250ml",
      size: "250ml",
      packaging_type: "bottle",
      pieces_per_case: 30,
      price_per_case: "",
      stock_cases: "",
      reorder_level_cases: 10,
    },
  ]);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchAdminData().then((data) => {
      setBrands(data.brands);
      setCategories(data.categories);
      // Set default selections once loaded
      if (data.brands.length > 0) {
        setProductData((prev) => ({ ...prev, brand_id: prev.brand_id || data.brands[0].id }));
      }
      if (data.categories.length > 0) {
        setProductData((prev) => ({ ...prev, category_id: prev.category_id || data.categories[1]?.id || data.categories[0].id }));
      }
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || "Invalid file format.");
        return;
      }

      setErrorMessage("");
      setSelectedFile(file);
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      setAnalysisResult(null);
      setSaveSuccess(false);

      // Attempt upload to Supabase storage
      try {
        setIsUploading(true);
        const { publicUrl } = await uploadProductImage(file, "catalog");
        setUploadedImageUrl(publicUrl);
      } catch (err: unknown) {
        // Fallback to local URL for preview if Supabase storage is offline
        console.warn("Storage upload notice:", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSimulateAnalysis = () => {
    if (!previewUrl && !selectedFile) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      // AI analysis respecting strict safety rules (price and stock are left for manual admin entry)
      const mockResult: ProductImageAnalysisResult = {
        brand: {
          value: "Coca-Cola",
          confidence: "high",
          needsReview: false,
          extractedFromText: "COCA-COLA",
        },
        productName: {
          value: "Coke",
          confidence: "high",
          needsReview: false,
          extractedFromText: "COKE",
        },
        variant: {
          value: "250ml",
          confidence: "high",
          needsReview: false,
        },
        category: {
          value: "Soft Drinks",
          confidence: "high",
          needsReview: false,
        },
        visibleSize: {
          value: "250ml",
          confidence: "high",
          needsReview: false,
          extractedFromText: "250 ml",
        },
        packagingType: {
          value: "bottle",
          confidence: "high",
          needsReview: false,
        },
        piecesPerCase: {
          value: 30,
          confidence: "high",
          needsReview: false,
          sourceNote: "Identified 30 bottles per case on packaging crate",
        },
        visibleText: ["COCA-COLA", "COKE", "250 ml", "30 BOTTLES CASE"],
        manualFieldsRequired: {
          basePrice: true,
          stockQuantity: true,
        },
        overallStatus: "ready_for_review",
      };

      setAnalysisResult(mockResult);

      // Pre-fill master product fields
      const matchedBrand = brands.find((b) => b.name === mockResult.brand.value);
      const matchedCat = categories.find((c) => c.name === mockResult.category.value);

      setProductData({
        brand_id: matchedBrand ? matchedBrand.id : brands[0]?.id || "",
        category_id: matchedCat ? matchedCat.id : categories[1]?.id || "",
        name: mockResult.productName.value || "",
        description: `${mockResult.productName.value} sparkling beverage cases.`,
      });

      // Pre-fill variant fields without inventing price or stock
      setVariants([
        {
          variant_name: mockResult.visibleSize.value || "250ml",
          size: mockResult.visibleSize.value || "250ml",
          packaging_type: mockResult.packagingType.value || "bottle",
          pieces_per_case: mockResult.piecesPerCase.value || 30,
          price_per_case: "", // Mandatory manual entry
          stock_cases: "", // Mandatory manual entry
          reorder_level_cases: 10,
        },
      ]);

      setIsAnalyzing(false);
    }, 1200);
  };

  const handleAddVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        variant_name: "",
        size: "",
        packaging_type: "bottle",
        pieces_per_case: 24,
        price_per_case: "",
        stock_cases: "",
        reorder_level_cases: 10,
      },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantFormInput,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleApproveAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!productData.name.trim()) {
      setErrorMessage("Please enter a product name.");
      return;
    }

    // Safety validation
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.variant_name.trim()) {
        setErrorMessage(`Variant #${i + 1} must have a name/size.`);
        return;
      }
      if (v.pieces_per_case && Number(v.pieces_per_case) < 1) {
        setErrorMessage(`Variant #${i + 1} pieces per case must be at least 1.`);
        return;
      }
    }

    const productId = `prod-${Date.now()}`;
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const constructedVariants: ProductVariant[] = variants.map((v, idx) => {
      const priceNum = v.price_per_case !== "" ? Number(v.price_per_case) : null;
      return {
        id: `var-${productId}-${idx + 1}`,
        product_id: productId,
        variant_name: v.variant_name,
        slug: `${slug}-${v.variant_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        size: v.size || v.variant_name,
        packaging_type: v.packaging_type,
        pieces_per_case: Number(v.pieces_per_case) || 24,
        price_per_case: priceNum,
        stock_cases: Number(v.stock_cases) || 0,
        reserved_cases: 0,
        reorder_level_cases: Number(v.reorder_level_cases) || 10,
        needs_review: priceNum === null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const newProduct: Product = {
      id: productId,
      brand_id: productData.brand_id,
      category_id: productData.category_id,
      name: productData.name.trim(),
      slug: slug,
      description: productData.description.trim() || null,
      product_image_url: uploadedImageUrl || previewUrl || null,
      is_active: true,
      variants: constructedVariants,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      saveAdminProduct(newProduct);
      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save product.");
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Product Creation & Image Intake Workflow"
        subtitle="Upload packaging images or enter product lineup with multiple case pack variants."
      />

      <div className="flex items-center gap-2">
        <Link
          href="/admin/products"
          prefetch={false}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Products List
        </Link>
      </div>

      {/* Safety Rule Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm text-amber-950">
            Seller Safety Guardrails Enforced
          </span>
          <p className="mt-0.5 leading-relaxed text-amber-900">
            Selling units are strictly <strong>CASES / BOXES</strong>. The AI assistant extracts brand, size, and visible pack count from packaging images, but will <strong>NEVER</strong> invent prices or warehouse stock.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Image Upload & Preview */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-charcoal-900">
              1. Packaging Image & AI Inspection
            </h2>
            {isUploading && (
              <span className="text-[11px] font-semibold text-brand-600 animate-pulse">
                Uploading to Storage...
              </span>
            )}
          </div>

          <div className="border-2 border-dashed border-warmGray-300 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors bg-brand-50/30">
            <input
              type="file"
              id="product-image-upload"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="product-image-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-charcoal-900">
                Click to upload bottle, can, or case carton image
              </span>
              <span className="text-xs text-warmGray-500">
                JPEG, PNG, WEBP up to 10MB • Saved to &apos;product-images&apos; bucket
              </span>
            </label>
          </div>

          {/* Image Preview & AI Analysis trigger */}
          {previewUrl && (
            <div className="space-y-3 pt-3 border-t border-warmGray-100">
              <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                Preview & Inspection:
              </span>
              <div className="relative aspect-video rounded-xl bg-charcoal-900 flex items-center justify-center overflow-hidden border border-warmGray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {!analysisResult && (
                <Button
                  size="md"
                  variant="primary"
                  className="w-full font-bold shadow-sm"
                  isLoading={isAnalyzing}
                  onClick={handleSimulateAnalysis}
                >
                  <Sparkles className="w-4 h-4 ml-1" />
                  Analyze Packaging with AI
                </Button>
              )}
              {uploadedImageUrl && (
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stored in Supabase product-images bucket
                </p>
              )}
            </div>
          )}

          {/* Quick simulation helper for development testing */}
          {!previewUrl && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  setPreviewUrl("https://placehold.co/600x400/FAF7F0/1A1A1C?text=Coke+30+Bottle+Case+250ml");
                  handleSimulateAnalysis();
                }}
              >
                Simulate Coke 250ml 30-Pack Case Image
              </Button>
            </div>
          )}

          {analysisResult && (
            <div className="rounded-xl bg-brand-50/50 border border-warmGray-200 p-4 space-y-2 text-xs">
              <span className="font-bold text-charcoal-900 uppercase tracking-wider text-[11px] block border-b border-warmGray-200 pb-1">
                AI Detected Packaging Attributes
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-warmGray-500 block">Brand:</span>
                  <span className="font-bold text-charcoal-900 flex items-center gap-1">
                    {analysisResult.brand.value} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>
                <div>
                  <span className="text-warmGray-500 block">Product:</span>
                  <span className="font-bold text-charcoal-900 flex items-center gap-1">
                    {analysisResult.productName.value} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>
                <div>
                  <span className="text-warmGray-500 block">Pack Size:</span>
                  <span className="font-bold text-charcoal-900 flex items-center gap-1">
                    {analysisResult.visibleSize.value} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>
                <div>
                  <span className="text-warmGray-500 block">Pieces / Case:</span>
                  <span className="font-bold text-charcoal-900 flex items-center gap-1">
                    {analysisResult.piecesPerCase.value} pcs <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Right Column: Product Master & Variants Form */}
        <Card variant="default" padding="lg" className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-charcoal-900">
              2. Product Master & Variant Specifications
            </h2>
            <p className="text-xs text-warmGray-500 mt-0.5">
              Enter product details and configure case rates.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Product and all pack variants saved successfully!
            </div>
          )}

          <form onSubmit={handleApproveAndSave} className="space-y-4">
            {/* Master Product Fields */}
            <div className="space-y-3 p-4 rounded-xl bg-brand-50/40 border border-warmGray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block">
                Product Details
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Parent Brand
                  </label>
                  <select
                    value={productData.brand_id}
                    onChange={(e) => setProductData({ ...productData, brand_id: e.target.value })}
                    className="w-full rounded-lg border border-warmGray-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={productData.category_id}
                    onChange={(e) => setProductData({ ...productData, category_id: e.target.value })}
                    className="w-full rounded-lg border border-warmGray-300 bg-white px-3 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Product Name"
                placeholder="e.g. Coke or Red Bull"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                required
              />

              <Input
                label="Description"
                placeholder="Short commercial description"
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
              />
            </div>

            {/* Pack Variants Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900 block">
                    Case Pack Variants ({variants.length})
                  </span>
                  <span className="text-[11px] text-warmGray-500">
                    Add different bottle/can sizes with their specific pieces per case.
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold"
                  onClick={handleAddVariantRow}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Pack
                </Button>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-warmGray-200 bg-white space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-warmGray-100 pb-2">
                      <span className="text-xs font-bold text-charcoal-900">
                        Pack Variant #{idx + 1}
                      </span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="text-red-600 hover:text-red-700 text-xs flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <Input
                        label="Variant / Size"
                        placeholder="e.g. 250ml or 1L"
                        value={v.variant_name}
                        onChange={(e) => handleVariantChange(idx, "variant_name", e.target.value)}
                        required
                      />

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                          Packaging
                        </label>
                        <select
                          value={v.packaging_type}
                          onChange={(e) => handleVariantChange(idx, "packaging_type", e.target.value)}
                          className="w-full rounded-lg border border-warmGray-300 bg-white px-2.5 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="bottle">Bottle</option>
                          <option value="can">Can</option>
                          <option value="tetrapack">Tetrapack</option>
                          <option value="carton_case">Case Carton</option>
                        </select>
                      </div>

                      <Input
                        label="Pieces / Case"
                        type="number"
                        min={1}
                        placeholder="e.g. 24 or 30"
                        value={v.pieces_per_case}
                        onChange={(e) =>
                          handleVariantChange(
                            idx,
                            "pieces_per_case",
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        required
                      />
                    </div>

                    {/* Wholesale Case Pricing and Stock */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <Input
                        label="Seller Price / Case (₹)"
                        type="number"
                        min={0}
                        placeholder="e.g. 600 (Blank if TBD)"
                        value={v.price_per_case}
                        onChange={(e) =>
                          handleVariantChange(
                            idx,
                            "price_per_case",
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        helperText="Rate per full case (Blank = Needs Review)"
                      />

                      <Input
                        label="Stock in Cases"
                        type="number"
                        min={0}
                        placeholder="e.g. 50 cases"
                        value={v.stock_cases}
                        onChange={(e) =>
                          handleVariantChange(
                            idx,
                            "stock_cases",
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        helperText="Physical cases in warehouse"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-warmGray-200">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Approve & Save Product
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
