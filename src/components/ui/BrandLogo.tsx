"use client";

import React from "react";
import Link from "next/link";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showTagline?: boolean;
  tagline?: string;
  variant?: "light" | "dark";
  layout?: "horizontal" | "vertical";
  stacked?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showText = true,
  showTagline = true,
  tagline,
  variant = "light",
  layout = "horizontal",
  stacked = false,
  href,
  className = "",
}: BrandLogoProps) {
  const sizeMap = {
    sm: { img: 32, box: "w-8 h-8", text: "text-sm", tagline: "text-[9px]" },
    md: { img: 42, box: "w-10 h-10 sm:w-11 sm:h-11", text: "text-base sm:text-lg", tagline: "text-[10px]" },
    lg: { img: 56, box: "w-14 h-14", text: "text-xl sm:text-2xl", tagline: "text-xs" },
    xl: { img: 72, box: "w-18 h-18 sm:w-20 sm:h-20", text: "text-2xl sm:text-3xl", tagline: "text-xs sm:text-sm" },
  };

  const currentSize = sizeMap[size];
  const isVertical = layout === "vertical" || stacked;

  const content = (
    <div
      className={`flex ${
        isVertical ? "flex-col items-center text-center gap-2.5" : "items-center gap-3"
      } group select-none ${className}`}
    >
      {/* Official 'mj' Logo Container */}
      <div
        className={`${currentSize.box} relative rounded-2xl p-1 bg-white border border-brand-100 shadow-sm shadow-brand-900/5 flex items-center justify-center shrink-0 overflow-hidden transition-all duration-200 group-hover:scale-105 group-hover:shadow-md group-hover:border-brand-200`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="Maa Ji Ki Dukaan Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Typography */}
      {showText && (
        <div className={`flex flex-col justify-center ${isVertical ? "items-center text-center" : ""}`}>
          <span
            className={`font-black tracking-tight leading-tight transition-colors ${currentSize.text} ${
              variant === "dark" ? "text-white" : "text-charcoal-950 group-hover:text-brand-700"
            }`}
          >
            MAA JI KI DUKAAN
          </span>
          {showTagline && (
            <span
              className={`font-bold tracking-wide uppercase mt-0.5 ${currentSize.tagline} ${
                variant === "dark" ? "text-accent-400" : "text-brand-600"
              }`}
            >
              {tagline || "Direct Seller Ordering. Made Simple."}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
