import React, { useState, useEffect } from 'react';
import { MarketStore, MarketStoreState } from './services/marketStore';
import { User, UserRole, Order } from './types/market';
import { Navbar } from './components/Navbar';
import { SellerPortal } from './components/seller/SellerPortal';
import { Storefront } from './components/buyer/Storefront';
import { BuyerOrders } from './components/buyer/BuyerOrders';
import { RfqWorkspace } from './components/rfq/RfqWorkspace';
import { AdminControlCenter } from './components/admin/AdminControlCenter';
import { CartDrawer } from './components/buyer/CartDrawer';
import { CheckCircle2, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export default function App() {
  const [storeState, setStoreState] = useState<MarketStoreState>(() => MarketStore.initialize());
  const [currentTab, setCurrentTab] = useState<'storefront' | 'seller' | 'rfqs' | 'orders' | 'admin'>('seller');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  const refreshState = () => {
    setStoreState({ ...MarketStore.getState() });
  };

  const handleRoleSwitch = (role: UserRole) => {
    MarketStore.switchRole(role);
    refreshState();
  };

  const handleOrderSuccess = (order: Order) => {
    setLastPlacedOrder(order);
    refreshState();
    setCurrentTab('orders');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={storeState.currentUser}
        onRoleSwitch={handleRoleSwitch}
        cartCount={storeState.cart.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Order Success Toast Banner */}
        {lastPlacedOrder && (
          <div className="mb-6 bg-teal-900 text-white rounded-lg p-4 flex items-center justify-between shadow-md border border-teal-700 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
              <div>
                <strong className="text-sm font-bold">
                  Wholesale Order Confirmed: {lastPlacedOrder.orderNumber}
                </strong>
                <p className="text-xs text-teal-200 mt-0.5">
                  Stock reserved atomically across {lastPlacedOrder.sellerOrders.length} supplier packages.
                  Escrow settlement initiated.
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastPlacedOrder(null)}
              className="text-xs text-teal-300 hover:text-white font-semibold underline px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Workspace View */}
        {currentTab === 'seller' && (
          <SellerPortal
            currentUser={storeState.currentUser}
            businesses={storeState.businesses}
            products={storeState.products}
            orders={storeState.orders}
            rfqs={storeState.rfqs}
            categories={storeState.categories}
            onDataRefresh={refreshState}
          />
        )}

        {currentTab === 'storefront' && (
          <Storefront
            products={storeState.products}
            categories={storeState.categories}
            onDataRefresh={refreshState}
            onOpenSellerPortal={() => setCurrentTab('seller')}
          />
        )}

        {currentTab === 'orders' && (
          <BuyerOrders orders={storeState.orders} onDataRefresh={refreshState} />
        )}

        {currentTab === 'rfqs' && (
          <RfqWorkspace
            rfqs={storeState.rfqs}
            categories={storeState.categories}
            currentUser={storeState.currentUser}
            onDataRefresh={refreshState}
          />
        )}

        {currentTab === 'admin' && (
          <AdminControlCenter
            businesses={storeState.businesses}
            orders={storeState.orders}
            products={storeState.products}
            auditLogs={storeState.auditLogs}
            onDataRefresh={refreshState}
          />
        )}
      </main>

      {/* Multi-Vendor Wholesale Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={storeState.cart}
        currentUser={storeState.currentUser}
        onDataRefresh={refreshState}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Footer (Institutional & Clean anti-slop) */}
      <footer className="bg-[#0B192C] text-slate-400 border-t border-slate-800 text-xs mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2 md:col-span-1">
            <div className="text-white font-extrabold text-base tracking-tight">NOVA NEPAL</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Nepal’s verified multi-vendor B2B wholesale marketplace, connecting manufacturers, trade distributors, and procurement retailers.
            </p>
            <div className="text-[11px] text-teal-400 pt-1">
              Inland Revenue Department (IRD) Registered
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Wholesale Sectors</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Industrial & Construction Hardware</li>
              <li>Himalayan Agricultural Spices & Tea</li>
              <li>Textiles, Yarns & Woven Garments</li>
              <li>Commercial Corrugated Packaging</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">B2B Logistics & Escrow</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Atomic Stock Reservation System</li>
              <li>Multi-Vendor Order Routing</li>
              <li>ConnectIPS & Bank Escrow Settlement</li>
              <li>Pan-Nepal Cargo Bilty Tracking</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Kathmandu Trade Desk</h4>
            <div className="space-y-1 text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Kalanki Industrial Corridor, Kathmandu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>+977 1 4289000 / +977 9851089234</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>trade@novanepal.com.np</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 py-4 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>© 2026 NOVA NEPAL Technologies Pvt. Ltd. All rights reserved.</div>
          <div>Official B2B Wholesale Trading Protocol · ISO 9001:2015 Compliant Operations</div>
        </div>
      </footer>
    </div>
  );
}
