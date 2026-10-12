/**
 * NOVA NEPAL B2B Marketplace - Domain Entity Types
 * Adheres to PostgreSQL NUMERIC for currency, TIMESTAMPTZ, UUIDs, and Nepal geo-administrative standards.
 */

export type UserRole = 'GUEST' | 'BUYER' | 'SELLER_OWNER' | 'SELLER_MEMBER' | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  businessId?: string; // If affiliated with a seller business
  createdAt: string;
}

export interface BusinessDocument {
  id: string;
  businessId: string;
  documentType: 'PAN_VAT_CERTIFICATE' | 'COMPANY_REGISTRATION' | 'WARD_CLEARANCE' | 'TAX_CLEARANCE';
  documentNumber: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  verifiedAt?: string;
  uploadedAt: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  panVatNumber: string;
  registrationNumber: string;
  description: string;
  province: string; // Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, Sudurpashchim
  district: string;
  municipality: string;
  ward: number;
  streetAddress: string;
  contactPhone: string;
  contactEmail: string;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  ownerId: string;
  rating: number; // 4.8
  totalFulfilledOrders: number;
  documents: BusinessDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  productCount: number;
}

export interface PriceTier {
  id: string;
  variantId: string;
  minQuantity: number;
  maxQuantity?: number; // undefined indicates unbounded top tier (e.g. 100+)
  unitPriceNpr: number; // Stored as precise monetary integer or 2-decimal numeric
  currency: 'NPR';
}

export interface Inventory {
  id: string;
  variantId: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number; // stockQuantity - reservedQuantity
  warehouseLocation: string;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  inventoryId: string;
  type: 'STOCK_IN' | 'RESERVE' | 'RELEASE' | 'FULFILL_OUT' | 'ADJUSTMENT';
  quantityDelta: number;
  referenceId: string; // e.g. orderId or restock batch
  notes: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  title: string;
  unitOfMeasure: string; // e.g., 'Carton (24 pcs)', 'Box (100 units)', 'Kg', 'Bale'
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  status: 'ACTIVE' | 'INACTIVE';
  priceTiers: PriceTier[];
  inventory: Inventory;
  createdAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  businessName: string;
  businessVerified: boolean;
  categoryId: string;
  categoryName: string;
  title: string;
  slug: string;
  description: string;
  originCountry: string; // 'Nepal'
  images: string[];
  status: 'ACTIVE' | 'PENDING_MODERATION' | 'DRAFT';
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  unitOfMeasure: string;
  businessId: string;
  businessName: string;
  unitPriceNpr: number;
  quantity: number;
  subtotalNpr: number;
  minOrderQuantity: number;
  availableStock: number;
  selectedTier: PriceTier;
}

export interface NepalAddress {
  province: string;
  district: string;
  municipality: string;
  ward: string;
  streetAddress: string;
  contactName: string;
  contactPhone: string; // +977 98...
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  sellerOrderId: string;
  variantId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  unitOfMeasure: string;
  quantity: number;
  unitPriceNpr: number;
  lineTotalNpr: number;
  currency: 'NPR';
}

export interface SellerOrder {
  id: string;
  orderNumber: string; // e.g. NOVA-SO-2026-001
  parentOrderId: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  subtotalNpr: number;
  deliveryFeeNpr: number;
  totalNpr: number;
  fulfillmentStatus: OrderStatus;
  items: OrderItem[];
  trackingNumber?: string;
  courierName?: string;
  biltyNumber?: string;
  vehicleNumber?: string;
  originHub?: string;
  biltyGeneratedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. NOVA-ORD-2026-1042
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  totalAmountNpr: number;
  currency: 'NPR';
  paymentStatus: 'UNPAID' | 'ESCROW_PAID' | 'RELEASED_TO_SELLERS' | 'REFUNDED';
  paymentMethod: 'KHALTI' | 'ESEWA' | 'CONNECT_IPS' | 'BANK_TRANSFER_ESCROW';
  overallStatus: OrderStatus;
  shippingAddress: NepalAddress;
  sellerOrders: SellerOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface RFQItem {
  id: string;
  productTitle: string;
  unitOfMeasure: string;
  quantity: number;
  targetPriceNpr?: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  sellerBusinessId: string;
  sellerBusinessName: string;
  sellerContactPhone: string;
  offeredUnitPriceNpr: number;
  offeredTotalNpr: number;
  leadTimeDays: number;
  notes: string;
  validUntil: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  buyerPhone: string;
  title: string;
  category: string;
  quantity: number;
  unitOfMeasure: string;
  targetPriceNpr?: number;
  destinationProvince: string;
  destinationCity: string;
  deliveryDeadline: string;
  specifications: string;
  status: 'OPEN' | 'QUOTATIONS_RECEIVED' | 'ACCEPTED' | 'CLOSED';
  quotations: Quotation[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
