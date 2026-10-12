import React, { useState } from 'react';
import {
  Building2,
  Package,
  Plus,
  RefreshCw,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  FileCheck2,
  ArrowUpRight,
  Boxes,
  FileText,
  Send,
} from 'lucide-react';
import { Business, Category, Order, Product, ProductVariant, RFQ, User } from '../../types/market';
import { MarketStore } from '../../services/marketStore';
import { PricingEngine } from '../../services/pricingEngine';
import { SellerProductModal } from './SellerProductModal';
import { OrderLogisticsTimeline } from '../common/OrderLogisticsTimeline';

interface SellerPortalProps {
  currentUser: User;
  businesses: Business[];
  products: Product[];
  orders: Order[];
  rfqs: RFQ[];
  categories: Category[];
  onDataRefresh: () => void;
}

export const SellerPortal: React.FC<SellerPortalProps> = ({
  currentUser,
  businesses,
  products,
  orders,
  rfqs,
  categories,
  onDataRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'rfqs' | 'business'>('inventory');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Restock modal state
  const [restockVariant, setRestockVariant] = useState<ProductVariant | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(50);

  // Quotation modal state
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(0);
  const [quoteDays, setQuoteDays] = useState<number>(7);
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  // Dispatch modal state
  const [dispatchOrder, setDispatchOrder] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [courierName, setCourierName] = useState<string>('Nepal Cargo Transport Express');

  // Active seller business
  const currentBusiness =
    businesses.find((b) => b.id === currentUser.businessId) ||
    businesses.find((b) => b.ownerId === currentUser.id) ||
    businesses[0];

  // Seller's specific catalog products and variants
  const myProducts = products.filter((p) => p.businessId === currentBusiness.id);
  const myVariants = myProducts.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productTitle: p.title, productId: p.id }))
  );

  // Seller's fulfillment orders
  const mySellerOrders = orders.flatMap((o) =>
    o.sellerOrders
      .filter((so) => so.sellerBusinessId === currentBusiness.id)
      .map((so) => ({ ...so, parentOrder: o }))
  );

  // Inventory totals
  const totalPhysicalStock = myVariants.reduce((sum, v) => sum + v.inventory.stockQuantity, 0);
  const totalReserved = myVariants.reduce((sum, v) => sum + v.inventory.reservedQuantity, 0);
  const totalAvailable = myVariants.reduce((sum, v) => sum + v.inventory.availableQuantity, 0);

  // Handle Restock
  const handleConfirmRestock = () => {
    if (!restockVariant) return;
    const newPhysical = restockVariant.inventory.stockQuantity + restockAmount;
    MarketStore.updateInventoryStock(restockVariant.id, newPhysical, 'Batch Warehouse Restock');
    setRestockVariant(null);
    onDataRefresh();
  };

  // Handle Dispatch
  const handleConfirmDispatch = (sellerOrderId: string) => {
    MarketStore.updateSellerOrderStatus(
      sellerOrderId,
      'DISPATCHED',
      trackingNumber || `TRK-NP-${Date.now().toString().slice(-6)}`,
      courierName
    );
    setDispatchOrder(null);
    setTrackingNumber('');
    onDataRefresh();
  };

  // Handle Mark Delivered
  const handleMarkDelivered = (sellerOrderId: string) => {
    MarketStore.updateSellerOrderStatus(sellerOrderId, 'DELIVERED');
    onDataRefresh();
  };

  // Handle Submit Quote
  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq || quotePrice <= 0) return;

    MarketStore.submitQuotation(
      selectedRfq.id,
      quotePrice,
      quoteDays,
      quoteNotes || 'Standard wholesale trade delivery within Nepal.'
    );
    setSelectedRfq(null);
    setQuoteNotes('');
    onDataRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Business Header & Verification Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentBusiness.name}
              </h1>
              {currentBusiness.isVerified ? (
                <div className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>IRD PAN Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>KYC Pending Review</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="font-mono">PAN/VAT: {currentBusiness.panVatNumber}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {currentBusiness.streetAddress}, {currentBusiness.district} ({currentBusiness.province})
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {currentBusiness.contactPhone}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded transition-colors flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Wholesale Product</span>
            </button>
          </div>
        </div>

        {/* Quantitative Metrics Strip (Single-elevation, tabular numbers) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Active Catalog SKUs
            </span>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {myVariants.length}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Physical Stock (Units)
            </span>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {totalPhysicalStock.toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">
              Reserved in Orders
            </span>
            <div className="text-xl font-bold text-amber-600 font-mono tabular-nums">
              {totalReserved.toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-teal-700 uppercase tracking-wider">
              Available to Trade
            </span>
            <div className="text-xl font-bold text-teal-700 font-mono tabular-nums">
              {totalAvailable.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation (Interactive segmented buttons, unboxed) */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Warehouse Inventory & Price Tiers ({myVariants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fulfillment Orders ({mySellerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rfqs')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'rfqs'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>B2B Market RFQs ({rfqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'business'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Compliance & KYC</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY & TIER PRICING MATRIX */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Warehouse Inventory & Wholesale Tiers</h2>
              <p className="text-xs text-slate-500">
                Atomic reservations calculate real-time available stock (Stock - Reserved).
              </p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>New SKU</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">SKU & Product</th>
                  <th className="py-3 px-4 font-semibold">Packaging (UOM)</th>
                  <th className="py-3 px-4 font-semibold">MOQ</th>
                  <th className="py-3 px-4 font-semibold text-right">Physical</th>
                  <th className="py-3 px-4 font-semibold text-right">Reserved</th>
                  <th className="py-3 px-4 font-semibold text-right text-teal-700">Available</th>
                  <th className="py-3 px-4 font-semibold">Wholesale Price Tiers (NPR)</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myVariants.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{v.sku}</div>
                      <div className="text-slate-600 line-clamp-1">{v.productTitle}</div>
                      <div className="text-[11px] text-slate-400">{v.inventory.warehouseLocation}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{v.unitOfMeasure}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {v.minOrderQuantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                      {v.inventory.stockQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-amber-600">
                      {v.inventory.reservedQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-teal-700 text-sm">
                      {v.inventory.availableQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        {v.priceTiers.map((t) => (
                          <div key={t.id} className="text-[11px] text-slate-600 font-mono">
                            <span className="text-slate-400">
                              {t.minQuantity}–{t.maxQuantity ?? '∞'} units:
                            </span>{' '}
                            <strong className="text-slate-900">
                              {PricingEngine.formatNpr(t.unitPriceNpr)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setRestockVariant(v)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-teal-700 border border-slate-300 hover:border-teal-600 rounded transition-colors"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FULFILLMENT ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {mySellerOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 text-xs">
              No fulfillment orders received yet. Orders placed by trade buyers will appear here.
            </div>
          ) : (
            mySellerOrders.map((so) => (
              <div
                key={so.id}
                className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {so.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 font-mono">
                        Parent: {so.parentOrder.orderNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Buyer: <strong className="text-slate-800">{so.parentOrder.buyerName}</strong> ({so.parentOrder.buyerPhone})
                      {' · '}
                      Destination: {so.parentOrder.shippingAddress.municipality}, {so.parentOrder.shippingAddress.district}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded ${
                        so.fulfillmentStatus === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : so.fulfillmentStatus === 'DISPATCHED'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Status: {so.fulfillmentStatus}
                    </span>

                    {so.fulfillmentStatus === 'PENDING_PAYMENT' && (
                      <button
                        onClick={() => MarketStore.updateSellerOrderStatus(so.id, 'PROCESSING')}
                        className="px-3 py-1 bg-teal-700 text-white text-xs font-semibold rounded hover:bg-teal-600"
                      >
                        Confirm Order
                      </button>
                    )}

                    {so.fulfillmentStatus === 'PROCESSING' && (
                      <button
                        onClick={() => setDispatchOrder(so.id)}
                        className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Shipment</span>
                      </button>
                    )}

                    {so.fulfillmentStatus === 'DISPATCHED' && (
                      <button
                        onClick={() => handleMarkDelivered(so.id)}
                        className="px-3 py-1 bg-emerald-700 text-white text-xs font-semibold rounded hover:bg-emerald-600 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Delivered</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Items in this seller order */}
                <div className="space-y-2">
                  {so.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1.5 bg-slate-50 px-3 rounded"
                    >
                      <div>
                        <span className="font-mono font-semibold text-slate-900 mr-2">[{item.sku}]</span>
                        <span className="text-slate-800">{item.productTitle}</span>
                        <span className="text-slate-500 ml-2">({item.unitOfMeasure})</span>
                      </div>
                      <div className="font-mono text-slate-800">
                        {item.quantity} units × {PricingEngine.formatNpr(item.unitPriceNpr)} ={' '}
                        <strong>{PricingEngine.formatNpr(item.lineTotalNpr)}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal summary */}
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 text-slate-600">
                  <div>
                    {so.trackingNumber && (
                      <span className="text-[11px] font-mono text-slate-500">
                        Courier: {so.courierName} · Tracking: <strong>{so.trackingNumber}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span>Order Total: </span>
                    <strong className="text-slate-900 font-mono text-sm ml-1">
                      {PricingEngine.formatNpr(so.totalNpr)}
                    </strong>
                  </div>
                </div>

                {/* Interactive Real-Time Logistics Timeline */}
                <div className="pt-2">
                  <OrderLogisticsTimeline
                    sellerOrder={so}
                    parentOrder={so.parentOrder}
                    onRefresh={onDataRefresh}
                    canManage={true}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: INCOMING B2B RFQS */}
      {activeTab === 'rfqs' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <strong className="text-slate-900">National Wholesale RFQ Exchange</strong>
              <p className="mt-0.5">
                Review volume requests from verified contractors and trade buyers across Nepal.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {rfqs.map((rfq) => {
              const myQuote = rfq.quotations.find((q) => q.sellerBusinessId === currentBusiness.id);

              return (
                <div
                  key={rfq.id}
                  className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {rfq.rfqNumber}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{rfq.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{rfq.specifications}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                        <span>
                          Buyer: <strong>{rfq.buyerCompany}</strong> ({rfq.buyerName})
                        </span>
                        <span>·</span>
                        <span>
                          Quantity Required:{' '}
                          <strong className="font-mono text-slate-800">
                            {rfq.quantity} {rfq.unitOfMeasure}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>
                          Destination: {rfq.destinationCity}, {rfq.destinationProvince}
                        </span>
                        <span>·</span>
                        <span>Delivery Deadline: {rfq.deliveryDeadline}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {myQuote ? (
                        <div className="text-right">
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                            Quotation Sent ({PricingEngine.formatNpr(myQuote.offeredUnitPriceNpr)}/unit)
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1 font-mono">
                            Status: {myQuote.status}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRfq(rfq);
                            setQuotePrice(rfq.targetPriceNpr || 5000);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Quote</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE & KYC DOCUMENTS */}
      {activeTab === 'business' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Nepal Business Registration & KYC Verification</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified businesses receive higher buyer trust and priority placement in search results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <span className="text-xs font-bold text-slate-800">Inland Revenue Department (IRD) PAN</span>
              <div className="font-mono text-sm font-bold text-slate-900">
                {currentBusiness.panVatNumber}
              </div>
              <div className="text-xs text-slate-500">
                Status: {currentBusiness.isVerified ? 'Officially Verified' : 'Under Review'}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <span className="text-xs font-bold text-slate-800">Company Registrar Registration</span>
              <div className="font-mono text-sm font-bold text-slate-900">
                {currentBusiness.registrationNumber}
              </div>
              <div className="text-xs text-slate-500">
                Jurisdiction: Office of Company Registrar, Tripureshwor
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Compliance Documents on File
            </h3>
            <div className="space-y-2">
              {currentBusiness.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-teal-700" />
                    <span className="font-semibold text-slate-800">{doc.documentType}</span>
                    <span className="font-mono text-slate-500">({doc.documentNumber})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        doc.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESTOCK WAREHOUSE STOCK */}
      {restockVariant && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Quick Restock Physical Inventory</h3>
            <p className="text-xs text-slate-600">
              Replenishing SKU: <strong className="font-mono">{restockVariant.sku}</strong> ({restockVariant.unitOfMeasure})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Physical Units Received
              </label>
              <input
                type="number"
                min={1}
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded">
              Current Available: {restockVariant.inventory.availableQuantity} → New Available:{' '}
              <strong className="text-teal-700">
                {restockVariant.inventory.availableQuantity + restockAmount}
              </strong>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRestockVariant(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestock}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded"
              >
                Commit Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH SHIPMENT */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Dispatch Order for Cargo Transport</h3>
            <p className="text-xs text-slate-600">
              Enter courier details and consignment tracking number for the buyer.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Freight / Courier Service
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Sundar Yatayat Cargo, Nepal Post Express"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consignment / Bilty Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. BLT-KTM-BIR-9021"
                  className="w-full text-xs font-mono uppercase px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDispatchOrder(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDispatch(dispatchOrder)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT RFQ QUOTATION */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitQuote}
            className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900">Submit Wholesale Quotation</h3>
            <p className="text-xs text-slate-600">
              RFQ: <strong className="font-mono">{selectedRfq.rfqNumber}</strong> ({selectedRfq.quantity}{' '}
              {selectedRfq.unitOfMeasure})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Offered Unit Price (NPR per {selectedRfq.unitOfMeasure}) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600 font-semibold"
                />
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Total Bid:{' '}
                  <strong className="text-slate-900 font-mono">
                    {PricingEngine.formatNpr(quotePrice * selectedRfq.quantity)}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Time / Delivery Days (Nepal)
                </label>
                <input
                  type="number"
                  min={1}
                  value={quoteDays}
                  onChange={(e) => setQuoteDays(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Freight & Commercial Terms
                </label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Includes transit insurance and delivery to site warehouse..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRfq(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Quotation</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Creator Modal */}
      <SellerProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        categories={categories}
        businessId={currentBusiness.id}
        onSuccess={onDataRefresh}
      />
    </div>
  );
};
