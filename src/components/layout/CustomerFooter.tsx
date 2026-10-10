import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, CreditCard, PhoneCall } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function CustomerFooter() {
  return (
    <footer className="bg-charcoal-900 text-warmGray-300 border-t border-charcoal-800 mt-20">
      {/* Trust Highlights */}
      <div className="border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-brand-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Bulk Doorstep Delivery
                </h4>
                <p className="text-xs text-warmGray-400 mt-0.5">
                  Direct dispatch to shop & warehouse
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  100% Genuine Stock
                </h4>
                <p className="text-xs text-warmGray-400 mt-0.5">
                  Direct from authorized company bottlers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-amber-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Credit & Flexible Terms
                </h4>
                <p className="text-xs text-warmGray-400 mt-0.5">
                  Custom limits for regular partners
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-brand-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Dedicated Seller Desk
                </h4>
                <p className="text-xs text-warmGray-400 mt-0.5">
                  Quick support for high-volume orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <BrandLogo size="md" variant="dark" />
            <p className="text-xs text-warmGray-400 mt-2 max-w-sm">
              Direct Seller Ordering. Made Simple. Direct B2B beverage distribution for retailers, vendors, and distributors.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-warmGray-400 font-medium">
            <Link href="/products" className="hover:text-white transition-colors">
              Seller Catalog
            </Link>
            <Link href="/orders" className="hover:text-white transition-colors">
              Order Tracking
            </Link>
            <Link href="/reorder" className="hover:text-white transition-colors">
              Quick Reorder
            </Link>
            <Link href="/admin" className="text-brand-400 hover:text-brand-300 transition-colors">
              Seller Admin
            </Link>
          </div>
        </div>

        <div className="border-t border-charcoal-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-warmGray-500">
          <p>© {new Date().getFullYear()} Maa Ji Ki Dukaan. All rights reserved.</p>
          <p>Strictly for Registered B2B Commercial Beverage Accounts.</p>
        </div>
      </div>
    </footer>
  );
}
