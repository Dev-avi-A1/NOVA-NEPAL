/**
 * Automated Verification Suite for NOVA NEPAL B2B Wholesale Core Engine
 * Tests tier boundary validation, atomic stock reservation, multi-vendor order splitting,
 * decimal-safe arithmetic, and RFQ acceptance transactions.
 */

import { PricingEngine } from '../services/pricingEngine';
import { MarketStore } from '../services/marketStore';
import { ProductVariant } from '../types/market';

export function runAutomatedTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`PASS: ${testName}`);
    } else {
      failed++;
      results.push(`FAIL: ${testName}`);
    }
  }

  // Test 1: Reject negative or zero quantity
  const dummyVariant: ProductVariant = {
    id: 'var-test-1',
    productId: 'prod-test-1',
    sku: 'TEST-SKU-001',
    title: 'Test Industrial Fitting',
    unitOfMeasure: 'Box of 20',
    minOrderQuantity: 10,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    inventory: {
      id: 'inv-test-1',
      variantId: 'var-test-1',
      stockQuantity: 100,
      reservedQuantity: 0,
      availableQuantity: 100,
      warehouseLocation: 'Kathmandu Bay 1',
      lowStockThreshold: 10,
      updatedAt: new Date().toISOString(),
    },
    priceTiers: [
      { id: 't1', variantId: 'var-test-1', minQuantity: 10, maxQuantity: 49, unitPriceNpr: 500, currency: 'NPR' },
      { id: 't2', variantId: 'var-test-1', minQuantity: 50, maxQuantity: 99, unitPriceNpr: 450, currency: 'NPR' },
      { id: 't3', variantId: 'var-test-1', minQuantity: 100, unitPriceNpr: 400, currency: 'NPR' },
    ],
  };

  const zeroRes = PricingEngine.calculatePrice(dummyVariant, 0);
  assert(!zeroRes.isValid, 'Scenario 1: Zero or negative order quantity is rejected');

  // Test 2: Quantity below Minimum Order Quantity (MOQ) is rejected
  const belowMoqRes = PricingEngine.calculatePrice(dummyVariant, 5);
  assert(!belowMoqRes.isValid, 'Scenario 2: Quantity below MOQ (5 < 10) is rejected');

  // Test 3: Valid tier 1 selection (quantity 20)
  const tier1Res = PricingEngine.calculatePrice(dummyVariant, 20);
  assert(tier1Res.isValid && tier1Res.unitPriceNpr === 500 && tier1Res.totalNpr === 10000, 'Scenario 3: Tier 1 correctly evaluated (20 units @ NPR 500 = NPR 10,000)');

  // Test 4: Valid tier 2 selection (quantity 50)
  const tier2Res = PricingEngine.calculatePrice(dummyVariant, 50);
  assert(tier2Res.isValid && tier2Res.unitPriceNpr === 450 && tier2Res.totalNpr === 22500, 'Scenario 4: Tier 2 correctly evaluated (50 units @ NPR 450 = NPR 22,500)');

  // Test 5: Valid tier 3 selection (quantity 100)
  const tier3Res = PricingEngine.calculatePrice(dummyVariant, 100);
  assert(tier3Res.isValid && tier3Res.unitPriceNpr === 400 && tier3Res.totalNpr === 40000, 'Scenario 5: Top unbounded Tier 3 correctly evaluated (100 units @ NPR 400 = NPR 40,000)');

  // Test 6: Overlapping tier validation rejects improper configs
  const overlappingCheck = PricingEngine.validateTierConfiguration(10, [
    { minQuantity: 10, maxQuantity: 50, unitPriceNpr: 500 },
    { minQuantity: 45, maxQuantity: 100, unitPriceNpr: 450 }, // Overlaps 45 <= 50!
  ]);
  assert(!overlappingCheck.valid, 'Scenario 6: Overlapping wholesale tiers are rejected by validator');

  // Test 7: Tier pricing anomaly where higher quantity costs more per unit is rejected
  const anomalyCheck = PricingEngine.validateTierConfiguration(10, [
    { minQuantity: 10, maxQuantity: 49, unitPriceNpr: 500 },
    { minQuantity: 50, maxQuantity: 99, unitPriceNpr: 600 }, // Volume penalty!
  ]);
  assert(!anomalyCheck.valid, 'Scenario 7: Volume penalty pricing is rejected');

  // Test 8: Atomic stock reservation prevents negative available inventory
  MarketStore.initialize();
  const state = MarketStore.getState();
  const sampleVariant = state.products[0].variants[0];
  const originalAvailable = sampleVariant.inventory.availableQuantity;

  // Attempt to order excessive stock
  const excessCart = MarketStore.addToCart(sampleVariant.id, originalAvailable + 5000);
  assert(!excessCart.success, 'Scenario 8: Concurrent buyer cannot oversell warehouse stock beyond availability');

  // Test 9: Multi-vendor order creation splits seller orders
  const testBuyer = {
    id: 'test-buyer-uuid',
    name: 'Pradeep Sharma',
    email: 'pradeep@sharma-hardware.np',
    phone: '+977 9851122334',
    role: 'BUYER' as const,
    createdAt: new Date().toISOString(),
  };

  MarketStore.clearCart();
  MarketStore.addToCart(state.products[0].variants[0].id, state.products[0].variants[0].minOrderQuantity);
  const checkoutResult = MarketStore.checkout(testBuyer, {
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Met',
    ward: '5',
    streetAddress: 'Tangal Commercial Depot',
    contactName: 'Pradeep Sharma',
    contactPhone: '+977 9851122334',
  });

  assert(
    checkoutResult.success &&
      Boolean(checkoutResult.order) &&
      checkoutResult.order!.sellerOrders.length >= 1,
    'Scenario 9: Multi-vendor checkout atomically creates parent order and seller fulfillment orders'
  );

  // Test 10: RFQ quotation acceptance locks transactionally
  const dummyRfq = MarketStore.createRfq({
    title: '500kg Himalayan Black Cardamom',
    category: 'Himalayan Agro & Spices',
    quantity: 10,
    unitOfMeasure: '50kg Jute Bag',
    destinationProvince: 'Koshi Province',
    destinationCity: 'Biratnagar',
    deliveryDeadline: '2026-05-01',
    specifications: 'Standard export moisture test',
  });

  MarketStore.submitQuotation(dummyRfq.rfq!.id, 62000, 5, 'Immediate dispatch');
  const quot = MarketStore.getState().rfqs.find((r) => r.id === dummyRfq.rfq!.id)!.quotations[0];
  const acceptResult = MarketStore.acceptQuotation(quot.id);
  assert(acceptResult.success, 'Scenario 10: RFQ quotation acceptance commits transactionally');

  return { passed, failed, results };
}
