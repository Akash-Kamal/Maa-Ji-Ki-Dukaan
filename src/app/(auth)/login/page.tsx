"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-cream-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex justify-center mb-3">
          <BrandLogo href="/" size="lg" />
        </div>
        <h2 className="mt-2 text-2xl font-extrabold text-charcoal-900 tracking-tight">
          Partner Account Login
        </h2>
        <p className="mt-1 text-xs text-warmGray-500">
          Direct wholesale access for registered retailers & distributors.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card variant="default" padding="lg" className="shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
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
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold mt-2"
              isLoading={loading}
            >
              Sign In to Wholesale Portal
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-warmGray-200 text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-700 hover:text-brand-600 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Owner & Wholesaler Admin Login</span>
            </Link>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-warmGray-500">
          New retailer or distributor?{" "}
          <Link
            href="/register"
            className="font-bold text-brand-600 hover:text-brand-700"
          >
            Apply for wholesale account
          </Link>
        </p>
      </div>
    </div>
  );
}
