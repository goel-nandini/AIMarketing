'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Client } from '../../lib/types';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Plus, 
  Mail, 
  Phone,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    website: '',
    industry: '',
    country: 'Canada',
    province: 'Ontario',
    city: 'Toronto',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    description: '',
    brandTone: 'Professional, Modern, High-Converting',
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        logoUrl: formData.logoUrl.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(formData.name.trim())}`,
      };

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          businessName: '',
          website: '',
          industry: '',
          country: 'Canada',
          province: 'Ontario',
          city: 'Toronto',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          logoUrl: '',
          description: '',
          brandTone: 'Professional, Modern, High-Converting',
        });
        fetchClients();
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to save client business.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating client.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchClients();
      }
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Business & Brand Portfolio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business Profiles & Clients
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage client businesses, logos, contact numbers, and targeting parameters for AI marketing campaigns.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Business</span>
          </button>
        </div>

        {/* Clients Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading business database...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Businesses or Clients Added Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Clean state initialized. Click below to add your first business with logo, phone number, website, and target market.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Business</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={client.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(client.name)}`}
                      alt={client.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 shadow-2xs shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{client.name}</h3>
                      <p className="text-xs font-medium text-slate-500">{client.businessName || client.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100">
                      {client.country}
                    </span>
                    <button
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Business"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {client.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-3">
                    {client.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{client.industry || 'General Industry'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{client.city}, {client.province}</span>
                  </div>
                  {client.website && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <a
                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>{client.website.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}
                  {client.contactPhone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate font-mono">{client.contactPhone}</span>
                    </div>
                  )}
                  {client.contactEmail && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{client.contactEmail}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Tone: <strong className="text-slate-700">{client.brandTone || 'Professional'}</strong>
                  </span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for AI Campaigns
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal to Add New Client Business */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 border border-slate-200 shadow-2xl my-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Add Business / Client Profile</h2>
                  <p className="text-xs text-slate-500">Configure business identity, contact details, and marketing parameters</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Business Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Health Clinic"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Registered Legal Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Health Solutions Inc."
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Industry / Niche *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dental Care, Real Estate, SaaS"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. John Smith"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="contact@business.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile / Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Province / State</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                {/* Logo URL & Live Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Logo Image URL</label>
                    <button
                      type="button"
                      onClick={() => {
                        const seed = formData.name.trim() || 'business';
                        setFormData({
                          ...formData,
                          logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`,
                        });
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Generate Smart Logo
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png (or leave blank for auto logo)"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Brand Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Brand Description & Services
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe core services, target audience pain points, key value proposition..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Business Profile...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Save Business Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
