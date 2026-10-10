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


  const pathname = request.nextUrl.pathname;

  // Detect background prefetch requests from Next.js router
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-purpose") === "prefetch";

  // Helper to preserve updated session cookies on redirects
  const createRedirect = (redirectUrl: URL) => {
    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c);
    });
    return redirectResponse;
  };

  // Dedicated admin session cookie set upon successful admin login
  const adminSessionCookie = request.cookies.get("mjd_admin_session")?.value;
  const hasAuthTokenCookie = request.cookies
    .getAll()
    .some((c) => c.name.includes("-auth-token") && c.value.length > 20);

  // Background prefetch requests for /admin/* must NEVER receive a 307 redirect
  // if session cookies are present, because the Next.js client router caches prefetch redirects
  // and erroneously kicks the user out when they subsequently click the link!
  if (isPrefetch && pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (adminSessionCookie || hasAuthTokenCookie) {
      return supabaseResponse;
    }
  }

  // Refresh auth session
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      // If already authenticated as an active admin, redirect to /admin dashboard
      if (user) {
        const isUserAdmin =
          user.app_metadata?.role === "admin" ||
          user.app_metadata?.is_admin === true ||
          user.email === "admin@maajikidukaan.com" ||
          (adminSessionCookie && adminSessionCookie === user.id);

        if (isUserAdmin) {
          const url = request.nextUrl.clone();
          url.pathname = "/admin";
          return createRedirect(url);
        }

        // Secondary fallback check against PostgreSQL profiles table
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
            const url = request.nextUrl.clone();
            url.pathname = "/admin";
            return createRedirect(url);
          }
        } catch (e) {
          console.error("[Middleware] Login check profile lookup error:", e);
        }
      }
      return supabaseResponse;
    }

    // Protected /admin sub-routes
    if (!user) {
      // If user session is temporarily pending during a prefetch but cookies are present, do not poison router cache
      if (isPrefetch && (adminSessionCookie || hasAuthTokenCookie)) {
        return supabaseResponse;
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return createRedirect(url);
    }

    // 1. Instant Authoritative Path: Cryptographically verified JWT claim, owner email, or admin session cookie
    const isDirectAdmin =
      user.app_metadata?.role === "admin" ||
      user.app_metadata?.is_admin === true ||
      user.email === "admin@maajikidukaan.com" ||
      (adminSessionCookie && adminSessionCookie === user.id);

    if (isDirectAdmin) {
      return supabaseResponse;
    }

    // 2. Fallback check: Query PostgreSQL profiles table
    let profile: Pick<Profile, "role" | "is_active"> | null = null;
    let queryFailed = false;

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
        queryFailed = true;
        console.warn(`[Middleware] Admin profile lookup returned error:`, error.message);
      }
    } catch (err) {
      queryFailed = true;
      console.error("[Middleware] Admin profile check exception:", err);
    }

    // Only redirect if database explicitly verified that user is NOT an active admin
    if (profile && (profile.role !== "admin" || !profile.is_active)) {
      console.warn(`[Middleware] Admin access denied for user ${user.id} on ${pathname}. Profile:`, profile);
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return createRedirect(url);
    }

    // If query failed due to network/timeout but user is authenticated, allow request through
    if (queryFailed && !profile) {
      console.warn(`[Middleware] Profile check network failure for authenticated user ${user.id}, allowing request.`);
      return supabaseResponse;
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
      return createRedirect(url);
    }
  }

  return supabaseResponse;
}

