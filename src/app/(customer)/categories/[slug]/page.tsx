import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { getDbCategoryBySlug, getDbProducts } from "@/lib/catalog-service";
import { ProductCard } from "@/components/ui/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getDbCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const allProducts = await getDbProducts();
  const categoryProducts = allProducts.filter(
    (p) => p.category_id === category.id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-warmGray-500">
        <Link href="/products" className="hover:text-charcoal-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> All Products
        </Link>
        <span>/</span>
        <span className="text-charcoal-900">{category.name}</span>
      </div>

      <div className="border-b border-warmGray-200 pb-4">
        <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">
          {category.name}
        </h1>
        <p className="text-xs text-warmGray-500 mt-1">
          Direct seller case inventory available in this beverage category. Selling unit: Case/Box.
        </p>
      </div>

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<PackageOpen className="w-6 h-6 text-brand-600" />}
          title={`No products listed under ${category.name} yet`}
          description="The central seller has established this category for future portfolio expansion. Check other categories for available stock."
          action={
            <Link href="/products">
              <Button size="md" variant="primary">
                Browse Available Catalog
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
