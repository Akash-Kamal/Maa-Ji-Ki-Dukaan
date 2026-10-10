"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BeveragePatternBackground } from "@/components/ui/BeveragePatternBackground";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error || !data?.user) {
        setErrorMessage(error?.message || "Invalid business email or password.");
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_user_id", data.user.id)
        .single();

      const profile = profileData as Pick<Profile, "role"> | null;
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get("redirectTo");

      let target = "/";
      if (profile?.role === "admin") {
        target = "/admin";
      } else if (redirectParam && !redirectParam.startsWith("/admin")) {
        target = redirectParam;
      }

      // Hard navigation guarantees fresh session cookies are sent in HTTP headers
      window.location.href = target;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMessage(message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F0FDF4]/50 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Decorative Beverage Pattern Background */}
      <BeveragePatternBackground variant="auth" />

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-[440px] mx-auto animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <BrandLogo
              href="/"
              size="lg"
              layout="vertical"
              tagline="Har Cheez Ek Jagah. Har Koi Ek Jagah."
            />
          </div>
          <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">
            Partner Sign In
          </h1>
          <p className="mt-1 text-xs text-warmGray-500 font-medium">
            Direct seller ordering for verified retailers & distributors.
          </p>
        </div>

        {/* White Premium Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-warmGray-200/90 shadow-xl shadow-brand-950/5 p-6 sm:p-8 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="Business Email"
              type="email"
              required
              placeholder="retailer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-warmGray-400" />}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-warmGray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-warmGray-400 hover:text-charcoal-700 focus:outline-none transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-warmGray-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 border-warmGray-300 focus:ring-brand-500"
                />
                <span>Remember me</span>
              </label>

              <a
                href="tel:+919811234567"
                className="text-brand-700 hover:text-brand-800 font-semibold transition-colors"
                title="Call partner support for password reset"
              >
                Forgot password?
              </a>
            </div>

            {/* Action Buttons: Sign In + Sign Up */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1 font-bold shadow-md shadow-brand-900/10"
                isLoading={loading}
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <Link href="/register" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full font-bold border-brand-600 text-brand-700 hover:bg-brand-50"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </form>

          {/* Admin Operations Quick Link */}
          <div className="mt-6 pt-5 border-t border-warmGray-100 text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-700 hover:text-brand-600 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Owner & Seller Admin Login</span>
            </Link>
          </div>
        </div>

        {/* Footer Support Notice */}
        <p className="mt-6 text-center text-xs text-warmGray-500 font-medium">
          New retailer or distributor?{" "}
          <Link
            href="/register"
            className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2"
          >
            Create Partner Account
          </Link>
        </p>
      </div>
    </div>
  );
}
