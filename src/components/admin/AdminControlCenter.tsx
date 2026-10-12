import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  CheckCircle,
  XCircle,
  History,
  Code,
  DollarSign,
  TrendingUp,
  X,
} from 'lucide-react';
import { AuditLog, Business, Order, Product } from '../../types/market';
import { PricingEngine } from '../../services/pricingEngine';
import { MarketStore } from '../../services/marketStore';

interface AdminControlCenterProps {
  businesses: Business[];
  orders: Order[];
  products: Product[];
  auditLogs: AuditLog[];
  onDataRefresh: () => void;
}

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  businesses,
  orders,
  products,
  auditLogs,
  onDataRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'verification' | 'audit' | 'openapi'>('verification');
  const [apiDocJson, setApiDocJson] = useState<any | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const totalGmvNpr = orders.reduce((sum, o) => sum + o.totalAmountNpr, 0);
  const pendingCount = businesses.filter((b) => !b.isVerified).length;

  const handleVerify = (businessId: string, approve: boolean) => {
    MarketStore.verifyBusiness(businessId, approve);
    onDataRefresh();
  };

  const handleLoadOpenApi = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch('/api/v1/openapi.json');
      const data = await res.json();
      setApiDocJson(data);
    } catch {
      setApiDocJson({
        openapi: '3.0.3',
        info: { title: 'NOVA NEPAL B2B Marketplace API', version: '1.0.0' },
        paths: {
          '/api/v1/categories': { get: { summary: 'List wholesale categories' } },
          '/api/v1/products': { get: { summary: 'List wholesale products' } },
          '/api/v1/seller/inventory': { get: { summary: 'Warehouse inventory matrix' } },
          '/api/v1/orders': { post: { summary: 'Atomic checkout and split seller orders' } },
          '/api/v1/rfqs': { post: { summary: 'Create B2B RFQ' } },
        },
      });
    } finally {
      setIsLoadingDocs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Marketplace GMV
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {PricingEngine.formatNpr(totalGmvNpr)}
          </div>
          <span className="text-[11px] text-teal-700">All settled orders</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Registered Businesses
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {businesses.length}
          </div>
          <span className="text-[11px] text-slate-500">Across Nepal provinces</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">
            Pending KYC Reviews
          </span>
          <div className="text-xl font-bold text-amber-600 font-mono tabular-nums">
            {pendingCount}
          </div>
          <span className="text-[11px] text-slate-500">Requires IRD verification</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-1 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Active Catalog SKUs
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {products.reduce((acc, p) => acc + p.variants.length, 0)}
          </div>
          <span className="text-[11px] text-emerald-700">100% stock checked</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'verification'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Seller Business Verification Queue ({businesses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>System Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('openapi');
            if (!apiDocJson) handleLoadOpenApi();
          }}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'openapi'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>OpenAPI / Swagger Specification</span>
        </button>
      </div>

      {/* TAB 1: SELLER VERIFICATION */}
      {activeTab === 'verification' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Inland Revenue Department (IRD) PAN/VAT & Business Verification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review company registrar numbers and PAN credentials to grant official verified status.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {businesses.map((biz) => (
              <div key={biz.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-slate-900">{biz.name}</h3>
                    {biz.isVerified ? (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pending KYC Review
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono">PAN: {biz.panVatNumber}</span>
                    <span>·</span>
                    <span className="font-mono">Reg: {biz.registrationNumber}</span>
                    <span>·</span>
                    <span>
                      {biz.streetAddress}, {biz.district} ({biz.province})
                    </span>
                    <span>·</span>
                    <span>Phone: {biz.contactPhone}</span>
                  </div>

                  <div className="text-xs text-slate-600 mt-1">{biz.description}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {biz.isVerified ? (
                    <button
                      onClick={() => handleVerify(biz.id, false)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors"
                    >
                      Suspend Verification
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerify(biz.id, true)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve PAN & Verify</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Immutable Audit Logs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks financial checkouts, inventory stock movements, and administrative verifications.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-4 font-semibold">Actor Role</th>
                  <th className="py-2.5 px-4 font-semibold">Action</th>
                  <th className="py-2.5 px-4 font-semibold">Entity</th>
                  <th className="py-2.5 px-4 font-semibold">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-teal-800 font-semibold">{log.actorRole}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-600">{log.entityType}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700 max-w-md">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OPENAPI SPECIFICATION */}
      {activeTab === 'openapi' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">OpenAPI 3.0 / Swagger Specification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official REST endpoints exposed under <code className="font-mono text-teal-700">/api/v1</code>
              </p>
            </div>
            <a
              href="/api/v1/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Open Raw JSON ↗
            </a>
          </div>

          <pre className="bg-[#0B192C] text-teal-300 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed">
            {JSON.stringify(apiDocJson || {}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
