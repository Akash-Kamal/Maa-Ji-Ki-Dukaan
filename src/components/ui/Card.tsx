import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "elevated" | "highlight";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  variant = "default",
  padding = "md",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-white border border-warmGray-200/80 shadow-sm rounded-xl",
    flat: "bg-brand-50/60 border border-warmGray-200 rounded-xl",
    elevated: "bg-white border border-warmGray-200/60 shadow-md rounded-xl",
    highlight: "bg-white border-2 border-brand-500/80 shadow-md rounded-xl",
  };

  const paddingStyles = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
