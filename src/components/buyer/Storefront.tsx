import React, { useState } from 'react';
import { Search, ShieldCheck, MapPin, ArrowRight, Filter, Boxes, Sparkles } from 'lucide-react';
import { Category, Product } from '../../types/market';
import { PricingEngine } from '../../services/pricingEngine';
import { ProductDetailModal } from './ProductDetailModal';

interface StorefrontProps {
  products: Product[];
  categories: Category[];
  onDataRefresh: () => void;
  onOpenSellerPortal: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  categories,
  onDataRefresh,
  onOpenSellerPortal,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.businessName.toLowerCase().includes(query) ||
      p.variants.some((v) => v.sku.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-8">
      {/* Wholesale Hero Section (Split 2-column or full banner with clean B2B copy) */}
      <div className="relative bg-[#0B192C] text-white rounded-xl overflow-hidden border border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[340px]">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-4 z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>Direct Manufacturer & Wholesale Distribution Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Institutional Trade & Wholesale Supply for Nepal
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Source verified bulk products directly from certified Nepalese manufacturers and distributors.
              Automated volume price tiers, atomic inventory stock, and nationwide escrow fulfillment.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by SKU, industrial product, or verified supplier..."
                  className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-900/90 text-white placeholder-slate-400 border border-slate-700 rounded focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                onClick={onOpenSellerPortal}
                className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded transition-colors whitespace-nowrap"
              >
                Supply on NOVA NEPAL →
              </button>
            </div>
          </div>

          {/* Right Hero Visual (Real generated warehouse image) */}
          <div className="lg:col-span-5 relative hidden lg:block overflow-hidden">
            <img
              src="/src/assets/images/hero_b2b_warehouse_1791742639213.jpg"
              alt="NOVA NEPAL Central Distribution Center"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B192C] via-transparent to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Category Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`px-3 py-2 font-medium rounded transition-colors whitespace-nowrap ${
            selectedCategoryId === 'all'
              ? 'bg-[#0B192C] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Categories ({products.length})
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategoryId(c.id)}
            className={`px-3 py-2 font-medium rounded transition-colors whitespace-nowrap ${
              selectedCategoryId === c.id
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Wholesale Product Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredProducts.length} wholesale catalog listings</span>
          <span>Prices exclude 13% Nepal VAT where applicable</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const v = p.variants[0];
            const lowestTier = v.priceTiers[v.priceTiers.length - 1];
            const highestTier = v.priceTiers[0];

            return (
              <div
                key={p.id}
                onClick={() => setActiveProduct(p)}
                className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="aspect-4/3 bg-slate-100 relative overflow-hidden">
                    <img
                      src={p.images[0] || '/src/assets/images/hero_b2b_warehouse_1791742639213.jpg'}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    {p.businessVerified && (
                      <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-teal-300 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-teal-400" />
                        <span>PAN Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content (Anti-slop clean typography) */}
                  <div className="p-4 space-y-2">
                    {/* Unboxed Metadata (Zero-pill) */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span>{p.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-700">MOQ: {v.minOrderQuantity} {v.unitOfMeasure}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                      {p.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="text-[11px] text-slate-600 flex items-center gap-1 pt-1">
                      <span className="font-semibold text-slate-800">{p.businessName}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Footer */}
                <div className="p-4 pt-2 border-t border-slate-100 flex items-end justify-between bg-slate-50/50">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Wholesale Tier Price
                    </span>
                    <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                      {PricingEngine.formatNpr(lowestTier.unitPriceNpr)}
                      {highestTier.unitPriceNpr !== lowestTier.unitPriceNpr && (
                        <span className="text-xs text-slate-500 font-normal">
                          {' '}– {PricingEngine.formatNpr(highestTier.unitPriceNpr)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">per {v.unitOfMeasure}</span>
                  </div>

                  <button className="px-3 py-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors">
                    View Tiers
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onAddToCartSuccess={() => {
          onDataRefresh();
        }}
      />
    </div>
  );
};
