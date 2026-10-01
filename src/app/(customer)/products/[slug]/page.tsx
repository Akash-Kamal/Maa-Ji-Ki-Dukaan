import React from "react";
import { notFound } from "next/navigation";
import { getDbProductBySlug } from "@/lib/catalog-service";
import { ProductDetailClient } from "./ProductDetailClient";

// Revalidate or dynamic
export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getDbProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
