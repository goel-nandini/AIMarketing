'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { AuthGuard } from '../../../components/auth-guard';
import { ExpenseItem } from '../../../lib/types';
import { Wallet, Plus, Search, Filter, Calendar, DollarSign, X } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    category: 'SOFTWARE' as any,
    amount: 15000,
    gstAmount: 2700,
    paymentMethod: 'Corporate Credit Card',
    description: '',
    department: 'Development',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/finance/expenses');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setExpenses(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendor || !formData.amount) return;

    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        fetchExpenses();
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
              <Wallet className="w-6 h-6 text-rose-600" />
              <span>Company Expenses & Outflow</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Track cloud hosting, AI credits, office lease, software tools and vendor payouts with input GST.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Category / Dept</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Input GST</th>
                  <th className="py-3 px-4 font-bold text-slate-900">Total Outflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">{exp.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{exp.vendor}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{exp.description}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{formatINR(exp.gstAmount)}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{formatINR(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Record Expense */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Record Business Expense</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vendor / Provider *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud / Vercel Pro"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 bg-white"
                    >
                      <option value="SOFTWARE">Software & APIs</option>
                      <option value="HOSTING">Cloud Hosting</option>
                      <option value="ADVERTISING">Ad Spend</option>
                      <option value="OFFICE">Office & Utilities</option>
                      <option value="VENDOR">Vendor Services</option>
                      <option value="TRAVEL">Travel</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Amount (INR) *</label>
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Description / Memo</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    Save Expense
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
