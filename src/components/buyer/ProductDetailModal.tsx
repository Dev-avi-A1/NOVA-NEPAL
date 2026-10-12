import React, { useState } from 'react';
import { X, Check, ShieldCheck, AlertCircle, ShoppingBag, Truck, MapPin, Building2 } from 'lucide-react';
import { Product, ProductVariant } from '../../types/market';
import { PricingEngine } from '../../services/pricingEngine';
import { MarketStore } from '../../services/marketStore';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCartSuccess: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCartSuccess,
}) => {
  if (!product) return null;

  const variant: ProductVariant = product.variants[0];
  const [quantity, setQuantity] = useState<number>(variant.minOrderQuantity);
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0]);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Evaluate dynamic pricing real-time
  const pricingResult = PricingEngine.calculatePrice(variant, quantity);
  const baseTier = variant.priceTiers[0];
  const unitSavings =
    pricingResult.isValid && baseTier
      ? Math.max(0, Math.round(((baseTier.unitPriceNpr - pricingResult.unitPriceNpr) / baseTier.unitPriceNpr) * 100))
      : 0;

  const handleAddToCart = () => {
    setActionMessage(null);
    if (!pricingResult.isValid) {
      setActionMessage({ type: 'error', text: pricingResult.error || 'Invalid volume selected.' });
      return;
    }

    const res = MarketStore.addToCart(variant.id, quantity);
    if (!res.success) {
      setActionMessage({ type: 'error', text: res.error || 'Failed to add item to cart.' });
      return;
    }

    setActionMessage({
      type: 'success',
      text: `Added ${quantity} ${variant.unitOfMeasure} to wholesale cart at ${PricingEngine.formatNpr(
        pricingResult.unitPriceNpr
      )}/unit.`,
    });
    onAddToCartSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0B192C] text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-teal-400 font-semibold uppercase tracking-wider">
              SKU: {variant.sku}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">{product.categoryName}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Image & Specifications */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-4/3 bg-slate-100 rounded border border-slate-200 overflow-hidden flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Supplier Card */}
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Verified Supplier</span>
                {product.businessVerified && (
                  <span className="flex items-center gap-1 font-semibold text-teal-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>PAN Verified</span>
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900">{product.businessName}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Warehouse Origin: Nepal ({variant.inventory.warehouseLocation})</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Product Specifications
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module & Dynamic Tier Calculator */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {product.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>Unit: <strong>{variant.unitOfMeasure}</strong></span>
                <span>·</span>
                <span>MOQ: <strong className="font-mono text-slate-800">{variant.minOrderQuantity} units</strong></span>
                <span>·</span>
                <span>
                  Available Stock:{' '}
                  <strong className="font-mono text-teal-700">
                    {variant.inventory.availableQuantity.toLocaleString()} units
                  </strong>
                </span>
              </div>
            </div>

            {/* Dynamic Wholesale Tier Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Wholesale Quantity Discount Tiers</span>
                <span className="text-[11px] text-slate-400">All prices in NPR</span>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 font-medium">Quantity Range</th>
                      <th className="py-2 px-3 font-medium text-right">Unit Price (NPR)</th>
                      <th className="py-2 px-3 font-medium text-right">Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variant.priceTiers.map((tier, idx) => {
                      const isTierActive =
                        pricingResult.appliedTier && pricingResult.appliedTier.id === tier.id;
                      const tierDiscount =
                        baseTier && baseTier.unitPriceNpr > tier.unitPriceNpr
                          ? Math.round(((baseTier.unitPriceNpr - tier.unitPriceNpr) / baseTier.unitPriceNpr) * 100)
                          : 0;

                      return (
                        <tr
                          key={tier.id}
                          className={`transition-colors font-mono ${
                            isTierActive
                              ? 'bg-teal-50/80 font-bold text-teal-900 border-l-3 border-teal-600'
                              : 'text-slate-700 hover:bg-slate-50/40'
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            {tier.minQuantity}
                            {tier.maxQuantity ? ` – ${tier.maxQuantity}` : '+'} {variant.unitOfMeasure}
                            {isTierActive && (
                              <span className="ml-2 font-sans text-[10px] font-semibold text-teal-700 uppercase tracking-wider">
                                Active Tier
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {PricingEngine.formatNpr(tier.unitPriceNpr)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500 font-sans text-[11px]">
                            {tierDiscount > 0 ? (
                              <span className="text-emerald-700 font-semibold">-{tierDiscount}%</span>
                            ) : (
                              'Base Price'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic Volume Stepper & Price Output */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Purchase Quantity ({variant.unitOfMeasure})
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={variant.minOrderQuantity}
                      max={variant.inventory.availableQuantity}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10) || variant.minOrderQuantity)}
                      className="w-28 text-sm font-mono font-bold px-3 py-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => setQuantity(variant.minOrderQuantity)}
                        className="px-2 py-1 text-[11px] font-medium bg-white border border-slate-300 rounded hover:bg-slate-100"
                      >
                        MOQ ({variant.minOrderQuantity})
                      </button>
                      <button
                        onClick={() => setQuantity(Math.max(variant.minOrderQuantity, 50))}
                        className="px-2 py-1 text-[11px] font-medium bg-white border border-slate-300 rounded hover:bg-slate-100"
                      >
                        50
                      </button>
                      <button
                        onClick={() => setQuantity(Math.max(variant.minOrderQuantity, 100))}
                        className="px-2 py-1 text-[11px] font-medium bg-white border border-slate-300 rounded hover:bg-slate-100"
                      >
                        100+
                      </button>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    Calculated Wholesale Total
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                    {pricingResult.isValid
                      ? PricingEngine.formatNpr(pricingResult.totalNpr)
                      : '---'}
                  </div>
                  {pricingResult.isValid && (
                    <div className="text-xs text-slate-600 font-mono">
                      @ {PricingEngine.formatNpr(pricingResult.unitPriceNpr)} / unit
                      {unitSavings > 0 && (
                        <span className="ml-1.5 font-sans font-semibold text-emerald-700">
                          (Save {unitSavings}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {actionMessage && (
                <div
                  className={`p-3 rounded text-xs flex items-start gap-2 ${
                    actionMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {actionMessage.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{actionMessage.text}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!pricingResult.isValid || quantity > variant.inventory.availableQuantity}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-950 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:hover:bg-teal-500 rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-950" />
                  <span>Add to Wholesale Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
