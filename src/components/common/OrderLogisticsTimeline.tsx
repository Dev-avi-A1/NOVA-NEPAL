import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  FileText,
  Truck,
  Warehouse,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Send,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Order, SellerOrder, UserRole } from '../../types/market';
import { MarketStore } from '../../services/marketStore';

interface OrderLogisticsTimelineProps {
  sellerOrder: SellerOrder;
  parentOrder: Order;
  onRefresh: () => void;
  canManage?: boolean; // If user has seller/admin permissions to mutate state
}

export const OrderLogisticsTimeline: React.FC<OrderLogisticsTimelineProps> = ({
  sellerOrder,
  parentOrder,
  onRefresh,
  canManage = true,
}) => {
  // Determine current active milestone index (0 to 4)
  const isEscrowed = parentOrder.paymentStatus === 'ESCROW_PAID' || parentOrder.paymentStatus === 'RELEASED_TO_SELLERS';
  const isConfirmed = sellerOrder.fulfillmentStatus !== 'PENDING_PAYMENT';
  const hasBilty = Boolean(sellerOrder.biltyNumber) || sellerOrder.fulfillmentStatus === 'DISPATCHED' || sellerOrder.fulfillmentStatus === 'DELIVERED';
  const isDispatched = sellerOrder.fulfillmentStatus === 'DISPATCHED' || sellerOrder.fulfillmentStatus === 'DELIVERED';
  const isDelivered = sellerOrder.fulfillmentStatus === 'DELIVERED';

  let currentStageIndex = 0;
  if (isDelivered) currentStageIndex = 4;
  else if (isDispatched) currentStageIndex = 3;
  else if (hasBilty) currentStageIndex = 2;
  else if (isConfirmed) currentStageIndex = 1;
  else if (isEscrowed) currentStageIndex = 0;

  const [selectedMilestone, setSelectedMilestone] = useState<number>(currentStageIndex);
  const [isBiltyModalOpen, setIsBiltyModalOpen] = useState(false);

  // Bilty Generator Form State
  const [courierName, setCourierName] = useState(sellerOrder.courierName || 'Sundar Yatayat Cargo Express');
  const [biltyNumber, setBiltyNumber] = useState(
    sellerOrder.biltyNumber || `BLT-KTM-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [vehicleNumber, setVehicleNumber] = useState(sellerOrder.vehicleNumber || 'Ba 2 Kha 8941');
  const [originHub, setOriginHub] = useState(
    sellerOrder.originHub || 'Kalanki Industrial Corridor Hub, Kathmandu'
  );

  const stages = [
    {
      index: 0,
      title: 'Payment Escrowed',
      shortDesc: 'Secured in Nepal B2B Escrow',
      isCompleted: isEscrowed,
      isCurrent: currentStageIndex === 0,
      icon: CreditCard,
      timestamp: parentOrder.createdAt,
    },
    {
      index: 1,
      title: 'Order Confirmed',
      shortDesc: 'Stock Allocated & Packaged',
      isCompleted: isConfirmed,
      isCurrent: currentStageIndex === 1,
      icon: CheckCircle2,
      timestamp: sellerOrder.createdAt,
    },
    {
      index: 2,
      title: 'Bilty Generated',
      shortDesc: 'Freight Consignment Issued',
      isCompleted: hasBilty,
      isCurrent: currentStageIndex === 2,
      icon: FileText,
      timestamp: sellerOrder.biltyGeneratedAt || sellerOrder.updatedAt,
    },
    {
      index: 3,
      title: 'Dispatched in Transit',
      shortDesc: 'En Route to Destination',
      isCompleted: isDispatched,
      isCurrent: currentStageIndex === 3,
      icon: Truck,
      timestamp: sellerOrder.dispatchedAt,
    },
    {
      index: 4,
      title: 'Delivered',
      shortDesc: 'Escrow Released to Supplier',
      isCompleted: isDelivered,
      isCurrent: currentStageIndex === 4,
      icon: Warehouse,
      timestamp: sellerOrder.deliveredAt,
    },
  ];

  // Actions
  const handleSaveBilty = (e: React.FormEvent) => {
    e.preventDefault();
    MarketStore.updateSellerOrderStatus(
      sellerOrder.id,
      sellerOrder.fulfillmentStatus === 'PENDING_PAYMENT' ? 'PROCESSING' : sellerOrder.fulfillmentStatus,
      sellerOrder.trackingNumber || `TRK-NP-${Date.now().toString().slice(-6)}`,
      courierName,
      {
        biltyNumber,
        vehicleNumber,
        originHub,
      }
    );
    setIsBiltyModalOpen(false);
    setSelectedMilestone(2);
    onRefresh();
  };

  const handleAdvanceToDispatched = () => {
    MarketStore.updateSellerOrderStatus(
      sellerOrder.id,
      'DISPATCHED',
      sellerOrder.trackingNumber || `TRK-NP-${Date.now().toString().slice(-6)}`,
      courierName,
      {
        biltyNumber: sellerOrder.biltyNumber || biltyNumber,
        vehicleNumber: sellerOrder.vehicleNumber || vehicleNumber,
        originHub: sellerOrder.originHub || originHub,
      }
    );
    setSelectedMilestone(3);
    onRefresh();
  };

  const handleAdvanceToDelivered = () => {
    MarketStore.updateSellerOrderStatus(sellerOrder.id, 'DELIVERED');
    setSelectedMilestone(4);
    onRefresh();
  };

  const handleResetForTesting = () => {
    MarketStore.updateSellerOrderStatus(sellerOrder.id, 'PROCESSING');
    setSelectedMilestone(1);
    onRefresh();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5 shadow-2xs">
      {/* Header and status indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Logistics & Fulfillment Progression
            </h4>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-xs font-semibold text-teal-800">
              {sellerOrder.orderNumber}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time track from secure escrow to Nepal freight consignment bilty and delivery.
          </p>
        </div>

        {/* Live current stage badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1.5 ${
              isDelivered
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : isDispatched
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : hasBilty
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            <span>Current: {stages[currentStageIndex].title}</span>
          </span>
        </div>
      </div>

      {/* HORIZONTAL RESPONSIVE STEPPER */}
      <div className="relative py-2">
        {/* Progress connector line */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0 hidden md:block">
          <div
            className="h-full bg-teal-600 transition-all duration-500"
            style={{ width: `${(currentStageIndex / 4) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isPassed = stage.index < currentStageIndex || (stage.index === currentStageIndex && stage.isCompleted);
            const isCurrent = stage.index === currentStageIndex;
            const isSelected = selectedMilestone === stage.index;

            return (
              <button
                key={stage.index}
                onClick={() => setSelectedMilestone(stage.index)}
                className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600 shadow-xs'
                    : isPassed
                    ? 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                    : 'border-slate-200 bg-white hover:bg-slate-50 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      isPassed
                        ? 'bg-teal-600 text-white'
                        : isCurrent
                        ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-600 font-bold'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : stage.index + 1}
                  </div>
                  <Icon
                    className={`w-4 h-4 ${
                      isPassed ? 'text-teal-600' : isCurrent ? 'text-teal-700' : 'text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <div className="font-bold text-xs text-slate-900 leading-tight">
                    {stage.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {stage.shortDesc}
                  </div>
                </div>

                {stage.timestamp && (
                  <div className="mt-2 text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-200/60">
                    {new Date(stage.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* EXPANDABLE MILESTONE DETAILS & INTERACTIVE SIMULATION PANEL */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4 text-xs">
        {/* Milestone Detail Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Stage {selectedMilestone + 1}: {stages[selectedMilestone].title}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-medium">{stages[selectedMilestone].shortDesc}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {selectedMilestone === 0 &&
                'Payment is held securely in platform escrow awaiting supplier consignment dispatch.'}
              {selectedMilestone === 1 &&
                'Supplier verified line item availability and allocated physical inventory.'}
              {selectedMilestone === 2 &&
                'Official Freight Bilty (Bill of Lading) issued under Nepal road transport guidelines.'}
              {selectedMilestone === 3 &&
                'Consignment in active freight transit along designated Nepal commercial transport routes.'}
              {selectedMilestone === 4 &&
                'Consignment verified and accepted at destination warehouse; escrow payout released.'}
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              {/* If no bilty yet */}
              {!hasBilty && (
                <button
                  onClick={() => setIsBiltyModalOpen(true)}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Bilty Consignment</span>
                </button>
              )}

              {/* If has bilty but not dispatched */}
              {hasBilty && !isDispatched && (
                <button
                  onClick={handleAdvanceToDispatched}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dispatch Freight</span>
                </button>
              )}

              {/* If dispatched but not delivered */}
              {isDispatched && !isDelivered && (
                <button
                  onClick={handleAdvanceToDelivered}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Delivered</span>
                </button>
              )}

              {/* If delivered or advanced, allow reset for testing */}
              {isDelivered && (
                <button
                  onClick={handleResetForTesting}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-white transition-colors flex items-center gap-1"
                  title="Reset state to test again"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Test</span>
                </button>
              )}

              {/* Edit Bilty button */}
              {hasBilty && (
                <button
                  onClick={() => setIsBiltyModalOpen(true)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-white transition-colors"
                >
                  Edit Bilty Info
                </button>
              )}
            </div>
          )}
        </div>

        {/* BILTY FREIGHT CONSIGNMENT CARD (Highlighted when on stage 2, 3, 4 or whenever bilty exists) */}
        {hasBilty ? (
          <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Government of Nepal Freight Bilty Consignment
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                BILTY NO: {sellerOrder.biltyNumber || biltyNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  Cargo Transport Operator
                </span>
                <strong className="text-slate-900 block mt-0.5">
                  {sellerOrder.courierName || courierName}
                </strong>
                <span className="text-[10px] text-slate-400">Licensed National Freight</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  Truck / Vehicle Registration
                </span>
                <strong className="text-slate-900 font-mono block mt-0.5">
                  {sellerOrder.vehicleNumber || vehicleNumber}
                </strong>
                <span className="text-[10px] text-slate-400">Department of Transport (DoTM)</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  Origin Dispatch Hub
                </span>
                <strong className="text-slate-900 block mt-0.5">
                  {sellerOrder.originHub || originHub}
                </strong>
                <span className="text-[10px] text-slate-400">Supplier Central Warehouse</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                  Destination Delivery
                </span>
                <strong className="text-slate-900 block mt-0.5">
                  {parentOrder.shippingAddress.municipality}, {parentOrder.shippingAddress.district}
                </strong>
                <span className="text-[10px] text-slate-400">
                  Ward {parentOrder.shippingAddress.ward} ({parentOrder.shippingAddress.province})
                </span>
              </div>
            </div>

            {/* Consignment Trust Stamp */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Transit Insurance & Escrow Protected · Consignee: {parentOrder.buyerName}</span>
              </div>
              <span className="font-mono text-slate-400">
                Packages: {sellerOrder.items.reduce((s, it) => s + it.quantity, 0)} Units Loaded
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/60 border border-amber-200/80 rounded p-3 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Freight Bilty has not yet been generated. Click <strong>Generate Bilty Consignment</strong> to issue transport paperwork.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: GENERATE / EDIT BILTY CONSIGNMENT */}
      {isBiltyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBilty}
            className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200 p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Issue Nepal Freight Bilty Consignment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBiltyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Generate the legal B2B consignment receipt for transport across Nepal highway corridors.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cargo Courier / Transport Company *
                </label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Sundar Yatayat Cargo Express, Nepal Post Cargo"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bilty Consignment Number *
                </label>
                <input
                  type="text"
                  required
                  value={biltyNumber}
                  onChange={(e) => setBiltyNumber(e.target.value)}
                  placeholder="e.g. BLT-KTM-PKR-4891"
                  className="w-full font-mono uppercase px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Truck / Vehicle Number (Nepal Registration) *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. Ba 2 Kha 8941, Na 4 Kha 1209"
                  className="w-full font-mono px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Origin Dispatch Warehouse Hub *
                </label>
                <input
                  type="text"
                  required
                  value={originHub}
                  onChange={(e) => setOriginHub(e.target.value)}
                  placeholder="e.g. Kalanki Logistics Corridor, Kathmandu"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBiltyModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Issue Bilty</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
