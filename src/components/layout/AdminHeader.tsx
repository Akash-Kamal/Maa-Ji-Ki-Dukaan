"use client";

import React from "react";
import Link from "next/link";
import { Plus, Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-warmGray-200 px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-charcoal-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-warmGray-500 mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button size="sm" variant="primary" className="text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="primary" className="text-xs" onClick={action.onClick}>
                <Plus className="w-3.5 h-3.5" />
                {action.label}
              </Button>
            )
          )}

          <div className="h-6 w-px bg-warmGray-200 hidden sm:block" />

          <button
            type="button"
            className="p-2 rounded-lg text-charcoal-600 hover:bg-cream-100 transition-colors relative"
            aria-label="Wholesale Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-600 rounded-full" />
          </button>

          <div className="flex items-center gap-2 pl-1 text-charcoal-700">
            <UserCircle className="w-6 h-6 text-charcoal-400" />
            <span className="text-xs font-bold hidden md:inline">
              Wholesaler Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
