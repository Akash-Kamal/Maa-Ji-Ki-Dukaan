import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kyaniskklympilrmgoyg.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Run with --env-file=.env.local");
  process.exit(1);
}

const adminDb = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  console.log("=== POPULATING ALL BEVERAGE PRODUCTS & IMAGES IN SUPABASE ===");

  // 1. Fetch categories
  const { data: categories } = await adminDb.from("categories").select("*");
  const waterCat = categories.find((c) => c.slug === "water")?.id;
  const softDrinksCat = categories.find((c) => c.slug === "soft-drinks")?.id;
  const energyCat = categories.find((c) => c.slug === "energy-drinks")?.id;

  // 2. Insert new Brands
  const newBrands = [
    { name: "Bisleri", description: "India's leading packaged mineral water brand" },
    { name: "Campa", description: "The Great Indian Taste carbonated beverages by Reliance" },
    { name: "Lahori", description: "Traditional spiced soda and ethnic beverage brand" },
    { name: "Non Stop", description: "Maximum energy and stamina boost drink" },
    { name: "Panther", description: "Wild energy recharge beverage" },
  ];

  for (const b of newBrands) {
    const { data: existing } = await adminDb.from("brands").select("id").eq("name", b.name).single();
    if (!existing) {
      const { data: created, error } = await adminDb.from("brands").insert(b).select().single();
      console.log("Created brand:", b.name, created?.id, error ? error.message : "OK");
    }
  }

  const { data: allBrands } = await adminDb.from("brands").select("*");
  const getBrandId = (name) => allBrands.find((b) => b.name.toLowerCase() === name.toLowerCase())?.id;

  // 3. Products to add
  const productsToAdd = [
    {
      name: "Bisleri Packaged Drinking Water",
      slug: "bisleri-water",
      brand_id: getBrandId("Bisleri"),
      category_id: waterCat,
      description: "Hygienically purified mineral water wholesale case packs.",
      product_image_url: "/images/products/bisleri_water_1l_x12.jpg",
      variants: [
        { name: "200ml (Pack of 48)", size: "200ml", pieces: 48, price: 260, stock: 100 },
        { name: "250ml (Pack of 24)", size: "250ml", pieces: 24, price: 180, stock: 80 },
        { name: "1L (Pack of 12)", size: "1L", pieces: 12, price: 210, stock: 150 },
        { name: "2L (Pack of 9)", size: "2L", pieces: 9, price: 250, stock: 60 },
      ],
    },
    {
      name: "Campa Cola",
      slug: "campa-cola",
      brand_id: getBrandId("Campa"),
      category_id: softDrinksCat,
      description: "Original Indian cola beverage with crisp taste.",
      product_image_url: "/images/products/campa_cola_750ml.jpg",
      variants: [
        { name: "750ml (Pack of 24)", size: "750ml", pieces: 24, price: 440, stock: 50 },
      ],
    },
    {
      name: "Campa Orange",
      slug: "campa-orange",
      brand_id: getBrandId("Campa"),
      category_id: softDrinksCat,
      description: "Tangy and refreshing orange sparkling drink.",
      product_image_url: "/images/products/campa_orange_250ml.jpg",
      variants: [
        { name: "250ml (Pack of 30)", size: "250ml", pieces: 30, price: 290, stock: 60 },
      ],
    },
    {
      name: "Campa Lemon",
      slug: "campa-lemon",
      brand_id: getBrandId("Campa"),
      category_id: softDrinksCat,
      description: "Zesty lemon carbonated soft drink.",
      product_image_url: "/images/products/campa_lemon_500ml.jpg",
      variants: [
        { name: "500ml (Pack of 24)", size: "500ml", pieces: 24, price: 380, stock: 45 },
      ],
    },
    {
      name: "Campa Energy Gold Boost",
      slug: "campa-energy-gold",
      brand_id: getBrandId("Campa"),
      category_id: energyCat,
      description: "Gold boost energy drink formulated for stamina.",
      product_image_url: "/images/products/campa_energy_gold_boost_250ml.jpg",
      variants: [
        { name: "250ml (Pack of 30)", size: "250ml", pieces: 30, price: 540, stock: 40 },
      ],
    },
    {
      name: "Lahori Zeera",
      slug: "lahori-zeera",
      brand_id: getBrandId("Lahori"),
      category_id: softDrinksCat,
      description: "Authentic desi roasted cumin sparkling digestive soda.",
      product_image_url: "/images/products/lahori_zeera_250ml.jpg",
      variants: [
        { name: "250ml (Pack of 30)", size: "250ml", pieces: 30, price: 320, stock: 75 },
      ],
    },
    {
      name: "Lahori Nimboo",
      slug: "lahori-nimboo",
      brand_id: getBrandId("Lahori"),
      category_id: softDrinksCat,
      description: "Traditional lemon masala refreshing soda.",
      product_image_url: "/images/products/lahori_nimboo_250ml.jpg",
      variants: [
        { name: "250ml (Pack of 30)", size: "250ml", pieces: 30, price: 320, stock: 50 },
      ],
    },
    {
      name: "Lahori Shikanji",
      slug: "lahori-shikanji",
      brand_id: getBrandId("Lahori"),
      category_id: softDrinksCat,
      description: "Classic Indian street-style sparkling shikanji.",
      product_image_url: "/images/products/lahori_shikanji_250ml.jpg",
      variants: [
        { name: "250ml (Pack of 30)", size: "250ml", pieces: 30, price: 320, stock: 45 },
      ],
    },
    {
      name: "Non Stop Energy Drink",
      slug: "non-stop-energy",
      brand_id: getBrandId("Non Stop"),
      category_id: energyCat,
      description: "High impact energy beverage in 450ml pet bottles.",
      product_image_url: "/images/products/non_stop_original_450ml.jpg",
      variants: [
        { name: "Original 450ml (Pack of 24)", size: "450ml", pieces: 24, price: 890, stock: 35 },
        { name: "Boost 450ml (Pack of 24)", size: "450ml", pieces: 24, price: 890, stock: 30 },
        { name: "Jungle 450ml (Pack of 24)", size: "450ml", pieces: 24, price: 890, stock: 25 },
      ],
    },
    {
      name: "Panther Energy Drink",
      slug: "panther-energy",
      brand_id: getBrandId("Panther"),
      category_id: energyCat,
      description: "Potent energy boost formulation.",
      product_image_url: "/images/products/panther_energy_drink.jpg",
      variants: [
        { name: "250ml (Pack of 24)", size: "250ml", pieces: 24, price: 720, stock: 30 },
      ],
    },
  ];

  for (const item of productsToAdd) {
    let productId;
    const { data: existingProd } = await adminDb.from("products").select("id").eq("slug", item.slug).single();
    if (existingProd) {
      productId = existingProd.id;
      await adminDb.from("products").update({ product_image_url: item.product_image_url }).eq("id", productId);
      console.log("Updated product:", item.name);
    } else {
      const { data: newProd, error: prodErr } = await adminDb
        .from("products")
        .insert({
          name: item.name,
          slug: item.slug,
          brand_id: item.brand_id,
          category_id: item.category_id,
          description: item.description,
          product_image_url: item.product_image_url,
          is_active: true,
        })
        .select()
        .single();
      if (prodErr) {
        console.error("Failed to insert product", item.name, prodErr);
        continue;
      }
      productId = newProd.id;
      console.log("Inserted new product:", item.name, "(ID:", productId, ")");
    }

    // Insert or update variants
    for (const v of item.variants) {
      const { data: existingVar } = await adminDb
        .from("product_variants")
        .select("id")
        .eq("product_id", productId)
        .eq("variant_name", v.name)
        .single();

      if (!existingVar) {
        const { error: varErr } = await adminDb.from("product_variants").insert({
          product_id: productId,
          variant_name: v.name,
          slug: `${item.slug}-${v.size.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          size: v.size,
          packaging_type: v.name.toLowerCase().includes("can") ? "can" : "bottle",
          pieces_per_case: v.pieces,
          price_per_case: v.price,
          stock_cases: v.stock,
          reserved_cases: 0,
          reorder_level_cases: 5,
          needs_review: false,
          is_active: true,
        });
        if (varErr) {
          console.error("Error creating variant:", v.name, varErr);
        } else {
          console.log("  + Created variant:", v.name, "at ₹" + v.price);
        }
      }
    }
  }

  console.log("=== ALL PRODUCTS AND VARIANTS SUCCESSFULLY SYNCED ===");
}

run().catch(console.error);
