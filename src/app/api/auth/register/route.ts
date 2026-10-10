import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProfileInsert, UserRole } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessName,
      ownerName,
      phone,
      email,
      password,
      role = "retailer",
      gstin,
      address,
      city = "Delhi",
      state = "Delhi",
      pincode,
    } = body;

    // Validate required fields
    if (!email || !password || !businessName || !ownerName || !phone || !address || !pincode) {
      return NextResponse.json(
        {
          success: false,
          error: "Please fill in all mandatory partner registration fields.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminDb = createAdminClient();

    // 1. Check if profile already exists with this email
    const { data: existingProfile } = await adminDb
      .from("profiles")
      .select("id, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this business email is already registered. Please sign in.",
        },
        { status: 400 }
      );
    }

    // 2. Prevent role escalation - strictly retailer or distributor for self-registration
    const safeRole: UserRole = role === "distributor" ? "distributor" : "retailer";

    // 3. Create user in Supabase Auth via Admin API (pre-confirmed so they can log in immediately)
    const { data: authData, error: authError } = await adminDb.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        business_name: businessName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        role: safeRole,
      },
    });

    if (authError || !authData.user) {
      // If user already exists in auth.users (e.g. from previous failed attempt without profile)
      if (authError?.message?.toLowerCase().includes("already registered") || authError?.message?.toLowerCase().includes("already been registered")) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email already exists. Please sign in.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: authError?.message || "Failed to create user account.",
        },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 4. Safely insert profile record using admin client (bypasses RLS)
    const profileRecord: ProfileInsert = {
      auth_user_id: userId,
      business_name: businessName.trim(),
      owner_name: ownerName.trim(),
      phone: phone.trim(),
      email: cleanEmail,
      role: safeRole,
      business_type: safeRole,
      gstin: gstin ? gstin.trim().toUpperCase() : null,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      credit_limit: 0,
      outstanding_amount: 0,
      is_active: true,
    };

    const { error: profileError } = await (adminDb as any)
      .from("profiles")
      .insert([profileRecord]);

    if (profileError) {
      // Rollback: delete auth user so we don't leave orphaned records
      console.error("Profile insertion error:", profileError);
      await adminDb.auth.admin.deleteUser(userId);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize partner profile. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Partner account created successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected registration error occurred.";
    console.error("Registration route error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
