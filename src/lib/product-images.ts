/**
 * MAA JI KI DUKAAN - BEVERAGE IMAGE RESOLVER
 * Maps products and pack sizes to real authentic product photography
 * Sources from /public/images/products (71 verified beverage packaging files)
 */

export interface ImageMapping {
  defaultImage: string;
  variants: Record<string, string>;
}

export const PRODUCT_IMAGE_REGISTRY: Record<string, ImageMapping> = {
  // --- COCA-COLA BEVERAGES ---
  coke: {
    defaultImage: "/images/products/coca_cola_original_taste_250ml.jpg",
    variants: {
      "250ml": "/images/products/coca_cola_original_taste_250ml.jpg",
      "500ml": "/images/products/coca_cola_original_taste_500ml.jpg",
      "750ml": "/images/products/coca_cola_original_taste_500ml.jpg",
      "1l": "/images/products/coca_cola_original_taste_1l.jpg",
      "2l": "/images/products/coca_cola_original_taste_2l.jpg",
      "can 180ml": "/images/products/coca_cola_original_taste_can_180ml.jpg",
      "can 300ml": "/images/products/coca_cola_original_taste_can_300ml.jpg",
      "can 330ml": "/images/products/coca_cola_original_taste_can_300ml.jpg",
    },
  },
  "thums-up": {
    defaultImage: "/images/products/thums_up_250ml.jpg",
    variants: {
      "250ml": "/images/products/thums_up_250ml.jpg",
      "750ml": "/images/products/thums_up_750ml.jpg",
      "1l": "/images/products/thums_up_1l.jpg",
      "2l": "/images/products/thums_up_2l.jpg",
      "can 180ml": "/images/products/thums_up_can_180ml.jpg",
      "can 300ml": "/images/products/thums_up_can_300ml.jpg",
      "can 330ml": "/images/products/thums_up_can_300ml.jpg",
    },
  },
  sprite: {
    defaultImage: "/images/products/sprite_750ml.jpg",
    variants: {
      "250ml": "/images/products/sprite_750ml.jpg",
      "750ml": "/images/products/sprite_750ml.jpg",
      "1l": "/images/products/sprite_1l.jpg",
      "2l": "/images/products/sprite_2l.jpg",
      "can 180ml": "/images/products/sprite_can_180ml.jpg",
      "can 300ml": "/images/products/sprite_can_300ml.jpg",
      "can 330ml": "/images/products/sprite_can_300ml.jpg",
    },
  },
  fanta: {
    defaultImage: "/images/products/fanta_orange_750ml.jpg",
    variants: {
      "250ml": "/images/products/fanta_orange_750ml.jpg",
      "750ml": "/images/products/fanta_orange_750ml.jpg",
      "1l": "/images/products/fanta_orange_1l.jpg",
      "2l": "/images/products/fanta_orange_2l.jpg",
      "can 180ml": "/images/products/fanta_orange_can_180ml.jpg",
      "can 300ml": "/images/products/fanta_orange_can_300ml.jpg",
      "can 330ml": "/images/products/fanta_orange_can_300ml.jpg",
    },
  },
  limca: {
    defaultImage: "/images/products/limca_250ml.jpg",
    variants: {
      "250ml": "/images/products/limca_250ml.jpg",
      "750ml": "/images/products/limca_250ml.jpg",
      "1l": "/images/products/limca_250ml.jpg",
      "2l": "/images/products/limca_250ml.jpg",
      "can 180ml": "/images/products/limca_can_300ml.jpg",
      "can 300ml": "/images/products/limca_can_300ml.jpg",
      "can 330ml": "/images/products/limca_can_300ml.jpg",
    },
  },

  // --- PEPSICO BEVERAGES ---
  pepsi: {
    defaultImage: "/images/products/pepsi_750ml.jpg",
    variants: {
      "400ml": "/images/products/pepsi_400ml.jpg",
      "750ml": "/images/products/pepsi_750ml.jpg",
      "2l": "/images/products/pepsi_750ml.jpg",
    },
  },
  mirinda: {
    defaultImage: "/images/products/mirinda_orange_500ml.jpg",
    variants: {
      "400ml": "/images/products/mirinda_orange_400ml.jpg",
      "500ml": "/images/products/mirinda_orange_500ml.jpg",
      "750ml": "/images/products/mirinda_orange_500ml.jpg",
      "1.25l": "/images/products/mirinda_orange_1.25l.jpg",
      "2l": "/images/products/mirinda_orange_1.25l.jpg",
    },
  },
  "mountain-dew": {
    defaultImage: "/images/products/mountain_dew_750ml.jpg",
    variants: {
      "400ml": "/images/products/mountain_dew_400ml.jpg",
      "750ml": "/images/products/mountain_dew_750ml.jpg",
      "1.25l": "/images/products/mountain_dew_1.25l.jpg",
      "2l": "/images/products/mountain_dew_2l.jpg",
    },
  },
  "7up-nimbooz": {
    defaultImage: "/images/products/lahori_nimboo_250ml.jpg",
    variants: {
      "350ml": "/images/products/lahori_nimboo_250ml.jpg",
    },
  },

  // --- ENERGY DRINKS ---
  "red-bull": {
    defaultImage: "/images/products/red_bull_energy_drink_250ml.jpg",
    variants: {
      "250ml": "/images/products/red_bull_energy_drink_250ml.jpg",
    },
  },
  sting: {
    defaultImage: "/images/products/sting_energy_250ml.jpg",
    variants: {
      "250ml": "/images/products/sting_energy_250ml.jpg",
    },
  },
  "hell-energy": {
    defaultImage: "/images/products/hell_energy_classic_250ml.jpg",
    variants: {
      "250ml": "/images/products/hell_energy_classic_250ml.jpg",
    },
  },
  monster: {
    defaultImage: "/images/products/monster_mega_500ml.jpg",
    variants: {
      "500ml": "/images/products/monster_mega_500ml.jpg",
      standard: "/images/products/monster_mega_500ml.jpg",
    },
  },
  predator: {
    defaultImage: "/images/products/predator_double_strength_450ml_x24.jpg",
    variants: {
      "450ml": "/images/products/predator_double_strength_450ml_x24.jpg",
      standard: "/images/products/predator_double_strength_450ml_x24.jpg",
    },
  },
  "campa-energy-gold": {
    defaultImage: "/images/products/campa_energy_gold_boost_250ml.jpg",
    variants: {
      "250ml": "/images/products/campa_energy_gold_boost_250ml.jpg",
    },
  },
  "non-stop-energy": {
    defaultImage: "/images/products/non_stop_original_450ml.jpg",
    variants: {
      original: "/images/products/non_stop_original_450ml.jpg",
      boost: "/images/products/non_stop_boost_450ml.jpg",
      jungle: "/images/products/non_stop_jungle_450ml.jpg",
    },
  },
  "panther-energy": {
    defaultImage: "/images/products/panther_energy_drink.jpg",
    variants: {
      "250ml": "/images/products/panther_energy_drink.jpg",
    },
  },

  // --- WATER ---
  "bisleri-water": {
    defaultImage: "/images/products/bisleri_water_1l_x12.jpg",
    variants: {
      "200ml": "/images/products/bisleri_water_200ml_x48.jpg",
      "250ml": "/images/products/bisleri_water_250ml_x24.jpg",
      "1l": "/images/products/bisleri_water_1l_x12.jpg",
      "2l": "/images/products/bisleri_water_2l_x9.jpg",
    },
  },

  // --- CAMPA SPARKLING ---
  "campa-cola": {
    defaultImage: "/images/products/campa_cola_750ml.jpg",
    variants: {
      "750ml": "/images/products/campa_cola_750ml.jpg",
    },
  },
  "campa-orange": {
    defaultImage: "/images/products/campa_orange_250ml.jpg",
    variants: {
      "250ml": "/images/products/campa_orange_250ml.jpg",
    },
  },
  "campa-lemon": {
    defaultImage: "/images/products/campa_lemon_500ml.jpg",
    variants: {
      "500ml": "/images/products/campa_lemon_500ml.jpg",
      multipack: "/images/products/campa_lemon_multipack.jpg",
      case: "/images/products/campa_lemon_multipack.jpg",
    },
  },

  // --- LAHORI SPICED BEVERAGES ---
  "lahori-zeera": {
    defaultImage: "/images/products/lahori_zeera_250ml.jpg",
    variants: {
      "250ml": "/images/products/lahori_zeera_250ml.jpg",
      multipack: "/images/products/lahori_zeera_multipack.jpg",
      case: "/images/products/lahori_zeera_multipack.jpg",
    },
  },
  "lahori-nimboo": {
    defaultImage: "/images/products/lahori_nimboo_250ml.jpg",
    variants: {
      "250ml": "/images/products/lahori_nimboo_250ml.jpg",
      nimbu: "/images/products/lahori_nimbu_250ml.jpg",
    },
  },
  "lahori-shikanji": {
    defaultImage: "/images/products/lahori_shikanji_250ml.jpg",
    variants: {
      "250ml": "/images/products/lahori_shikanji_250ml.jpg",
    },
  },

  // --- DAIRY DRINKS ---
  "creambell-kesar-badam": {
    defaultImage: "/images/products/cream_bell_kesar_badam.jpg",
    variants: {
      "180ml": "/images/products/cream_bell_kesar_badam.jpg",
    },
  },
};

/**
 * Gallery mapping for products with alternate packaging angles and multipack shots
 */
export const PRODUCT_GALLERY_EXTRAS: Record<string, string[]> = {
  "campa-cola": ["/images/products/campa_cola_750ml_2.jpg"],
  "campa-orange": ["/images/products/campa_orange_250ml_2.jpg"],
  "campa-lemon": ["/images/products/campa_lemon_multipack.jpg"],
  "campa-energy": [
    "/images/products/campa_energy_gold_boost_250ml_2.jpg",
    "/images/products/campa_energy_gold_boost_250ml_3.jpg",
  ],
  fanta: ["/images/products/fanta_orange_750ml_2.jpg"],
  "lahori-zeera": ["/images/products/lahori_zeera_multipack.jpg"],
  "lahori-nimboo": ["/images/products/lahori_nimbu_250ml.jpg"],
  limca: [
    "/images/products/limca_250ml_2.jpg",
    "/images/products/limca_250ml_3.jpg",
    "/images/products/limca_250ml_4.jpg",
    "/images/products/limca_can_300ml_2.jpg",
  ],
  mirinda: ["/images/products/mirinda_orange_1.25l_2.jpg"],
  pepsi: [
    "/images/products/pepsi_750ml_2.jpg",
    "/images/products/pepsi_750ml_3.jpg",
  ],
  sprite: ["/images/products/sprite_1l_2.jpg"],
};

/**
 * Resolves the packaging image based on Product Slug and Variant / Size.
 */
export function resolveBeverageImage(
  productSlug?: string | null,
  variantNameOrSize?: string | null,
  databaseImageUrl?: string | null
): string {
  if (!productSlug) {
    return databaseImageUrl || "/images/products/maaji_ki_dukaan_logo.jpg";
  }

  const cleanSlug = productSlug.trim().toLowerCase();
  const entry = PRODUCT_IMAGE_REGISTRY[cleanSlug];

  if (!entry) {
    return databaseImageUrl || "/images/products/maaji_ki_dukaan_logo.jpg";
  }

  if (variantNameOrSize) {
    const cleanVariant = variantNameOrSize.trim().toLowerCase();

    // Direct key match
    for (const [key, path] of Object.entries(entry.variants)) {
      if (cleanVariant.includes(key)) {
        return path;
      }
    }
  }

  return databaseImageUrl || entry.defaultImage;
}

/**
 * Resolves all available packaging photos (primary size packaging + alternate angles / cases)
 */
export function resolveBeverageGallery(
  productSlug?: string | null,
  variantNameOrSize?: string | null,
  databaseImageUrl?: string | null
): string[] {
  const primary = resolveBeverageImage(productSlug, variantNameOrSize, databaseImageUrl);
  const gallery = [primary];

  if (productSlug) {
    const cleanSlug = productSlug.trim().toLowerCase();
    const extras = PRODUCT_GALLERY_EXTRAS[cleanSlug] || [];
    for (const img of extras) {
      if (!gallery.includes(img)) {
        gallery.push(img);
      }
    }
  }

  return gallery;
}
