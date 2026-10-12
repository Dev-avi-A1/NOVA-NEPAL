import React from 'react';
import { ShoppingBag, Building2, Package, FileText, ShieldCheck, Store, UserCheck } from 'lucide-react';
import { User, UserRole } from '../types/market';
import { MarketStore } from '../services/marketStore';

interface NavbarProps {
  currentTab: 'storefront' | 'seller' | 'rfqs' | 'orders' | 'admin';
  setCurrentTab: (tab: 'storefront' | 'seller' | 'rfqs' | 'orders' | 'admin') => void;
  currentUser: User;
  onRoleSwitch: (role: UserRole) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onRoleSwitch,
  cartCount,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-slate-800 shadow-sm">
      {/* Top Banner Notice: Regional Compliance & Escrow */}
      <div className="bg-[#07111E] text-slate-300 text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-teal-400">NOVA NEPAL B2B</span>
          <span className="text-slate-500">·</span>
          <span>Inland Revenue Department (IRD) PAN/VAT Verified Trading</span>
          <span className="text-slate-500">·</span>
          <span>Escrow Protected Wholesale Logistics</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 text-xs">
          <span>Currency: <strong className="text-white font-mono">NPR</strong></span>
          <span className="text-slate-600">|</span>
          <span>Kathmandu (+977)</span>
        </div>
      </div>

      {/* Main 3-Zone Navigation Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('seller')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 bg-teal-500 rounded flex items-center justify-center font-bold text-lg text-slate-950 tracking-wider">
              N
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                NOVA NEPAL
              </span>
              <span className="block text-[10px] font-medium tracking-widest text-teal-400 uppercase">
                B2B Wholesale
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single line, unboxed, subtle hover) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setCurrentTab('seller')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'seller'
                ? 'bg-slate-800/80 text-teal-400 border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Building2 className="w-4 h-4 text-teal-400" />
            <span>Seller Portal</span>
            {currentUser.role.includes('SELLER') && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block"></span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('storefront')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'storefront'
                ? 'bg-slate-800/80 text-teal-400 border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Buyer Catalog</span>
          </button>

          <button
            onClick={() => setCurrentTab('rfqs')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'rfqs'
                ? 'bg-slate-800/80 text-teal-400 border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>B2B RFQs</span>
          </button>

          <button
            onClick={() => setCurrentTab('orders')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'orders'
                ? 'bg-slate-800/80 text-teal-400 border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders & Dispatch</span>
          </button>

          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap flex items-center gap-2 ${
              currentTab === 'admin'
                ? 'bg-slate-800/80 text-teal-400 border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Desk</span>
          </button>
        </nav>

        {/* Zone 3: Interactive Role Switcher & Cart Bag */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Persona quick-switch menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors">
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-semibold text-teal-300">
                {currentUser.role === 'SELLER_OWNER'
                  ? 'Seller Owner'
                  : currentUser.role === 'BUYER'
                  ? 'Trade Buyer'
                  : 'Platform Admin'}
              </span>
            </button>
            <div className="absolute right-0 mt-1 w-52 bg-[#0E1E34] border border-slate-700 rounded shadow-xl py-1 hidden group-hover:block group-focus-within:block z-50">
              <div className="px-3 py-1.5 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Test Persona
              </div>
              <button
                onClick={() => {
                  onRoleSwitch('SELLER_OWNER');
                  setCurrentTab('seller');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                  currentUser.role === 'SELLER_OWNER'
                    ? 'text-teal-400 bg-slate-800/60 font-semibold'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>Seller Business Owner</span>
                {currentUser.role === 'SELLER_OWNER' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onRoleSwitch('BUYER');
                  setCurrentTab('storefront');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                  currentUser.role === 'BUYER'
                    ? 'text-teal-400 bg-slate-800/60 font-semibold'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>Trade Buyer (Procurement)</span>
                {currentUser.role === 'BUYER' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onRoleSwitch('PLATFORM_ADMIN');
                  setCurrentTab('admin');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                  currentUser.role === 'PLATFORM_ADMIN'
                    ? 'text-teal-400 bg-slate-800/60 font-semibold'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>Platform Administrator</span>
                {currentUser.role === 'PLATFORM_ADMIN' && <span>✓</span>}
              </button>
            </div>
          </div>

          {/* Wholesale Cart Drawer trigger */}
          <button
            onClick={onOpenCart}
            className="relative px-3 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-semibold text-xs rounded transition-colors flex items-center gap-2 shrink-0"
            aria-label="Open Wholesale Cart"
          >
            <ShoppingBag className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">Wholesale Cart</span>
            {cartCount > 0 && (
              <span className="ml-1 bg-slate-950 text-teal-300 text-[11px] font-mono px-1.5 py-0.2 rounded font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
