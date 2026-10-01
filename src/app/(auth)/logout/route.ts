import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("from") === "admin" ? "/admin/login" : "/login";
  const response = NextResponse.redirect(new URL(redirectTo, url.origin));
  
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signOut errors
  }

  // Clear wholesale session cookie
  response.cookies.set("mjd_session", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}

export async function POST(request: Request) {
  return GET(request);
}
