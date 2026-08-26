'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, MapPin, Check, Sparkles, Globe } from 'lucide-react';
import { Client } from '@/lib/types';

interface ClientSelectorProps {
  selectedClientId: string | null;
  onSelectClient: (client: Client) => void;
  className?: string;
}

export function ClientSelector({ selectedClientId, onSelectClient, className = '' }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setClients(data);

          // Find if we have stored preference or selected client
          const storedId = localStorage.getItem('kairo_selected_client_id');
          const target = data.find((c: Client) => c.id === selectedClientId) ||
                         data.find((c: Client) => c.id === storedId) ||
                         data.find((c: Client) => c.name.includes('Aura')) ||
                         data[0];

          if (target && (!selectedClientId || target.id !== selectedClientId)) {
            onSelectClient(target);
            try {
              localStorage.setItem('kairo_selected_client_id', target.id);
            } catch {}
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load clients in selector:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleSelect = (client: Client) => {
    onSelectClient(client);
    try {
      localStorage.setItem('kairo_selected_client_id', client.id);
    } catch {}
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
          Active Client:
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-3 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all duration-200 cursor-pointer btn-press min-w-[220px] max-w-[320px]"
        >
          {loading && !activeClient ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Building2 className="w-4 h-4 animate-pulse" />
              <span>Loading clients...</span>
            </div>
          ) : activeClient ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={activeClient.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${activeClient.name}`}
                alt={activeClient.name}
                className="w-6 h-6 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {activeClient.businessName || activeClient.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                  <span>{activeClient.city || 'Canada'}</span>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-medium">Select a Client</span>
          )}

          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : 'rotate-0'
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-accordion">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>SWITCH CLIENT ACCOUNT</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
              {clients.length} Clients
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
            {clients.map((c) => {
              const isSelected = c.id === activeClient?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200 text-blue-950 font-bold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={c.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.name}`}
                      alt={c.name}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs truncate font-bold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        <span>{c.industry || 'General'}</span>
                        <span>•</span>
                        <span>{c.city}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
