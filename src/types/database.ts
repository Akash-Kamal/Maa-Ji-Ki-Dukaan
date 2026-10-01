// ==============================================================================
// MAA JI KI DUKAAN - CORE DATABASE & DOMAIN TYPES
// Phase 2: Category -> Brand -> Product -> Variant Architecture
// Selling Unit: Strictly CASE / BOX
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "distributor" | "vendor" | "retailer";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packing"
  | "dispatched"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "cash_on_delivery"
  | "credit"
  | "bank_transfer"
  | "upi";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "partially_paid"
  | "credit_approved"
  | "overdue";

export type PackagingType =
  | "bottle"
  | "can"
  | "carton_case"
  | "tetrapack"
  | "other";

export interface DeliveryAddress {
  business_name: string;
  owner_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Profile {
  id: string;
  auth_user_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  role: UserRole;
  gstin: string | null;
  business_type: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  credit_limit: number;
  outstanding_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string; // e.g. '250ml', '750ml', '1L', 'Can 180ml'
  slug: string;
  size: string | null;
  packaging_type: PackagingType;
  pieces_per_case: number | null; // e.g. 30 pcs/case
  price_per_case: number | null; // Wholesale Price / Case (NULL if TBD / Needs Review)
  stock_cases: number; // Case Inventory
  reserved_cases: number;
  reorder_level_cases: number;
  needs_review: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Optional joined parent product
  product?: Product;
}

export interface Product {
  id: string;
  brand_id: string | null;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  size?: string | null;
  unit?: string;
  pieces_per_case?: number | null;
  /** @deprecated Backward compatibility alias only. Use canonical `price_per_case` */
  base_price?: number | null;
  price_per_case?: number | null; // Canonical wholesale price per CASE
  minimum_order_quantity?: number;
  stock_quantity?: number;
  stock_cases?: number;
  reserved_quantity?: number;
  reorder_level?: number;
  product_image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Joined relations
  brand?: Brand | null;
  category?: Category | null;
  variants?: ProductVariant[];
  bulk_prices?: BulkPrice[];
}

export interface CustomerPrice {
  id: string;
  customer_id: string;
  product_id: string;
  variant_id?: string | null;
  price: number; // Wholesale price per case negotiated for this customer
  price_per_case?: number;
  minimum_quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface BulkPrice {
  id: string;
  product_id: string;
  variant_id?: string | null;
  minimum_quantity: number; // Minimum cases required
  price_per_case: number; // Wholesale case rate for this volume tier
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  discount: number;
  gst_amount: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  delivery_address: DeliveryAddress;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  customer?: Profile;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id?: string | null;
  product_name_snapshot: string;
  variant_snapshot?: string | null;
  price_snapshot: number;
  price_per_case_snapshot: number;
  quantity: number; // Strictly cases
  quantity_cases?: number;
  pieces_per_case_snapshot: number | null;
  subtotal: number;
  created_at: string;
  product?: Product | null;
  variant?: ProductVariant | null;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  variant_id: string;
  previous_stock: number;
  adjustment: number;
  new_stock: number;
  reason: string;
  admin_id?: string | null;
  admin_email?: string | null;
  created_at: string;
  product_name?: string;
  variant_name?: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id?: string | null;
  admin_email: string;
  action: string;
  entity: string;
  entity_id: string;
  previous_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  tagline: string;
  contact_phone: string;
  email: string;
  address: string;
  gstin?: string | null;
  minimum_order_cases: number;
  delivery_charge: number;
  allowed_payment_methods: PaymentMethod[];
  show_inactive_products: boolean;
  price_on_request_badge: string;
  created_at: string;
  updated_at: string;
}

// ==============================================================================
// PRODUCT IMAGE ANALYSIS WORKFLOW TYPES
// ==============================================================================

export type ConfidenceScore = "high" | "medium" | "low" | "needs_review";

export interface AnalyzedField<T> {
  value: T | null;
  confidence: ConfidenceScore;
  needsReview: boolean;
  extractedFromText?: string;
  sourceNote?: string;
}

export interface ProductImageAnalysisResult {
  imageId?: string;
  imageUrl?: string;
  brand: AnalyzedField<string>;
  productName: AnalyzedField<string>;
  variant: AnalyzedField<string>;
  category: AnalyzedField<string>;
  visibleSize: AnalyzedField<string>;
  packagingType: AnalyzedField<PackagingType>;
  piecesPerCase: AnalyzedField<number>;
  visibleText: string[];
  manualFieldsRequired: {
    basePrice: boolean;
    stockQuantity: boolean;
  };
  overallStatus: "ready_for_review" | "needs_clarification";
}

export type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type ProfileInsert = {
  id?: string;
  auth_user_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  role?: UserRole;
  gstin?: string | null;
  business_type?: string | null;
  address: string;
  city: string;
  state?: string;
  pincode: string;
  credit_limit?: number;
  outstanding_amount?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type ProfileUpdate = Partial<ProfileInsert> & {
  [key: string]: unknown;
};

export type ProductVariantInsert = {
  id?: string;
  product_id: string;
  variant_name: string;
  slug: string;
  size?: string | null;
  packaging_type?: PackagingType;
  pieces_per_case?: number | null;
  price_per_case?: number | null;
  stock_cases?: number;
  reserved_cases?: number;
  reorder_level_cases?: number;
  needs_review?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductVariantUpdate = Partial<ProductVariantInsert>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: Relationship[];
      };
      brands: {
        Row: Brand;
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          brand_id?: string | null;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          size?: string | null;
          unit?: string;
          pieces_per_case?: number | null;
          base_price?: number | null;
          price_per_case?: number | null;
          minimum_order_quantity?: number;
          stock_quantity?: number;
          reserved_quantity?: number;
          reorder_level?: number;
          product_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string | null;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          size?: string | null;
          unit?: string;
          pieces_per_case?: number | null;
          base_price?: number | null;
          price_per_case?: number | null;
          minimum_order_quantity?: number;
          stock_quantity?: number;
          reserved_quantity?: number;
          reorder_level?: number;
          product_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: ProductVariantInsert;
        Update: ProductVariantUpdate;
        Relationships: Relationship[];
      };
      customer_prices: {
        Row: CustomerPrice;
        Insert: {
          id?: string;
          customer_id: string;
          product_id: string;
          variant_id?: string | null;
          price: number;
          price_per_case?: number;
          minimum_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          product_id?: string;
          variant_id?: string | null;
          price?: number;
          price_per_case?: number;
          minimum_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      bulk_prices: {
        Row: BulkPrice;
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          minimum_quantity: number;
          price_per_case: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          minimum_quantity?: number;
          price_per_case?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          order_number: string;
          customer_id: string;
          subtotal?: number;
          discount?: number;
          gst_amount?: number;
          delivery_charge?: number;
          total_amount?: number;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          order_status?: OrderStatus;
          delivery_address: DeliveryAddress;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string;
          subtotal?: number;
          discount?: number;
          gst_amount?: number;
          delivery_charge?: number;
          total_amount?: number;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          order_status?: OrderStatus;
          delivery_address?: DeliveryAddress;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name_snapshot: string;
          variant_snapshot?: string | null;
          price_snapshot: number;
          price_per_case_snapshot: number;
          quantity: number;
          pieces_per_case_snapshot?: number | null;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name_snapshot?: string;
          variant_snapshot?: string | null;
          price_snapshot?: number;
          price_per_case_snapshot?: number;
          quantity?: number;
          pieces_per_case_snapshot?: number | null;
          subtotal?: number;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      current_profile_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      packaging_type: PackagingType;
    };
    CompositeTypes: Record<string, never>;
  };
};
