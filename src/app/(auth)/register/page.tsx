"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BeveragePatternBackground } from "@/components/ui/BeveragePatternBackground";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    role: "retailer" as UserRole,
    gstin: "",
    address: "",
    city: "Delhi",
    state: "Delhi",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Registration failed. Please check your details.");
        setLoading(false);
        return;
      }

      setSuccessMessage(
        "Partner account created successfully! Redirecting to login..."
      );
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F0FDF4]/50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <BeveragePatternBackground variant="auth" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex justify-center mb-3">
          <BrandLogo
            href="/"
            size="lg"
            layout="vertical"
            tagline="Har Cheez Ek Jagah. Har Koi Ek Jagah."
          />
        </div>
        <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
          Partner Account Sign Up
        </h2>
        <p className="mt-1 text-xs text-warmGray-500 font-medium">
          Direct registration for retailers & distributors.
        </p>
      </div>

      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card variant="default" padding="lg" className="shadow-xl shadow-brand-950/5 border border-warmGray-200/90 rounded-2xl sm:rounded-3xl backdrop-blur-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business / Shop Name"
                name="businessName"
                required
                placeholder="e.g. Gupta Daily Mart"
                value={formData.businessName}
                onChange={handleChange}
                leftIcon={<Building2 className="w-4 h-4" />}
              />

              <Input
                label="Owner / Proprietor Name"
                name="ownerName"
                required
                placeholder="Full name"
                value={formData.ownerName}
                onChange={handleChange}
                leftIcon={<User className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone (WhatsApp for Dispatch)"
                name="phone"
                type="tel"
                required
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Business Email"
                name="email"
                type="email"
                required
                placeholder="partner@domain.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Business Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-warmGray-300 bg-white px-3.5 py-2.5 text-sm text-charcoal-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="retailer">Retail Shop (Kirana / Supermarket)</option>
                  <option value="distributor">Sub-Distributor</option>
                  <option value="vendor">Event / Corporate Vendor</option>
                </select>
              </div>
            </div>

            <Input
              label="GSTIN (Optional for Small Retailers)"
              name="gstin"
              placeholder="e.g. 07AAAAA0000A1Z5"
              value={formData.gstin}
              onChange={handleChange}
            />

            <Input
              label="Shop / Warehouse Address"
              name="address"
              required
              placeholder="Shop number, Street, Landmark"
              value={formData.address}
              onChange={handleChange}
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
              />
              <Input
                label="State"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
              />
              <Input
                label="Pincode"
                name="pincode"
                required
                placeholder="110001"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold mt-4"
              isLoading={loading}
            >
              Sign Up
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-warmGray-500">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
