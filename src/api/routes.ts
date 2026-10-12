/**
 * NOVA NEPAL - Express API Router (/api/v1) & OpenAPI Specification
 */

import { Router, Request, Response } from 'express';
import { MarketStore } from '../services/marketStore';
import { PricingEngine } from '../services/pricingEngine';
import { NepalAddress, UserRole, SellerOrder } from '../types/market';

export const apiRouter = Router();

// OpenAPI 3.0 Documentation Endpoint
apiRouter.get('/openapi.json', (_req: Request, res: Response) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'NOVA NEPAL B2B Marketplace API',
      version: '1.0.0',
      description: 'Production REST API for Nepal Wholesale Trade, Tiered Pricing, Inventory & RFQ Negotiations',
      contact: {
        name: 'NOVA NEPAL Engineering',
        email: 'api@novanepal.com.np',
      },
    },
    servers: [{ url: '/api/v1', description: 'Development and staging API' }],
    paths: {
      '/categories': {
        get: {
          summary: 'List wholesale categories',
          responses: { '200': { description: 'Successful array of categories' } },
        },
      },
      '/products': {
        get: {
          summary: 'List products with filters (category, query, minMoq, verifiedOnly)',
          parameters: [
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'q', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Filtered array of wholesale products' } },
        },
      },
      '/products/{id}': {
        get: {
          summary: 'Get product detail with wholesale price tiers',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Product with variants and inventory' } },
        },
      },
      '/products/{id}/prices': {
        get: {
          summary: 'Evaluate dynamic wholesale price for a requested quantity',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'quantity', in: 'query', required: true, schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'Evaluated unit price, tier, and total in NPR' } },
        },
      },
      '/seller/products': {
        post: {
          summary: 'Create a new B2B product with volume price tiers and inventory',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          responses: { '201': { description: 'Created product' } },
        },
      },
      '/seller/inventory/{variantId}': {
        patch: {
          summary: 'Update physical warehouse stock for a variant',
          parameters: [{ name: 'variantId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          responses: { '200': { description: 'Updated inventory balance' } },
        },
      },
      '/cart': {
        get: { summary: 'Get buyer wholesale cart' },
      },
      '/cart/items': {
        post: {
          summary: 'Add or update item in cart with server pricing revalidation',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          responses: { '200': { description: 'Item added' } },
        },
      },
      '/orders': {
        get: { summary: 'List orders for authenticated buyer or all orders' },
        post: {
          summary: 'Checkout cart atomically with stock reservations and multi-vendor split orders',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          responses: { '201': { description: 'Created order with split seller sub-orders' } },
        },
      },
      '/seller/orders': {
        get: { summary: 'List fulfillment orders for seller business' },
      },
      '/seller/orders/{id}/status': {
        patch: {
          summary: 'Update seller fulfillment status (PROCESSING, DISPATCHED, DELIVERED)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Status updated' } },
        },
      },
      '/rfqs': {
        get: { summary: 'List all open RFQs' },
        post: { summary: 'Create new B2B Request for Quotation' },
      },
      '/rfqs/{id}/quotations': {
        post: { summary: 'Submit supplier quotation for an RFQ' },
      },
      '/quotations/{id}/accept': {
        post: { summary: 'Accept quotation and close RFQ' },
      },
      '/admin/dashboard': {
        get: { summary: 'Platform statistics, pending KYC verifications, GMV' },
      },
    },
  });
});

// Categories
apiRouter.get('/categories', (_req: Request, res: Response) => {
  const state = MarketStore.getState();
  res.json({ success: true, data: state.categories });
});

// Products & Catalog
apiRouter.get('/products', (req: Request, res: Response) => {
  const state = MarketStore.getState();
  const { categoryId, q, verifiedOnly } = req.query;

  let filtered = [...state.products];
  if (categoryId) {
    filtered = filtered.filter((p) => p.categoryId === categoryId);
  }
  if (q && typeof q === 'string') {
    const term = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.businessName.toLowerCase().includes(term)
    );
  }
  if (verifiedOnly === 'true') {
    filtered = filtered.filter((p) => p.businessVerified);
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const state = MarketStore.getState();
  const product = state.products.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

apiRouter.get('/products/:id/prices', (req: Request, res: Response) => {
  const state = MarketStore.getState();
  const product = state.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const quantity = parseInt(req.query.quantity as string, 10);
  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ success: false, error: 'Valid positive quantity required' });
  }

  const variant = product.variants[0];
  const evalResult = PricingEngine.calculatePrice(variant, quantity);
  res.json({ success: evalResult.isValid, ...evalResult });
});

// Seller Operations
apiRouter.post('/seller/products', (req: Request, res: Response) => {
  const state = MarketStore.getState();
  const businessId = req.body.businessId || state.currentUser.businessId || 'biz-1';

  const result = MarketStore.addProduct(businessId, req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.status(201).json(result);
});

apiRouter.get('/seller/inventory', (_req: Request, res: Response) => {
  const state = MarketStore.getState();
  const businessId = state.currentUser.businessId || 'biz-1';
  const myProducts = state.products.filter((p) => p.businessId === businessId);

  const inventoryList = myProducts.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productTitle: p.title,
      variantId: v.id,
      sku: v.sku,
      unitOfMeasure: v.unitOfMeasure,
      stockQuantity: v.inventory.stockQuantity,
      reservedQuantity: v.inventory.reservedQuantity,
      availableQuantity: v.inventory.availableQuantity,
      warehouseLocation: v.inventory.warehouseLocation,
      priceTiers: v.priceTiers,
      status: v.status,
    }))
  );

  res.json({ success: true, data: inventoryList });
});

apiRouter.patch('/seller/inventory/:variantId', (req: Request, res: Response) => {
  const { stockQuantity, notes } = req.body;
  if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
    return res.status(400).json({ success: false, error: 'Valid stock quantity required' });
  }

  const result = MarketStore.updateInventoryStock(req.params.variantId, stockQuantity, notes);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Cart & Orders
apiRouter.get('/cart', (_req: Request, res: Response) => {
  const state = MarketStore.getState();
  res.json({ success: true, data: state.cart });
});

apiRouter.post('/cart/items', (req: Request, res: Response) => {
  const { variantId, quantity } = req.body;
  if (!variantId || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ success: false, error: 'variantId and positive quantity required' });
  }

  const result = MarketStore.addToCart(variantId, quantity);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json({ success: true, cart: MarketStore.getState().cart });
});

apiRouter.delete('/cart/items/:id', (req: Request, res: Response) => {
  MarketStore.removeFromCart(req.params.id);
  res.json({ success: true, cart: MarketStore.getState().cart });
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  const state = MarketStore.getState();
  const shippingAddress: NepalAddress = req.body.shippingAddress || {
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan',
    ward: '1',
    streetAddress: 'Durbar Marg Trade Center',
    contactName: state.currentUser.name,
    contactPhone: state.currentUser.phone,
  };

  const result = MarketStore.checkout(state.currentUser, shippingAddress, req.body.paymentMethod);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.status(201).json(result);
});

apiRouter.get('/orders', (_req: Request, res: Response) => {
  const state = MarketStore.getState();
  res.json({ success: true, data: state.orders });
});

apiRouter.get('/seller/orders', (_req: Request, res: Response) => {
  const state = MarketStore.getState();
  const businessId = state.currentUser.businessId || 'biz-1';

  const sellerOrders: SellerOrder[] = [];
  state.orders.forEach((o) => {
    o.sellerOrders.forEach((so) => {
      if (so.sellerBusinessId === businessId) {
        sellerOrders.push(so);
      }
    });
  });

  res.json({ success: true, data: sellerOrders });
});

apiRouter.patch('/seller/orders/:id/status', (req: Request, res: Response) => {
  const { status, trackingNumber, courierName } = req.body;
  const result = MarketStore.updateSellerOrderStatus(req.params.id, status, trackingNumber, courierName);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// RFQs & Quotations
apiRouter.get('/rfqs', (_req: Request, res: Response) => {
  const state = MarketStore.getState();
  res.json({ success: true, data: state.rfqs });
});

apiRouter.post('/rfqs', (req: Request, res: Response) => {
  const result = MarketStore.createRfq(req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.status(201).json(result);
});

apiRouter.post('/rfqs/:id/quotations', (req: Request, res: Response) => {
  const { offeredUnitPriceNpr, leadTimeDays, notes } = req.body;
  const result = MarketStore.submitQuotation(req.params.id, offeredUnitPriceNpr, leadTimeDays, notes);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.status(201).json(result);
});

apiRouter.post('/quotations/:id/accept', (req: Request, res: Response) => {
  const result = MarketStore.acceptQuotation(req.params.id);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// Admin Control Center
apiRouter.get('/admin/dashboard', (_req: Request, res: Response) => {
  const state = MarketStore.getState();
  const totalGmv = state.orders.reduce((sum, o) => sum + o.totalAmountNpr, 0);
  const pendingVerifications = state.businesses.filter((b) => !b.isVerified).length;

  res.json({
    success: true,
    data: {
      totalGmvNpr: totalGmv,
      totalOrders: state.orders.length,
      totalBusinesses: state.businesses.length,
      pendingVerifications,
      activeProducts: state.products.length,
    },
  });
});

apiRouter.get('/admin/businesses', (_req: Request, res: Response) => {
  const state = MarketStore.getState();
  res.json({ success: true, data: state.businesses });
});

apiRouter.patch('/admin/businesses/:id/verification', (req: Request, res: Response) => {
  const { approve, notes } = req.body;
  MarketStore.verifyBusiness(req.params.id, Boolean(approve), notes);
  res.json({ success: true });
});

apiRouter.get('/admin/audit-logs', (_req: Request, res: Response) => {
  const state = MarketStore.getState();
  res.json({ success: true, data: state.auditLogs });
});

// Role Switcher for live UI testing
apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const user = MarketStore.switchRole(role as UserRole);
  res.json({ success: true, user });
});
