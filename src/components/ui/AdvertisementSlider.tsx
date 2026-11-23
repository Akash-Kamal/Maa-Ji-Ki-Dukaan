"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface AdvertisementSlide {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
  alt: string;
}

export const DEFAULT_AD_SLIDES: AdvertisementSlide[] = [
  {
    id: "panther-energy",
    title: "Panther Energy Drink - Fuel Your Drive",
    imageUrl: "/images/banners/panther-energy-banner.jpg",
    href: "/products?search=Panther",
    alt: "Panther Energy Drink Wholesale Banner - Fuel Your Drive",
  },
  {
    id: "coca-cola",
    title: "Coca-Cola Real Magic - Refresh, Recharge, Enjoy",
    imageUrl: "/images/banners/coca-cola-banner.jpg",
    href: "/products/coke",
    alt: "Coca-Cola Original Taste Wholesale Banner - Real Magic",
  },
];

export interface AdvertisementSliderProps {
  slides?: AdvertisementSlide[];
  autoPlayInterval?: number;
  className?: string;
}

export function AdvertisementSlider({
  slides = DEFAULT_AD_SLIDES,
  autoPlayInterval = 5000,
  className = "",
}: AdvertisementSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides, autoPlayInterval, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  if (totalSlides === 0) return null;

  return (
    <section
      id="advertisement-slider"
      aria-label="Promotional Banners"
      className={`group relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-warmGray-200/90 shadow-sm bg-charcoal-900 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div key={slide.id} className="w-full shrink-0 relative aspect-[16/9] max-h-[460px]">
            <Link
              href={slide.href}
              className="block w-full h-full relative focus:outline-none"
              tabIndex={idx === currentIndex ? 0 : -1}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.alt}
                className="w-full h-full object-cover object-center select-none"
                loading={idx === 0 ? "eager" : "lazy"}
                draggable={false}
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all duration-200 focus:opacity-100 shadow-md"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-80 transition-all duration-200 focus:opacity-100 shadow-md"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators / Dots */}
      {totalSlides > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-full">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Discrete Sponsor Tag */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
          Sponsored
        </span>
      </div>
    </section>
  );
}
