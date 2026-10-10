import React from "react";
import { PackageOpen } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-warmGray-200 bg-brand-50/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 mb-3.5 shadow-sm">
        {icon || <PackageOpen className="w-6 h-6 text-brand-600" />}
      </div>
      <h3 className="text-base font-bold text-charcoal-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-warmGray-600 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
