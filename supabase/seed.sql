-- ==============================================================================
-- MAA JI KI DUKAAN - PHASE 2 & 5 SEED DATA
-- supabase/seed.sql
-- Hierarchy: Category -> Brand -> Product -> Variant
-- Strict Wholesale Case Pricing: price_per_case & pieces_per_case
-- ==============================================================================

-- 1. MASTER CATEGORIES
INSERT INTO public.categories (id, name, slug, sort_order, is_active)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Energy Drinks', 'energy-drinks', 1, true),
    ('c0000000-0000-0000-0000-000000000002', 'Soft Drinks', 'soft-drinks', 2, true),
    ('c0000000-0000-0000-0000-000000000003', 'Water', 'water', 3, true),
    ('c0000000-0000-0000-0000-000000000004', 'Juices', 'juices', 4, true),
    ('c0000000-0000-0000-0000-000000000005', 'Sports Drinks', 'sports-drinks', 5, true),
    ('c0000000-0000-0000-0000-000000000006', 'Soda', 'soda', 6, true),
    ('c0000000-0000-0000-0000-000000000007', 'Other Beverages', 'other-beverages', 7, true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

-- 2. MASTER BRANDS
INSERT INTO public.brands (id, name, description, is_active)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Red Bull', 'Red Bull GmbH energy beverage portfolio', true),
    ('b0000000-0000-0000-0000-000000000002', 'Hell Energy', 'Hell Energy European beverage brand', true),
    ('b0000000-0000-0000-0000-000000000003', 'Predator', 'Monster Beverage Corporation energy brand', true),
    ('b0000000-0000-0000-0000-000000000004', 'Monster', 'Monster Energy Company', true),
    ('b0000000-0000-0000-0000-000000000005', 'Coca-Cola', 'The Coca-Cola Company sparkling beverage portfolio', true),
    ('b0000000-0000-0000-0000-000000000006', 'PepsiCo', 'PepsiCo Beverages portfolio', true),
    ('b0000000-0000-0000-0000-000000000007', 'Creambell', 'Creambell dairy and traditional flavored drinks', true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description;

-- 3. MASTER PRODUCTS (1 Product per Beverage Lineup)
INSERT INTO public.products (id, brand_id, category_id, name, slug, description, is_active)
VALUES
    -- Energy Drinks
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Red Bull Energy Drink', 'red-bull', 'Original Red Bull Energy Drink wholesale case packs.', true),
    ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Hell Energy Classic', 'hell-energy', 'Hell Energy Classic European formulation wholesale cases.', true),
    ('a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Predator Energy Drink', 'predator', 'Predator Energy Drink. Rate and pack awaiting admin confirmation.', true),
    ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Monster Energy Drink', 'monster', 'Monster Energy Drink. Rate and pack awaiting admin confirmation.', true),

    -- Coca-Cola Products
    ('a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Coke', 'coke', 'Coca-Cola sparkling cola beverage wholesale cases.', true),
    ('a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Limca', 'limca', 'Limca fresh lemon-lime sparkling beverage wholesale cases.', true),
    ('a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Thums Up', 'thums-up', 'Thums Up strong taste carbonated beverage wholesale cases.', true),
    ('a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Sprite', 'sprite', 'Sprite clear crisp lemon-lime sparkling beverage wholesale cases.', true),
    ('a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Fanta', 'fanta', 'Fanta sparkling orange beverage wholesale cases.', true),

    -- PepsiCo Products
    ('a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'Pepsi', 'pepsi', 'Pepsi cola sparkling drink wholesale cases.', true),
    ('a0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'Mirinda', 'mirinda', 'Mirinda tangy orange sparkling drink wholesale cases.', true),
    ('a0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'Mountain Dew', 'mountain-dew', 'Mountain Dew high-energy citrus sparkling drink wholesale cases.', true),
    ('a0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000004', '7UP Nimbooz', '7up-nimbooz', '7UP Nimbooz real lemon juice drink wholesale cases.', true),
    ('a0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'Sting', 'sting', 'Sting Energy Drink wholesale case packs.', true),

    -- Creambell Products
    ('a0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000007', 'Creambell Kesar Badam', 'creambell-kesar-badam', 'Creambell Kesar Badam rich flavored beverage wholesale cases.', true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 4. CONFIRMED PRODUCT VARIANTS (Hierarchy: Product -> Variant)
-- Rule: price_per_case and pieces_per_case are strictly case-based.
-- Do NOT invent unconfirmed prices; leave as NULL with needs_review = true.
INSERT INTO public.product_variants (
    id, product_id, variant_name, slug, size, packaging_type, pieces_per_case, price_per_case, stock_cases, needs_review, is_active
)
VALUES
    -- COKE VARIANTS
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', '250ml', 'coke-250ml', '250ml', 'bottle', 30, 600.00, 50, false, true),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', '750ml', 'coke-750ml', '750ml', 'bottle', 24, 960.00, 40, false, true),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', '1L',    'coke-1l',    '1L',    'bottle', 15, 750.00, 30, false, true),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', '2L',    'coke-2l',    '2L',    'bottle', 9,  900.00, 25, false, true),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Can 180ml', 'coke-can-180ml', '180ml', 'can', 36, 1080.00, 20, false, true),
    ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'Can 330ml', 'coke-can-330ml', '330ml', 'can', 24, 1200.00, 20, false, true),

    -- LIMCA VARIANTS
    ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000006', '250ml', 'limca-250ml', '250ml', 'bottle', 30, 600.00, 40, false, true),
    ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000006', '750ml', 'limca-750ml', '750ml', 'bottle', 24, 960.00, 30, false, true),
    ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000006', '1L',    'limca-1l',    '1L',    'bottle', 15, 750.00, 25, false, true),
    ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000006', '2L',    'limca-2l',    '2L',    'bottle', 9,  900.00, 20, false, true),
    ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006', 'Can 180ml', 'limca-can-180ml', '180ml', 'can', 36, 1080.00, 15, false, true),
    ('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000006', 'Can 330ml', 'limca-can-330ml', '330ml', 'can', 24, 1200.00, 15, false, true),

    -- THUMS UP VARIANTS
    ('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000007', '250ml', 'thums-up-250ml', '250ml', 'bottle', 30, 600.00, 50, false, true),
    ('d0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000007', '750ml', 'thums-up-750ml', '750ml', 'bottle', 24, 960.00, 40, false, true),
    ('d0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000007', '1L',    'thums-up-1l',    '1L',    'bottle', 15, 750.00, 30, false, true),
    ('d0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000007', '2L',    'thums-up-2l',    '2L',    'bottle', 9,  900.00, 25, false, true),
    ('d0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000007', 'Can 180ml', 'thums-up-can-180ml', '180ml', 'can', 36, 1080.00, 20, false, true),
    ('d0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000007', 'Can 330ml', 'thums-up-can-330ml', '330ml', 'can', 24, 1200.00, 20, false, true),

    -- SPRITE VARIANTS
    ('d0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000008', '250ml', 'sprite-250ml', '250ml', 'bottle', 30, 600.00, 45, false, true),
    ('d0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000008', '750ml', 'sprite-750ml', '750ml', 'bottle', 24, 960.00, 35, false, true),
    ('d0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000008', '1L',    'sprite-1l',    '1L',    'bottle', 15, 750.00, 30, false, true),
    ('d0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000008', '2L',    'sprite-2l',    '2L',    'bottle', 9,  900.00, 25, false, true),
    ('d0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000008', 'Can 180ml', 'sprite-can-180ml', '180ml', 'can', 36, 1080.00, 15, false, true),
    ('d0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000008', 'Can 330ml', 'sprite-can-330ml', '330ml', 'can', 24, 1200.00, 15, false, true),

    -- FANTA VARIANTS
    ('d0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000009', '250ml', 'fanta-250ml', '250ml', 'bottle', 30, 600.00, 35, false, true),
    ('d0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000009', '750ml', 'fanta-750ml', '750ml', 'bottle', 24, 960.00, 25, false, true),
    ('d0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000009', '1L',    'fanta-1l',    '1L',    'bottle', 15, 750.00, 20, false, true),
    ('d0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000009', '2L',    'fanta-2l',    '2L',    'bottle', 9,  900.00, 15, false, true),
    ('d0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000009', 'Can 180ml', 'fanta-can-180ml', '180ml', 'can', 36, 1080.00, 10, false, true),
    ('d0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000009', 'Can 330ml', 'fanta-can-330ml', '330ml', 'can', 24, 1200.00, 10, false, true),

    -- PEPSI VARIANTS
    ('d0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000010', '400ml', 'pepsi-400ml', '400ml', 'bottle', 30, 600.00, 40, false, true),
    ('d0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000010', '750ml', 'pepsi-750ml', '750ml', 'bottle', 24, 960.00, 30, false, true),
    ('d0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000010', '2L',    'pepsi-2l',    '2L',    'bottle', 9,  891.00, 20, false, true),

    -- MIRINDA VARIANTS (400ml confirmed, 750ml and 2L awaiting prices)
    ('d0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000011', '400ml', 'mirinda-400ml', '400ml', 'bottle', 30, 600.00, 30, false, true),
    ('d0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000011', '750ml', 'mirinda-750ml', '750ml', 'bottle', 24, NULL, 0, true, true),
    ('d0000000-0000-0000-0000-000000000036', 'a0000000-0000-0000-0000-000000000011', '2L',    'mirinda-2l',    '2L',    'bottle', 9,  NULL, 0, true, true),

    -- MOUNTAIN DEW VARIANTS (400ml confirmed, 750ml and 2L awaiting prices)
    ('d0000000-0000-0000-0000-000000000037', 'a0000000-0000-0000-0000-000000000012', '400ml', 'mountain-dew-400ml', '400ml', 'bottle', 30, 600.00, 35, false, true),
    ('d0000000-0000-0000-0000-000000000038', 'a0000000-0000-0000-0000-000000000012', '750ml', 'mountain-dew-750ml', '750ml', 'bottle', 24, NULL, 0, true, true),
    ('d0000000-0000-0000-0000-000000000039', 'a0000000-0000-0000-0000-000000000012', '2L',    'mountain-dew-2l',    '2L',    'bottle', 9,  NULL, 0, true, true),

    -- 7UP NIMBOOZ
    ('d0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000013', '350ml', '7up-nimbooz-350ml', '350ml', 'bottle', 30, 600.00, 30, false, true),

    -- STING ENERGY
    ('d0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000014', '250ml', 'sting-250ml', '250ml', 'bottle', 30, 600.00, 50, false, true),

    -- CREAMBELL KESAR BADAM
    ('d0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000015', '180ml', 'creambell-kesar-badam-180ml', '180ml', 'bottle', 30, 600.00, 25, false, true),

    -- RED BULL ENERGY DRINK
    ('d0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000001', '250ml', 'red-bull-250ml', '250ml', 'can', 24, 3000.00, 100, false, true),

    -- HELL ENERGY CLASSIC
    ('d0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000002', '250ml', 'hell-energy-classic-250ml', '250ml', 'can', 24, 1440.00, 80, false, true),

    -- PREDATOR (Price & Pack Needs Review)
    ('d0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000003', 'Standard', 'predator-standard', NULL, 'can', NULL, NULL, 0, true, true),

    -- MONSTER (Price & Pack Needs Review)
    ('d0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000004', 'Standard', 'monster-standard', NULL, 'can', NULL, NULL, 0, true, true)
ON CONFLICT (slug) DO UPDATE SET
    variant_name = EXCLUDED.variant_name,
    pieces_per_case = EXCLUDED.pieces_per_case,
    price_per_case = EXCLUDED.price_per_case,
    needs_review = EXCLUDED.needs_review;

-- 5. BULK PRICING TIERS FOR RED BULL (Case Quantity Thresholds)
-- 1-4 cases -> ₹3,000 / case
-- 5+ cases -> ₹2,950 / case
-- 10+ cases -> ₹2,900 / case
INSERT INTO public.bulk_prices (product_id, variant_id, minimum_quantity, price_per_case)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000043', 5, 2950.00),
    ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000043', 10, 2900.00)
ON CONFLICT (product_id, minimum_quantity) DO UPDATE SET
    price_per_case = EXCLUDED.price_per_case;
