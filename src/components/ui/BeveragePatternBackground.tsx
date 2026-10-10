"use client";

import React from "react";

export interface BeveragePatternBackgroundProps {
  variant?: "auth" | "page" | "subtle";
  className?: string;
}

// -------------------------------------------------------------
// Pure Vector SVG Beverage Icons (Thin Outline Style, #16834A / #08633B)
// Includes 15 brands + generic bottles, cans, cartons, bubbles & fruits
// -------------------------------------------------------------

function CocaColaBottle({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 140" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Crown cap */}
      <rect x="25" y="6" width="10" height="4" rx="1" />
      {/* Bottle neck */}
      <path d="M26 10 v12 c0 4 -3 8 -5 14 c-2 6 -3 14 -3 24 c0 14 3 24 3 38 c0 12 -2 20 -2 26 c0 4 3 6 11 6 s11 -2 11 -6 c0 -6 -2 -14 -2 -26 c0 -14 3 -24 3 -38 c0 -10 -1 -18 -3 -24 c-2 -6 -5 -10 -5 -14 v-12" />
      {/* Iconic contour ridges / wave ribbon */}
      <path d="M19 62 q11 -6 22 2" strokeDasharray="1 1" opacity="0.6" />
      <path d="M18 72 q12 -6 24 2" />
      <path d="M18 77 q12 -6 24 2" />
      {/* Subtle label badge */}
      <rect x="20" y="86" width="20" height="12" rx="3" strokeWidth="1.2" />
      <text x="30" y="94.5" fontSize="4.2" fontWeight="900" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.4">
        COCA-COLA
      </text>
      {/* Glass base curve */}
      <line x1="23" y1="126" x2="37" y2="126" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

function PepsiCan({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 70 120" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Top rim & tab */}
      <ellipse cx="35" cy="14" rx="24" ry="7" />
      <ellipse cx="35" cy="14" rx="8" ry="3" strokeWidth="1.2" />
      <path d="M35 11 v4" strokeWidth="1.2" />
      {/* Can body */}
      <path d="M11 14 v90 c0 6 11 9 24 9 s24 -3 24 -9 v-90" />
      <ellipse cx="35" cy="104" rx="24" ry="7" strokeDasharray="3 3" opacity="0.4" />
      {/* Iconic Pepsi wave globe motif */}
      <circle cx="35" cy="58" r="15" strokeWidth="1.4" />
      <path d="M20 58 q7 -6 15 0 q8 6 15 0" strokeWidth="1.5" />
      <text x="35" y="86" fontSize="5.5" fontWeight="900" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.8">
        PEPSI
      </text>
    </svg>
  );
}

function StingCan({ color = "#08633B" }: { color?: string }) {
  return (
    <svg viewBox="0 0 55 130" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Sleek 250ml can */}
      <ellipse cx="27.5" cy="12" rx="18" ry="5" />
      <ellipse cx="27.5" cy="12" rx="6" ry="2" strokeWidth="1.2" />
      <path d="M9.5 12 v104 c0 4 8 6 18 6 s18 -2 18 -6 v-104" />
      {/* Lightning energy bolt */}
      <path d="M31 38 L22 58 L29 58 L23 80 L35 54 L28 54 Z" strokeWidth="1.5" />
      <text x="27.5" y="95" fontSize="6.5" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="1">
        STING
      </text>
      <circle cx="27.5" cy="103" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

function RedBullCan({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 55 130" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <ellipse cx="27.5" cy="12" rx="18" ry="5" />
      <path d="M9.5 12 v104 c0 4 8 6 18 6 s18 -2 18 -6 v-104" />
      {/* Sun disk and charging horn motifs */}
      <circle cx="27.5" cy="50" r="10" strokeWidth="1.3" />
      <path d="M19 50 q8 -8 17 0" strokeWidth="1.4" />
      <path d="M18 55 q10 6 19 0" strokeWidth="1.4" />
      <text x="27.5" y="75" fontSize="4.8" fontWeight="900" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.8">
        RED BULL
      </text>
      <text x="27.5" y="85" fontSize="3.5" fontWeight="700" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.4">
        ENERGY DRINK
      </text>
    </svg>
  );
}

function ThumsUpBottle({ color = "#08633B" }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 140" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="24" y="6" width="12" height="4" rx="1" />
      <path d="M25 10 v14 c0 6 -4 10 -6 18 c-2 8 -2 18 -2 30 c0 16 3 28 3 42 c0 10 -2 16 -2 20 c0 4 4 6 12 6 s12 -2 12 -6 c0 -4 -2 -10 -2 -20 c0 -14 3 -26 3 -42 c0 -12 0 -22 -2 -30 c-2 -8 -6 -12 -6 -18 v-14" />
      {/* Bold Thumbs Up crest symbol */}
      <path d="M26 68 h8 l2 -4 c1 -2 0 -5 -3 -5 h-2 v-6 c0 -3 -2 -4 -4 -3 l-2 4 v14" strokeWidth="1.5" />
      <text x="30" y="93" fontSize="5" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.6">
        THUMS UP
      </text>
    </svg>
  );
}

function SpriteBottle({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 140" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="25" y="6" width="10" height="4" rx="1" />
      <path d="M26 10 v12 c0 5 -4 9 -6 16 c-2 7 -2 18 -2 28 c0 16 3 28 3 42 c0 10 -2 18 -2 24 c0 4 3 6 11 6 s11 -2 11 -6 c0 -6 -2 -14 -2 -24 c0 -14 3 -26 3 -42 c0 -10 0 -21 -2 -28 c-2 -7 -6 -11 -6 -16 v-12" />
      {/* Sprite sparkle / lemon star */}
      <path d="M30 46 L32 52 L38 54 L32 56 L30 62 L28 56 L22 54 L28 52 Z" strokeWidth="1.3" />
      <text x="30" y="80" fontSize="5.5" fontWeight="900" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.8">
        SPRITE
      </text>
      {/* Dimples on glass */}
      <circle cx="24" cy="98" r="1.5" opacity="0.6" />
      <circle cx="36" cy="102" r="1.5" opacity="0.6" />
      <circle cx="30" cy="112" r="1.5" opacity="0.6" />
    </svg>
  );
}

function FantaBottle({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 65 140" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="27" y="6" width="11" height="4" rx="1" />
      <path d="M28 10 v12 c0 6 -6 10 -8 18 c-3 10 -3 20 -1 32 c3 14 6 22 6 36 c0 14 -3 18 -3 24 c0 4 4 6 11 6 s11 -2 11 -6 c0 -6 -3 -10 -3 -24 c0 -14 3 -22 6 -36 c2 -12 2 -22 -1 -32 c-2 -8 -8 -12 -8 -18 v-12" />
      {/* Orange slice motif */}
      <circle cx="32.5" cy="56" r="9" strokeWidth="1.3" />
      <path d="M32.5 47 v18 M23.5 56 h18 M26 49.5 l13 13 M26 62.5 l13 -13" strokeWidth="1" opacity="0.6" />
      <text x="32.5" y="86" fontSize="5.5" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.8">
        FANTA
      </text>
    </svg>
  );
}

function FrootiCarton({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 70 120" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Tetra pack gable top */}
      <path d="M12 30 L35 14 L58 30 L58 110 L12 110 Z" />
      <path d="M35 14 L35 110" strokeDasharray="2 2" opacity="0.5" />
      {/* Straw hole */}
      <circle cx="46" cy="24" r="3" strokeWidth="1.3" />
      {/* Mango fruit outline */}
      <path d="M35 50 c-8 0 -12 8 -10 16 c2 9 10 16 16 16 c6 0 10 -6 8 -14 c-2 -10 -8 -18 -14 -18 z" strokeWidth="1.4" />
      <path d="M35 48 c0 -4 4 -6 7 -6" strokeWidth="1.2" />
      <text x="35" y="100" fontSize="6.5" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.8">
        FROOTI
      </text>
    </svg>
  );
}

function MaazaBottle({ color = "#08633B" }: { color?: string }) {
  return (
    <svg viewBox="0 0 65 140" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="27" y="6" width="11" height="4" rx="1" />
      <path d="M28 10 v14 c0 6 -4 10 -6 18 c-3 10 -4 20 -4 34 c0 16 2 28 2 40 c0 10 -2 16 -2 20 c0 4 4 6 14 6 s14 -2 14 -6 c0 -4 -2 -10 -2 -20 c0 -12 2 -24 2 -40 c0 -14 -1 -24 -4 -34 c-2 -8 -6 -12 -6 -18 v-14" />
      {/* Plump Mango motif */}
      <path d="M32.5 56 c-6 0 -10 6 -9 12 c1 7 8 12 13 12 c5 0 8 -4 7 -10 c-1 -8 -6 -14 -11 -14 z" strokeWidth="1.4" />
      <text x="32.5" y="96" fontSize="6" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.8">
        MAAZA
      </text>
    </svg>
  );
}

function LahoriJeeraBottle({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 140" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Glass soda bottle with ribbed neck */}
      <rect x="25" y="6" width="10" height="4" rx="1" />
      <path d="M26 10 v12 c0 4 -2 6 -3 10 c-1 4 -1 8 -1 14 c0 18 3 32 3 48 c0 14 -2 24 -2 30 c0 4 3 6 12 6 s12 -2 12 -6 c0 -6 -2 -16 -2 -30 c0 -16 3 -30 3 -48 c0 -6 0 -10 -1 -14 c-1 -4 -3 -6 -3 -10 v-12" />
      {/* Jeera spice & traditional diamond badge */}
      <rect x="22" y="58" width="16" height="16" rx="2" transform="rotate(45 30 66)" strokeWidth="1.3" />
      <circle cx="30" cy="66" r="2" fill={color} stroke="none" />
      <text x="30" y="94" fontSize="4.6" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.5">
        LAHORI
      </text>
      <text x="30" y="101" fontSize="3.6" fontWeight="800" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.5">
        JEERA
      </text>
    </svg>
  );
}

function SevenUpCan({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 65 120" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <ellipse cx="32.5" cy="14" rx="22" ry="6" />
      <path d="M10.5 14 v90 c0 6 10 9 22 9 s22 -3 22 -9 v-90" />
      {/* Big 7 + Red dot emblem */}
      <circle cx="44" cy="52" r="5" strokeWidth="1.4" />
      <path d="M22 42 h16 l-10 26" strokeWidth="2.2" />
      <text x="32.5" y="90" fontSize="6.5" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.8">
        7UP
      </text>
    </svg>
  );
}

function LimcaBottle({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 140" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="25" y="6" width="10" height="4" rx="1" />
      <path d="M26 10 v12 c0 4 -3 8 -5 14 c-2 6 -3 16 -3 26 c0 16 3 28 3 42 c0 12 -2 20 -2 26 c0 4 3 6 11 6 s11 -2 11 -6 c0 -6 -2 -14 -2 -26 c0 -14 3 -26 3 -42 c0 -10 -1 -20 -3 -26 c-2 -6 -5 -10 -5 -14 v-12" />
      {/* Crisp lemon wave */}
      <path d="M19 60 q11 -4 22 2" strokeWidth="1.4" />
      <circle cx="30" cy="74" r="5" strokeWidth="1.2" />
      <text x="30" y="92" fontSize="5.5" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.8">
        LIMCA
      </text>
    </svg>
  );
}

function MountainDewCan({ color = "#08633B" }: { color?: string }) {
  return (
    <svg viewBox="0 0 65 120" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <ellipse cx="32.5" cy="14" rx="22" ry="6" />
      <path d="M10.5 14 v90 c0 6 10 9 22 9 s22 -3 22 -9 v-90" />
      {/* Angular jagged mountain chevron */}
      <path d="M20 54 L32.5 38 L45 54 L32.5 50 Z" strokeWidth="1.5" />
      <text x="32.5" y="76" fontSize="5.5" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.5">
        MTN DEW
      </text>
    </svg>
  );
}

function PantherEnergyCan({ color = "#08633B" }: { color?: string }) {
  return (
    <svg viewBox="0 0 55 130" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <ellipse cx="27.5" cy="12" rx="18" ry="5" />
      <path d="M9.5 12 v104 c0 4 8 6 18 6 s18 -2 18 -6 v-104" />
      {/* Triple claw slash marks */}
      <path d="M20 44 l4 22 M27.5 40 l3 28 M35 44 l2 22" strokeWidth="1.8" />
      <text x="27.5" y="86" fontSize="4.6" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.6">
        PANTHER
      </text>
      <text x="27.5" y="94" fontSize="3.6" fontWeight="800" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.4">
        ENERGY
      </text>
    </svg>
  );
}

function AppyFizzBottle({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 140" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Sleek champagne neck bottle */}
      <rect x="25" y="6" width="10" height="4" rx="1" />
      <path d="M26 10 v18 c0 10 -4 18 -6 26 c-2 8 -2 20 -2 34 c0 14 2 24 2 32 c0 4 3 6 10 6 s10 -2 10 -6 c0 -8 2 -18 2 -32 c0 -14 0 -26 -2 -34 c-2 -8 -6 -16 -6 -26 v-18" />
      {/* Apple silhouette & rising fizz */}
      <circle cx="30" cy="62" r="6" strokeWidth="1.3" />
      <path d="M30 56 q3 -4 6 -2" strokeWidth="1.2" />
      <circle cx="27" cy="80" r="1.5" />
      <circle cx="33" cy="86" r="2" />
      <circle cx="28" cy="94" r="1.5" />
      <text x="30" y="108" fontSize="4.4" fontWeight="950" textAnchor="middle" fill={color} stroke="none" letterSpacing="0.5">
        APPY FIZZ
      </text>
    </svg>
  );
}

// -------------------------------------------------------------
// Generic Beverage Motifs (Citrus, Mint, Drops, Cans, Caps, Bubbles)
// -------------------------------------------------------------

function CitrusSlice({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="30" cy="30" r="26" />
      <circle cx="30" cy="30" r="21" strokeDasharray="2 2" opacity="0.6" />
      <circle cx="30" cy="30" r="4" fill={color} fillOpacity="0.15" />
      <line x1="30" y1="9" x2="30" y2="26" />
      <line x1="30" y1="34" x2="30" y2="51" />
      <line x1="9" y1="30" x2="26" y2="30" />
      <line x1="34" y1="30" x2="51" y2="30" />
      <line x1="15" y1="15" x2="27" y2="27" />
      <line x1="33" y1="33" x2="45" y2="45" />
      <line x1="45" y1="15" x2="33" y2="27" />
      <line x1="27" y1="33" x2="15" y2="45" />
    </svg>
  );
}

function CrownBottleCap({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="30" cy="30" r="18" />
      <circle cx="30" cy="30" r="12" strokeDasharray="2 2" opacity="0.5" />
      {/* 16 Scalloped crimped teeth */}
      <path d="M30 6 l2 5 M39 8 l1 5 M47 13 l-1 5 M52 21 l-3 4 M54 30 l-5 2 M52 39 l-4 1 M47 47 l-5 -1 M39 52 l-1 -5 M30 54 l-2 -5 M21 52 l-1 -5 M13 47 l1 -5 M8 39 l3 -1 M6 30 l5 -2 M8 21 l4 -1 M13 13 l5 1 M21 8 l1 5" strokeWidth="1.3" />
      <circle cx="30" cy="30" r="3" fill={color} fillOpacity="0.15" />
    </svg>
  );
}

function CarbonationBubbles({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 50 70" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="25" cy="15" r="7" />
      <circle cx="23" cy="13" r="2" fill={color} fillOpacity="0.3" stroke="none" />
      <circle cx="14" cy="38" r="5" />
      <circle cx="36" cy="42" r="6" />
      <circle cx="24" cy="58" r="4" />
      {/* Sparkles */}
      <path d="M38 18 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

function MintLeafMotif({ color = "#08633B" }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M10 50 C10 24 30 10 50 10 C50 36 30 50 10 50 Z" />
      <path d="M10 50 Q30 30 50 10" strokeWidth="1.2" />
      <path d="M25 35 q8 -6 12 -4 M20 40 q12 -4 18 0 M35 25 q6 -6 10 -4" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

function CondensationDroplets({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 50 60" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M16 12 C16 12 10 22 10 28 C10 32 13 35 16 35 C19 35 22 32 22 28 C22 22 16 12 16 12 Z" />
      <path d="M34 22 C34 22 30 29 30 33 C30 36 32 38 34 38 C36 38 38 36 38 33 C38 29 34 22 34 22 Z" />
      <path d="M26 38 C26 38 23 44 23 47 C23 49 24.5 51 26 51 C27.5 51 29 49 29 47 C29 44 26 38 26 38 Z" />
    </svg>
  );
}

function GenericSodaCan({ color = "#16834A" }: { color?: string }) {
  return (
    <svg viewBox="0 0 65 110" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <ellipse cx="32.5" cy="14" rx="20" ry="6" />
      <ellipse cx="32.5" cy="14" rx="7" ry="2.5" strokeWidth="1" />
      <path d="M12.5 14 v82 c0 5 9 8 20 8 s20 -3 20 -8 v-82" />
      <line x1="12.5" y1="36" x2="52.5" y2="36" strokeDasharray="2 2" opacity="0.5" />
      <line x1="12.5" y1="76" x2="52.5" y2="76" strokeDasharray="2 2" opacity="0.5" />
      <circle cx="32.5" cy="56" r="10" strokeWidth="1.2" />
    </svg>
  );
}

// -------------------------------------------------------------
// Deterministic Placement Matrix (Zero Math.random() for SSR Safety)
// Spec: ~0.08–0.15 opacity, selected up to 0.18, thin green outlines
// -------------------------------------------------------------

type IconComponent = React.ComponentType<{ color?: string }>;

interface PatternItem {
  id: string;
  component: IconComponent;
  top: string;
  left: string;
  size: number; // width in pixels
  rotate: number; // rotation in deg
  opacity: number;
  color: string;
}

// Master deterministic set of beverage illustrations framing auth screens
const AUTH_PATTERN_ITEMS: PatternItem[] = [
  // Top-Left Cluster
  { id: "coke-tl", component: CocaColaBottle, top: "4%", left: "3%", size: 68, rotate: -12, opacity: 0.16, color: "#16834A" },
  { id: "sting-tl", component: StingCan, top: "20%", left: "6%", size: 54, rotate: 14, opacity: 0.15, color: "#08633B" },
  { id: "bubbles-tl", component: CarbonationBubbles, top: "12%", left: "14%", size: 38, rotate: 8, opacity: 0.14, color: "#16834A" },
  { id: "limca-tl", component: LimcaBottle, top: "34%", left: "3%", size: 60, rotate: -8, opacity: 0.13, color: "#16834A" },
  { id: "citrus-tl", component: CitrusSlice, top: "28%", left: "12%", size: 44, rotate: 25, opacity: 0.15, color: "#16834A" },

  // Top Edge / Header Margin
  { id: "sprite-tc", component: SpriteBottle, top: "3%", left: "28%", size: 56, rotate: 10, opacity: 0.14, color: "#16834A" },
  { id: "cap-tc", component: CrownBottleCap, top: "5%", left: "48%", size: 42, rotate: -15, opacity: 0.12, color: "#16834A" },
  { id: "redbull-tr", component: RedBullCan, top: "3%", left: "68%", size: 52, rotate: -10, opacity: 0.15, color: "#08633B" },

  // Top-Right Cluster
  { id: "pepsi-tr", component: PepsiCan, top: "5%", left: "86%", size: 62, rotate: 15, opacity: 0.17, color: "#16834A" },
  { id: "thumsup-tr", component: ThumsUpBottle, top: "18%", left: "91%", size: 64, rotate: -14, opacity: 0.16, color: "#08633B" },
  { id: "fizz-tr", component: AppyFizzBottle, top: "18%", left: "78%", size: 54, rotate: 12, opacity: 0.13, color: "#16834A" },
  { id: "mint-tr", component: MintLeafMotif, top: "30%", left: "85%", size: 42, rotate: 35, opacity: 0.14, color: "#08633B" },

  // Right Edge Middle Margin
  { id: "fanta-mr", component: FantaBottle, top: "42%", left: "89%", size: 62, rotate: 8, opacity: 0.16, color: "#16834A" },
  { id: "panther-mr", component: PantherEnergyCan, top: "56%", left: "92%", size: 52, rotate: -16, opacity: 0.14, color: "#08633B" },
  { id: "bubbles-mr", component: CarbonationBubbles, top: "48%", left: "80%", size: 40, rotate: -6, opacity: 0.12, color: "#16834A" },
  { id: "citrus-mr", component: CitrusSlice, top: "66%", left: "86%", size: 46, rotate: -22, opacity: 0.14, color: "#16834A" },

  // Bottom-Right Cluster
  { id: "frooti-br", component: FrootiCarton, top: "76%", left: "88%", size: 64, rotate: 12, opacity: 0.17, color: "#16834A" },
  { id: "sevenup-br", component: SevenUpCan, top: "82%", left: "76%", size: 56, rotate: -10, opacity: 0.15, color: "#16834A" },
  { id: "drops-br", component: CondensationDroplets, top: "72%", left: "78%", size: 36, rotate: 18, opacity: 0.13, color: "#16834A" },

  // Bottom Edge Margin
  { id: "dew-bc", component: MountainDewCan, top: "86%", left: "56%", size: 54, rotate: 14, opacity: 0.14, color: "#08633B" },
  { id: "cap-bc", component: CrownBottleCap, top: "88%", left: "38%", size: 40, rotate: 20, opacity: 0.12, color: "#16834A" },

  // Bottom-Left Cluster
  { id: "maaza-bl", component: MaazaBottle, top: "75%", left: "4%", size: 64, rotate: -14, opacity: 0.16, color: "#08633B" },
  { id: "lahori-bl", component: LahoriJeeraBottle, top: "84%", left: "14%", size: 58, rotate: 16, opacity: 0.15, color: "#16834A" },
  { id: "can-bl", component: GenericSodaCan, top: "62%", left: "5%", size: 54, rotate: 10, opacity: 0.13, color: "#16834A" },
  { id: "mint-bl", component: MintLeafMotif, top: "52%", left: "10%", size: 40, rotate: -30, opacity: 0.14, color: "#08633B" },
  { id: "bubbles-bl", component: CarbonationBubbles, top: "70%", left: "16%", size: 36, rotate: 4, opacity: 0.12, color: "#16834A" },
];

// Lighter pattern items for homepage / catalog pages
const PAGE_PATTERN_ITEMS: PatternItem[] = [
  { id: "coke-p1", component: CocaColaBottle, top: "6%", left: "2%", size: 56, rotate: -10, opacity: 0.09, color: "#16834A" },
  { id: "pepsi-p1", component: PepsiCan, top: "8%", left: "94%", size: 52, rotate: 12, opacity: 0.09, color: "#16834A" },
  { id: "sting-p1", component: StingCan, top: "24%", left: "1%", size: 46, rotate: 15, opacity: 0.08, color: "#08633B" },
  { id: "frooti-p1", component: FrootiCarton, top: "28%", left: "95%", size: 50, rotate: -14, opacity: 0.09, color: "#16834A" },
  { id: "citrus-p1", component: CitrusSlice, top: "42%", left: "2%", size: 38, rotate: 25, opacity: 0.08, color: "#16834A" },
  { id: "thumsup-p1", component: ThumsUpBottle, top: "48%", left: "95%", size: 54, rotate: -8, opacity: 0.09, color: "#08633B" },
  { id: "limca-p1", component: LimcaBottle, top: "64%", left: "1%", size: 52, rotate: 10, opacity: 0.08, color: "#16834A" },
  { id: "sevenup-p1", component: SevenUpCan, top: "68%", left: "94%", size: 48, rotate: -12, opacity: 0.08, color: "#16834A" },
  { id: "bubbles-p1", component: CarbonationBubbles, top: "82%", left: "3%", size: 34, rotate: 6, opacity: 0.08, color: "#16834A" },
  { id: "redbull-p1", component: RedBullCan, top: "86%", left: "95%", size: 46, rotate: 14, opacity: 0.09, color: "#08633B" },
];

export function BeveragePatternBackground({
  variant = "auth",
  className = "",
}: BeveragePatternBackgroundProps) {
  const items = variant === "auth" ? AUTH_PATTERN_ITEMS : PAGE_PATTERN_ITEMS;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Background Mint Gradient Tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F0FDF4]/80 via-white to-[#F0FDF4]/60" />

      {/* Soft Center Vignette to keep central forms / cards crisp and highly readable */}
      {variant === "auth" && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.4)_65%,transparent_100%)]" />
      )}

      {/* Deterministic SVG Beverage Illustrations */}
      {items.map((item) => {
        const Icon = item.component;
        return (
          <div
            key={item.id}
            className="absolute transition-opacity duration-300"
            style={{
              top: item.top,
              left: item.left,
              width: `${item.size}px`,
              height: `${Math.round(item.size * 1.8)}px`,
              transform: `rotate(${item.rotate}deg)`,
              opacity: item.opacity,
            }}
          >
            <Icon color={item.color} />
          </div>
        );
      })}
    </div>
  );
}

export default BeveragePatternBackground;
