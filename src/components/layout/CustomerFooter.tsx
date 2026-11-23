import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, CreditCard, PhoneCall, Mail, MapPin, Clock } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function CustomerFooter() {
  return (
    <footer className="relative z-20 bg-[#112338] text-slate-200 border-t border-slate-700/60 mt-16">
      {/* 1. Value Proposition Highlights (ROS Retail Style) */}
      <div className="border-b border-slate-800 bg-[#0c1a2b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Fast Wholesale Delivery
                </h4>
                <p className="text-[11px] text-warmGray-400 mt-0.5">
                  Direct doorstep delivery to shops & godowns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  100% Genuine Inventory
                </h4>
                <p className="text-[11px] text-warmGray-400 mt-0.5">
                  Direct from official bottlers (Coca-Cola, PepsiCo, Bisleri)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Flexible B2B Payment
                </h4>
                <p className="text-[11px] text-warmGray-400 mt-0.5">
                  Cash on Delivery, UPI, Bank Transfer & Approved Credit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Wholesale Order Desk
                </h4>
                <p className="text-[11px] text-warmGray-400 mt-0.5">
                  Direct helpline support: +91 83830 92211
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 4-Column Footer (ROS Retail Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Store Information */}
          <div className="space-y-4">
            <BrandLogo size="md" variant="dark" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Maa Ji Ki Dukaan is an authorized central B2B beverage distribution portal supplying retailers, kiosks, restaurants, and distributors across Delhi NCR.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Plot 12, Main Market, Sector 7, New Delhi, 110075</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+918383092211" className="hover:text-white transition-colors">
                  +91 83830 92211
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:wholesale@maajikidukaan.com" className="hover:text-white transition-colors">
                  wholesale@maajikidukaan.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Orders Dispatched Daily: 8:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-l-2 border-brand-500 pl-2">
              Top Categories
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li>
                <Link href="/categories/soft-drinks" className="hover:text-white transition-colors">
                  Cold Drinks & Sodas
                </Link>
              </li>
              <li>
                <Link href="/categories/energy-drinks" className="hover:text-white transition-colors">
                  Energy Drinks (Panther, Red Bull, Sting)
                </Link>
              </li>
              <li>
                <Link href="/categories/water" className="hover:text-white transition-colors">
                  Packaged Drinking Water (Bisleri)
                </Link>
              </li>
              <li>
                <Link href="/categories/juices" className="hover:text-white transition-colors">
                  Juices & Fruit Beverages
                </Link>
              </li>
              <li>
                <Link href="/categories/soda" className="hover:text-white transition-colors">
                  Ethnic Sodas & Lahori Zeera
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors text-brand-400 font-bold">
                  View Full Portfolio →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-l-2 border-brand-500 pl-2">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/reorder" className="hover:text-white transition-colors">
                  Quick Reorder Store
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Track Dispatched Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  View Cart & Checkout
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Partner Login
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                  Central Seller Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Wholesale Policies & Verification */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-l-2 border-brand-500 pl-2">
              B2B Partner Assurance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              All inventory is strictly sold in wholesale master carton cases. Verified GST invoice provided with every dispatch.
            </p>
            <div className="p-3 rounded-xl bg-[#0c1a2b] border border-slate-700/60 text-[11px] space-y-1.5 text-slate-200">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>GST Registered Supplier</span>
              </div>
              <p className="text-slate-300">GSTIN: 07AAAAA0000A1Z5</p>
              <p className="text-slate-400">Delhi State Jurisdiction</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Maa Ji Ki Dukaan. All rights reserved.</p>
          <p className="text-slate-400">
            Powered for Verified Commercial Beverage Retailers, Grocers & Distributors.
          </p>
        </div>
      </div>
    </footer>
  );
}
