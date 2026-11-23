// ==============================================================================
// MAA JI KI DUKAAN - SUPABASE DATABASE CATALOG SERVICE
// Single authoritative source for products, variants, brands, categories & pricing
// ==============================================================================

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_BRANDS } from "@/lib/catalog-data";
import type {
  Product,
  ProductVariant,
  Brand,
  Category,
  BulkPrice,
  CustomerPrice,
  BusinessSettings,
} from "@/types";

const DB_TIMEOUT_MS = 3500;

function withTimeout<T = any>(promise: Promise<T> | any, ms: number = DB_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    Promise.resolve(promise) as Promise<T>,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Database query timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Transforms raw Supabase product rows into full canonical Product entities
 */
function transformProduct(raw: any): Product {
  const variants: ProductVariant[] = (raw.variants || []).sort(
    (a: any, b: any) => (a.price_per_case || 0) - (b.price_per_case || 0)
  );

  const firstConfirmedVariant = variants.find((v) => v.price_per_case !== null && v.price_per_case !== undefined);
  const primaryVariant = firstConfirmedVariant || variants[0];
  const totalStock = variants.reduce((acc: number, v: any) => acc + (v.stock_cases || 0), 0);

  return {
    id: raw.id,
    brand_id: raw.brand_id,
    category_id: raw.category_id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    size: primaryVariant?.size ?? raw.size ?? null,
    unit: raw.unit || "ml",
    pieces_per_case: primaryVariant?.pieces_per_case ?? raw.pieces_per_case ?? null,
    base_price: primaryVariant?.price_per_case ?? raw.base_price ?? null,
    price_per_case: primaryVariant?.price_per_case ?? raw.price_per_case ?? null,
    minimum_order_quantity: raw.minimum_order_quantity || 1,
    stock_quantity: totalStock,
    stock_cases: totalStock,
    reserved_quantity: variants.reduce((acc: number, v: any) => acc + (v.reserved_cases || 0), 0),
    reorder_level: primaryVariant?.reorder_level_cases ?? raw.reorder_level ?? 10,
    product_image_url: raw.product_image_url || null,
    is_active: raw.is_active,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    brand: raw.brand || null,
    category: raw.category || null,
    variants: variants,
    bulk_prices: raw.bulk_prices || [],
  };
}

/**
 * Server-side helper to get products directly from Supabase
 */
export async function getDbProducts(includeInactive = false): Promise<Product[]> {
  try {
    const supabase = await createServerClient();
    let query = supabase
      .from("products")
      .select(`
        *,
        brand:brands(*),
        category:categories(*),
        variants:product_variants(*),
        bulk_prices(*)
      `)
      .order("name");

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await withTimeout(query as any);
    if (error) {
      console.warn("Database query error in getDbProducts, falling back to seed data:", error);
      return SEED_PRODUCTS.filter((p) => (includeInactive ? true : p.is_active));
    }

    return (data || []).map(transformProduct);
  } catch (err) {
    console.warn("Failed to load products from database, falling back to seed data:", err);
    return SEED_PRODUCTS.filter((p) => (includeInactive ? true : p.is_active));
  }
}

/**
 * Server-side helper to fetch a single product by slug
 */
export async function getDbProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await withTimeout(
      supabase
        .from("products")
        .select(`
          *,
          brand:brands(*),
          category:categories(*),
          variants:product_variants(*),
          bulk_prices(*)
        `)
        .eq("slug", slug)
        .single() as any
    );

    if (error || !data) {
      return SEED_PRODUCTS.find((p) => p.slug === slug) || null;
    }
    return transformProduct(data);
  } catch (err) {
    console.warn(`Failed to load product '${slug}' from database, falling back to seed data:`, err);
    return SEED_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

/**
 * Server-side helper to fetch all active categories
 */
export async function getDbCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await withTimeout(
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }) as any
    );

    if (error) {
      console.warn("Database error in getDbCategories, falling back to seed data:", error);
      return SEED_CATEGORIES.filter((c) => c.is_active);
    }
    return (data as Category[]) || [];
  } catch (err) {
    console.warn("Failed to load categories from database, falling back to seed data:", err);
    return SEED_CATEGORIES.filter((c) => c.is_active);
  }
}

/**
 * Server-side helper to fetch category by slug
 */
export async function getDbCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await withTimeout(
      supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single() as any
    );

    if (error || !data) {
      return SEED_CATEGORIES.find((c) => c.slug === slug) || null;
    }
    return data as Category;
  } catch (err) {
    console.warn(`Failed to load category '${slug}' from database, falling back to seed data:`, err);
    return SEED_CATEGORIES.find((c) => c.slug === slug) || null;
  }
}

/**
 * Server-side helper to fetch all active brands
 */
export async function getDbBrands(): Promise<Brand[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await withTimeout(
      supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true }) as any
    );

    if (error) {
      console.warn("Database error in getDbBrands, falling back to seed data:", error);
      return SEED_BRANDS.filter((b) => b.is_active);
    }
    return (data as Brand[]) || [];
  } catch (err) {
    console.warn("Failed to load brands from database, falling back to seed data:", err);
    return SEED_BRANDS.filter((b) => b.is_active);
  }
}

/**
 * Client-side helper to fetch live catalog for React components
 */
export async function fetchLiveCatalog(): Promise<{
  products: Product[];
  categories: Category[];
  brands: Brand[];
}> {
  try {
    const supabase = createBrowserClient();

    const [productsRes, categoriesRes, brandsRes] = await Promise.all([
      supabase
        .from("products")
        .select(`
          *,
          brand:brands(*),
          category:categories(*),
          variants:product_variants(*),
          bulk_prices(*)
        `)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

    if (productsRes.error) throw productsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;
    if (brandsRes.error) throw brandsRes.error;

    return {
      products: (productsRes.data || []).map(transformProduct),
      categories: (categoriesRes.data || []) as Category[],
      brands: (brandsRes.data || []) as Brand[],
    };
  } catch (err) {
    console.warn("Failed to fetch live catalog from browser, falling back to seed data:", err);
    return {
      products: SEED_PRODUCTS.filter((p) => p.is_active),
      categories: SEED_CATEGORIES.filter((c) => c.is_active),
      brands: SEED_BRANDS.filter((b) => b.is_active),
    };
  }
}

/**
 * Fetch customer-specific prices from Supabase
 */
export async function fetchCustomerPrices(customerId: string): Promise<CustomerPrice[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("customer_prices")
    .select("*")
    .eq("customer_id", customerId);

  if (error) {
    console.warn("Could not fetch customer prices:", error);
    return [];
  }
  return (data || []) as CustomerPrice[];
}

/**
 * Fetch business settings from Supabase
 */
export async function getDbBusinessSettings(): Promise<BusinessSettings | null> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("business_settings")
      .select("*")
      .eq("id", "default")
      .single();

    if (error || !data) return null;
    return data as BusinessSettings;
  } catch {
    return null;
  }
}
