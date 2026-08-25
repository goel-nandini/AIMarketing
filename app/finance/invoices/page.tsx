'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { AuthGuard } from '../../../components/auth-guard';
import { InvoiceItem } from '../../../lib/types';
import { Receipt, Plus, Search, Filter, CheckCircle2, Clock, AlertCircle, ExternalLink, X, Printer, DollarSign } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [formData, setFormData] = useState({
    clientName: 'Jeevansphere',
    clientGstin: '07AABCU9603R1ZX',
    billingAddress: 'CP, New Delhi, India',
    itemDesc: 'Custom Next.js Web Portal Development — Phase 1',
    itemRate: 150000,
    isInterState: false,
    notes: 'Payment due within 15 days via NEFT/IMPS or Razorpay.',
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/invoices');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setInvoices(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.itemDesc) return;

    const items = [
      {
        desc: formData.itemDesc,
        hsn: '998314',
        qty: 1,
        rate: Number(formData.itemRate),
        amount: Number(formData.itemRate),
      },
    ];

    try {
      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientGstin: formData.clientGstin,
          billingAddress: formData.billingAddress,
          items,
          isInterState: formData.isInterState,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchInvoices();
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
              <Receipt className="w-6 h-6 text-blue-600" />
              <span>Invoices & Receivables</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              GST-compliant tax invoices, CGST/SGST/IGST breakdown, payment status & Razorpay links.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tax Invoice</span>
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client / GSTIN</th>
                  <th className="py-3 px-4">Date / Due</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Tax (GST)</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inv.clientName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inv.clientGstin || 'Unregistered'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{inv.date}</div>
                      <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {formatINR(inv.subtotal)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatINR((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0))}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      {formatINR(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create Invoice */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Create GST Tax Invoice</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="font-semibold text-slate-700 block mb-1">Client GSTIN</label>
                    <input
                      type="text"
                      placeholder="e.g. 07AABCU9603R1ZX"
                      value={formData.clientGstin}
                      onChange={(e) => setFormData({ ...formData, clientGstin: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Billing Address</label>
                  <input
                    type="text"
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Item Description *</label>
                  <input
                    type="text"
                    required
                    value={formData.itemDesc}
                    onChange={(e) => setFormData({ ...formData, itemDesc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Taxable Amount (INR) *</label>
                    <input
                      type="number"
                      required
                      value={formData.itemRate}
                      onChange={(e) => setFormData({ ...formData, itemRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">GST Tax Type</label>
                    <select
                      value={formData.isInterState ? 'IGST' : 'CGST_SGST'}
                      onChange={(e) => setFormData({ ...formData, isInterState: e.target.value === 'IGST' })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 bg-white"
                    >
                      <option value="CGST_SGST">Intra-State: 9% CGST + 9% SGST (18%)</option>
                      <option value="IGST">Inter-State: 18% IGST</option>
                    </select>
                  </div>
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
                    Generate Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Printable Invoice Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">CodeKap Technologies Pvt Ltd</h2>
                  <p className="text-xs text-slate-500">GSTIN: 07AAACC4819M1ZV • Delhi, India</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold font-mono text-slate-900 block">
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <span className="text-xs text-slate-500">Date: {selectedInvoice.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">Billed To:</span>
                  <p className="font-bold text-slate-800">{selectedInvoice.clientName}</p>
                  <p className="text-slate-500">{selectedInvoice.billingAddress}</p>
                  <p className="text-slate-600 font-mono mt-1">GSTIN: {selectedInvoice.clientGstin || 'Unregistered'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">Payment Status:</span>
                  <p className="font-bold text-emerald-700">{selectedInvoice.status}</p>
                  <p className="text-slate-500">Due Date: {selectedInvoice.dueDate}</p>
                  {selectedInvoice.razorpayPaymentLinkId && (
                    <p className="text-blue-600 truncate mt-1">
                      Link: {selectedInvoice.razorpayPaymentLinkId}
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-right">Taxable Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {JSON.parse(selectedInvoice.itemsJson || '[]').map((it: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3">{it.desc}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{formatINR(it.amount || it.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end text-xs mb-6">
                <div className="w-64 space-y-1.5 border-t border-slate-200 pt-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatINR(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%):</span>
                    <span>{formatINR(selectedInvoice.cgst || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%):</span>
                    <span>{formatINR(selectedInvoice.sgst || 0)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span>{formatINR(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
