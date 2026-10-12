import React from 'react';
import { Package, Truck, Building2, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Order } from '../../types/market';
import { PricingEngine } from '../../services/pricingEngine';
import { OrderLogisticsTimeline } from '../common/OrderLogisticsTimeline';

interface BuyerOrdersProps {
  orders: Order[];
  onDataRefresh?: () => void;
}

export const BuyerOrders: React.FC<BuyerOrdersProps> = ({ orders, onDataRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Procurement Purchase Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tracking parent multi-vendor orders and supplier-specific dispatch packages across Nepal.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center text-slate-500 text-xs">
          No procurement orders placed yet. Add wholesale products to cart to test multi-vendor checkout.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs space-y-4 p-6"
            >
              {/* Parent Order Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {order.paymentStatus}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Delivery: {order.shippingAddress.streetAddress}, Ward {order.shippingAddress.ward},{' '}
                      {order.shippingAddress.municipality} ({order.shippingAddress.province})
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    Parent Order Total
                  </span>
                  <div className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
                    {PricingEngine.formatNpr(order.totalAmountNpr)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Settled via <strong className="font-mono">{order.paymentMethod}</strong>
                  </div>
                </div>
              </div>

              {/* Split Seller Sub-Orders */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Supplier Fulfillment Packages ({order.sellerOrders.length})
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {order.sellerOrders.map((so) => (
                    <div
                      key={so.id}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-teal-700" />
                          <span className="font-bold text-slate-900">{so.sellerBusinessName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-slate-500">{so.orderNumber}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              so.fulfillmentStatus === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : so.fulfillmentStatus === 'DISPATCHED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Package: {so.fulfillmentStatus}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {PricingEngine.formatNpr(so.totalNpr)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {so.items.map((it) => (
                          <div
                            key={it.id}
                            className="flex justify-between items-center text-xs bg-white p-2 rounded border border-slate-200/80"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-slate-600">[{it.sku}]</span>
                              <span className="font-medium text-slate-900">{it.productTitle}</span>
                              <span className="text-slate-400">({it.unitOfMeasure})</span>
                            </div>
                            <div className="font-mono text-slate-800">
                              {it.quantity} × {PricingEngine.formatNpr(it.unitPriceNpr)} ={' '}
                              <strong>{PricingEngine.formatNpr(it.lineTotalNpr)}</strong>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Courier Logistics Tracking */}
                      {so.trackingNumber && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1 font-mono">
                          <Truck className="w-3.5 h-3.5 text-teal-600" />
                          <span>Courier: {so.courierName}</span>
                          <span>·</span>
                          <span>
                            Tracking / Bilty: <strong>{so.trackingNumber}</strong>
                          </span>
                        </div>
                      )}

                      {/* Interactive Real-Time Logistics Timeline */}
                      <div className="pt-2">
                        <OrderLogisticsTimeline
                          sellerOrder={so}
                          parentOrder={order}
                          onRefresh={onDataRefresh || (() => {})}
                          canManage={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
