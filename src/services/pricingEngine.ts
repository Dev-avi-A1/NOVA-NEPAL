/**
 * NOVA NEPAL - Wholesale Pricing Engine
 * Decimal-safe arithmetic, tier validation, boundary verification, and line-total computation.
 */

import { PriceTier, ProductVariant } from '../types/market';

export interface PricingEvaluationResult {
  isValid: boolean;
  unitPriceNpr: number;
  totalNpr: number;
  appliedTier?: PriceTier;
  error?: string;
}

export class PricingEngine {
  /**
   * Validates that price tiers for a variant have non-overlapping ranges,
   * proper ascending minQuantities, and correct bounds.
   */
  public static validateTierConfiguration(
    moq: number,
    tiers: Array<{ minQuantity: number; maxQuantity?: number; unitPriceNpr: number }>
  ): { valid: boolean; error?: string } {
    if (!tiers || tiers.length === 0) {
      return { valid: false, error: 'At least one wholesale price tier is required.' };
    }

    if (moq <= 0) {
      return { valid: false, error: 'Minimum Order Quantity (MOQ) must be at least 1.' };
    }

    // Sort by minQuantity ascending
    const sorted = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);

    // The first tier's minQuantity must align with or precede the variant's MOQ
    if (sorted[0].minQuantity > moq) {
      return {
        valid: false,
        error: `First price tier minimum quantity (${sorted[0].minQuantity}) cannot exceed variant MOQ (${moq}).`,
      };
    }

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];

      if (current.unitPriceNpr <= 0) {
        return { valid: false, error: `Unit price for tier ${i + 1} must be positive.` };
      }

      if (current.maxQuantity !== undefined && current.maxQuantity < current.minQuantity) {
        return {
          valid: false,
          error: `Tier ${i + 1} max quantity (${current.maxQuantity}) cannot be lower than min quantity (${current.minQuantity}).`,
        };
      }

      // Check overlap or gaps with previous tier
      if (i > 0) {
        const prev = sorted[i - 1];
        if (prev.maxQuantity === undefined) {
          return {
            valid: false,
            error: `Tier ${i} is unbounded at top; no subsequent tier may follow an unbounded tier.`,
          };
        }

        if (current.minQuantity <= prev.maxQuantity) {
          return {
            valid: false,
            error: `Overlapping price ranges: Tier ${i} starts at ${current.minQuantity} while previous tier ends at ${prev.maxQuantity}.`,
          };
        }

        // Wholesale volume discount rule: higher volume should generally have lower or equal unit price
        if (current.unitPriceNpr > prev.unitPriceNpr) {
          return {
            valid: false,
            error: `Wholesale pricing anomaly: Tier ${i + 1} (NPR ${current.unitPriceNpr}) is higher than Tier ${i} (NPR ${prev.unitPriceNpr}). Volume prices must reward scale.`,
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Authoritatively evaluates the applicable unit price and computes the line total for a variant and requested quantity.
   */
  public static calculatePrice(variant: ProductVariant, quantity: number): PricingEvaluationResult {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return {
        isValid: false,
        unitPriceNpr: 0,
        totalNpr: 0,
        error: 'Order quantity must be a positive whole integer.',
      };
    }

    if (quantity < variant.minOrderQuantity) {
      return {
        isValid: false,
        unitPriceNpr: 0,
        totalNpr: 0,
        error: `Quantity ${quantity} does not meet Minimum Order Quantity (${variant.minOrderQuantity} ${variant.unitOfMeasure}).`,
      };
    }

    if (variant.maxOrderQuantity && quantity > variant.maxOrderQuantity) {
      return {
        isValid: false,
        unitPriceNpr: 0,
        totalNpr: 0,
        error: `Quantity ${quantity} exceeds Maximum Order Quantity (${variant.maxOrderQuantity} ${variant.unitOfMeasure}).`,
      };
    }

    if (variant.status !== 'ACTIVE') {
      return {
        isValid: false,
        unitPriceNpr: 0,
        totalNpr: 0,
        error: `Variant ${variant.sku} is currently inactive or suspended.`,
      };
    }

    // Find the matching tier
    const matchingTier = variant.priceTiers.find((tier) => {
      const minMet = quantity >= tier.minQuantity;
      const maxMet = tier.maxQuantity === undefined || quantity <= tier.maxQuantity;
      return minMet && maxMet;
    });

    if (!matchingTier) {
      return {
        isValid: false,
        unitPriceNpr: 0,
        totalNpr: 0,
        error: `No wholesale pricing tier configured for quantity ${quantity}.`,
      };
    }

    // Decimal-safe currency computation in NPR
    const unitPrice = matchingTier.unitPriceNpr;
    const total = Math.round(unitPrice * quantity * 100) / 100;

    return {
      isValid: true,
      unitPriceNpr: unitPrice,
      totalNpr: total,
      appliedTier: matchingTier,
    };
  }

  /**
   * Formats Nepalese Rupee amount with standard Nepali/Indian comma notation and tabular formatting.
   * e.g., NPR 1,50,000.00
   */
  public static formatNpr(amount: number): string {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
