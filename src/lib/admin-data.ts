// ==============================================================================
// MAA JI KI DUKAAN - ADMIN OPERATIONS DATA REPOSITORY
// Database-backed state, transactional mutations & PostgreSQL audit logging
// Single authoritative source of truth: Supabase PostgreSQL
// ==============================================================================

import type {
  Product,
  ProductVariant,
  Brand,
  Category,
  BulkPrice,
  CustomerPrice,
  Order,
  Profile,
  OrderStatus,
  InventoryMovement,
  AdminAuditLog,
  BusinessSettings,
} from "@/types";

// In-memory cache synchronized with Supabase PostgreSQL
interface AdminStateCache {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  orders: Order[];
  customers: Profile[];
  bulk_prices: BulkPrice[];
  customer_prices: CustomerPrice[];
  inventory_movements: InventoryMovement[];
  audit_logs: AdminAuditLog[];
  settings: BusinessSettings | null;
  lastSynced: number;
}

let _cache: AdminStateCache = {
  products: [],
  brands: [],
  categories: [],
  orders: [],
  customers: [],
  bulk_prices: [],
  customer_prices: [],
  inventory_movements: [],
  audit_logs: [],
  settings: null,
  lastSynced: 0,
};

let _syncPromise: Promise<AdminStateCache> | null = null;

/**
 * Fetch and sync all administrative state from Supabase PostgreSQL
 */
export async function syncAdminFromDatabase(): Promise<AdminStateCache> {
  if (typeof window === "undefined") {
    return _cache;
  }

  if (_syncPromise) return _syncPromise;

  _syncPromise = (async () => {
    try {
      const res = await fetch("/api/admin/operations", {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();

      if (data.success) {
        _cache = {
          products: data.products || [],
          brands: data.brands || [],
          categories: data.categories || [],
          orders: data.orders || [],
          customers: data.customers || [],
          bulk_prices: data.bulk_prices || [],
          customer_prices: data.customer_prices || [],
          inventory_movements: data.inventory_movements || [],
          audit_logs: data.admin_audit_logs || [],
          settings: data.settings || null,
          lastSynced: Date.now(),
        };
      }
      return _cache;
    } catch (err) {
      console.error("Failed to sync admin data from database:", err);
      return _cache;
    } finally {
      _syncPromise = null;
    }
  })();

  return _syncPromise;
}

// Auto-trigger sync on browser load
if (typeof window !== "undefined") {
  syncAdminFromDatabase();
}

/**
 * Async fetch that waits for the database sync to complete and returns
 * the full admin state. Use this in React useEffect instead of the sync
 * getters to avoid reading empty cache before DB load completes.
 */
export async function fetchAdminData(): Promise<AdminStateCache> {
  return syncAdminFromDatabase();
}

/**
 * Helper to dispatch authenticated mutation to server API
 */
async function mutateAdmin(action: string, payload: any) {
  try {
    const res = await fetch("/api/admin/operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });

    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || `Admin mutation failed: ${action}`);
    }

    // Refresh database state after mutation
    syncAdminFromDatabase();
    return result;
  } catch (err: any) {
    console.error(`Admin mutation error [${action}]:`, err);
    throw err;
  }
}

// ==============================================================================
// 1. PRODUCTS & VARIANTS
// ==============================================================================

export function getAdminProducts(): Product[] {
  if (typeof window !== "undefined" && _cache.products.length === 0) {
    syncAdminFromDatabase();
  }
  return _cache.products;
}

export function saveAdminProduct(
  product: Product,
  _adminEmail: string = "admin@maajikidukaan.com"
): Product {
  // Update optimistic local cache
  const idx = _cache.products.findIndex((p) => p.id === product.id);
  if (idx > -1) {
    _cache.products[idx] = { ..._cache.products[idx], ...product };
  } else {
    _cache.products.push(product);
  }

  // Persist directly to Supabase PostgreSQL
  mutateAdmin("SAVE_PRODUCT", { product, variants: product.variants });
  return product;
}

export function toggleProductActive(
  productId: string,
  _adminEmail: string = "admin@maajikidukaan.com"
): boolean {
  const prod = _cache.products.find((p) => p.id === productId);
  const newStatus = prod ? !prod.is_active : true;

  if (prod) {
    prod.is_active = newStatus;
  }

  mutateAdmin("TOGGLE_PRODUCT_ACTIVE", { productId });
  return newStatus;
}

export function deleteProductSafely(
  productId: string,
  _adminEmail: string = "admin@maajikidukaan.com"
): { success: boolean; message: string } {
  _cache.products = _cache.products.filter((p) => p.id !== productId);
  mutateAdmin("DELETE_PRODUCT", { productId });
  return { success: true, message: "Product deleted or archived safely in database." };
}

export function saveAdminVariant(
  productId: string,
  variant: Partial<ProductVariant> & { id: string },
  _adminEmail: string = "admin@maajikidukaan.com"
): ProductVariant | null {
  const prod = _cache.products.find((p) => p.id === productId);
  if (!prod) return null;

  const currentVariants = prod.variants || [];
  const existingIdx = currentVariants.findIndex((v) => v.id === variant.id);

  let updatedVariant: ProductVariant;
  if (existingIdx > -1) {
    updatedVariant = { ...currentVariants[existingIdx], ...variant } as ProductVariant;
    currentVariants[existingIdx] = updatedVariant;
  } else {
    updatedVariant = {
      product_id: productId,
      packaging_type: "bottle",
      stock_cases: 0,
      reserved_cases: 0,
      reorder_level_cases: 10,
      needs_review: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...variant,
    } as ProductVariant;
    currentVariants.push(updatedVariant);
  }

  prod.variants = currentVariants;
  mutateAdmin("SAVE_VARIANT", { productId, variant: updatedVariant });
  return updatedVariant;
}

// ==============================================================================
// 2. INVENTORY & ADJUSTMENT (TRANSACTIONAL RPC)
// ==============================================================================

export function adjustInventoryStock(params: {
  productId: string;
  variantId: string;
  adjustmentCases: number;
  reason: string;
  adminEmail?: string;
}): { success: boolean; newStock: number } {
  const { productId, variantId, adjustmentCases, reason } = params;

  // Optimistically update cache
  const prod = _cache.products.find((p) => p.id === productId);
  const variant = prod?.variants?.find((v) => v.id === variantId);
  const oldStock = variant ? variant.stock_cases : 0;
  const newStock = Math.max(0, oldStock + adjustmentCases);

  if (variant) {
    variant.stock_cases = newStock;
  }

  // Execute PostgreSQL RPC adjust_variant_stock
  mutateAdmin("ADJUST_STOCK", {
    variantId,
    adjustment: adjustmentCases,
    reason,
  });

  return { success: true, newStock };
}

export function getInventoryMovements(): InventoryMovement[] {
  if (typeof window !== "undefined" && _cache.inventory_movements.length === 0) {
    syncAdminFromDatabase();
  }
  return _cache.inventory_movements;
}

// ==============================================================================
// 3. BULK PRICING
// ==============================================================================

export function getAdminBulkPrices(): BulkPrice[] {
  if (typeof window !== "undefined" && _cache.bulk_prices.length === 0) {
    syncAdminFromDatabase();
  }
  return _cache.bulk_prices;
}

export function saveBulkPriceTier(
  bulkPrice: Partial<BulkPrice> & { product_id: string; minimum_quantity: number; price_per_case: number },
  _adminEmail: string = "admin@maajikidukaan.com"
): BulkPrice {
  const fullBp: BulkPrice = {
    id: bulkPrice.id || `bp-${Date.now()}`,
    product_id: bulkPrice.product_id,
    variant_id: bulkPrice.variant_id || null,
    minimum_quantity: bulkPrice.minimum_quantity,
    price_per_case: bulkPrice.price_per_case,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const idx = _cache.bulk_prices.findIndex(
    (bp) => bp.product_id === fullBp.product_id && bp.minimum_quantity === fullBp.minimum_quantity
  );
  if (idx > -1) {
    _cache.bulk_prices[idx] = fullBp;
  } else {
    _cache.bulk_prices.push(fullBp);
  }

  mutateAdmin("SAVE_BULK_PRICE", { bulkPrice: fullBp });
  return fullBp;
}

export function deleteBulkPriceTier(
  id: string,
  _adminEmail: string = "admin@maajikidukaan.com"
): boolean {
  _cache.bulk_prices = _cache.bulk_prices.filter((bp) => bp.id !== id);
  mutateAdmin("DELETE_BULK_PRICE", { id });
  return true;
}

// ==============================================================================
// 4. CUSTOMER SPECIFIC PRICING
// ==============================================================================

export function getAdminCustomerPrices(): CustomerPrice[] {
  if (typeof window !== "undefined" && _cache.customer_prices.length === 0) {
    syncAdminFromDatabase();
  }
  return _cache.customer_prices;
}

export function saveCustomerPrice(
  customerPrice: Partial<CustomerPrice> & {
    customer_id: string;
    product_id: string;
    price: number;
  },
  _adminEmail: string = "admin@maajikidukaan.com"
): CustomerPrice {
  const fullCp: CustomerPrice = {
    id: customerPrice.id || `cp-${Date.now()}`,
    customer_id: customerPrice.customer_id,
    product_id: customerPrice.product_id,
    variant_id: customerPrice.variant_id || null,
    price: customerPrice.price,
    price_per_case: customerPrice.price_per_case || customerPrice.price,
    minimum_quantity: customerPrice.minimum_quantity || 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const idx = _cache.customer_prices.findIndex(
    (cp) => cp.customer_id === fullCp.customer_id && cp.product_id === fullCp.product_id
  );
  if (idx > -1) {
    _cache.customer_prices[idx] = fullCp;
  } else {
    _cache.customer_prices.push(fullCp);
  }

  mutateAdmin("SAVE_CUSTOMER_PRICE", { customerPrice: fullCp });
  return fullCp;
}

export function deleteCustomerPrice(
  id: string,
  _adminEmail: string = "admin@maajikidukaan.com"
): boolean {
  _cache.customer_prices = _cache.customer_prices.filter((cp) => cp.id !== id);
  mutateAdmin("DELETE_CUSTOMER_PRICE", { id });
  return true;
}

// ==============================================================================
// 5. CUSTOMER PROFILES
// ==============================================================================

export function getAdminCustomers(): Profile[] {
  if (typeof window !== "undefined" && _cache.customers.length === 0) {
    syncAdminFromDatabase();
  }
  return _cache.customers;
}

export function saveAdminCustomer(
  customer: Partial<Profile> & { id: string },
  _adminEmail: string = "admin@maajikidukaan.com"
): Profile | null {
  const idx = _cache.customers.findIndex((c) => c.id === customer.id);
  if (idx > -1) {
    _cache.customers[idx] = { ..._cache.customers[idx], ...customer };
    mutateAdmin("SAVE_CUSTOMER", { customer: _cache.customers[idx] });
    return _cache.customers[idx];
  }
  return null;
}

export function toggleCustomerActive(
  customerId: string,
  adminEmail: string = "admin@maajikidukaan.com"
): boolean {
  const cust = _cache.customers.find((c) => c.id === customerId);
  const newStatus = cust ? !cust.is_active : true;
  if (cust) {
    cust.is_active = newStatus;
    saveAdminCustomer({ id: customerId, is_active: newStatus }, adminEmail);
  }
  return newStatus;
}

// ==============================================================================
// 6. ORDERS & ORDER STATUS (TRANSACTIONAL RPC)
// ==============================================================================

export function getAdminOrders(): Order[] {
  if (typeof window !== "undefined" && _cache.orders.length === 0) {
    syncAdminFromDatabase();
  }
  return _cache.orders;
}

export function updateOrderStatus(
  orderIdOrNumber: string,
  newStatus: OrderStatus,
  _adminEmail: string = "admin@maajikidukaan.com"
): { success: boolean; order: Order | null } {
  const order = _cache.orders.find(
    (o) => o.id === orderIdOrNumber || o.order_number === orderIdOrNumber
  );
  if (order) {
    order.order_status = newStatus;
  }

  // Execute PostgreSQL update via mutateAdmin
  mutateAdmin("UPDATE_ORDER_STATUS", {
    orderId: order?.id || orderIdOrNumber,
    newStatus,
  });

  return { success: true, order: order || null };
}

// ==============================================================================
// 7. BRANDS & CATEGORIES
// ==============================================================================

export function getAdminBrands(): Brand[] {
  if (typeof window !== "undefined" && _cache.brands.length === 0) {
    syncAdminFromDatabase();
  }
  return _cache.brands;
}

export function saveAdminBrand(
  brand: Brand,
  _adminEmail: string = "admin@maajikidukaan.com"
): Brand {
  const idx = _cache.brands.findIndex((b) => b.id === brand.id);
  if (idx > -1) {
    _cache.brands[idx] = brand;
  } else {
    _cache.brands.push(brand);
  }
  mutateAdmin("SAVE_BRAND", { brand });
  return brand;
}

export function deleteBrandSafely(brandId: string): { success: boolean; message: string } {
  _cache.brands = _cache.brands.filter((b) => b.id !== brandId);
  mutateAdmin("DELETE_BRAND", { id: brandId });
  return { success: true, message: "Brand deleted safely." };
}

export function getAdminCategories(): Category[] {
  if (typeof window !== "undefined" && _cache.categories.length === 0) {
    syncAdminFromDatabase();
  }
  return _cache.categories;
}

export function saveAdminCategory(
  category: Category,
  _adminEmail: string = "admin@maajikidukaan.com"
): Category {
  const idx = _cache.categories.findIndex((c) => c.id === category.id);
  if (idx > -1) {
    _cache.categories[idx] = category;
  } else {
    _cache.categories.push(category);
  }
  mutateAdmin("SAVE_CATEGORY", { category });
  return category;
}

export function deleteCategorySafely(categoryId: string): { success: boolean; message: string } {
  _cache.categories = _cache.categories.filter((c) => c.id !== categoryId);
  mutateAdmin("DELETE_CATEGORY", { id: categoryId });
  return { success: true, message: "Category deleted safely." };
}

// ==============================================================================
// 8. SETTINGS & AUDIT LOGS
// ==============================================================================

export function getAdminSettings(): BusinessSettings {
  if (_cache.settings) return _cache.settings;
  return {
    id: "default",
    business_name: "Maa Ji Ki Dukaan",
    tagline: "Direct Seller Ordering. Made Simple.",
    contact_phone: "+91 98112 34567",
    email: "orders@maajikidukaan.com",
    address: "Plot 12, Main Market, Sector 7, New Delhi, 110075",
    gstin: "07AAAAA0000A1Z5",
    minimum_order_cases: 1,
    delivery_charge: 0,
    allowed_payment_methods: ["cash_on_delivery", "credit", "bank_transfer", "upi"],
    show_inactive_products: false,
    price_on_request_badge: "Price on Request",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function saveAdminSettings(
  settings: Partial<BusinessSettings>,
  _adminEmail: string = "admin@maajikidukaan.com"
): BusinessSettings {
  const current = getAdminSettings();
  const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
  _cache.settings = updated;
  mutateAdmin("SAVE_SETTINGS", { settings: updated });
  return updated;
}

export function logAudit(_entry: any): void {
  // Handled automatically server-side in PostgreSQL
}

export function getAdminAuditLogs(): AdminAuditLog[] {
  if (typeof window !== "undefined" && _cache.audit_logs.length === 0) {
    syncAdminFromDatabase();
  }
  return _cache.audit_logs;
}
