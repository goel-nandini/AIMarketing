'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Edit,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openAddModal = () => {
    setEditingClient(null);
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
    setError('');
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      businessName: client.businessName || '',
      website: client.website || '',
      industry: client.industry || '',
      country: client.country || 'Canada',
      province: client.province || '',
      city: client.city || '',
      contactName: client.contactName || '',
      contactEmail: client.contactEmail || '',
      contactPhone: client.contactPhone || '',
      logoUrl: client.logoUrl || '',
      description: client.description || '',
      brandTone: client.brandTone || 'Professional, Modern, High-Converting',
    });
    setError('');
    setShowModal(true);
  };

  // Handle local file upload from Downloads/PC
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (.png, .jpg, .svg, .webp).');
      return;
    }

    // Convert file to Data URI base64
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          logoUrl: event.target?.result as string,
        }));
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        logoUrl: formData.logoUrl.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(formData.name.trim())}`,
      };

      const isEdit = !!editingClient;
      const url = '/api/clients';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit ? JSON.stringify({ id: editingClient.id, ...payload }) : JSON.stringify(payload);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (res.ok) {
        setShowModal(false);
        fetchClients();
      } else {
        const d = await res.json();
        setError(d.error || `Failed to ${isEdit ? 'update' : 'save'} client business.`);
      }
    } catch (err: any) {
      setError(err.message || 'Error processing client.');
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
              <span>Business & Client Profiles</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Client & Business Management
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage client businesses, uploaded logos, contact numbers, and target market parameters.
            </p>
          </div>

          <button
            onClick={openAddModal}
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
                Add your first business profile with custom logo upload, mobile phone number, website, and industry details.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={openAddModal}
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
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={client.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(client.name)}`}
                        alt={client.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-50 shadow-2xs shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{client.name}</h3>
                        <p className="text-xs font-medium text-slate-500">{client.businessName || client.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100 mr-1">
                        {client.country}
                      </span>
                      
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                        title="Edit Business"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                        title="Delete Business"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                      <div className="flex items-center gap-2 text-slate-600 col-span-2">
                        <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{client.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
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

        {/* Modal: Add / Edit Business Profile */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 border border-slate-200 shadow-2xl my-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {editingClient ? 'Edit Business Profile' : 'Add Business / Client Profile'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {editingClient ? 'Update business details and branding' : 'Configure business identity, logo, and contact info'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Logo Upload Section (Manual Upload from PC/Downloads) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Business Logo (Upload from Downloads or Enter URL)
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Logo Preview box */}
                    <div className="relative group w-18 h-18 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-slate-300" />
                      )}
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Manual Upload Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload from Downloads / PC</span>
                        </button>

                        {/* Smart AI Logo Generator */}
                        <button
                          type="button"
                          onClick={() => {
                            const seed = formData.name.trim() || 'business';
                            setFormData({
                              ...formData,
                              logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`,
                            });
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Generate Logo</span>
                        </button>

                        {formData.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, logoUrl: '' })}
                            className="px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Optional URL input */}
                      <input
                        type="url"
                        placeholder="Or paste direct image URL (https://...)"
                        value={formData.logoUrl.startsWith('data:') ? '' : formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        className="w-full text-[11px] p-2 rounded-xl border border-slate-200 bg-white focus:ring-1 focus:ring-blue-600 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

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

                {/* Contact Information (Including Mobile / Phone) */}
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

                {/* Brand Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Brand Description & Services
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe core services, target audience, key value proposition..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                        <span>{editingClient ? 'Updating Business...' : 'Saving Business...'}</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>{editingClient ? 'Save Changes' : 'Save Business Profile'}</span>
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
