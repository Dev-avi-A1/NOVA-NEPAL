/**
 * NOVA NEPAL - Market Store & Transactional Engine
 * Full-fidelity local persistence, atomic inventory reservations, multi-vendor order routing,
 * and Nepalese B2B RFQ negotiations.
 */

import {
  AuditLog,
  Business,
  BusinessDocument,
  CartItem,
  Category,
  NepalAddress,
  Order,
  Product,
  ProductVariant,
  Quotation,
  RFQ,
  SellerOrder,
  User,
  UserRole,
} from '../types/market';
import { PricingEngine } from './pricingEngine';

// Seed Categories
const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Industrial & Hardware',
    slug: 'industrial-hardware',
    description: 'Pipes, fittings, industrial tools, scaffolding, and precision construction materials.',
    imageUrl: '/src/assets/images/cat_hardware_tools_1791742650883.jpg',
    productCount: 14,
  },
  {
    id: 'cat-2',
    name: 'Himalayan Agro & Spices',
    slug: 'himalayan-agro-spices',
    description: 'Bulk black cardamom, orthodox tea, organic ginger, timur pepper, and grains.',
    imageUrl: '/src/assets/images/cat_himalayan_agro_1791742661393.jpg',
    productCount: 28,
  },
  {
    id: 'cat-3',
    name: 'Textiles & Garments',
    slug: 'textiles-garments',
    description: 'Wholesale Pashmina, raw cotton rolls, hemp fiber, and institutional uniform fabrics.',
    imageUrl: '/src/assets/images/cat_textile_rolls_1791742670617.jpg',
    productCount: 19,
  },
  {
    id: 'cat-4',
    name: 'Electronics & Solar Power',
    slug: 'electronics-solar',
    description: 'Solar inverters, high-capacity lithium batteries, distribution boxes, and wiring.',
    imageUrl: '/src/assets/images/hero_b2b_warehouse_1791742639213.jpg',
    productCount: 11,
  },
  {
    id: 'cat-5',
    name: 'Commercial Packaging',
    slug: 'commercial-packaging',
    description: 'Corrugated boxes, food-grade biodegradable pouches, heavy jute sacks, and sealing tapes.',
    imageUrl: '/src/assets/images/cat_hardware_tools_1791742650883.jpg',
    productCount: 16,
  },
];

// Seed Businesses
const SEED_BUSINESSES: Business[] = [
  {
    id: 'biz-1',
    name: 'Himalayan Forge & Industrial Supply',
    slug: 'himalayan-forge-industrial',
    panVatNumber: '302498112',
    registrationNumber: 'REG-KTM-89412',
    description: 'Direct manufacturer and importer of ASTM grade brass valves, high-pressure fittings, and scaffolding.',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan',
    ward: 14,
    streetAddress: 'Kalanki Industrial Corridor, Kathmandu',
    contactPhone: '+977 9851089234',
    contactEmail: 'sales@himalayanforge.com.np',
    isVerified: true,
    verificationStatus: 'VERIFIED',
    ownerId: 'user-seller-1',
    rating: 4.9,
    totalFulfilledOrders: 420,
    documents: [
      {
        id: 'doc-1',
        businessId: 'biz-1',
        documentType: 'PAN_VAT_CERTIFICATE',
        documentNumber: '302498112-VAT',
        fileUrl: '#pan-cert-verified',
        status: 'APPROVED',
        verifiedAt: '2025-01-15T10:00:00Z',
        uploadedAt: '2025-01-10T09:30:00Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'biz-2',
    name: 'Everest Agro Trade & Spices',
    slug: 'everest-agro-trade',
    panVatNumber: '601938472',
    registrationNumber: 'REG-BIR-44109',
    description: 'Premier B2B aggregator of Himalayan large black cardamom, dry ginger, and Ilam orthodox tea.',
    province: 'Koshi Province',
    district: 'Morang',
    municipality: 'Biratnagar Metropolitan',
    ward: 3,
    streetAddress: 'Main Road Trading Hub, Biratnagar',
    contactPhone: '+977 9801234567',
    contactEmail: 'trade@everestagro.com.np',
    isVerified: true,
    verificationStatus: 'VERIFIED',
    ownerId: 'user-seller-2',
    rating: 4.8,
    totalFulfilledOrders: 680,
    documents: [
      {
        id: 'doc-2',
        businessId: 'biz-2',
        documentType: 'PAN_VAT_CERTIFICATE',
        documentNumber: '601938472-VAT',
        fileUrl: '#pan-cert-everest',
        status: 'APPROVED',
        verifiedAt: '2025-02-01T10:00:00Z',
        uploadedAt: '2025-01-20T08:00:00Z',
      },
    ],
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'biz-3',
    name: 'Bagmati PolyPack & Containers',
    slug: 'bagmati-polypack',
    panVatNumber: '309988231',
    registrationNumber: 'REG-LAT-12048',
    description: 'Industrial corrugated packaging cartons and high-tensile packaging tapes for factory logistics.',
    province: 'Bagmati Province',
    district: 'Lalitpur',
    municipality: 'Patan Sub-Metropolitan',
    ward: 8,
    streetAddress: 'Patan Industrial Estate, Lalitpur',
    contactPhone: '+977 9841992200',
    contactEmail: 'orders@bagmatipack.com.np',
    isVerified: false,
    verificationStatus: 'PENDING',
    ownerId: 'user-seller-3',
    rating: 4.6,
    totalFulfilledOrders: 110,
    documents: [
      {
        id: 'doc-3',
        businessId: 'biz-3',
        documentType: 'PAN_VAT_CERTIFICATE',
        documentNumber: '309988231-VAT',
        fileUrl: '#pan-cert-pending',
        status: 'PENDING',
        uploadedAt: '2026-03-01T14:00:00Z',
      },
    ],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
];

// Seed Products with Tier Pricing and Inventory
const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    businessId: 'biz-1',
    businessName: 'Himalayan Forge & Industrial Supply',
    businessVerified: true,
    categoryId: 'cat-1',
    categoryName: 'Industrial & Hardware',
    title: 'Forged Brass Ball Valve (1/2" PN16 Industrial)',
    slug: 'forged-brass-ball-valve-pn16',
    description: 'Heavy-duty forged brass ball valves for commercial water distribution and steam piping. Tested to 16 bar pressure.',
    originCountry: 'Nepal',
    images: ['/src/assets/images/cat_hardware_tools_1791742650883.jpg'],
    status: 'ACTIVE',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    variants: [
      {
        id: 'var-101',
        productId: 'prod-1',
        sku: 'HF-BV-050-BOX24',
        title: 'Master Box of 24 Units (1/2" Valve)',
        unitOfMeasure: 'Box of 24 pcs',
        minOrderQuantity: 10,
        maxOrderQuantity: 500,
        status: 'ACTIVE',
        createdAt: '2025-06-01T00:00:00Z',
        inventory: {
          id: 'inv-101',
          variantId: 'var-101',
          stockQuantity: 450,
          reservedQuantity: 20,
          availableQuantity: 430,
          warehouseLocation: 'Kathmandu Bay A-4',
          lowStockThreshold: 50,
          updatedAt: '2026-03-01T00:00:00Z',
        },
        priceTiers: [
          {
            id: 'tier-101-1',
            variantId: 'var-101',
            minQuantity: 10,
            maxQuantity: 49,
            unitPriceNpr: 8500, // per box
            currency: 'NPR',
          },
          {
            id: 'tier-101-2',
            variantId: 'var-101',
            minQuantity: 50,
            maxQuantity: 99,
            unitPriceNpr: 7800,
            currency: 'NPR',
          },
          {
            id: 'tier-101-3',
            variantId: 'var-101',
            minQuantity: 100,
            unitPriceNpr: 7200,
            currency: 'NPR',
          },
        ],
      },
    ],
  },
  {
    id: 'prod-2',
    businessId: 'biz-2',
    businessName: 'Everest Agro Trade & Spices',
    businessVerified: true,
    categoryId: 'cat-2',
    categoryName: 'Himalayan Agro & Spices',
    title: 'Grade-A Jumbo Himalayan Black Cardamom (Alaichi)',
    slug: 'grade-a-jumbo-black-cardamom',
    description: 'Sun-dried jumbo smoked black cardamom directly sourced from Sankhuwasabha plantations. Export-grade moisture content < 11%.',
    originCountry: 'Nepal',
    images: ['/src/assets/images/cat_himalayan_agro_1791742661393.jpg'],
    status: 'ACTIVE',
    createdAt: '2025-08-10T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
    variants: [
      {
        id: 'var-201',
        productId: 'prod-2',
        sku: 'EA-CARD-JUMBO-50KG',
        title: '50kg Moisture-Proof Jute Bag',
        unitOfMeasure: '50kg Jute Bag',
        minOrderQuantity: 5,
        maxOrderQuantity: 200,
        status: 'ACTIVE',
        createdAt: '2025-08-10T00:00:00Z',
        inventory: {
          id: 'inv-201',
          variantId: 'var-201',
          stockQuantity: 180,
          reservedQuantity: 15,
          availableQuantity: 165,
          warehouseLocation: 'Biratnagar Cold Bay 2',
          lowStockThreshold: 20,
          updatedAt: '2026-03-05T00:00:00Z',
        },
        priceTiers: [
          {
            id: 'tier-201-1',
            variantId: 'var-201',
            minQuantity: 5,
            maxQuantity: 19,
            unitPriceNpr: 68000, // per 50kg bag
            currency: 'NPR',
          },
          {
            id: 'tier-201-2',
            variantId: 'var-201',
            minQuantity: 20,
            maxQuantity: 49,
            unitPriceNpr: 64500,
            currency: 'NPR',
          },
          {
            id: 'tier-201-3',
            variantId: 'var-201',
            minQuantity: 50,
            unitPriceNpr: 61000,
            currency: 'NPR',
          },
        ],
      },
    ],
  },
  {
    id: 'prod-3',
    businessId: 'biz-1',
    businessName: 'Himalayan Forge & Industrial Supply',
    businessVerified: true,
    categoryId: 'cat-1',
    categoryName: 'Industrial & Hardware',
    title: 'GI Scaffolding Swivel Clamp (Heavy Duty 48.3mm)',
    slug: 'gi-scaffolding-swivel-clamp-48mm',
    description: 'Hot-dip galvanized drop-forged steel coupler for building site tubular scaffolding. Conforms to BS EN74 standards.',
    originCountry: 'Nepal',
    images: ['/src/assets/images/cat_hardware_tools_1791742650883.jpg'],
    status: 'ACTIVE',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
    variants: [
      {
        id: 'var-102',
        productId: 'prod-3',
        sku: 'HF-SCAF-SWIVEL-CTN30',
        title: 'Heavy Carton of 30 Clamps',
        unitOfMeasure: 'Carton of 30 pcs',
        minOrderQuantity: 15,
        maxOrderQuantity: 1000,
        status: 'ACTIVE',
        createdAt: '2025-09-01T00:00:00Z',
        inventory: {
          id: 'inv-102',
          variantId: 'var-102',
          stockQuantity: 600,
          reservedQuantity: 50,
          availableQuantity: 550,
          warehouseLocation: 'Kathmandu Bay C-1',
          lowStockThreshold: 100,
          updatedAt: '2026-03-08T00:00:00Z',
        },
        priceTiers: [
          {
            id: 'tier-102-1',
            variantId: 'var-102',
            minQuantity: 15,
            maxQuantity: 49,
            unitPriceNpr: 10500,
            currency: 'NPR',
          },
          {
            id: 'tier-102-2',
            variantId: 'var-102',
            minQuantity: 50,
            maxQuantity: 199,
            unitPriceNpr: 9750,
            currency: 'NPR',
          },
          {
            id: 'tier-102-3',
            variantId: 'var-102',
            minQuantity: 200,
            unitPriceNpr: 9100,
            currency: 'NPR',
          },
        ],
      },
    ],
  },
  {
    id: 'prod-4',
    businessId: 'biz-3',
    businessName: 'Bagmati PolyPack & Containers',
    businessVerified: false,
    categoryId: 'cat-5',
    categoryName: 'Commercial Packaging',
    title: '5-Ply Corrugated Heavy Shipping Master Carton',
    slug: '5-ply-corrugated-master-carton',
    description: 'Double-wall kraft board boxes with 40kg burst strength, ideal for food processing and export apparel packaging.',
    originCountry: 'Nepal',
    images: ['/src/assets/images/hero_b2b_warehouse_1791742639213.jpg'],
    status: 'ACTIVE',
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-20T00:00:00Z',
    variants: [
      {
        id: 'var-301',
        productId: 'prod-4',
        sku: 'BPP-CTN-5PLY-BNDL50',
        title: 'Strapped Bundle of 50 Cartons',
        unitOfMeasure: 'Bundle of 50 pcs',
        minOrderQuantity: 20,
        maxOrderQuantity: 1500,
        status: 'ACTIVE',
        createdAt: '2026-02-10T00:00:00Z',
        inventory: {
          id: 'inv-301',
          variantId: 'var-301',
          stockQuantity: 800,
          reservedQuantity: 40,
          availableQuantity: 760,
          warehouseLocation: 'Patan Bay 1',
          lowStockThreshold: 150,
          updatedAt: '2026-03-02T00:00:00Z',
        },
        priceTiers: [
          {
            id: 'tier-301-1',
            variantId: 'var-301',
            minQuantity: 20,
            maxQuantity: 99,
            unitPriceNpr: 4500,
            currency: 'NPR',
          },
          {
            id: 'tier-301-2',
            variantId: 'var-301',
            minQuantity: 100,
            maxQuantity: 299,
            unitPriceNpr: 4050,
            currency: 'NPR',
          },
          {
            id: 'tier-301-3',
            variantId: 'var-301',
            minQuantity: 300,
            unitPriceNpr: 3700,
            currency: 'NPR',
          },
        ],
      },
    ],
  },
];

// Seed RFQs
const SEED_RFQS: RFQ[] = [
  {
    id: 'rfq-1',
    rfqNumber: 'RFQ-NP-2026-081',
    buyerId: 'user-buyer-1',
    buyerName: 'Ramesh Karki',
    buyerCompany: 'Lumbini Builders & Infrastructure Pvt Ltd',
    buyerPhone: '+977 9857022341',
    title: 'Bulk Supply of 1/2" PN16 Brass Ball Valves for Pokhara Hospital Project',
    category: 'Industrial & Hardware',
    quantity: 120,
    unitOfMeasure: 'Box of 24 pcs',
    targetPriceNpr: 7000,
    destinationProvince: 'Gandaki Province',
    destinationCity: 'Pokhara',
    deliveryDeadline: '2026-04-15',
    specifications: 'Requires 16 bar hydraulic test certificates and batch serial numbering for municipal inspection.',
    status: 'QUOTATIONS_RECEIVED',
    createdAt: '2026-03-02T10:00:00Z',
    quotations: [
      {
        id: 'quot-1',
        rfqId: 'rfq-1',
        sellerBusinessId: 'biz-1',
        sellerBusinessName: 'Himalayan Forge & Industrial Supply',
        sellerContactPhone: '+977 9851089234',
        offeredUnitPriceNpr: 7100,
        offeredTotalNpr: 852000,
        leadTimeDays: 7,
        notes: 'Price includes freight to Pokhara warehouse and test certification.',
        validUntil: '2026-03-25',
        status: 'SUBMITTED',
        createdAt: '2026-03-04T11:30:00Z',
      },
    ],
  },
];

// Seed Orders
const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'NOVA-ORD-2026-0042',
    buyerId: 'user-buyer-1',
    buyerName: 'Ramesh Karki',
    buyerPhone: '+977 9857022341',
    totalAmountNpr: 184500,
    currency: 'NPR',
    paymentStatus: 'ESCROW_PAID',
    paymentMethod: 'CONNECT_IPS',
    overallStatus: 'PROCESSING',
    shippingAddress: {
      province: 'Gandaki Province',
      district: 'Kaski',
      municipality: 'Pokhara Metropolitan',
      ward: '9',
      streetAddress: 'New Road Commercial Complex, Pokhara',
      contactName: 'Ramesh Karki',
      contactPhone: '+977 9857022341',
    },
    sellerOrders: [
      {
        id: 'so-1001-1',
        orderNumber: 'NOVA-SO-2026-0042-HF',
        parentOrderId: 'ord-1001',
        sellerBusinessId: 'biz-1',
        sellerBusinessName: 'Himalayan Forge & Industrial Supply',
        subtotalNpr: 170000,
        deliveryFeeNpr: 4500,
        totalNpr: 174500,
        fulfillmentStatus: 'PROCESSING',
        trackingNumber: 'TRK-KTM-PKR-984',
        courierName: 'Sundar Yatayat Cargo Express',
        biltyNumber: 'BLT-KTM-PKR-4891',
        vehicleNumber: 'Ba 2 Kha 8941',
        originHub: 'Kalanki Logistics Corridor, Kathmandu',
        biltyGeneratedAt: '2026-03-01T14:30:00Z',
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-02T08:00:00Z',
        items: [
          {
            id: 'item-1',
            sellerOrderId: 'so-1001-1',
            variantId: 'var-101',
            productTitle: 'Forged Brass Ball Valve (1/2" PN16 Industrial)',
            variantTitle: 'Master Box of 24 Units (1/2" Valve)',
            sku: 'HF-BV-050-BOX24',
            unitOfMeasure: 'Box of 24 pcs',
            quantity: 20,
            unitPriceNpr: 8500,
            lineTotalNpr: 170000,
            currency: 'NPR',
          },
        ],
      },
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-02T08:00:00Z',
  },
];

const LOCAL_STORAGE_KEY = 'nova_nepal_marketplace_v1';

export interface MarketStoreState {
  currentUser: User;
  businesses: Business[];
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  rfqs: RFQ[];
  auditLogs: AuditLog[];
}

export class MarketStore {
  private static state: MarketStoreState;

  public static initialize(): MarketStoreState {
    if (this.state) return this.state;

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
        return this.state;
      }
    } catch {
      // Fallback to fresh seed
    }

    this.state = {
      currentUser: {
        id: 'user-seller-1',
        name: 'Bikram Thapa',
        email: 'bikram@himalayanforge.com.np',
        phone: '+977 9851089234',
        role: 'SELLER_OWNER',
        businessId: 'biz-1',
        createdAt: '2025-01-01T00:00:00Z',
      },
      businesses: SEED_BUSINESSES,
      categories: SEED_CATEGORIES,
      products: SEED_PRODUCTS,
      cart: [],
      orders: SEED_ORDERS,
      rfqs: SEED_RFQS,
      auditLogs: [
        {
          id: 'log-1',
          actorId: 'admin-1',
          actorRole: 'PLATFORM_ADMIN',
          action: 'VERIFY_BUSINESS_PAN',
          entityType: 'BUSINESS',
          entityId: 'biz-1',
          details: 'Verified PAN 302498112 for Himalayan Forge & Industrial Supply with Inland Revenue Department record.',
          timestamp: '2025-01-15T10:00:00Z',
        },
      ],
    };

    this.persist();
    return this.state;
  }

  private static persist(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Non-blocking
    }
  }

  public static getState(): MarketStoreState {
    if (!this.state) this.initialize();
    return this.state;
  }

  public static switchRole(role: UserRole): User {
    const state = this.getState();
    if (role === 'SELLER_OWNER' || role === 'SELLER_MEMBER') {
      state.currentUser = {
        id: 'user-seller-1',
        name: 'Bikram Thapa (Seller Owner)',
        email: 'bikram@himalayanforge.com.np',
        phone: '+977 9851089234',
        role,
        businessId: 'biz-1',
        createdAt: '2025-01-01T00:00:00Z',
      };
    } else if (role === 'PLATFORM_ADMIN') {
      state.currentUser = {
        id: 'user-admin-1',
        name: 'Super Admin (Nepal Ops)',
        email: 'ops@novanepal.com.np',
        phone: '+977 9801122334',
        role: 'PLATFORM_ADMIN',
        createdAt: '2025-01-01T00:00:00Z',
      };
    } else {
      // BUYER
      state.currentUser = {
        id: 'user-buyer-1',
        name: 'Ramesh Karki (Procurement)',
        email: 'ramesh@lumbinibuilders.com.np',
        phone: '+977 9857022341',
        role: 'BUYER',
        createdAt: '2025-03-01T00:00:00Z',
      };
    }
    this.persist();
    return state.currentUser;
  }

  // --- Catalog & Variant Management ---
  public static addProduct(
    businessId: string,
    data: {
      title: string;
      description: string;
      categoryId: string;
      images?: string[];
      variant: {
        sku: string;
        unitOfMeasure: string;
        minOrderQuantity: number;
        maxOrderQuantity?: number;
        stockQuantity: number;
        warehouseLocation: string;
        priceTiers: Array<{ minQuantity: number; maxQuantity?: number; unitPriceNpr: number }>;
      };
    }
  ): { success: boolean; product?: Product; error?: string } {
    const state = this.getState();
    const business = state.businesses.find((b) => b.id === businessId);
    if (!business) return { success: false, error: 'Business not found.' };

    const category = state.categories.find((c) => c.id === data.categoryId) || state.categories[0];

    // Validate pricing tiers
    const tierValidation = PricingEngine.validateTierConfiguration(
      data.variant.minOrderQuantity,
      data.variant.priceTiers
    );
    if (!tierValidation.valid) {
      return { success: false, error: tierValidation.error };
    }

    const productId = `prod-${Date.now()}`;
    const variantId = `var-${Date.now()}`;
    const inventoryId = `inv-${Date.now()}`;

    const newVariant: ProductVariant = {
      id: variantId,
      productId,
      sku: data.variant.sku.trim().toUpperCase(),
      title: `${data.title} (${data.variant.unitOfMeasure})`,
      unitOfMeasure: data.variant.unitOfMeasure,
      minOrderQuantity: data.variant.minOrderQuantity,
      maxOrderQuantity: data.variant.maxOrderQuantity,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      inventory: {
        id: inventoryId,
        variantId,
        stockQuantity: data.variant.stockQuantity,
        reservedQuantity: 0,
        availableQuantity: data.variant.stockQuantity,
        warehouseLocation: data.variant.warehouseLocation || 'Central Warehouse',
        lowStockThreshold: Math.max(10, Math.floor(data.variant.stockQuantity * 0.1)),
        updatedAt: new Date().toISOString(),
      },
      priceTiers: data.variant.priceTiers.map((t, idx) => ({
        id: `tier-${variantId}-${idx + 1}`,
        variantId,
        minQuantity: t.minQuantity,
        maxQuantity: t.maxQuantity,
        unitPriceNpr: t.unitPriceNpr,
        currency: 'NPR',
      })),
    };

    const newProduct: Product = {
      id: productId,
      businessId: business.id,
      businessName: business.name,
      businessVerified: business.isVerified,
      categoryId: category.id,
      categoryName: category.name,
      title: data.title,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now().toString().slice(-4)}`,
      description: data.description,
      originCountry: 'Nepal',
      images: data.images && data.images.length > 0 ? data.images : ['/src/assets/images/hero_b2b_warehouse_1791742639213.jpg'],
      status: 'ACTIVE',
      variants: [newVariant],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.products.unshift(newProduct);
    this.addAuditLog('CREATE_PRODUCT', 'PRODUCT', productId, `Created B2B product ${data.title} with SKU ${newVariant.sku}`);
    this.persist();

    return { success: true, product: newProduct };
  }

  // --- Atomic Inventory Management ---
  public static updateInventoryStock(
    variantId: string,
    newPhysicalStock: number,
    notes: string = 'Manual replenishment'
  ): { success: boolean; availableQuantity?: number; error?: string } {
    const state = this.getState();

    let targetVariant: ProductVariant | undefined;
    for (const prod of state.products) {
      const v = prod.variants.find((item) => item.id === variantId);
      if (v) {
        targetVariant = v;
        break;
      }
    }

    if (!targetVariant) return { success: false, error: 'Product variant not found.' };

    if (newPhysicalStock < targetVariant.inventory.reservedQuantity) {
      return {
        success: false,
        error: `Physical stock cannot be lower than currently reserved quantity (${targetVariant.inventory.reservedQuantity}).`,
      };
    }

    const previousStock = targetVariant.inventory.stockQuantity;
    targetVariant.inventory.stockQuantity = newPhysicalStock;
    targetVariant.inventory.availableQuantity = newPhysicalStock - targetVariant.inventory.reservedQuantity;
    targetVariant.inventory.updatedAt = new Date().toISOString();

    this.addAuditLog(
      'ADJUST_STOCK',
      'INVENTORY',
      targetVariant.inventory.id,
      `Updated physical stock from ${previousStock} to ${newPhysicalStock}. Available: ${targetVariant.inventory.availableQuantity}. Note: ${notes}`
    );

    this.persist();
    return { success: true, availableQuantity: targetVariant.inventory.availableQuantity };
  }

  // --- Cart Operations ---
  public static addToCart(variantId: string, quantity: number): { success: boolean; error?: string } {
    const state = this.getState();

    let parentProduct: Product | undefined;
    let variant: ProductVariant | undefined;
    for (const p of state.products) {
      const v = p.variants.find((item) => item.id === variantId);
      if (v) {
        parentProduct = p;
        variant = v;
        break;
      }
    }

    if (!parentProduct || !variant) return { success: false, error: 'Variant not found' };

    // Authoritative pricing evaluation
    const pricing = PricingEngine.calculatePrice(variant, quantity);
    if (!pricing.isValid) {
      return { success: false, error: pricing.error };
    }

    if (quantity > variant.inventory.availableQuantity) {
      return {
        success: false,
        error: `Only ${variant.inventory.availableQuantity} ${variant.unitOfMeasure} available in warehouse stock.`,
      };
    }

    const existingIndex = state.cart.findIndex((item) => item.variantId === variantId);
    if (existingIndex >= 0) {
      const newQty = quantity; // Update to the requested bulk volume
      const recheck = PricingEngine.calculatePrice(variant, newQty);
      if (!recheck.isValid) return { success: false, error: recheck.error };

      state.cart[existingIndex].quantity = newQty;
      state.cart[existingIndex].unitPriceNpr = recheck.unitPriceNpr;
      state.cart[existingIndex].subtotalNpr = recheck.totalNpr;
      state.cart[existingIndex].selectedTier = recheck.appliedTier!;
    } else {
      state.cart.push({
        id: `cart-item-${Date.now()}`,
        productId: parentProduct.id,
        variantId: variant.id,
        productTitle: parentProduct.title,
        variantTitle: variant.title,
        sku: variant.sku,
        unitOfMeasure: variant.unitOfMeasure,
        businessId: parentProduct.businessId,
        businessName: parentProduct.businessName,
        unitPriceNpr: pricing.unitPriceNpr,
        quantity,
        subtotalNpr: pricing.totalNpr,
        minOrderQuantity: variant.minOrderQuantity,
        availableStock: variant.inventory.availableQuantity,
        selectedTier: pricing.appliedTier!,
      });
    }

    this.persist();
    return { success: true };
  }

  public static removeFromCart(cartItemId: string): void {
    const state = this.getState();
    state.cart = state.cart.filter((c) => c.id !== cartItemId);
    this.persist();
  }

  public static clearCart(): void {
    const state = this.getState();
    state.cart = [];
    this.persist();
  }

  // --- Atomic Checkout & Multi-Vendor Order Splitting ---
  public static checkout(
    buyer: User,
    shippingAddress: NepalAddress,
    paymentMethod: Order['paymentMethod'] = 'CONNECT_IPS'
  ): { success: boolean; order?: Order; error?: string } {
    const state = this.getState();

    if (state.cart.length === 0) {
      return { success: false, error: 'Wholesale cart is empty.' };
    }

    // Step 1: Atomic Pre-validation and Reservation check
    // We execute a dry-run check across all items to guarantee all stock exists before mutating anything (transaction atomicity)
    for (const item of state.cart) {
      let foundVariant: ProductVariant | undefined;
      for (const prod of state.products) {
        const v = prod.variants.find((cand) => cand.id === item.variantId);
        if (v) {
          foundVariant = v;
          break;
        }
      }

      if (!foundVariant) {
        return { success: false, error: `SKU ${item.sku} is no longer available in the catalog.` };
      }

      if (foundVariant.status !== 'ACTIVE') {
        return { success: false, error: `Product variant ${foundVariant.sku} is currently suspended.` };
      }

      // Check available quantity: stock_quantity - reserved_quantity >= requested
      const currentAvailable = foundVariant.inventory.stockQuantity - foundVariant.inventory.reservedQuantity;
      if (currentAvailable < item.quantity) {
        return {
          success: false,
          error: `Insufficient warehouse stock for ${foundVariant.sku}. Requested ${item.quantity}, but only ${currentAvailable} available.`,
        };
      }

      // Authoritative pricing check
      const pricing = PricingEngine.calculatePrice(foundVariant, item.quantity);
      if (!pricing.isValid) {
        return { success: false, error: `Pricing validation failed for ${foundVariant.sku}: ${pricing.error}` };
      }
    }

    // Step 2: Atomic Execution Phase - Group by Seller Business
    const sellerGroups: { [businessId: string]: CartItem[] } = {};
    for (const item of state.cart) {
      if (!sellerGroups[item.businessId]) {
        sellerGroups[item.businessId] = [];
      }
      sellerGroups[item.businessId].push(item);
    }

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `NOVA-ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const sellerOrders: SellerOrder[] = [];
    let masterTotalNpr = 0;

    // Mutate inventory and build split seller orders
    for (const [businessId, items] of Object.entries(sellerGroups)) {
      const sellerBiz = state.businesses.find((b) => b.id === businessId);
      const sellerName = sellerBiz?.name || items[0].businessName;
      const sellerOrderId = `so-${orderId}-${businessId.slice(-3)}`;
      const sellerOrderNumber = `${orderNumber}-${businessId.slice(-4).toUpperCase()}`;

      let subtotal = 0;
      const orderItems = items.map((cartItem, idx) => {
        // Atomic stock reservation
        let targetVariant: ProductVariant | undefined;
        for (const prod of state.products) {
          const v = prod.variants.find((cand) => cand.id === cartItem.variantId);
          if (v) {
            targetVariant = v;
            break;
          }
        }

        if (targetVariant) {
          targetVariant.inventory.reservedQuantity += cartItem.quantity;
          targetVariant.inventory.availableQuantity =
            targetVariant.inventory.stockQuantity - targetVariant.inventory.reservedQuantity;
          targetVariant.inventory.updatedAt = new Date().toISOString();
        }

        subtotal += cartItem.subtotalNpr;

        return {
          id: `item-${orderId}-${idx + 1}`,
          sellerOrderId,
          variantId: cartItem.variantId,
          productTitle: cartItem.productTitle,
          variantTitle: cartItem.variantTitle,
          sku: cartItem.sku,
          unitOfMeasure: cartItem.unitOfMeasure,
          quantity: cartItem.quantity,
          unitPriceNpr: cartItem.unitPriceNpr,
          lineTotalNpr: cartItem.subtotalNpr,
          currency: 'NPR' as const,
        };
      });

      // Fixed B2B commercial logistics fee per supplier dispatch in Nepal
      const deliveryFee = 2500;
      const sellerTotal = subtotal + deliveryFee;
      masterTotalNpr += sellerTotal;

      sellerOrders.push({
        id: sellerOrderId,
        orderNumber: sellerOrderNumber,
        parentOrderId: orderId,
        sellerBusinessId: businessId,
        sellerBusinessName: sellerName,
        subtotalNpr: subtotal,
        deliveryFeeNpr: deliveryFee,
        totalNpr: sellerTotal,
        fulfillmentStatus: 'PENDING_PAYMENT',
        items: orderItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      totalAmountNpr: masterTotalNpr,
      currency: 'NPR',
      paymentStatus: 'ESCROW_PAID', // Simulated secure Nepal escrow
      paymentMethod,
      overallStatus: 'PROCESSING',
      shippingAddress,
      sellerOrders,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Commit changes
    state.orders.unshift(newOrder);
    state.cart = []; // clear cart upon successful commit
    this.addAuditLog(
      'CHECKOUT_ORDER',
      'ORDER',
      orderId,
      `Processed multi-vendor checkout ${orderNumber} totaling NPR ${masterTotalNpr} with ${sellerOrders.length} supplier orders.`
    );

    this.persist();
    return { success: true, order: newOrder };
  }

  // --- Seller Order Status Update ---
  public static updateSellerOrderStatus(
    sellerOrderId: string,
    status: Order['overallStatus'],
    trackingNumber?: string,
    courierName?: string,
    logistics?: {
      biltyNumber?: string;
      vehicleNumber?: string;
      originHub?: string;
    }
  ): { success: boolean; error?: string } {
    const state = this.getState();

    for (const order of state.orders) {
      const so = order.sellerOrders.find((s) => s.id === sellerOrderId);
      if (so) {
        so.fulfillmentStatus = status;
        if (trackingNumber) so.trackingNumber = trackingNumber;
        if (courierName) so.courierName = courierName;
        if (logistics?.biltyNumber) {
          so.biltyNumber = logistics.biltyNumber;
          so.biltyGeneratedAt = so.biltyGeneratedAt || new Date().toISOString();
        }
        if (logistics?.vehicleNumber) so.vehicleNumber = logistics.vehicleNumber;
        if (logistics?.originHub) so.originHub = logistics.originHub;
        if (status === 'DISPATCHED') {
          so.dispatchedAt = so.dispatchedAt || new Date().toISOString();
        }
        if (status === 'DELIVERED') {
          so.deliveredAt = so.deliveredAt || new Date().toISOString();
        }
        so.updatedAt = new Date().toISOString();

        // If dispatched or delivered, convert reserved stock to fulfilled
        if (status === 'DISPATCHED' || status === 'DELIVERED') {
          for (const item of so.items) {
            for (const prod of state.products) {
              const v = prod.variants.find((cand) => cand.id === item.variantId);
              if (v) {
                // Deduct from stock and reserved
                v.inventory.stockQuantity = Math.max(0, v.inventory.stockQuantity - item.quantity);
                v.inventory.reservedQuantity = Math.max(0, v.inventory.reservedQuantity - item.quantity);
                v.inventory.availableQuantity = v.inventory.stockQuantity - v.inventory.reservedQuantity;
                v.inventory.updatedAt = new Date().toISOString();
              }
            }
          }
        }

        // If all seller orders are delivered, update overall status
        const allDelivered = order.sellerOrders.every((s) => s.fulfillmentStatus === 'DELIVERED');
        if (allDelivered) {
          order.overallStatus = 'DELIVERED';
        } else {
          order.overallStatus = 'PROCESSING';
        }

        this.addAuditLog(
          'UPDATE_SELLER_ORDER_STATUS',
          'SELLER_ORDER',
          sellerOrderId,
          `Fulfillment updated to ${status}. Tracking: ${trackingNumber || 'N/A'}`
        );

        this.persist();
        return { success: true };
      }
    }

    return { success: false, error: 'Seller order not found.' };
  }

  // --- Business Onboarding & Verification ---
  public static createBusiness(data: {
    name: string;
    panVatNumber: string;
    registrationNumber: string;
    province: string;
    district: string;
    municipality: string;
    ward: number;
    streetAddress: string;
    contactPhone: string;
    contactEmail: string;
    description: string;
  }): { success: boolean; business?: Business; error?: string } {
    const state = this.getState();

    // Check unique PAN
    if (state.businesses.some((b) => b.panVatNumber === data.panVatNumber)) {
      return { success: false, error: `PAN/VAT number ${data.panVatNumber} is already registered.` };
    }

    const businessId = `biz-${Date.now()}`;
    const newBiz: Business = {
      id: businessId,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Date.now().toString().slice(-4)}`,
      panVatNumber: data.panVatNumber,
      registrationNumber: data.registrationNumber,
      description: data.description,
      province: data.province,
      district: data.district,
      municipality: data.municipality,
      ward: data.ward,
      streetAddress: data.streetAddress,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      isVerified: false,
      verificationStatus: 'PENDING',
      ownerId: state.currentUser.id,
      rating: 5.0,
      totalFulfilledOrders: 0,
      documents: [
        {
          id: `doc-${Date.now()}`,
          businessId,
          documentType: 'PAN_VAT_CERTIFICATE',
          documentNumber: `${data.panVatNumber}-GOV`,
          fileUrl: '#uploaded-pan-cert',
          status: 'PENDING',
          uploadedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.businesses.push(newBiz);
    state.currentUser.businessId = businessId;
    state.currentUser.role = 'SELLER_OWNER';

    this.addAuditLog('REGISTER_BUSINESS', 'BUSINESS', businessId, `Registered business ${data.name} with PAN ${data.panVatNumber}`);
    this.persist();

    return { success: true, business: newBiz };
  }

  public static verifyBusiness(businessId: string, approve: boolean, notes?: string): void {
    const state = this.getState();
    const biz = state.businesses.find((b) => b.id === businessId);
    if (!biz) return;

    biz.isVerified = approve;
    biz.verificationStatus = approve ? 'VERIFIED' : 'SUSPENDED';
    biz.documents.forEach((d) => {
      d.status = approve ? 'APPROVED' : 'REJECTED';
      d.verifiedAt = new Date().toISOString();
      if (!approve && notes) d.rejectionReason = notes;
    });

    // Update verified flag on products
    state.products.forEach((p) => {
      if (p.businessId === businessId) {
        p.businessVerified = approve;
      }
    });

    this.addAuditLog(
      approve ? 'APPROVE_VERIFICATION' : 'REJECT_VERIFICATION',
      'BUSINESS',
      businessId,
      `Admin ${approve ? 'approved' : 'rejected'} verification for ${biz.name}. Note: ${notes || 'Verified against IRD database.'}`
    );

    this.persist();
  }

  // --- RFQ and Quotations ---
  public static createRfq(data: {
    title: string;
    category: string;
    quantity: number;
    unitOfMeasure: string;
    targetPriceNpr?: number;
    destinationProvince: string;
    destinationCity: string;
    deliveryDeadline: string;
    specifications: string;
  }): { success: boolean; rfq?: RFQ; error?: string } {
    const state = this.getState();
    const rfqId = `rfq-${Date.now()}`;
    const rfqNumber = `RFQ-NP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newRfq: RFQ = {
      id: rfqId,
      rfqNumber,
      buyerId: state.currentUser.id,
      buyerName: state.currentUser.name,
      buyerCompany: 'Registered Trade Procurement Corp',
      buyerPhone: state.currentUser.phone,
      title: data.title,
      category: data.category,
      quantity: data.quantity,
      unitOfMeasure: data.unitOfMeasure,
      targetPriceNpr: data.targetPriceNpr,
      destinationProvince: data.destinationProvince,
      destinationCity: data.destinationCity,
      deliveryDeadline: data.deliveryDeadline,
      specifications: data.specifications,
      status: 'OPEN',
      quotations: [],
      createdAt: new Date().toISOString(),
    };

    state.rfqs.unshift(newRfq);
    this.addAuditLog('CREATE_RFQ', 'RFQ', rfqId, `Published wholesale RFQ ${rfqNumber} for ${data.quantity} ${data.unitOfMeasure} of ${data.title}`);
    this.persist();

    return { success: true, rfq: newRfq };
  }

  public static submitQuotation(
    rfqId: string,
    offeredUnitPriceNpr: number,
    leadTimeDays: number,
    notes: string
  ): { success: boolean; error?: string } {
    const state = this.getState();
    const rfq = state.rfqs.find((r) => r.id === rfqId);
    if (!rfq) return { success: false, error: 'RFQ not found.' };

    const sellerBiz = state.businesses.find((b) => b.id === state.currentUser.businessId) || state.businesses[0];

    const quotId = `quot-${Date.now()}`;
    const newQuot: Quotation = {
      id: quotId,
      rfqId,
      sellerBusinessId: sellerBiz.id,
      sellerBusinessName: sellerBiz.name,
      sellerContactPhone: sellerBiz.contactPhone,
      offeredUnitPriceNpr,
      offeredTotalNpr: offeredUnitPriceNpr * rfq.quantity,
      leadTimeDays,
      notes,
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    rfq.quotations.push(newQuot);
    rfq.status = 'QUOTATIONS_RECEIVED';

    this.addAuditLog('SUBMIT_QUOTATION', 'QUOTATION', quotId, `Seller ${sellerBiz.name} submitted quote NPR ${offeredUnitPriceNpr} for ${rfq.rfqNumber}`);
    this.persist();

    return { success: true };
  }

  public static acceptQuotation(quotationId: string): { success: boolean; error?: string } {
    const state = this.getState();
    let targetRfq: RFQ | undefined;
    let targetQuot: Quotation | undefined;

    for (const rfq of state.rfqs) {
      const q = rfq.quotations.find((item) => item.id === quotationId);
      if (q) {
        targetRfq = rfq;
        targetQuot = q;
        break;
      }
    }

    if (!targetRfq || !targetQuot) return { success: false, error: 'Quotation not found.' };

    targetQuot.status = 'ACCEPTED';
    targetRfq.status = 'ACCEPTED';
    targetRfq.quotations.forEach((q) => {
      if (q.id !== quotationId) q.status = 'REJECTED';
    });

    this.addAuditLog('ACCEPT_QUOTATION', 'QUOTATION', quotationId, `Accepted quotation from ${targetQuot.sellerBusinessName} for ${targetRfq.rfqNumber}`);
    this.persist();

    return { success: true };
  }

  private static addAuditLog(action: string, entityType: string, entityId: string, details: string): void {
    const state = this.getState();
    state.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId: state.currentUser.id,
      actorRole: state.currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
