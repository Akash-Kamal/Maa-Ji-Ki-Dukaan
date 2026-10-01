import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Parallel fetch from database
    const [productsRes, categoriesRes, brandsRes, settingsRes] = await Promise.all([
      supabase
        .from("products")
        .select(`
          *,
          brand:brands(*),
          category:categories(*),
          variants:product_variants(*),
          bulk_prices(*)
        `)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase
        .from("business_settings")
        .select("*")
        .eq("id", "default")
        .single(),
    ]);

    if (productsRes.error) throw productsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;
    if (brandsRes.error) throw brandsRes.error;

    // Check if user is authenticated to fetch customer specific rates
    let customerPrices: any[] = [];
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

    if (authUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", authUser.id)
        .single();

      if (profile) {
        const { data: custPrices } = await supabase
          .from("customer_prices")
          .select("*")
          .eq("customer_id", profile.id);
        if (custPrices) customerPrices = custPrices;
      }
    }

    // Transform products with proper canonical case fields, applying negotiated pricing for authenticated customer
    const products = (productsRes.data || []).map((p: any) => {
      const variants = (p.variants || []).map((v: any) => {
        const custMatch = customerPrices.find(
          (cp: any) =>
            (cp.variant_id === v.id || (!cp.variant_id && cp.product_id === p.id)) &&
            Number(cp.price_per_case || cp.price) > 0
        );
        if (custMatch) {
          const negotiatedRate = Number(custMatch.price_per_case || custMatch.price);
          return {
            ...v,
            price_per_case: negotiatedRate,
            is_negotiated: true,
          };
        }
        return v;
      }).sort(
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
      settings: settingsRes.data || null,
      customerPrices,
    });
  } catch (error: any) {
    console.error("Failed to query catalog from database:", error);
    return NextResponse.json(
      { error: "Database catalog query failed: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
