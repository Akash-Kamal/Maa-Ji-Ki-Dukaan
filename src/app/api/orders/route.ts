import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DeliveryAddress, PaymentMethod } from "@/types";

interface OrderItemInput {
  productId: string;
  variantId: string;
  quantityCases: number;
}

interface PlaceOrderPayload {
  items: OrderItemInput[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body: PlaceOrderPayload = await request.json();
    const { items, deliveryAddress, paymentMethod, notes } = body;

    // 1. Basic payload validations
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Please select cases to order." },
        { status: 400 }
      );
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.business_name ||
      !deliveryAddress.owner_name ||
      !deliveryAddress.phone ||
      !deliveryAddress.address ||
      !deliveryAddress.pincode
    ) {
      return NextResponse.json(
        { error: "Please provide a complete business delivery address." },
        { status: 400 }
      );
    }

    // 2. Identify Authenticated User & Profile from Supabase
    const supabase = await createClient();
    let authUser = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) authUser = data.user;
    }
    if (!authUser) {
      const { data } = await supabase.auth.getUser();
      authUser = data?.user || null;
    }

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to place orders." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, is_active, role, credit_limit, outstanding_amount, business_name, owner_name, phone, address, pincode")
      .eq("auth_user_id", authUser.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        { error: "Verified customer profile not found." },
        { status: 403 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: "Your purchasing account is currently inactive. Please contact seller." },
        { status: 403 }
      );
    }

    // Check credit limit if paying with credit
    if (paymentMethod === "credit") {
      const availableCredit = Math.max(0, (profile.credit_limit || 0) - (profile.outstanding_amount || 0));
      if (availableCredit <= 0) {
        return NextResponse.json(
          { error: "Credit line exhausted. Please select Cash on Delivery, UPI, or Bank Transfer." },
          { status: 400 }
        );
      }
    }

    // Fetch customer specific rates
    const { data: customerPrices } = await supabase
      .from("customer_prices")
      .select("*")
      .eq("customer_id", profile.id);

    // 3. Server-Side Strict Price & Stock Resolution (Zero Trust in Client-Supplied Prices)
    const resolvedOrderItems = [];
    let serverSubtotal = 0;
    let serverTotalDiscount = 0;

    for (const item of items) {
      const quantityCases = Number(item.quantityCases);
      if (!Number.isInteger(quantityCases) || quantityCases <= 0) {
        return NextResponse.json(
          { error: `Invalid case quantity (${item.quantityCases}). Items are sold strictly in whole cases.` },
          { status: 400 }
        );
      }

      // Fetch variant and parent product from PostgreSQL
      const { data: variant, error: varErr } = await supabase
        .from("product_variants")
        .select(`
          *,
          product:products(*)
        `)
      .eq("id", item.variantId)
      .single();

      if (varErr || !variant) {
        return NextResponse.json(
          { error: `Selected product pack size was not found in database.` },
          { status: 404 }
        );
      }

      const product = variant.product;
      if (!product || !product.is_active || !variant.is_active) {
        return NextResponse.json(
          { error: `${product?.name || "Product"} is currently inactive or archived in the warehouse.` },
          { status: 400 }
        );
      }

      // Price-on-Request protection: price_per_case = NULL can NEVER checkout
      if (variant.price_per_case === null || variant.price_per_case === undefined) {
        return NextResponse.json(
          {
            error: `${product.name} (${variant.variant_name}) pricing is awaiting seller confirmation. Cannot be ordered at this time.`,
          },
          { status: 400 }
        );
      }

      // Check available inventory (stock_cases - reserved_cases)
      const availableCases = Math.max(0, (variant.stock_cases || 0) - (variant.reserved_cases || 0));
      if (availableCases < quantityCases) {
        return NextResponse.json(
          {
            error: `Insufficient available stock for ${product.name} (${variant.variant_name}). Available: ${availableCases} cases, requested: ${quantityCases} cases.`,
          },
          { status: 400 }
        );
      }

      // Resolve effective price: Customer Negotiated -> Bulk -> Standard
      let effectivePrice = Number(variant.price_per_case);
      const standardPrice = Number(variant.price_per_case);

      // A. Check customer-specific negotiated price
      const customMatch = (customerPrices || []).find(
        (cp: any) =>
          (cp.variant_id === variant.id || cp.product_id === product.id) &&
          quantityCases >= (cp.minimum_quantity || 1)
      );

      if (customMatch && Number(customMatch.price) > 0) {
        effectivePrice = Number(customMatch.price);
      } else {
        // B. Check bulk tier from database
        const { data: bulkTiers } = await supabase
          .from("bulk_prices")
          .select("*")
          .eq("product_id", product.id)
          .lte("minimum_quantity", quantityCases)
          .order("minimum_quantity", { ascending: false })
          .limit(1);

        if (bulkTiers && bulkTiers.length > 0 && Number(bulkTiers[0].price_per_case) > 0) {
          effectivePrice = Number(bulkTiers[0].price_per_case);
        }
      }

      const lineSubtotal = effectivePrice * quantityCases;
      const lineSavings = Math.max(0, standardPrice - effectivePrice) * quantityCases;

      serverSubtotal += lineSubtotal;
      serverTotalDiscount += lineSavings;

      resolvedOrderItems.push({
        product_id: product.id,
        variant_id: variant.id,
        product_name_snapshot: product.name,
        variant_snapshot: variant.variant_name,
        price_snapshot: effectivePrice,
        price_per_case_snapshot: effectivePrice,
        pieces_per_case_snapshot: variant.pieces_per_case || null,
        quantity: quantityCases,
        quantity_cases: quantityCases,
        subtotal: lineSubtotal,
      });
    }

    // 4. Generate Unique Order Number
    const orderNumber = `MJ${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderRecord = {
      order_number: orderNumber,
      customer_id: profile.id,
      subtotal: serverSubtotal,
      discount: serverTotalDiscount,
      gst_amount: 0.0,
      delivery_charge: 0.0,
      total_amount: serverSubtotal,
      payment_method: paymentMethod || "cash_on_delivery",
      payment_status: paymentMethod === "credit" ? "credit_approved" : "pending",
      order_status: "confirmed",
      delivery_address: deliveryAddress,
      notes: notes || null,
    };

    // 5. Strictly Persist to Supabase Database (Fail loudly if DB error occurs)
    const { data: dbOrder, error: orderErr } = await supabase
      .from("orders")
      .insert(orderRecord)
      .select("id")
      .single();

    if (orderErr || !dbOrder) {
      console.error("Order insertion error in Supabase:", orderErr);
      return NextResponse.json(
        { error: "Failed to persist order to database: " + (orderErr?.message || "Unknown DB error") },
        { status: 500 }
      );
    }

    const createdOrderId = dbOrder.id;

    // Insert order items snapshot with exact historical prices
    const itemsPayload = resolvedOrderItems.map((item) => ({
      order_id: createdOrderId,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name_snapshot: item.product_name_snapshot,
      variant_snapshot: item.variant_snapshot,
      price_snapshot: item.price_snapshot,
      price_per_case_snapshot: item.price_per_case_snapshot,
      pieces_per_case_snapshot: item.pieces_per_case_snapshot,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
    if (itemsErr) {
      console.error("Order items insertion error:", itemsErr);
      return NextResponse.json(
        { error: "Failed to persist order snapshots: " + itemsErr.message },
        { status: 500 }
      );
    }

    // 6. Record inventory reservation in product_variants via admin client (bypassing customer RLS)
    const adminDb = createAdminClient();
    for (const item of resolvedOrderItems) {
      if (item.variant_id) {
        const { data: v } = await (adminDb.from("product_variants") as any)
          .select("reserved_cases")
          .eq("id", item.variant_id)
          .single();
        if (v) {
          const currentReserved = Number((v as any).reserved_cases || 0);
          await (adminDb.from("product_variants") as any)
            .update({ reserved_cases: currentReserved + item.quantity })
            .eq("id", item.variant_id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId: createdOrderId,
      orderNumber,
      subtotal: serverSubtotal,
      totalCases: items.reduce((acc, i) => acc + Number(i.quantityCases), 0),
      items: resolvedOrderItems,
      deliveryAddress,
      status: "confirmed",
      message: "Order placed successfully with confirmed snapshots.",
    });
  } catch (error: unknown) {
    console.error("Order creation fatal error:", error);
    const message = error instanceof Error ? error.message : "Failed to process order.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
