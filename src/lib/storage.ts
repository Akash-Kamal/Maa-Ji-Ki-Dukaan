import { createClient } from "@/lib/supabase/client";

export const PRODUCT_IMAGES_BUCKET = "product-images";
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface UploadImageResult {
  path: string;
  publicUrl: string;
}

/**
 * Validates product image file before upload.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WEBP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a product image to Supabase Storage and returns its public URL.
 */
export async function uploadProductImage(
  file: File,
  prefix: string = "products"
): Promise<UploadImageResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const supabase = createClient();
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl,
  };
}
