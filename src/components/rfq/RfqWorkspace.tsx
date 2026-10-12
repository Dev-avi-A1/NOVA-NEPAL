import React, { useState } from 'react';
import { FileText, Plus, Send, CheckCircle2, Building2, MapPin, Calendar, Clock, DollarSign, X } from 'lucide-react';
import { Category, Quotation, RFQ, User } from '../../types/market';
import { PricingEngine } from '../../services/pricingEngine';
import { MarketStore } from '../../services/marketStore';

interface RfqWorkspaceProps {
  rfqs: RFQ[];
  categories: Category[];
  currentUser: User;
  onDataRefresh: () => void;
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

export const RfqWorkspace: React.FC<RfqWorkspaceProps> = ({
  rfqs,
  categories,
  currentUser,
  onDataRefresh,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Industrial & Hardware');
  const [quantity, setQuantity] = useState<number>(100);
  const [unitOfMeasure, setUnitOfMeasure] = useState('Carton of 24 pcs');
  const [targetPriceNpr, setTargetPriceNpr] = useState<string>('7500');
  const [destinationProvince, setDestinationProvince] = useState('Bagmati Province');
  const [destinationCity, setDestinationCity] = useState('Kathmandu');
  const [deliveryDeadline, setDeliveryDeadline] = useState('2026-04-30');
  const [specifications, setSpecifications] = useState('');

  const handleCreateRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    MarketStore.createRfq({
      title,
      category,
      quantity,
      unitOfMeasure,
      targetPriceNpr: targetPriceNpr ? parseFloat(targetPriceNpr) : undefined,
      destinationProvince,
      destinationCity,
      deliveryDeadline,
      specifications: specifications || 'Commercial specifications per standard Nepal trading guidelines.',
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setSpecifications('');
    onDataRefresh();
  };

  const handleAcceptQuotation = (quotationId: string) => {
    MarketStore.acceptQuotation(quotationId);
    onDataRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            B2B Request for Quotation (RFQ) Exchange
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Negotiate customized volume orders, delivery deadlines, and contractual trade terms with certified suppliers.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded transition-colors flex items-center gap-2 shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Post New RFQ</span>
        </button>
      </div>

      {/* RFQ Listings */}
      <div className="space-y-4">
        {rfqs.map((rfq) => (
          <div
            key={rfq.id}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {rfq.rfqNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {rfq.category}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      rfq.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rfq.status === 'QUOTATIONS_RECEIVED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rfq.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{rfq.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rfq.specifications}</p>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                  Volume Requested
                </span>
                <div className="text-base font-extrabold text-slate-900 font-mono">
                  {rfq.quantity.toLocaleString()} {rfq.unitOfMeasure}
                </div>
                {rfq.targetPriceNpr && (
                  <div className="text-xs text-slate-500 font-mono">
                    Target: {PricingEngine.formatNpr(rfq.targetPriceNpr)}/unit
                  </div>
                )}
              </div>
            </div>

            {/* Logistics & Buyer Information */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span>
                Procurement: <strong>{rfq.buyerCompany}</strong> ({rfq.buyerName})
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Destination: {rfq.destinationCity}, {rfq.destinationProvince}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Deadline: {rfq.deliveryDeadline}
              </span>
            </div>

            {/* Quotations Received Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Supplier Quotations ({rfq.quotations.length})
              </h4>

              {rfq.quotations.length === 0 ? (
                <div className="p-3 bg-slate-50 text-slate-500 text-xs rounded border border-slate-200">
                  Awaiting supplier bids. Verified manufacturers will submit volume proposals here.
                </div>
              ) : (
                <div className="space-y-2">
                  {rfq.quotations.map((quot) => (
                    <div
                      key={quot.id}
                      className={`p-3 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        quot.status === 'ACCEPTED'
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-teal-700" />
                          <strong className="text-slate-900">{quot.sellerBusinessName}</strong>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{quot.sellerContactPhone}</span>
                        </div>
                        <div className="text-slate-600 text-[11px]">{quot.notes}</div>
                        <div className="text-slate-500 text-[11px]">
                          Lead Time: <strong>{quot.leadTimeDays} business days</strong> (Valid until{' '}
                          {quot.validUntil})
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:justify-end">
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm text-slate-900">
                            {PricingEngine.formatNpr(quot.offeredUnitPriceNpr)}
                            <span className="text-xs font-normal text-slate-500"> / unit</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            Total: {PricingEngine.formatNpr(quot.offeredTotalNpr)}
                          </div>
                        </div>

                        {quot.status === 'ACCEPTED' ? (
                          <div className="flex items-center gap-1 text-emerald-800 font-semibold px-2 py-1 rounded bg-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Accepted</span>
                          </div>
                        ) : rfq.status !== 'ACCEPTED' ? (
                          <button
                            onClick={() => handleAcceptQuotation(quot.id)}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded transition-colors whitespace-nowrap"
                          >
                            Accept Quotation
                          </button>
                        ) : (
                          <span className="text-slate-400 font-medium">Declined</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: POST NEW RFQ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRfq}
            className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Post B2B Request for Quotation</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Item Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bulk Supply of 50mm Industrial Brass Ball Valves"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white focus:outline-none focus:border-teal-600"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Packaging (UOM) *</label>
                  <input
                    type="text"
                    required
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    placeholder="e.g. Carton of 24 pcs"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Required Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Unit Price (NPR)</label>
                  <input
                    type="number"
                    value={targetPriceNpr}
                    onChange={(e) => setTargetPriceNpr(e.target.value)}
                    placeholder="Optional target"
                    className="w-full px-3 py-2 border border-slate-300 rounded font-mono focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Province *</label>
                  <select
                    value={destinationProvince}
                    onChange={(e) => setDestinationProvince(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white focus:outline-none focus:border-teal-600"
                  >
                    {NEPAL_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination City *</label>
                  <input
                    type="text"
                    required
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="e.g. Pokhara, Biratnagar"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Deadline *</label>
                <input
                  type="date"
                  required
                  value={deliveryDeadline}
                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Technical Specifications</label>
                <textarea
                  rows={3}
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="Material specifications, required test certificates, packaging guidelines..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded"
              >
                Publish RFQ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
