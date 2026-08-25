'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { SOPItem } from '../../lib/types';
import { BookOpen, Plus, Search, Filter, CheckSquare, Clock, ShieldCheck, FileText, ChevronRight, X, Sparkles } from 'lucide-react';

export default function SOPLibraryPage() {
  const [sops, setSops] = useState<SOPItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedSop, setSelectedSop] = useState<SOPItem | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: 'Development',
    service: '',
    purpose: '',
    instructions: '',
    checklistText: '1. Step One\n2. Step Two\n3. Step Three\n4. Final Quality QA',
    requiredProof: 'Live deployment URL + PR Link',
    expectedDurationHours: 15,
    responsibleRole: 'EMPLOYEE',
  });

  const fetchSops = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sop');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSops(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSops();
  }, []);

  const handleCreateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.purpose) return;

    const checklist = formData.checklistText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          checklistJson: JSON.stringify(checklist),
        }),
      });
      if (res.ok) {
        setShowBuilder(false);
        setFormData({
          title: '',
          department: 'Development',
          service: '',
          purpose: '',
          instructions: '',
          checklistText: '1. Step One\n2. Step Two\n3. Step Three\n4. Final Quality QA',
          requiredProof: 'Live deployment URL + PR Link',
          expectedDurationHours: 15,
          responsibleRole: 'EMPLOYEE',
        });
        fetchSops();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = sops.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.service.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || s.department.toLowerCase().includes(deptFilter.toLowerCase());
    return matchSearch && matchDept;
  });

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-amber-600" />
              <span>Standard Operating Procedures (SOP Library)</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Repeatable operational workflows, checklists, proofs of work and task generation templates.
            </p>
          </div>

          <button
            onClick={() => setShowBuilder(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create SOP Template</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search SOP by title, code, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {['ALL', 'Development', 'Digital Marketing', 'Administration'].map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  deptFilter === d
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* SOP Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((sop) => {
            let checklist: string[] = [];
            try {
              checklist = JSON.parse(sop.checklistJson || '[]');
            } catch {}

            return (
              <div
                key={sop.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {sop.code}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {sop.department}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">v{sop.version}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{sop.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">Service: <strong>{sop.service}</strong></p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Standard Purpose</span>
                    <p className="text-slate-700 leading-relaxed">{sop.purpose}</p>
                  </div>

                  {checklist.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Core Checklist Steps ({checklist.length})
                      </span>
                      <div className="space-y-1">
                        {checklist.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                        {checklist.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium pl-5 block">
                            +{checklist.length - 3} more steps
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est: <strong>{sop.expectedDurationHours}h</strong></span>
                  </div>

                  <button
                    onClick={() => setSelectedSop(sop)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Full SOP</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View SOP Detail Modal */}
        {selectedSop && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {selectedSop.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedSop.title}</h3>
                </div>
                <button onClick={() => setSelectedSop(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Purpose & Outcome</h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">{selectedSop.purpose}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Operational Instructions</h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">{selectedSop.instructions}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Standard Step-by-Step Checklist</h4>
                  <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    {JSON.parse(selectedSop.checklistJson || '[]').map((st: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSop.requiredProof && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Mandatory Proof of Completion</h4>
                    <p className="text-slate-600 italic">{selectedSop.requiredProof}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedSop(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  Close SOP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Builder Modal */}
        {showBuilder && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Create SOP Template</h3>
                <button onClick={() => setShowBuilder(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSop} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SOP Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next.js SaaS Web App Development SOP"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 bg-white"
                    >
                      <option value="Development">Development</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                      <option value="Sales & BD">Sales & BD</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Service Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Web Development"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Purpose & Target Outcome *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Explain the objective and expected business output..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Execution Instructions *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Detailed rules, conventions, and technical guardrails..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Checklist Steps (One per line)</label>
                  <textarea
                    rows={4}
                    value={formData.checklistText}
                    onChange={(e) => setFormData({ ...formData, checklistText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBuilder(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
                  >
                    Save SOP
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
