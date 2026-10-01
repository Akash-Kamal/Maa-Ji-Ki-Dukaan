-- ==============================================================================
-- MAA JI KI DUKAAN - B2B WHOLESALE BEVERAGES PLATFORM
-- Schema Migration: 20261001000000_initial_schema.sql
-- Normalized PostgreSQL Schema with Strict Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE
-- Roles: admin (central wholesaler), distributor, vendor, retailer
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'distributor', 'vendor', 'retailer')) DEFAULT 'retailer',
    gstin TEXT,
    business_type TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Delhi',
    pincode TEXT NOT NULL,
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    outstanding_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCTS TABLE
-- Wholesale pricing is CASE-based where pieces_per_case is set.
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    size TEXT,
    unit TEXT NOT NULL DEFAULT 'ml',
    pieces_per_case INTEGER,
    base_price NUMERIC(10, 2), -- Case wholesale price (e.g. 3000 for Red Bull 24 pcs case)
    minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    product_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. CUSTOMER-SPECIFIC PRICING TABLE
-- Custom rates per customer (e.g. ₹2,950 for Customer A vs ₹3,000 base)
CREATE TABLE IF NOT EXISTS public.customer_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    minimum_quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_customer_product UNIQUE (customer_id, product_id)
);

-- 7. BULK PRICING TABLE (TIERED PRICING)
-- Tiered rates by case quantity (e.g. 5+ cases -> ₹2,950, 10+ cases -> ₹2,900)
CREATE TABLE IF NOT EXISTS public.bulk_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    minimum_quantity INTEGER NOT NULL CHECK (minimum_quantity > 0),
    price_per_case NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_product_bulk_tier UNIQUE (product_id, minimum_quantity)
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gst_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    delivery_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash_on_delivery', 'credit', 'bank_transfer', 'upi')) DEFAULT 'cash_on_delivery',
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'credit_approved', 'overdue')) DEFAULT 'pending',
    order_status TEXT NOT NULL CHECK (order_status IN ('pending', 'confirmed', 'packing', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled')) DEFAULT 'pending',
    delivery_address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ORDER ITEMS TABLE
-- Stores historical snapshots of product name, unit price, and pieces_per_case
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    price_snapshot NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    pieces_per_case_snapshot INTEGER,
    subtotal NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_customer_prices_customer ON public.customer_prices(customer_id);
CREATE INDEX IF NOT EXISTS idx_bulk_prices_product ON public.bulk_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 11. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_brands_updated_at ON public.brands;
CREATE TRIGGER set_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_customer_prices_updated_at ON public.customer_prices;
CREATE TRIGGER set_customer_prices_updated_at
    BEFORE UPDATE ON public.customer_prices
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_bulk_prices_updated_at ON public.bulk_prices;
CREATE TRIGGER set_bulk_prices_updated_at
    BEFORE UPDATE ON public.bulk_prices
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 12. SECURITY HELPER FUNCTION FOR RLS
-- Safely check if current user is an admin without infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE auth_user_id = auth.uid()
          AND role = 'admin'
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Safely check customer's own profile id
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 13. PREVENT ROLE ESCALATION TRIGGER
-- Non-admin users cannot alter their role, credit_limit, or outstanding_amount
CREATE OR REPLACE FUNCTION public.prevent_profile_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT public.is_admin() THEN
        IF NEW.role <> OLD.role THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot change their own role.';
        END IF;
        IF NEW.credit_limit <> OLD.credit_limit THEN
            RAISE EXCEPTION 'Unauthorized: Credit limit is managed strictly by wholesaler.';
        END IF;
        IF NEW.outstanding_amount <> OLD.outstanding_amount THEN
            RAISE EXCEPTION 'Unauthorized: Outstanding amount is managed strictly by wholesaler.';
        END IF;
        IF NEW.is_active <> OLD.is_active THEN
            RAISE EXCEPTION 'Unauthorized: Account status is managed strictly by wholesaler.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_profile_security ON public.profiles;
CREATE TRIGGER enforce_profile_security
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_tampering();

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Admin can view all profiles; users can view their own profile
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        public.is_admin() OR auth_user_id = auth.uid()
    );

-- Users can insert their own profile upon registration (defaults to retailer)
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (
        auth_user_id = auth.uid() OR public.is_admin()
    );

-- Users can update their own profile; admins can update any profile
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (
        public.is_admin() OR auth_user_id = auth.uid()
    );

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE USING (
        public.is_admin()
    );

-- BRANDS POLICIES
-- Anyone authenticated can view active brands; admin can view all
CREATE POLICY "brands_select_policy" ON public.brands
    FOR SELECT USING (
        is_active = true OR public.is_admin()
    );

CREATE POLICY "brands_admin_insert" ON public.brands
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "brands_admin_update" ON public.brands
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "brands_admin_delete" ON public.brands
    FOR DELETE USING (public.is_admin());

-- CATEGORIES POLICIES
CREATE POLICY "categories_select_policy" ON public.categories
    FOR SELECT USING (
        is_active = true OR public.is_admin()
    );

CREATE POLICY "categories_admin_insert" ON public.categories
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_update" ON public.categories
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "categories_admin_delete" ON public.categories
    FOR DELETE USING (public.is_admin());

-- PRODUCTS POLICIES
-- Active products are visible to all authenticated users; admin sees all
CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT USING (
        is_active = true OR public.is_admin()
    );

CREATE POLICY "products_admin_insert" ON public.products
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update" ON public.products
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "products_admin_delete" ON public.products
    FOR DELETE USING (public.is_admin());

-- CUSTOMER-SPECIFIC PRICES POLICIES
-- A customer can only see their own custom pricing; admin sees all
CREATE POLICY "customer_prices_select_policy" ON public.customer_prices
    FOR SELECT USING (
        public.is_admin() OR customer_id = public.current_profile_id()
    );

CREATE POLICY "customer_prices_admin_insert" ON public.customer_prices
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "customer_prices_admin_update" ON public.customer_prices
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "customer_prices_admin_delete" ON public.customer_prices
    FOR DELETE USING (public.is_admin());

-- BULK PRICES POLICIES
-- Tiered bulk discounts visible to all authenticated customers
CREATE POLICY "bulk_prices_select_policy" ON public.bulk_prices
    FOR SELECT USING (true);

CREATE POLICY "bulk_prices_admin_insert" ON public.bulk_prices
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "bulk_prices_admin_update" ON public.bulk_prices
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "bulk_prices_admin_delete" ON public.bulk_prices
    FOR DELETE USING (public.is_admin());

-- ORDERS POLICIES
-- Admin can view all orders; customers can view only their own orders
CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (
        public.is_admin() OR customer_id = public.current_profile_id()
    );

-- Customers can create orders for themselves; admin can create for anyone
CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (
        public.is_admin() OR customer_id = public.current_profile_id()
    );

-- Customers can only cancel their own pending orders; admins have full update power
CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (
        public.is_admin() OR (
            customer_id = public.current_profile_id() 
            AND order_status = 'pending'
        )
    );

CREATE POLICY "orders_delete_policy" ON public.orders
    FOR DELETE USING (public.is_admin());

-- ORDER ITEMS POLICIES
CREATE POLICY "order_items_select_policy" ON public.order_items
    FOR SELECT USING (
        public.is_admin() OR EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.customer_id = public.current_profile_id()
        )
    );

CREATE POLICY "order_items_insert_policy" ON public.order_items
    FOR INSERT WITH CHECK (
        public.is_admin() OR EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.customer_id = public.current_profile_id()
        )
    );

CREATE POLICY "order_items_admin_update" ON public.order_items
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "order_items_admin_delete" ON public.order_items
    FOR DELETE USING (public.is_admin());

-- 15. SUPABASE STORAGE BUCKET CONFIGURATION
-- Inserts the 'product-images' bucket into storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'product-images'
CREATE POLICY "product_images_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND public.is_admin()
    );

CREATE POLICY "product_images_admin_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND public.is_admin()
    );

CREATE POLICY "product_images_admin_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND public.is_admin()
    );
