-- ==============================================================================
-- MAA JI KI DUKAAN - PHASE 2 MIGRATION
-- 20261001010000_product_variants.sql
-- Hierarchy: Category -> Brand -> Product -> Variant / Size
-- Canonical Wholesale Terminology: price_per_case, pieces_per_case, stock_cases
-- ==============================================================================

-- 1. Add canonical column price_per_case to products if not exists
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price_per_case NUMERIC(10, 2);

-- Sync price_per_case from existing base_price
UPDATE public.products 
SET price_per_case = base_price 
WHERE price_per_case IS NULL AND base_price IS NOT NULL;

-- 2. CREATE PRODUCT_VARIANTS TABLE
-- Primary wholesale entity representing a specific size/can/bottle pack
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    variant_name TEXT NOT NULL, -- e.g. '250ml', '750ml', '1L', '2L', 'Can 180ml', 'Can 330ml'
    slug TEXT NOT NULL UNIQUE,
    size TEXT, -- e.g. '250ml', '750ml', '1L'
    packaging_type TEXT NOT NULL DEFAULT 'bottle' CHECK (packaging_type IN ('bottle', 'can', 'carton_case', 'tetrapack', 'other')),
    pieces_per_case INTEGER CHECK (pieces_per_case IS NULL OR pieces_per_case >= 1),
    price_per_case NUMERIC(10, 2) CHECK (price_per_case IS NULL OR price_per_case >= 0),
    stock_cases INTEGER NOT NULL DEFAULT 0 CHECK (stock_cases >= 0),
    reserved_cases INTEGER NOT NULL DEFAULT 0 CHECK (reserved_cases >= 0),
    reorder_level_cases INTEGER NOT NULL DEFAULT 10 CHECK (reorder_level_cases >= 0),
    needs_review BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_product_variant UNIQUE (product_id, variant_name)
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_slug ON public.product_variants(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON public.product_variants(is_active);

-- 4. ATTACH AUTOMATIC UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS set_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER set_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. ROW LEVEL SECURITY (RLS) FOR PRODUCT_VARIANTS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_variants_select_policy" ON public.product_variants
    FOR SELECT USING (
        is_active = true OR public.is_admin()
    );

CREATE POLICY "product_variants_admin_insert" ON public.product_variants
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "product_variants_admin_update" ON public.product_variants
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "product_variants_admin_delete" ON public.product_variants
    FOR DELETE USING (public.is_admin());

-- 6. EXTEND ORDER_ITEMS WITH VARIANT AND CANONICAL CASE SNAPSHOTS
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS variant_snapshot TEXT,
ADD COLUMN IF NOT EXISTS price_per_case_snapshot NUMERIC(10, 2);

-- 7. EXTEND CUSTOMER_PRICES & BULK_PRICES FOR VARIANT SUPPORT
ALTER TABLE public.customer_prices
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS price_per_case NUMERIC(10, 2);

ALTER TABLE public.bulk_prices
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE;
