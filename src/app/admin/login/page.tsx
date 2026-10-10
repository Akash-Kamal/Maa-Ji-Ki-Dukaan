"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminId, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(
          data.error || "Invalid Admin ID or password. Access is restricted to central administrators."
        );
        setLoading(false);
        return;
      }

      // Hard navigation ensures browser sends freshly committed HTTP cookies to /admin
      window.location.href = "/admin";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error occurred.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      {/* Background aesthetic accents in logo colors */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex justify-center mb-4">
          <BrandLogo href="/" size="lg" variant="dark" layout="vertical" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-800 text-accent-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-400" />
          <span>Central Operations Control</span>
        </div>
        <h2 className="text-xl font-bold text-warmGray-200 tracking-tight">
          Admin Portal Login
        </h2>
        <p className="mt-1 text-xs text-warmGray-400">
          Enter your authorized credentials to access seller operations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-charcoal-900/90 border border-charcoal-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleAdminLogin} className="space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-warmGray-300 uppercase tracking-wider mb-1.5">
                Admin ID / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-warmGray-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="admin@maajikidukaan.com"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-sm placeholder:text-warmGray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-warmGray-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-warmGray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-charcoal-950 border border-charcoal-700 rounded-xl text-white text-sm placeholder:text-warmGray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-600/25 transition-all text-sm flex items-center justify-center gap-2 mt-2"
              isLoading={loading}
            >
              <span>Admin Login</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-warmGray-500">
          Retail partner?{" "}
          <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold underline">
            Go to Retailer Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
