import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: rawId } = await params;
    const orderIdentifier = decodeURIComponent(rawId);

    if (!orderIdentifier) {
      return NextResponse.json({ error: "Order identifier is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to view this order." },
        { status: 401 }
      );
    }

    // Get user's profile
    const adminDb = createAdminClient();
    const { data } = await adminDb
      .from("profiles")
      .select("id, role, email")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const profile = data as unknown as { id: string; role: string; email: string } | null;
    const isAdmin = profile?.role === "admin";

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);

    let query = adminDb
      .from("orders")
      .select(`
        *,
        customer:profiles(*),
        items:order_items(*)
      `);

    if (isUuid) {
      query = query.eq("id", orderIdentifier);
    } else {
      query = query.eq("order_number", orderIdentifier);
    }

    const { data: order, error } = await query.maybeSingle();

    if (error) {
      console.error("Database error looking up order:", error);
      return NextResponse.json({ error: "Failed to query order records." }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const orderRecord = order as any;

    // Authorization check: Admin can view any order; Customer can only view their own
    if (!isAdmin) {
      const isOwner = profile?.id && orderRecord.customer_id === profile.id;
      const isOwnerEmail = profile?.email && (
        orderRecord.customer?.email === profile.email || 
        orderRecord.delivery_address?.email === profile.email
      );

      if (!isOwner && !isOwnerEmail) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to view this order." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, order: orderRecord });
  } catch (err: unknown) {
    console.error("Order lookup unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while retrieving order." },
      { status: 500 }
    );
  }
}
