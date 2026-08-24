'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AISettings } from '../../lib/types';
import { Bot, Shield, CheckCircle2, Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [aiSettings, setAiSettings] = useState<AISettings>({
    strategyProvider: 'OpenAI',
    researchProvider: 'Gemini',
    copyProvider: 'OpenAI',
    imageProvider: 'OpenAI',
    videoProvider: 'Gemini',
    validationProvider: 'Gemini',
    demoMode: true,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) setAiSettings(await res.json());
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiSettings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings & Model Router
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Configure AI provider assignments per task, DEMO_MODE toggle, and security defaults.
          </p>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully in database!</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading model router settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Model Router Configuration</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Strategy Agent Provider</label>
                  <select
                    value={aiSettings.strategyProvider}
                    onChange={e => setAiSettings({...aiSettings, strategyProvider: e.target.value as any})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="OpenAI">OpenAI (GPT-4o)</option>
                    <option value="Gemini">Google Gemini 1.5 Pro</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Research Agent Provider</label>
                  <select
                    value={aiSettings.researchProvider}
                    onChange={e => setAiSettings({...aiSettings, researchProvider: e.target.value as any})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="Gemini">Google Gemini 1.5 Pro</option>
                    <option value="OpenAI">OpenAI (GPT-4o)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Copy Agent Provider</label>
                  <select
                    value={aiSettings.copyProvider}
                    onChange={e => setAiSettings({...aiSettings, copyProvider: e.target.value as any})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="OpenAI">OpenAI (GPT-4o)</option>
                    <option value="Gemini">Google Gemini 1.5 Pro</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quality & Compliance Agent Provider</label>
                  <select
                    value={aiSettings.validationProvider}
                    onChange={e => setAiSettings({...aiSettings, validationProvider: e.target.value as any})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="Gemini">Google Gemini 1.5 Pro</option>
                    <option value="OpenAI">OpenAI (GPT-4o)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Development & Offline Simulation Mode</span>
              </h2>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <strong className="block text-slate-900 font-bold">DEMO_MODE (`DEMO_MODE=true`)</strong>
                  <p className="text-slate-500 mt-0.5">
                    When enabled, agent execution runs in safe simulation without incurring API billing or creating live ad spending until keys are connected.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiSettings.demoMode}
                  onChange={e => setAiSettings({...aiSettings, demoMode: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
