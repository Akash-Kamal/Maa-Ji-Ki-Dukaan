-- ==============================================================================
-- MAA JI KI DUKAAN - INVENTORY & ORDER TRANSACTIONAL RPCs
-- 20261001030000_inventory_order_rpc.sql
-- Enforces row-locking, idempotency, audit trail & reservation/deduction safety
-- ==============================================================================

-- 1. TRANSACTIONAL INVENTORY ADJUSTMENT FUNCTION
CREATE OR REPLACE FUNCTION public.adjust_variant_stock(
    p_variant_id UUID,
    p_adjustment INTEGER,
    p_reason TEXT,
    p_admin_id UUID DEFAULT NULL,
    p_admin_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_variant RECORD;
    v_old_stock INTEGER;
    v_new_stock INTEGER;
    v_movement_id UUID;
BEGIN
    -- Row lock variant to prevent concurrent race condition
    SELECT * INTO v_variant 
    FROM public.product_variants 
    WHERE id = p_variant_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant not found with ID %', p_variant_id;
    END IF;

    v_old_stock := v_variant.stock_cases;
    v_new_stock := v_old_stock + p_adjustment;

    IF v_new_stock < 0 THEN
        RAISE EXCEPTION 'Stock adjustment rejected: stock cannot become negative (current: %, adjustment: %)', v_old_stock, p_adjustment;
    END IF;

    -- Update variant stock
    UPDATE public.product_variants
    SET stock_cases = v_new_stock,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_variant_id;

    -- Log movement
    INSERT INTO public.inventory_movements (
        product_id,
        variant_id,
        previous_stock,
        adjustment,
        new_stock,
        reason,
        admin_id,
        admin_email,
        created_at
    )
    VALUES (
        v_variant.product_id::TEXT,
        p_variant_id::TEXT,
        v_old_stock,
        p_adjustment,
        v_new_stock,
        p_reason,
        p_admin_id,
        p_admin_email,
        timezone('utc'::text, now())
    )
    RETURNING id INTO v_movement_id;

    -- Log admin audit trail
    INSERT INTO public.admin_audit_logs (
        admin_id,
        admin_email,
        action,
        entity,
        entity_id,
        previous_value,
        new_value,
        created_at
    )
    VALUES (
        p_admin_id,
        COALESCE(p_admin_email, 'system'),
        'STOCK_ADJUST',
        'product_variant',
        p_variant_id::TEXT,
        jsonb_build_object('stock_cases', v_old_stock),
        jsonb_build_object('stock_cases', v_new_stock, 'adjustment', p_adjustment, 'reason', p_reason),
        timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'variant_id', p_variant_id,
        'previous_stock', v_old_stock,
        'adjustment', p_adjustment,
        'new_stock', v_new_stock,
        'movement_id', v_movement_id
    );
END;
$$;


-- 2. TRANSACTIONAL ORDER STATUS TRANSITION FUNCTION
-- Workflow: pending -> confirmed -> packing -> dispatched -> delivered (or cancelled)
-- Invariants:
-- - Confirmed/Packing: reserves cases.
-- - Dispatched: deducts physical stock exactly once and releases reservation.
-- - Delivered: never deducts stock again (idempotent).
-- - Cancelled: releases reservation if not yet dispatched, or restores stock if already dispatched.
-- - Repeated transitions to same status: no-op (idempotent).
CREATE OR REPLACE FUNCTION public.transition_order_status(
    p_order_id UUID,
    p_new_status TEXT,
    p_admin_id UUID DEFAULT NULL,
    p_admin_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_old_status TEXT;
    v_was_reserved BOOLEAN;
    v_is_reserved BOOLEAN;
    v_was_deducted BOOLEAN;
    v_is_deducted BOOLEAN;
    v_variant RECORD;
BEGIN
    -- Lock order row
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found with ID %', p_order_id;
    END IF;

    v_old_status := v_order.order_status;

    -- Idempotent check: if target status is the same as current status, return early
    IF v_old_status = p_new_status THEN
        RETURN jsonb_build_object(
            'success', true,
            'idempotent', true,
            'order_id', p_order_id,
            'status', p_new_status,
            'message', 'Status is already ' || p_new_status
        );
    END IF;

    -- Define state flags
    v_was_reserved := (v_old_status IN ('confirmed', 'packing'));
    v_is_reserved  := (p_new_status IN ('confirmed', 'packing'));
    v_was_deducted := (v_old_status IN ('dispatched', 'out_for_delivery', 'delivered'));
    v_is_deducted  := (p_new_status IN ('dispatched', 'out_for_delivery', 'delivered'));

    -- Process Inventory Effects based on transitions
    FOR v_item IN 
        SELECT oi.*, COALESCE(oi.quantity_cases, oi.quantity) AS qty
        FROM public.order_items oi
        WHERE oi.order_id = p_order_id
    LOOP
        IF v_item.variant_id IS NOT NULL THEN
            -- Lock variant row
            SELECT * INTO v_variant
            FROM public.product_variants
            WHERE id = v_item.variant_id
            FOR UPDATE;

            IF FOUND THEN
                -- Case 1: Entering reservation from non-reserved/non-deducted state (e.g. pending -> confirmed)
                IF NOT v_was_reserved AND NOT v_was_deducted AND v_is_reserved THEN
                    UPDATE public.product_variants
                    SET reserved_cases = reserved_cases + v_item.qty,
                        updated_at = timezone('utc'::text, now())
                    WHERE id = v_item.variant_id;

                -- Case 2: Moving from reserved to deducted (e.g. confirmed/packing -> dispatched)
                ELSIF v_was_reserved AND v_is_deducted THEN
                    UPDATE public.product_variants
                    SET stock_cases = GREATEST(0, stock_cases - v_item.qty),
                        reserved_cases = GREATEST(0, reserved_cases - v_item.qty),
                        updated_at = timezone('utc'::text, now())
                    WHERE id = v_item.variant_id;

                    -- Record inventory movement
                    INSERT INTO public.inventory_movements (
                        product_id, variant_id, previous_stock, adjustment, new_stock, reason, admin_id, admin_email, created_at
                    ) VALUES (
                        v_variant.product_id::TEXT, v_item.variant_id::TEXT, v_variant.stock_cases, -v_item.qty,
                        GREATEST(0, v_variant.stock_cases - v_item.qty),
                        'Order dispatched ' || v_order.order_number,
                        p_admin_id, p_admin_email, timezone('utc'::text, now())
                    );

                -- Case 3: Moving directly from pending to deducted (e.g. pending -> dispatched)
                ELSIF NOT v_was_reserved AND NOT v_was_deducted AND v_is_deducted THEN
                    UPDATE public.product_variants
                    SET stock_cases = GREATEST(0, stock_cases - v_item.qty),
                        updated_at = timezone('utc'::text, now())
                    WHERE id = v_item.variant_id;

                    INSERT INTO public.inventory_movements (
                        product_id, variant_id, previous_stock, adjustment, new_stock, reason, admin_id, admin_email, created_at
                    ) VALUES (
                        v_variant.product_id::TEXT, v_item.variant_id::TEXT, v_variant.stock_cases, -v_item.qty,
                        GREATEST(0, v_variant.stock_cases - v_item.qty),
                        'Order dispatched direct ' || v_order.order_number,
                        p_admin_id, p_admin_email, timezone('utc'::text, now())
                    );

                -- Case 4: Moving from reserved to cancelled (release reservation)
                ELSIF v_was_reserved AND p_new_status = 'cancelled' THEN
                    UPDATE public.product_variants
                    SET reserved_cases = GREATEST(0, reserved_cases - v_item.qty),
                        updated_at = timezone('utc'::text, now())
                    WHERE id = v_item.variant_id;

                -- Case 5: Moving from deducted to cancelled (restoration of stock)
                ELSIF v_was_deducted AND p_new_status = 'cancelled' THEN
                    UPDATE public.product_variants
                    SET stock_cases = stock_cases + v_item.qty,
                        updated_at = timezone('utc'::text, now())
                    WHERE id = v_item.variant_id;

                    INSERT INTO public.inventory_movements (
                        product_id, variant_id, previous_stock, adjustment, new_stock, reason, admin_id, admin_email, created_at
                    ) VALUES (
                        v_variant.product_id::TEXT, v_item.variant_id::TEXT, v_variant.stock_cases, v_item.qty,
                        v_variant.stock_cases + v_item.qty,
                        'Order cancelled restock ' || v_order.order_number,
                        p_admin_id, p_admin_email, timezone('utc'::text, now())
                    );

                -- Case 6: Moving from cancelled back to confirmed (re-reserve)
                ELSIF v_old_status = 'cancelled' AND v_is_reserved THEN
                    UPDATE public.product_variants
                    SET reserved_cases = reserved_cases + v_item.qty,
                        updated_at = timezone('utc'::text, now())
                    WHERE id = v_item.variant_id;

                -- NOTE: dispatched -> delivered has (v_was_deducted = true AND v_is_deducted = true)
                -- so it performs ZERO extra deduction. Stock is deducted exactly once!
                END IF;
            END IF;
        END IF;
    END LOOP;

    -- Update order status
    UPDATE public.orders
    SET order_status = p_new_status,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;

    -- Log admin audit trail
    INSERT INTO public.admin_audit_logs (
        admin_id,
        admin_email,
        action,
        entity,
        entity_id,
        previous_value,
        new_value,
        created_at
    )
    VALUES (
        p_admin_id,
        COALESCE(p_admin_email, 'system'),
        'ORDER_STATUS_CHANGE',
        'orders',
        p_order_id::TEXT,
        jsonb_build_object('order_status', v_old_status),
        jsonb_build_object('order_status', p_new_status),
        timezone('utc'::text, now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'previous_status', v_old_status,
        'new_status', p_new_status
    );
END;
$$;
