-- ==============================================================================
-- MAA JI KI DUKAAN - PHASE 4 ADMIN OPERATIONS MIGRATION
-- Tables: inventory_movements, admin_audit_logs, business_settings
-- Security: Strict Admin-Only Row Level Security
-- ==============================================================================

-- 1. INVENTORY MOVEMENTS (Stock adjustments audit trail)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    variant_id TEXT NOT NULL,
    previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
    adjustment INTEGER NOT NULL,
    new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
    reason TEXT NOT NULL,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. ADMIN AUDIT LOGS (Operational change tracking)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL, -- e.g. "PRICE_CHANGE", "PRODUCT_CREATE", "STOCK_ADJUST", "STATUS_CHANGE"
    entity TEXT NOT NULL, -- e.g. "product", "variant", "order", "customer_price"
    entity_id TEXT NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. BUSINESS SETTINGS
CREATE TABLE IF NOT EXISTS public.business_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    business_name TEXT NOT NULL DEFAULT 'Maa Ji Ki Dukaan',
    tagline TEXT NOT NULL DEFAULT 'Wholesale Shopping. Made Simple.',
    contact_phone TEXT NOT NULL DEFAULT '+91 98112 34567',
    email TEXT NOT NULL DEFAULT 'wholesale@maajikidukaan.com',
    address TEXT NOT NULL DEFAULT 'Plot 12, Main Market, Sector 7, New Delhi, 110075',
    gstin TEXT DEFAULT '07AAAAA0000A1Z5',
    minimum_order_cases INTEGER NOT NULL DEFAULT 1 CHECK (minimum_order_cases >= 1),
    delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (delivery_charge >= 0),
    allowed_payment_methods TEXT[] NOT NULL DEFAULT ARRAY['cash_on_delivery', 'credit', 'bank_transfer', 'upi'],
    show_inactive_products BOOLEAN NOT NULL DEFAULT false,
    price_on_request_badge TEXT NOT NULL DEFAULT 'Price on Request',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed initial business settings if not present
INSERT INTO public.business_settings (id, business_name, tagline, contact_phone, email, address, gstin)
VALUES (
    'default',
    'Maa Ji Ki Dukaan',
    'Wholesale Shopping. Made Simple.',
    '+91 98112 34567',
    'wholesale@maajikidukaan.com',
    'Plot 12, Main Market, Sector 7, New Delhi, 110075',
    '07AAAAA0000A1Z5'
) ON CONFLICT (id) DO NOTHING;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users with admin role in public.profiles can read/write inventory movements
CREATE POLICY "Admins full access to inventory movements"
ON public.inventory_movements
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.auth_user_id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
);

-- Only authenticated admins can read/write audit logs
CREATE POLICY "Admins full access to audit logs"
ON public.admin_audit_logs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.auth_user_id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
);

-- Public can read business settings, only admins can modify
CREATE POLICY "Public read business settings"
ON public.business_settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins modify business settings"
ON public.business_settings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.auth_user_id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
);
