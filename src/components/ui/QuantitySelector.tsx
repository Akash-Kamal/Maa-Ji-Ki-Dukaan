"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

export interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unitLabel?: string;
  onChange: (newValue: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function QuantitySelector({
  value,
  min = 1,
  max = 999,
  step = 1,
  unitLabel = "cases",
  onChange,
  disabled = false,
  size = "md",
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(Math.min(max, value + step));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      if (val < min) onChange(min);
      else if (val > max) onChange(max);
      else onChange(val);
    }
  };

  const isSm = size === "sm";

  return (
    <div className="inline-flex items-center rounded-lg border border-warmGray-300 bg-white shadow-sm overflow-hidden select-none">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`flex items-center justify-center text-charcoal-700 hover:bg-brand-50 active:bg-brand-100 disabled:opacity-30 disabled:pointer-events-none transition-colors ${
          isSm ? "w-7 h-7" : "w-9 h-9"
        }`}
        aria-label="Decrease quantity"
      >
        <Minus className={isSm ? "w-3.5 h-3.5" : "w-4 h-4"} />
      </button>

      <div className={`flex items-center justify-center border-x border-warmGray-200 px-2 ${isSm ? "h-7" : "h-9"}`}>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className={`text-center font-bold text-charcoal-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            isSm ? "w-10 text-xs" : "w-12 text-sm"
          }`}
        />
        {unitLabel && (
          <span className="text-[11px] text-warmGray-500 font-medium ml-0.5 hidden sm:inline">
            {unitLabel}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={`flex items-center justify-center text-charcoal-700 hover:bg-brand-50 active:bg-brand-100 disabled:opacity-30 disabled:pointer-events-none transition-colors ${
          isSm ? "w-7 h-7" : "w-9 h-9"
        }`}
        aria-label="Increase quantity"
      >
        <Plus className={isSm ? "w-3.5 h-3.5" : "w-4 h-4"} />
      </button>
    </div>
  );
}
