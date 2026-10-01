import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "neutral" | "success" | "offer" | "danger" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  const variantStyles = {
    brand: "bg-brand-50 text-brand-700 border border-brand-200",
    neutral: "bg-warmGray-100 text-charcoal-700 border border-warmGray-200",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    offer: "bg-amber-50 text-amber-800 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    outline: "bg-transparent text-charcoal-700 border border-warmGray-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
