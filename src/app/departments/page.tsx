'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { DepartmentItem } from '../../lib/types';
import { Briefcase, Plus, Users, Layers, ShieldCheck, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', headName: '', description: '' });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDepartments(data);
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', headName: '', description: '' });
        fetchDepartments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <span>Departments & Structure</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Organize CodeKap functional verticals, heads, projects & cross-department workflows.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {departments.map((dept, idx) => (
            <div key={dept.id || idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">Head: <strong>{dept.headName || 'Aman Sir'}</strong></p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
                  {dept.description || 'Core operational department managing business initiatives.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned Team Active</span>
                </span>
                <span className="font-semibold text-blue-600 hover:underline cursor-pointer flex items-center">
                  Department Hub <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Create New Department</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Creative AI & Multimedia"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department Head Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Aman Sir"
                    value={formData.headName}
                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Purpose / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the department's functional scope..."
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
                    Create
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
