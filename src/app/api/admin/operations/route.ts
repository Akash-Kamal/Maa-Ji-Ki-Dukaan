import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import type { Profile } from "@/types";

/**
 * Helper to authenticate and authorize admin server-side
 */
async function getAuthenticatedAdmin(request?: Request): Promise<{
  supabase: any;
  user: any;
  profile: Profile | null;
  error: string | null;
}> {
  const supabase = await createClient();
  let user = null;

  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) user = data.user;
    }
  }

  if (!user) {
    const {
      data: { user: cookieUser },
      error: authErr,
    } = await supabase.auth.getUser();
    if (!authErr && cookieUser) {
      user = cookieUser;
    }
  }

  if (!user) {
    return { supabase, user: null, profile: null, error: "Unauthorized: Authentication required." };
  }

  const adminDb = createAdminClient();
  const { data: profileData, error: profErr } = await adminDb
    .from("profiles")
    .select("id, email, role, is_active, business_name, auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const profile = profileData as unknown as Profile | null;

  if (profErr || !profile || profile.role !== "admin" || !profile.is_active) {
    return {
      supabase,
      user,
      profile: null,
      error: "Forbidden: You do not possess active central administrator credentials.",
    };
  }

  return { supabase, user, profile, error: null };
}

/**
 * GET /api/admin/operations
 * Returns full administrative state from Supabase PostgreSQL
 */
export async function GET(request: Request) {
  const { supabase, profile, error } = await getAuthenticatedAdmin(request);
  if (error || !profile) {
    return NextResponse.json({ error }, { status: error?.includes("Unauthorized") ? 401 : 403 });
  }

  try {
    const adminDb = createAdminClient();
    const [
      productsRes,
      categoriesRes,
      brandsRes,
      ordersRes,
      customersRes,
      bulkPricesRes,
      customerPricesRes,
      movementsRes,
      auditLogsRes,
      settingsRes,
    ] = await Promise.all([
      adminDb
        .from("products")
        .select(`
          *,
          brand:brands(*),
          category:categories(*),
          variants:product_variants(*),
          bulk_prices(*)
        `)
        .order("name"),
      adminDb.from("categories").select("*").order("sort_order", { ascending: true }),
      adminDb.from("brands").select("*").order("name", { ascending: true }),
      adminDb
        .from("orders")
        .select(`
          *,
          customer:profiles(*),
          items:order_items(*)
        `)
        .order("created_at", { ascending: false }),
      adminDb.from("profiles").select("*").order("business_name", { ascending: true }),
      adminDb.from("bulk_prices").select("*").order("minimum_quantity", { ascending: true }),
      adminDb.from("customer_prices").select("*").order("created_at", { ascending: false }),
      adminDb.from("inventory_movements").select("*").order("created_at", { ascending: false }).limit(100),
      adminDb.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(100),
      adminDb.from("business_settings").select("*").eq("id", "default").single(),
    ]);

    if (productsRes.error) throw productsRes.error;

    // Transform products with canonical wholesale fields
    const products = (productsRes.data || []).map((p: any) => {
      const variants = (p.variants || []).sort(
        (a: any, b: any) => (a.price_per_case || 0) - (b.price_per_case || 0)
      );
      const firstConfirmed = variants.find((v: any) => v.price_per_case !== null && v.price_per_case !== undefined);
      const primaryVariant = firstConfirmed || variants[0];
      const totalStock = variants.reduce((acc: number, v: any) => acc + (v.stock_cases || 0), 0);

      return {
        ...p,
        size: primaryVariant?.size ?? p.size ?? null,
        pieces_per_case: primaryVariant?.pieces_per_case ?? p.pieces_per_case ?? null,
        base_price: primaryVariant?.price_per_case ?? p.base_price ?? null,
        price_per_case: primaryVariant?.price_per_case ?? p.price_per_case ?? null,
        stock_cases: totalStock,
        variants,
      };
    });

    return NextResponse.json({
      success: true,
      products,
      categories: categoriesRes.data || [],
      brands: brandsRes.data || [],
      orders: ordersRes.data || [],
      customers: customersRes.data || [],
      bulk_prices: bulkPricesRes.data || [],
      customer_prices: customerPricesRes.data || [],
      inventory_movements: movementsRes.data || [],
      admin_audit_logs: auditLogsRes.data || [],
      settings: settingsRes.data || null,
    });
  } catch (err: any) {
    console.error("Admin operations GET query error:", err);
    return NextResponse.json(
      { error: "Failed to load database records: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/operations
 * Performs transactional administrative mutations on Supabase PostgreSQL
 */
export async function POST(request: Request) {
  const { supabase, user, profile, error } = await getAuthenticatedAdmin(request);
  if (error || !profile) {
    return NextResponse.json({ error }, { status: error?.includes("Unauthorized") ? 401 : 403 });
  }

  try {
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      // --------------------------------------------------------------------------
      // 1. PRODUCTS & VARIANTS
      // --------------------------------------------------------------------------
      case "SAVE_PRODUCT": {
        const { product, variants } = payload;
        if (!product || !product.name || !product.slug) {
          return NextResponse.json({ error: "Product name and slug are required." }, { status: 400 });
        }

        // Fetch previous value for audit log
        let prevProduct = null;
        if (product.id) {
          const { data } = await supabase.from("products").select("*").eq("id", product.id).single();
          prevProduct = data;
        }

        // Upsert product
        const { data: savedProd, error: prodErr } = await supabase
          .from("products")
          .upsert({
            ...(product.id ? { id: product.id } : {}),
            brand_id: product.brand_id || null,
            category_id: product.category_id || null,
            name: product.name,
            slug: product.slug,
            description: product.description || null,
            product_image_url: product.product_image_url || null,
            is_active: product.is_active ?? true,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (prodErr || !savedProd) throw prodErr;

        // Upsert variants if provided
        if (variants && Array.isArray(variants)) {
          for (const v of variants) {
            await supabase.from("product_variants").upsert({
              ...(v.id && !v.id.startsWith("v-") ? { id: v.id } : {}),
              product_id: savedProd.id,
              variant_name: v.variant_name,
              slug: v.slug || `${savedProd.slug}-${v.variant_name.toLowerCase().replace(/\s+/g, "-")}`,
              size: v.size || null,
              packaging_type: v.packaging_type || "bottle",
              pieces_per_case: v.pieces_per_case || null,
              price_per_case: v.price_per_case ?? null,
              stock_cases: v.stock_cases ?? 0,
              reserved_cases: v.reserved_cases ?? 0,
              reorder_level_cases: v.reorder_level_cases ?? 10,
              needs_review: v.needs_review ?? false,
              is_active: v.is_active ?? true,
              updated_at: new Date().toISOString(),
            });
          }
        }

        // Log audit trail
        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          admin_email: profile.email,
          action: prevProduct ? "PRODUCT_UPDATE" : "PRODUCT_CREATE",
          entity: "products",
          entity_id: savedProd.id,
          previous_value: prevProduct,
          new_value: savedProd,
        });

        return NextResponse.json({ success: true, product: savedProd });
      }

      case "SAVE_VARIANT": {
        const { productId, variant } = payload;
        if (!productId || !variant) {
          return NextResponse.json({ error: "Missing productId or variant." }, { status: 400 });
        }

        let prevVariant = null;
        if (variant.id && !variant.id.startsWith("v-")) {
          const { data } = await supabase
            .from("product_variants")
            .select("*")
            .eq("id", variant.id)
            .single();
          prevVariant = data;
        }

        const { data: savedVar, error: varErr } = await supabase
          .from("product_variants")
          .upsert({
            ...(variant.id && !variant.id.startsWith("v-") ? { id: variant.id } : {}),
            product_id: productId,
            variant_name: variant.variant_name,
            slug: variant.slug,
            size: variant.size || null,
            packaging_type: variant.packaging_type || "bottle",
            pieces_per_case: variant.pieces_per_case || null,
            price_per_case: variant.price_per_case ?? null,
            stock_cases: variant.stock_cases ?? 0,
            reserved_cases: variant.reserved_cases ?? 0,
            reorder_level_cases: variant.reorder_level_cases ?? 10,
            needs_review: variant.needs_review ?? false,
            is_active: variant.is_active ?? true,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (varErr || !savedVar) throw varErr;

        // Log audit trail
        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          admin_email: profile.email,
          action: prevVariant ? "VARIANT_UPDATE" : "VARIANT_CREATE",
          entity: "product_variants",
          entity_id: savedVar.id,
          previous_value: prevVariant,
          new_value: savedVar,
        });

        return NextResponse.json({ success: true, variant: savedVar });
      }

      case "TOGGLE_PRODUCT_ACTIVE": {
        const { productId } = payload;
        const { data: current } = await supabase.from("products").select("is_active").eq("id", productId).single();
        if (!current) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        const newStatus = !current.is_active;
        await supabase.from("products").update({ is_active: newStatus }).eq("id", productId);

        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          admin_email: profile.email,
          action: newStatus ? "PRODUCT_ACTIVATE" : "PRODUCT_DEACTIVATE",
          entity: "products",
          entity_id: productId,
          previous_value: { is_active: current.is_active },
          new_value: { is_active: newStatus },
        });

        return NextResponse.json({ success: true, is_active: newStatus });
      }

      case "DELETE_PRODUCT": {
        const { productId } = payload;
        // Check if referenced in order_items
        const { data: orderItemRefs } = await supabase
          .from("order_items")
          .select("id")
          .eq("product_id", productId)
          .limit(1);

        if (orderItemRefs && orderItemRefs.length > 0) {
          // Deactivate rather than delete to protect historical order integrity
          await supabase.from("products").update({ is_active: false }).eq("id", productId);
          await supabase.from("product_variants").update({ is_active: false }).eq("product_id", productId);
          return NextResponse.json({
            success: true,
            archived: true,
            message: "Product has historical order references. Safely archived instead of hard-deleted.",
          });
        }

        // Hard delete if no orders exist
        await supabase.from("products").delete().eq("id", productId);
        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          admin_email: profile.email,
          action: "PRODUCT_DELETE",
          entity: "products",
          entity_id: productId,
          previous_value: null,
          new_value: null,
        });

        return NextResponse.json({ success: true, deleted: true });
      }

      // --------------------------------------------------------------------------
      // 2. INVENTORY ADJUSTMENT (TRANSACTIONAL RPC)
      // --------------------------------------------------------------------------
      case "ADJUST_STOCK": {
        const { variantId, adjustment, reason } = payload;
        if (!variantId || adjustment === undefined) {
          return NextResponse.json({ error: "Missing variantId or adjustment amount." }, { status: 400 });
        }

        const { data: rpcResult, error: rpcErr } = await supabase.rpc("adjust_variant_stock", {
          p_variant_id: variantId,
          p_adjustment: Number(adjustment),
          p_reason: reason || "Manual Admin Adjustment",
          p_admin_id: user.id,
          p_admin_email: profile.email,
        });

        if (rpcErr) {
          return NextResponse.json({ error: rpcErr.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, result: rpcResult });
      }

      // --------------------------------------------------------------------------
      // 3. ORDER STATUS (TRANSACTIONAL RPC WITH INVENTORY RESERVATION / DEDUCTION)
      // --------------------------------------------------------------------------
      case "UPDATE_ORDER_STATUS": {
        const orderId = payload?.orderId || body?.orderId;
        const newStatus = payload?.newStatus || body?.newStatus;
        if (!orderId || !newStatus) {
          return NextResponse.json({ error: "Missing orderId or newStatus." }, { status: 400 });
        }

        // Try RPC first
        const { data: rpcResult, error: rpcErr } = await supabase.rpc("transition_order_status", {
          p_order_id: orderId,
          p_new_status: newStatus,
          p_admin_id: user.id,
          p_admin_email: profile.email,
        });

        if (!rpcErr) {
          return NextResponse.json({ success: true, result: rpcResult });
        }

        // If RPC fails (e.g. column mismatch or function missing), execute exact transactional inventory logic via adminDb
        const adminDb = createAdminClient();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
        let orderQuery = (adminDb.from("orders") as any).select("id, order_number, order_status");
        orderQuery = isUuid ? orderQuery.eq("id", orderId) : orderQuery.eq("order_number", orderId);
        const { data: order, error: orderFetchErr } = await orderQuery.single();

        if (orderFetchErr || !order) {
          return NextResponse.json({ error: "Order not found." }, { status: 404 });
        }

        const oldStatus = order.order_status;
        if (oldStatus === newStatus) {
          return NextResponse.json({
            success: true,
            result: { idempotent: true, order_id: orderId, status: newStatus, message: `Status is already ${newStatus}` },
          });
        }

        const wasReserved = ["confirmed", "packing"].includes(oldStatus);
        const isReserved = ["confirmed", "packing"].includes(newStatus);
        const wasDeducted = ["dispatched", "out_for_delivery", "delivered"].includes(oldStatus);
        const isDeducted = ["dispatched", "out_for_delivery", "delivered"].includes(newStatus);

        const { data: orderItems } = await (adminDb.from("order_items") as any)
          .select("id, product_id, variant_id, quantity")
          .eq("order_id", orderId);

        if (orderItems && orderItems.length > 0) {
          for (const item of orderItems) {
            const qty = Number(item.quantity || 0);
            if (qty > 0 && item.variant_id) {
              const { data: variant } = await (adminDb.from("product_variants") as any)
                .select("id, product_id, stock_cases, reserved_cases")
                .eq("id", item.variant_id)
                .single();

              if (variant) {
                const currentStock = Number(variant.stock_cases || 0);
                const currentReserved = Number(variant.reserved_cases || 0);

                if (!wasReserved && !wasDeducted && isReserved) {
                  // Pending -> Confirmed/Packing
                  await (adminDb.from("product_variants") as any)
                    .update({ reserved_cases: currentReserved + qty, updated_at: new Date().toISOString() })
                    .eq("id", item.variant_id);
                } else if (wasReserved && isDeducted) {
                  // Confirmed/Packing -> Dispatched/Delivered
                  const newStock = Math.max(0, currentStock - qty);
                  const newReserved = Math.max(0, currentReserved - qty);
                  await (adminDb.from("product_variants") as any)
                    .update({ stock_cases: newStock, reserved_cases: newReserved, updated_at: new Date().toISOString() })
                    .eq("id", item.variant_id);

                  await (adminDb.from("inventory_movements") as any).insert({
                    product_id: String(variant.product_id),
                    variant_id: String(item.variant_id),
                    previous_stock: currentStock,
                    adjustment: -qty,
                    new_stock: newStock,
                    reason: `Order dispatched ${order.order_number}`,
                    admin_id: user.id,
                    admin_email: profile.email,
                  });
                } else if (!wasReserved && !wasDeducted && isDeducted) {
                  // Direct Pending -> Dispatched
                  const newStock = Math.max(0, currentStock - qty);
                  await (adminDb.from("product_variants") as any)
                    .update({ stock_cases: newStock, updated_at: new Date().toISOString() })
                    .eq("id", item.variant_id);

                  await (adminDb.from("inventory_movements") as any).insert({
                    product_id: String(variant.product_id),
                    variant_id: String(item.variant_id),
                    previous_stock: currentStock,
                    adjustment: -qty,
                    new_stock: newStock,
                    reason: `Order dispatched direct ${order.order_number}`,
                    admin_id: user.id,
                    admin_email: profile.email,
                  });
                } else if (wasReserved && newStatus === "cancelled") {
                  // Confirmed/Packing -> Cancelled (release reservation)
                  const newReserved = Math.max(0, currentReserved - qty);
                  await (adminDb.from("product_variants") as any)
                    .update({ reserved_cases: newReserved, updated_at: new Date().toISOString() })
                    .eq("id", item.variant_id);
                } else if (wasDeducted && newStatus === "cancelled") {
                  // Dispatched/Delivered -> Cancelled (restock)
                  const newStock = currentStock + qty;
                  await (adminDb.from("product_variants") as any)
                    .update({ stock_cases: newStock, updated_at: new Date().toISOString() })
                    .eq("id", item.variant_id);

                  await (adminDb.from("inventory_movements") as any).insert({
                    product_id: String(variant.product_id),
                    variant_id: String(item.variant_id),
                    previous_stock: currentStock,
                    adjustment: qty,
                    new_stock: newStock,
                    reason: `Order cancelled restock ${order.order_number}`,
                    admin_id: user.id,
                    admin_email: profile.email,
                  });
                } else if (oldStatus === "cancelled" && isReserved) {
                  // Cancelled -> Re-confirmed
                  await (adminDb.from("product_variants") as any)
                    .update({ reserved_cases: currentReserved + qty, updated_at: new Date().toISOString() })
                    .eq("id", item.variant_id);
                }
                // When wasDeducted && isDeducted (dispatched -> delivered), zero deduction occurs.
              }
            }
          }
        }

        await (adminDb.from("orders") as any)
          .update({ order_status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", orderId);

        await (adminDb.from("admin_audit_logs") as any).insert({
          admin_id: user.id,
          admin_email: profile.email,
          action: "ORDER_STATUS_UPDATE",
          entity: "orders",
          entity_id: orderId,
          previous_value: { status: oldStatus },
          new_value: { status: newStatus },
        });

        return NextResponse.json({
          success: true,
          result: { order_id: orderId, previous_status: oldStatus, new_status: newStatus },
        });
      }

      // --------------------------------------------------------------------------
      // 4. BULK PRICING
      // --------------------------------------------------------------------------
      case "SAVE_BULK_PRICE": {
        const { bulkPrice } = payload;
        const { data: savedBp, error: bpErr } = await supabase
          .from("bulk_prices")
          .upsert({
            ...(bulkPrice.id && !bulkPrice.id.startsWith("bp-") ? { id: bulkPrice.id } : {}),
            product_id: bulkPrice.product_id,
            variant_id: bulkPrice.variant_id || null,
            minimum_quantity: Number(bulkPrice.minimum_quantity),
            price_per_case: Number(bulkPrice.price_per_case),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (bpErr) throw bpErr;

        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          admin_email: profile.email,
          action: "BULK_PRICE_SAVE",
          entity: "bulk_prices",
          entity_id: savedBp.id,
          previous_value: null,
          new_value: savedBp,
        });

        return NextResponse.json({ success: true, bulk_price: savedBp });
      }

      case "DELETE_BULK_PRICE": {
        const { id } = payload;
        await supabase.from("bulk_prices").delete().eq("id", id);
        return NextResponse.json({ success: true });
      }

      // --------------------------------------------------------------------------
      // 5. CUSTOMER SPECIFIC PRICING
      // --------------------------------------------------------------------------
      case "SAVE_CUSTOMER_PRICE": {
        const { customerPrice } = payload;
        const { data: savedCp, error: cpErr } = await supabase
          .from("customer_prices")
          .upsert({
            ...(customerPrice.id && !customerPrice.id.startsWith("cp-") ? { id: customerPrice.id } : {}),
            customer_id: customerPrice.customer_id,
            product_id: customerPrice.product_id,
            variant_id: customerPrice.variant_id || null,
            price: Number(customerPrice.price || customerPrice.price_per_case),
            price_per_case: Number(customerPrice.price_per_case || customerPrice.price),
            minimum_quantity: Number(customerPrice.minimum_quantity || 1),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (cpErr) throw cpErr;

        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          admin_email: profile.email,
          action: "CUSTOMER_PRICE_SAVE",
          entity: "customer_prices",
          entity_id: savedCp.id,
          previous_value: null,
          new_value: savedCp,
        });

        return NextResponse.json({ success: true, customer_price: savedCp });
      }

      case "DELETE_CUSTOMER_PRICE": {
        const { id } = payload;
        await supabase.from("customer_prices").delete().eq("id", id);
        return NextResponse.json({ success: true });
      }

      // --------------------------------------------------------------------------
      // 6. CUSTOMER PROFILES
      // --------------------------------------------------------------------------
      case "SAVE_CUSTOMER": {
        const { customer } = payload;
        const { data: savedCust, error: custErr } = await supabase
          .from("profiles")
          .update({
            business_name: customer.business_name,
            owner_name: customer.owner_name,
            phone: customer.phone,
            gstin: customer.gstin || null,
            business_type: customer.business_type || "Retail Shop",
            role: customer.role || "retailer",
            address: customer.address,
            city: customer.city,
            state: customer.state,
            pincode: customer.pincode,
            credit_limit: Number(customer.credit_limit || 0),
            outstanding_amount: Number(customer.outstanding_amount || 0),
            is_active: customer.is_active ?? true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customer.id)
          .select()
          .single();

        if (custErr) throw custErr;

        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          admin_email: profile.email,
          action: "CUSTOMER_UPDATE",
          entity: "profiles",
          entity_id: customer.id,
          previous_value: null,
          new_value: savedCust,
        });

        return NextResponse.json({ success: true, customer: savedCust });
      }

      // --------------------------------------------------------------------------
      // 7. BRANDS & CATEGORIES
      // --------------------------------------------------------------------------
      case "SAVE_BRAND": {
        const { brand } = payload;
        const { data: savedBrand, error: brandErr } = await supabase
          .from("brands")
          .upsert({
            ...(brand.id && !brand.id.startsWith("b-") ? { id: brand.id } : {}),
            name: brand.name,
            description: brand.description || null,
            logo_url: brand.logo_url || null,
            is_active: brand.is_active ?? true,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (brandErr) throw brandErr;
        return NextResponse.json({ success: true, brand: savedBrand });
      }

      case "DELETE_BRAND": {
        const { id } = payload;
        // Verify no products reference this brand
        const { data: prods } = await supabase.from("products").select("id").eq("brand_id", id).limit(1);
        if (prods && prods.length > 0) {
          return NextResponse.json(
            { error: "Cannot delete brand that has active products assigned. Reassign products first." },
            { status: 400 }
          );
        }
        await supabase.from("brands").delete().eq("id", id);
        return NextResponse.json({ success: true });
      }

      case "SAVE_CATEGORY": {
        const { category } = payload;
        const { data: savedCat, error: catErr } = await supabase
          .from("categories")
          .upsert({
            ...(category.id && !category.id.startsWith("c-") ? { id: category.id } : {}),
            name: category.name,
            slug: category.slug,
            sort_order: Number(category.sort_order || 0),
            is_active: category.is_active ?? true,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (catErr) throw catErr;
        return NextResponse.json({ success: true, category: savedCat });
      }

      case "DELETE_CATEGORY": {
        const { id } = payload;
        const { data: prods } = await supabase.from("products").select("id").eq("category_id", id).limit(1);
        if (prods && prods.length > 0) {
          return NextResponse.json(
            { error: "Cannot delete category that has active products assigned. Reassign products first." },
            { status: 400 }
          );
        }
        await supabase.from("categories").delete().eq("id", id);
        return NextResponse.json({ success: true });
      }

      // --------------------------------------------------------------------------
      // 8. BUSINESS SETTINGS
      // --------------------------------------------------------------------------
      case "SAVE_SETTINGS": {
        const { settings } = payload;
        const { data: savedSettings, error: setErr } = await supabase
          .from("business_settings")
          .upsert({
            id: "default",
            business_name: settings.business_name || "Maa Ji Ki Dukaan",
            tagline: settings.tagline || "Direct Seller Ordering. Made Simple.",
            contact_phone: settings.contact_phone || "+91 98112 34567",
            email: settings.email || "orders@maajikidukaan.com",
            address: settings.address || "Plot 12, Main Market, Sector 7, New Delhi, 110075",
            gstin: settings.gstin || "07AAAAA0000A1Z5",
            minimum_order_cases: Number(settings.minimum_order_cases || 1),
            delivery_charge: Number(settings.delivery_charge || 0),
            allowed_payment_methods: settings.allowed_payment_methods || ["cash_on_delivery", "credit", "bank_transfer", "upi"],
            show_inactive_products: Boolean(settings.show_inactive_products),
            price_on_request_badge: settings.price_on_request_badge || "Price on Request",
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (setErr) throw setErr;

        await supabase.from("admin_audit_logs").insert({
          admin_id: user.id,
          admin_email: profile.email,
          action: "SETTINGS_UPDATE",
          entity: "business_settings",
          entity_id: "default",
          previous_value: null,
          new_value: savedSettings,
        });

        return NextResponse.json({ success: true, settings: savedSettings });
      }

      default:
        return NextResponse.json({ error: `Unknown admin action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Admin operation mutation error:", err);
    return NextResponse.json(
      { error: "Administrative database mutation failed: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
