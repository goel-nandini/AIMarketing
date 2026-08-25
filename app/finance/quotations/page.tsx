'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { AuthGuard } from '../../../components/auth-guard';
import { QuotationItem } from '../../../lib/types';
import { FileText, Plus, Search, CheckCircle2, Clock, X, ArrowRight, Printer } from 'lucide-react';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: 'Jeevansphere',
    clientGstin: '07AABCU9603R1ZX',
    billingAddress: 'CP, New Delhi',
    itemDesc: 'Enterprise Next.js Web Portal Development',
    itemRate: 250000,
    notes: 'Standard 50% advance milestone billing. Valid for 30 days.',
  });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/quotations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setQuotations(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.itemDesc) return;

    const items = [
      {
        desc: formData.itemDesc,
        qty: 1,
        rate: Number(formData.itemRate),
        amount: Number(formData.itemRate),
      },
    ];

    try {
      const res = await fetch('/api/finance/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientGstin: formData.clientGstin,
          billingAddress: formData.billingAddress,
          items,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchQuotations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-purple-600" />
              <span>Quotations & Commercial Proposals</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Commercial proposals, scoped milestones estimates, and automatic 1-click invoice conversion.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </button>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Date / Valid Until</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">GST (18%)</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Convert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {quotations.map((qtn) => (
                  <tr key={qtn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {qtn.quotationNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {qtn.clientName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{qtn.date}</div>
                      <div className="text-[10px] text-slate-400">Valid: {qtn.validUntil}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {formatINR(qtn.subtotal)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatINR(qtn.taxAmount)}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      {formatINR(qtn.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {qtn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href="/finance/invoices"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                      >
                        <span>Convert to Invoice</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Quotation */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Create Commercial Quotation</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Proposal Service Description *</label>
                  <input
                    type="text"
                    required
                    value={formData.itemDesc}
                    onChange={(e) => setFormData({ ...formData, itemDesc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Proposed Value (INR, Excl. GST) *</label>
                  <input
                    type="number"
                    required
                    value={formData.itemRate}
                    onChange={(e) => setFormData({ ...formData, itemRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Commercial Terms / Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
                  >
                    Generate Quotation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
