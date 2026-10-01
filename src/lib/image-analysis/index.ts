import type {
  ProductImageAnalysisResult,
  AnalyzedField,
  ConfidenceScore,
} from "@/types";

/**
 * Creates an AnalyzedField with strict review state.
 * If confidence is low or value is null, automatically flags needsReview = true.
 */
export function createAnalyzedField<T>(
  value: T | null,
  confidence: ConfidenceScore,
  extractedFromText?: string,
  sourceNote?: string
): AnalyzedField<T> {
  const needsReview = confidence === "low" || confidence === "needs_review" || value === null;

  return {
    value,
    confidence,
    needsReview,
    extractedFromText,
    sourceNote,
  };
}

/**
 * Safety validator ensuring no hallucinated or invented critical commercial values.
 * Prices and initial stock must be manually verified and input by the admin.
 */
export function validateAnalysisSafety(
  analysis: ProductImageAnalysisResult
): { passed: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Enforce manual entry check for commercial fields
  if (!analysis.manualFieldsRequired.basePrice) {
    warnings.push("SAFETY BREACH: Base price cannot be automatically assumed.");
  }
  if (!analysis.manualFieldsRequired.stockQuantity) {
    warnings.push("SAFETY BREACH: Stock quantity cannot be automatically assumed.");
  }

  // Check pieces per case
  if (analysis.piecesPerCase.value === null || analysis.piecesPerCase.needsReview) {
    warnings.push(
      "Case quantity not conclusively visible on packaging. Admin confirmation required."
    );
  }

  // Check brand and product name
  if (!analysis.brand.value || analysis.brand.needsReview) {
    warnings.push("Brand needs manual confirmation by Admin.");
  }
  if (!analysis.productName.value || analysis.productName.needsReview) {
    warnings.push("Product name needs manual confirmation by Admin.");
  }

  return {
    passed: warnings.length === 0,
    warnings,
  };
}

/**
 * Normalizes draft inspection into a structured Product draft for Admin review.
 */
export interface ProductDraftFromAnalysis {
  name: string;
  brandName: string;
  categoryName: string;
  size: string;
  piecesPerCase: number | "";
  basePrice: number | ""; // Must be input by admin
  stockQuantity: number | ""; // Must be input by admin
  isPriceConfirmed: boolean;
  notes: string[];
}

export function buildProductDraft(
  analysis: ProductImageAnalysisResult
): ProductDraftFromAnalysis {
  return {
    name: analysis.productName.value || "",
    brandName: analysis.brand.value || "",
    categoryName: analysis.category.value || "Other Beverages",
    size: analysis.visibleSize.value || "",
    piecesPerCase: analysis.piecesPerCase.value ?? "",
    basePrice: "", // Strictly left empty for admin manual entry
    stockQuantity: "", // Strictly left empty for admin manual entry
    isPriceConfirmed: false,
    notes: [
      ...(analysis.piecesPerCase.needsReview
        ? ["Pieces per case requires verification from physical packaging."]
        : []),
      "Wholesale price per case and initial warehouse stock must be entered by Admin.",
    ],
  };
}
