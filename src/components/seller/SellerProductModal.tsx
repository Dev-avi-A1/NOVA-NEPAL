import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Category } from '../../types/market';
import { PricingEngine } from '../../services/pricingEngine';
import { MarketStore } from '../../services/marketStore';

interface SellerProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  businessId: string;
  onSuccess: () => void;
}

export const SellerProductModal: React.FC<SellerProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  businessId,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Box of 24 pcs');
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(10);
  const [maxOrderQuantity, setMaxOrderQuantity] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number>(200);
  const [warehouseLocation, setWarehouseLocation] = useState('Kathmandu Logistics Hub Bay 1');

  // Dynamic price tiers state
  const [tiers, setTiers] = useState<Array<{ minQuantity: number; maxQuantity?: number; unitPriceNpr: number }>>([
    { minQuantity: 10, maxQuantity: 49, unitPriceNpr: 1200 },
    { minQuantity: 50, maxQuantity: 99, unitPriceNpr: 1050 },
    { minQuantity: 100, maxQuantity: undefined, unitPriceNpr: 950 },
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const nextMin = lastTier && lastTier.maxQuantity ? lastTier.maxQuantity + 1 : 100;
    setTiers([...tiers, { minQuantity: nextMin, maxQuantity: undefined, unitPriceNpr: (lastTier?.unitPriceNpr || 1000) * 0.9 }]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) {
      setErrorMessage('A wholesale product must have at least one pricing tier.');
      return;
    }
    const updated = tiers.filter((_, i) => i !== index);
    setTiers(updated);
  };

  const handleTierChange = (index: number, field: 'minQuantity' | 'maxQuantity' | 'unitPriceNpr', value: number | undefined) => {
    const updated = [...tiers];
    if (field === 'maxQuantity') {
      updated[index].maxQuantity = value;
    } else if (field === 'minQuantity' && typeof value === 'number') {
      updated[index].minQuantity = value;
    } else if (field === 'unitPriceNpr' && typeof value === 'number') {
      updated[index].unitPriceNpr = value;
    }
    setTiers(updated);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !sku.trim()) {
      setErrorMessage('Product title and variant SKU are required.');
      return;
    }

    if (minOrderQuantity <= 0) {
      setErrorMessage('Minimum Order Quantity (MOQ) must be at least 1.');
      return;
    }

    // Validate tier configuration
    const validation = PricingEngine.validateTierConfiguration(minOrderQuantity, tiers);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid tier configuration.');
      return;
    }

    const result = MarketStore.addProduct(businessId, {
      title,
      description: description || 'Wholesale commercial grade product manufactured to Nepal quality standards.',
      categoryId,
      variant: {
        sku: sku.trim().toUpperCase(),
        unitOfMeasure,
        minOrderQuantity,
        maxOrderQuantity: maxOrderQuantity ? parseInt(maxOrderQuantity, 10) : undefined,
        stockQuantity,
        warehouseLocation,
        priceTiers: tiers,
      },
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create product.');
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0B192C] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Create Wholesale Product & Price Tiers</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Define SKU specifications, MOQ limits, and volume discount brackets in NPR.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Product Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200">
              1. General Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ASTM Galvanized Scaffolding Pipe"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Wholesale Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white focus:outline-none focus:border-teal-600"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commercial Specifications</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Industrial grade specifications, compliance standard (BS/ASTM/Nepal Standard), batch packaging..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Section 2: Variant, SKU, & Packaging */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200">
              2. Variant SKU & Packaging Unit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Master SKU *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. HF-SCAF-48MM"
                  className="w-full text-xs font-mono uppercase px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure (UOM) *</label>
                <input
                  type="text"
                  required
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  placeholder="e.g. Carton of 24 pcs, 50kg Bag"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Order Qty (MOQ) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Physical Stock (Warehouse)</label>
                <input
                  type="number"
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nepal Warehouse Bay Location</label>
                <input
                  type="text"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  placeholder="e.g. Kathmandu Bay A-1, Biratnagar Depot"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Wholesale Volume Price Tiers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Volume Price Tiers (NPR)
              </h3>
              <button
                type="button"
                onClick={handleAddTier}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Define ascending volume brackets. The final tier can leave "Max Quantity" blank to represent unlimited volume discount.
            </p>

            <div className="space-y-2">
              {tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded border border-slate-200 text-xs"
                >
                  <div className="col-span-1 text-slate-500 font-medium">#{idx + 1}</div>

                  <div className="col-span-3">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Min Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={tier.minQuantity}
                      onChange={(e) => handleTierChange(idx, 'minQuantity', parseInt(e.target.value, 10) || 1)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Max Qty (optional)</label>
                    <input
                      type="number"
                      placeholder="Unlimited (e.g. 100+)"
                      value={tier.maxQuantity ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        handleTierChange(idx, 'maxQuantity', val);
                      }}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Unit Price (NPR)</label>
                    <input
                      type="number"
                      min={1}
                      value={tier.unitPriceNpr}
                      onChange={(e) => handleTierChange(idx, 'unitPriceNpr', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      disabled={tiers.length === 1}
                      className="text-slate-400 hover:text-red-600 p-1 disabled:opacity-30 disabled:hover:text-slate-400"
                      title="Remove tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Product & Tiers</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
