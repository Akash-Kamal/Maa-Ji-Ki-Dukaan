"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Warehouse,
  Users,
  Percent,
  Layers,
  Sparkles,
  Settings,
  ArrowLeft,
  Shield,
  LogOut,
  X,
  UserCheck,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Pricing", href: "/admin/pricing", icon: Percent },
    { name: "Brands", href: "/admin/brands", icon: Sparkles },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isCurrent = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal-900 text-cream-50 flex flex-col shrink-0 border-r border-charcoal-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Wholesaler Head Branding */}
        <div className="p-5 border-b border-charcoal-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl p-1 bg-white border border-charcoal-700 shadow-sm flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="Maa Ji Ki Dukaan"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">
                MAA JI KI DUKAAN
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="w-3 h-3 text-accent-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-warmGray-400">
                  Control Panel
                </span>
              </div>
            </div>
          </Link>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-warmGray-400 hover:text-white hover:bg-charcoal-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isCurrent(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "bg-brand-600 text-white font-bold shadow-sm shadow-brand-600/30"
                    : "text-warmGray-300 hover:bg-charcoal-800 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-warmGray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile, Business Name & Sign Out */}
        <div className="p-3 border-t border-charcoal-800 space-y-2">
          {/* Admin Profile Details */}
          <div className="px-3 py-2 rounded-lg bg-charcoal-800/80 border border-charcoal-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600/30 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Central Wholesaler</p>
                <p className="text-[10px] text-warmGray-400 truncate">Maa Ji Ki Dukaan</p>
              </div>
            </div>
          </div>

          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-warmGray-400 hover:bg-charcoal-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Store</span>
          </Link>

          <Link
            href="/logout?from=admin"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("mjd_active_session");
              }
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-charcoal-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
