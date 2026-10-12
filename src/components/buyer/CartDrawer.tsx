import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, ArrowRight, ShoppingBag, Truck, Building2, CheckCircle2 } from 'lucide-react';
import { CartItem, NepalAddress, Order, User } from '../../types/market';
import { PricingEngine } from '../../services/pricingEngine';
import { MarketStore } from '../../services/marketStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: User;
  onDataRefresh: () => void;
  onOrderSuccess: (order: Order) => void;
}

const NEPAL_PROVINCES = [
  'Bagmati Province',
  'Gandaki Province',
  'Koshi Province',
  'Madhesh Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province',
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onDataRefresh,
  onOrderSuccess,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('CONNECT_IPS');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Nepal Shipping Address State
  const [address, setAddress] = useState<NepalAddress>({
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan',
    ward: '14',
    streetAddress: 'Kalanki Commercial Complex, Unit 3B',
    contactName: currentUser.name || 'Ramesh Karki',
    contactPhone: currentUser.phone || '+977 9851089234',
  });

  if (!isOpen) return null;

  // Group items by Seller Business for multi-vendor logistics
  const sellerGroups: { [businessId: string]: { businessName: string; items: CartItem[] } } = {};
  for (const item of cart) {
    if (!sellerGroups[item.businessId]) {
      sellerGroups[item.businessId] = {
        businessName: item.businessName,
        items: [],
      };
    }
    sellerGroups[item.businessId].items.push(item);
  }

  const subtotalNpr = cart.reduce((sum, item) => sum + item.subtotalNpr, 0);
  const vendorCount = Object.keys(sellerGroups).length;
  const estimatedDeliveryNpr = vendorCount * 2500; // NPR 2,500 logistics flat freight per supplier dispatch
  const totalNpr = subtotalNpr + estimatedDeliveryNpr;

  const handleRemoveItem = (id: string) => {
    MarketStore.removeFromCart(id);
    onDataRefresh();
  };

  const handleExecuteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    const result = MarketStore.checkout(currentUser, address, paymentMethod);
    if (!result.success || !result.order) {
      setCheckoutError(result.error || 'Checkout failed.');
      return;
    }

    onDataRefresh();
    setIsCheckingOut(false);
    onOrderSuccess(result.order);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="bg-[#0B192C] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Wholesale Basket ({cart.length} SKUs across {vendorCount} {vendorCount === 1 ? 'Supplier' : 'Suppliers'})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">Your wholesale cart is empty</div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore the buyer catalog to add commercial SKUs with volume tier pricing.
              </p>
            </div>
          ) : !isCheckingOut ? (
            /* STEP 1: Multi-Vendor Basket Overview */
            <div className="space-y-6">
              {Object.entries(sellerGroups).map(([bizId, group]) => {
                const groupSubtotal = group.items.reduce((s, it) => s + it.subtotalNpr, 0);

                return (
                  <div
                    key={bizId}
                    className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Supplier Banner */}
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-teal-700" />
                        <span className="font-bold text-slate-900">{group.businessName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Subtotal: {PricingEngine.formatNpr(groupSubtotal)}
                      </span>
                    </div>

                    {/* Items for this Supplier */}
                    <div className="divide-y divide-slate-100 p-2">
                      {group.items.map((item) => (
                        <div key={item.id} className="p-3 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="font-mono text-[11px] font-bold text-teal-800">
                              [{item.sku}]
                            </div>
                            <div className="font-bold text-slate-900">{item.productTitle}</div>
                            <div className="text-slate-500 text-[11px]">
                              Quantity: <strong className="font-mono text-slate-800">{item.quantity}</strong> {item.unitOfMeasure}
                              {' · '}
                              Tier Price:{' '}
                              <strong className="font-mono text-slate-800">
                                {PricingEngine.formatNpr(item.unitPriceNpr)}
                              </strong>
                              /unit
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              {PricingEngine.formatNpr(item.subtotalNpr)}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50/50 px-4 py-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Direct supplier dispatch from warehouse location in Nepal</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* STEP 2: Nepal Shipping & Escrow Checkout Form */
            <form id="checkout-form" onSubmit={handleExecuteCheckout} className="space-y-5 text-xs">
              {checkoutError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded text-xs">
                  {checkoutError}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                  Nepal Destination Delivery Address
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Province *</label>
                    <select
                      value={address.province}
                      onChange={(e) => setAddress({ ...address, province: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-teal-600"
                    >
                      {NEPAL_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">District *</label>
                    <input
                      type="text"
                      required
                      value={address.district}
                      onChange={(e) => setAddress({ ...address, district: e.target.value })}
                      placeholder="e.g. Kathmandu, Kaski, Morang"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Municipality / Rural Mun. *</label>
                    <input
                      type="text"
                      required
                      value={address.municipality}
                      onChange={(e) => setAddress({ ...address, municipality: e.target.value })}
                      placeholder="e.g. Pokhara Metropolitan"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Ward Number *</label>
                    <input
                      type="text"
                      required
                      value={address.ward}
                      onChange={(e) => setAddress({ ...address, ward: e.target.value })}
                      placeholder="e.g. 9"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Street / Warehouse Address *</label>
                  <input
                    type="text"
                    required
                    value={address.streetAddress}
                    onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                    placeholder="e.g. New Road Industrial Arcade, Gate 2"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contact Receiver *</label>
                    <input
                      type="text"
                      required
                      value={address.contactName}
                      onChange={(e) => setAddress({ ...address, contactName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contact Phone (+977) *</label>
                    <input
                      type="text"
                      required
                      value={address.contactPhone}
                      onChange={(e) => setAddress({ ...address, contactPhone: e.target.value })}
                      placeholder="+977 98..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Escrow Payment Method */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                  Nepal B2B Escrow Settlement
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CONNECT_IPS', label: 'ConnectIPS (Bank API)', desc: 'Official Nepal Clearing House' },
                    { id: 'KHALTI', label: 'Khalti Corporate', desc: 'Instant B2B Merchant Transfer' },
                    { id: 'ESEWA', label: 'eSewa Corporate', desc: 'Direct Escrow Settlement' },
                    { id: 'BANK_TRANSFER_ESCROW', label: 'Bank RTGS Escrow', desc: 'Corporate Account Transfer' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-teal-600 bg-teal-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id as Order['paymentMethod'])}
                        className="sr-only"
                      />
                      <div className="font-bold text-slate-900">{method.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{method.desc}</div>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer with Calculations */}
        {cart.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Wholesale Line Subtotal</span>
                <span className="font-mono">{PricingEngine.formatNpr(subtotalNpr)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  Supplier Logistics Freight ({vendorCount} {vendorCount === 1 ? 'Dispatch' : 'Dispatches'})
                </span>
                <span className="font-mono">{PricingEngine.formatNpr(estimatedDeliveryNpr)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Payable (NPR)</span>
                <span className="font-mono text-teal-800 text-base">
                  {PricingEngine.formatNpr(totalNpr)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isCheckingOut ? (
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-teal-500 hover:bg-teal-400 rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Proceed to Wholesale Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex w-full gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="px-4 py-2.5 text-xs text-slate-700 border border-slate-300 rounded hover:bg-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    form="checkout-form"
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Confirm Order & Reserve Stock</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
