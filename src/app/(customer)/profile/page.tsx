"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  MapPin,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  Wallet,
  LogOut,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Editable fields
  const [formData, setFormData] = useState({
    business_name: "",
    owner_name: "",
    phone: "",
    gstin: "",
    business_type: "Retail Shop",
    address: "",
    city: "New Delhi",
    state: "Delhi",
    pincode: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("auth_user_id", user.id)
            .single();

          if (data) {
            const p = data as Profile;
            setProfile(p);
            setFormData({
              business_name: p.business_name || "",
              owner_name: p.owner_name || "",
              phone: p.phone || "",
              gstin: p.gstin || "",
              business_type: p.business_type || "Retail Shop",
              address: p.address || "",
              city: p.city || "New Delhi",
              state: p.state || "Delhi",
              pincode: p.pincode || "",
            });
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.warn("Could not load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && profile) {
        // Safe update: only allowed contact & address fields
        const { error } = await supabase
          .from("profiles")
          .update({
            owner_name: formData.owner_name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            gstin: formData.gstin || null,
          })
          .eq("id", profile.id);

        if (error) {
          throw new Error(error.message);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile settings.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Safe credit calculations
  const creditLimit = profile?.credit_limit ?? null;
  const outstanding = profile?.outstanding_amount ?? null;
  const availableCredit =
    creditLimit !== null && outstanding !== null
      ? Math.max(0, creditLimit - outstanding)
      : null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8 animate-pulse">
        <div className="h-8 bg-warmGray-200 rounded w-48 mb-4" />
        <div className="h-64 bg-warmGray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-warmGray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-950 tracking-tight">
            Business Partner Profile
          </h1>
          <p className="text-xs text-warmGray-500 mt-0.5">
            Verified retailer/distributor account credentials, delivery godown, and commercial credit limits.
          </p>
        </div>
        <Link
          href="/logout"
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("mjd_active_session");
            }
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </Link>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile particulars and delivery address saved successfully.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Credit & Terms Highlight */}
      <section className="p-6 rounded-3xl bg-gradient-to-br from-charcoal-950 to-charcoal-900 text-white border border-charcoal-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-warmGray-400 uppercase tracking-wider block">
                Wholesale Commercial Credit Facility
              </span>
              <h2 className="text-lg font-black text-white">
                {profile?.business_name || formData.business_name || "Partner Account"}
              </h2>
            </div>
          </div>

          <Badge variant="success" size="md">
            Active Account
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-warmGray-400 uppercase tracking-wider block">
              Credit Limit
            </span>
            <span className="text-lg font-black text-white mt-0.5 block">
              {creditLimit !== null ? `₹${creditLimit.toLocaleString("en-IN")}` : "₹—"}
            </span>
            <span className="text-[10px] text-warmGray-400">
              {profile ? "Approved Central Limit" : "Wholesale Standard"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-warmGray-400 uppercase tracking-wider block">
              Outstanding Amount
            </span>
            <span className="text-lg font-black text-brand-400 mt-0.5 block">
              {outstanding !== null ? `₹${outstanding.toLocaleString("en-IN")}` : "₹—"}
            </span>
            <span className="text-[10px] text-warmGray-400">
              {profile ? "Pending Dispatch Bills" : "Current Ledger"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-warmGray-400 uppercase tracking-wider">
                Available Credit
              </span>
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">
              {availableCredit !== null ? `₹${availableCredit.toLocaleString("en-IN")}` : "₹—"}
            </span>
            <span className="text-[10px] text-warmGray-400">Ready for Case Orders</span>
          </div>
        </div>
      </section>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card variant="default" padding="lg" className="space-y-5">
          <div className="flex items-center justify-between border-b border-warmGray-100 pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-charcoal-950">
                Business & Contact Particulars
              </h2>
            </div>
            <Badge variant="brand" size="sm">
              Role: {profile?.role || "Retail Shop"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business / Enterprise Name"
              value={formData.business_name}
              disabled
              helperText="Contact wholesaler admin to update registered enterprise title."
            />

            <Input
              label="Proprietor / Owner Name"
              value={formData.owner_name}
              onChange={(e) =>
                setFormData({ ...formData, owner_name: e.target.value })
              }
              required
            />

            <Input
              label="Primary Phone / WhatsApp"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />

            <Input
              label="Email Address"
              value={profile?.email || "partner@maajikidukaan.local"}
              disabled
              helperText="Managed by authentication sign-in."
            />

            <Input
              label="GSTIN / Trade Tax ID"
              placeholder="e.g. 07AAAAA0000A1Z5"
              value={formData.gstin}
              onChange={(e) =>
                setFormData({ ...formData, gstin: e.target.value })
              }
            />

            <Input
              label="Commercial Classification"
              value={formData.business_type}
              disabled
            />
          </div>
        </Card>

        {/* Delivery Address Card */}
        <Card variant="default" padding="lg" className="space-y-5">
          <div className="flex items-center gap-2 border-b border-warmGray-100 pb-3">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-extrabold text-charcoal-950">
              Primary Shop / Godown Delivery Point
            </h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Shop Address / Landmark"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />

              <Input
                label="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                required
              />

              <Input
                label="Pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-warmGray-100 flex justify-end">
            <Button
              type="submit"
              size="md"
              variant="primary"
              isLoading={isSaving}
              className="font-bold shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Profile Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
