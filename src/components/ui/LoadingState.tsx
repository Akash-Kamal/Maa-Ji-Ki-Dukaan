import React from "react";

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = "Loading wholesale catalog...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="relative w-10 h-10 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-warmGray-200" />
        <div className="absolute inset-0 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-semibold text-charcoal-700 tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}
