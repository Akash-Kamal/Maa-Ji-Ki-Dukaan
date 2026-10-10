import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Admin ID and password are required." },
        { status: 400 }
      );
    }

    const emailInput = String(email).trim().toLowerCase();
    const fullEmail = emailInput.includes("@")
      ? emailInput
      : emailInput === "admin"
      ? "admin@maajikidukaan.com"
      : `${emailInput}@maajikidukaan.com`;

    // Initialize server-side Supabase client (persists session cookies in HTTP response)
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: fullEmail,
      password: String(password),
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: "Invalid Admin ID or password. Access is restricted to central administrators." },
        { status: 401 }
      );
    }

    // Server-side authorization check against PostgreSQL profiles table using adminDb
    const adminDb = createAdminClient();
    const { data: profileData, error: profErr } = await adminDb
      .from("profiles")
      .select("id, email, role, is_active")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    const profile = profileData as Pick<Profile, "id" | "email" | "role" | "is_active"> | null;

    if (profErr || !profile || profile.role !== "admin" || !profile.is_active) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Access Denied: This account does not possess active central administrator privileges." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role,
      },
    });
  } catch (err: unknown) {
    console.error("[Admin Login Server Action Error]:", err);
    const message = err instanceof Error ? err.message : "Internal authentication error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
