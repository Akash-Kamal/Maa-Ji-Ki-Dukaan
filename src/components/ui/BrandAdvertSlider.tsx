"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SponsorBrand {
  id: string;
  name: string;
  tagline: string;
  query: string;
  bgColor: string;
  textColor: string;
}

const SPONSOR_SLIDES: SponsorBrand[][] = [
  [
    { id: "coke", name: "Coca-Cola", tagline: "Real Magic Official", query: "Coca-Cola", bgColor: "bg-[#e41c2d]", textColor: "text-white" },
    { id: "pepsi", name: "PepsiCo", tagline: "Direct Wholesaler", query: "PepsiCo", bgColor: "bg-[#004b93]", textColor: "text-white" },
    { id: "redbull", name: "Red Bull", tagline: "Energy Beverages", query: "Red Bull", bgColor: "bg-[#001f5b]", textColor: "text-white" },
    { id: "panther", name: "Panther", tagline: "Fuel Your Drive", query: "Panther", bgColor: "bg-[#381154]", textColor: "text-white" },
  ],
  [
    { id: "bisleri", name: "Bisleri", tagline: "Packaged Water", query: "Bisleri", bgColor: "bg-[#008f7a]", textColor: "text-white" },
    { id: "campa", name: "Campa", tagline: "Great Indian Taste", query: "Campa", bgColor: "bg-[#d9480f]", textColor: "text-white" },
    { id: "lahori", name: "Lahori Zeera", tagline: "Ethnic Refreshment", query: "Lahori", bgColor: "bg-[#7950f2]", textColor: "text-white" },
    { id: "monster", name: "Monster", tagline: "Energy Drinks", query: "Monster", bgColor: "bg-[#1a1a1a]", textColor: "text-[#95d600]" },
  ],
];

export function BrandAdvertSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SPONSOR_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SPONSOR_SLIDES.length) % SPONSOR_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const brands = SPONSOR_SLIDES[currentSlide];

  return (
    <section
      id="in-stream-advertisement"
      aria-label="Wholesale Partner Brands"
      className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#cfe3f7] via-[#ebf4fc] to-[#cfe3f7] border border-[#b8d6f2] p-3.5 sm:p-5 shadow-sm my-6"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous sponsors"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 hover:bg-white text-charcoal-700 flex items-center justify-center shadow-sm shrink-0 transition-all active:scale-95 z-10"
        >
          <ChevronLeft className="w-5 h-5 text-charcoal-600" />
        </button>

        {/* Sponsor Cards Row (ROS Retail Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3.5 flex-1">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/products?q=${encodeURIComponent(b.query)}`}
              className="group bg-white/95 hover:bg-white p-2.5 sm:p-3 rounded-xl border border-white/80 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center"
            >
              <div
                className={`w-full py-2 px-1 rounded-lg ${b.bgColor} ${b.textColor} font-black text-xs sm:text-sm tracking-wide shadow-xs mb-1.5 group-hover:scale-105 transition-transform`}
              >
                {b.name}
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-charcoal-700 line-clamp-1">
                {b.tagline}
              </span>
            </Link>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next sponsors"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 hover:bg-white text-charcoal-700 flex items-center justify-center shadow-sm shrink-0 transition-all active:scale-95 z-10"
        >
          <ChevronRight className="w-5 h-5 text-charcoal-600" />
        </button>
      </div>
    </section>
  );
}
