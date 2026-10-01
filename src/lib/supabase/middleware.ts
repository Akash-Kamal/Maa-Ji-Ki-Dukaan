import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import type { Profile } from "@/types";

export interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth session
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }

  const pathname = request.nextUrl.pathname;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    // Helper to preserve updated session cookies on redirects
    const createRedirect = (redirectUrl: URL) => {
      const redirectResponse = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value, c);
      });
      return redirectResponse;
    };

    if (pathname === "/admin/login") {
      // If already authenticated as an active admin, redirect to /admin dashboard
      if (user) {
        let isAdmin = false;
        try {
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const adminCheckClient = serviceRoleKey
            ? createClient(supabaseUrl, serviceRoleKey, {
                auth: { autoRefreshToken: false, persistSession: false },
              })
            : supabase;

          const { data } = await adminCheckClient
            .from("profiles")
            .select("role, is_active")
            .eq("auth_user_id", user.id)
            .maybeSingle();

          const profile = data as Pick<Profile, "role" | "is_active"> | null;
          if (profile?.role === "admin" && profile?.is_active) {
            isAdmin = true;
          }
        } catch (e) {
          console.error("[Middleware] Login check profile lookup error:", e);
        }

        if (isAdmin) {
          const url = request.nextUrl.clone();
          url.pathname = "/admin";
          return createRedirect(url);
        }
      }
      return supabaseResponse;
    }

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return createRedirect(url);
    }

    // Role check: ensure the authenticated user has an active admin profile
    // Use service role key to bypass RLS recursion / token timing issues in middleware
    let profile: Pick<Profile, "role" | "is_active"> | null = null;
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const adminCheckClient = serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : supabase;

      const { data, error } = await adminCheckClient
        .from("profiles")
        .select("role, is_active")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        profile = data as Pick<Profile, "role" | "is_active">;
      } else if (error) {
        console.warn(`[Middleware] Admin profile lookup returned error:`, error.message);
      }
    } catch (err) {
      console.error("[Middleware] Admin profile check exception:", err);
    }

    if (!profile || profile.role !== "admin" || !profile.is_active) {
      console.warn(`[Middleware] Admin access denied for user ${user.id} on ${pathname}. Profile:`, profile);
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return createRedirect(url);
    }
  }

  // Protect customer account routes
  const protectedCustomerRoutes = [
    "/cart",
    "/checkout",
    "/orders",
    "/profile",
    "/reorder",
  ];
  if (protectedCustomerRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

