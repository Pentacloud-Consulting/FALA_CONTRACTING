/**
 * Authoritative financial calculation functions and formatting utilities for Fala CRM + ERP.
 * Prevents floating point issues and guarantees consistent business calculations.
 */

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatAED(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "AED 0.00";
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return new Intl.NumberFormat("en-AE", {
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface EstimationCalculationInput {
  lineItems: {
    quantity: number;
    unitRate: number;
    costCategory: string;
  }[];
  overheads?: number;
  contingency?: number;
  targetMarginPercent: number; // e.g. 15 for 15%
  taxRatePercent?: number; // e.g. 5 for 5%
}

export interface EstimationCalculationResult {
  totalDirectCost: number;
  overheads: number;
  contingency: number;
  totalCost: number;
  sellingPriceBeforeTax: number;
  taxAmount: number;
  finalPrice: number;
  estimatedProfit: number;
  profitMarginPercent: number;
}

export function calculateEstimation(input: EstimationCalculationInput): EstimationCalculationResult {
  const totalDirectCost = round2(
    input.lineItems.reduce((acc, item) => {
      const lineTotal = round2(Number(item.quantity || 0) * Number(item.unitRate || 0));
      return acc + lineTotal;
    }, 0)
  );

  const overheads = round2(Number(input.overheads || 0));
  const contingency = round2(Number(input.contingency || 0));
  const totalCost = round2(totalDirectCost + overheads + contingency);

  // Validate margin: Target Margin is a percentage of selling price.
  // Selling Price = Total Cost / (1 - Target Margin)
  let marginRatio = Number(input.targetMarginPercent || 0) / 100;
  if (marginRatio >= 0.99) {
    marginRatio = 0.99; // Cap to prevent division by zero or negative
  }
  if (marginRatio < 0) {
    marginRatio = 0;
  }

  const sellingPriceBeforeTax = marginRatio === 1 ? totalCost : round2(totalCost / (1 - marginRatio));
  const estimatedProfit = round2(sellingPriceBeforeTax - totalCost);
  const profitMarginPercent = sellingPriceBeforeTax > 0 ? round2((estimatedProfit / sellingPriceBeforeTax) * 100) : 0;

  const taxRate = Number(input.taxRatePercent ?? 5.0) / 100;
  const taxAmount = round2(sellingPriceBeforeTax * taxRate);
  const finalPrice = round2(sellingPriceBeforeTax + taxAmount);

  return {
    totalDirectCost,
    overheads,
    contingency,
    totalCost,
    sellingPriceBeforeTax,
    taxAmount,
    finalPrice,
    estimatedProfit,
    profitMarginPercent,
  };
}
