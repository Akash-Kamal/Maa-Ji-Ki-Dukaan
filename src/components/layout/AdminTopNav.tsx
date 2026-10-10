"use client";

import React from "react";
import { Menu, Bell, ShieldCheck, Search } from "lucide-react";

interface AdminTopNavProps {
  onOpenMobileMenu: () => void;
}

export function AdminTopNav({ onOpenMobileMenu }: AdminTopNavProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-warmGray-200 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-charcoal-700 hover:bg-brand-50"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-50 text-charcoal-800 border border-warmGray-200">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            Seller Operations
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Fast Admin Search Shortcut */}
        <div className="hidden md:flex items-center gap-2 bg-warmGray-50 border border-warmGray-200 rounded-lg px-3 py-1.5 text-xs text-warmGray-500 w-64">
          <Search className="w-3.5 h-3.5 text-warmGray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search SKU, Order, Shop..."
            className="bg-transparent border-none outline-none text-xs text-charcoal-900 w-full placeholder:text-warmGray-400"
          />
        </div>

        {/* Notifications Icon */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-charcoal-600 hover:bg-brand-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600" />
        </button>

        <div className="h-6 w-px bg-warmGray-200" />

        {/* Admin Profile */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-lg bg-charcoal-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            A
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-charcoal-950 block leading-tight">
              Seller Admin
            </span>
            <span className="text-[10px] text-brand-600 font-semibold uppercase tracking-wider block">
              Owner
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
