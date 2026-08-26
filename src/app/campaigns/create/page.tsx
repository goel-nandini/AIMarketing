'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { 
  Sparkles, 
  Send, 
  Upload, 
  MapPin, 
  Building2, 
  Bot, 
  RefreshCw, 
  FileText, 
  Globe, 
  CheckCircle2, 
  Sliders,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  Layers,
  Search,
  Check,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
  industry: string;
  city: string;
  country: string;
  website?: string;
}

export default function CampaignCreatePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [locationCity, setLocationCity] = useState('Toronto');
  const [locationCountry, setLocationCountry] = useState('Canada');
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [selectedPlatform, setSelectedPlatform] = useState<'Google Ads' | 'Meta Ads' | 'Multi-Channel'>('Google Ads');
  const [selectedObjective, setSelectedObjective] = useState<'lead_generation' | 'consultations' | 'sales' | 'brand_awareness'>('lead_generation');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const presetTemplates = [
    {
      title: "Eye Surgery & Specialist Leads",
      category: "Healthcare",
      location: "Toronto, Canada",
      city: "Toronto",
      country: "Canada",
      prompt: "Launch a high-intent Google Search & Local campaign in Toronto for eye specialist and cataract/LASIK consultations. Target adults aged 35-65 with a focus on booking preliminary diagnostic appointments.",
    },
    {
      title: "Delhi NCR Consultation Search",
      category: "Local Clinic",
      location: "Delhi NCR, India",
      city: "Delhi",
      country: "India",
      prompt: "Run an optimized lead generation campaign in Delhi NCR for specialized eye care and surgery consultations with a conservative starting daily budget.",
    },
    {
      title: "B2B SaaS / Growth Marketing",
      category: "Technology",
      location: "National / Multi-City",
      city: "Toronto",
      country: "Canada",
      prompt: "Generate qualified B2B enterprise leads for AI workflow automation software targeting Marketing Directors and Operations Executives across North America.",
    },
    {
      title: "Luxury Real Estate Buyers",
      category: "Real Estate",
      location: "Vancouver / Toronto",
      city: "Vancouver",
      country: "Canada",
      prompt: "Promote pre-construction waterfront condominiums in Vancouver targeting high-net-worth investors with Meta & Google high-resolution visual storytelling.",
    }
  ];

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const list = await res.json();
          setClients(list);
          if (list.length > 0) {
            setSelectedClientId(list[0].id);
            if (list[0].website) setWebsiteUrl(list[0].website);
          }
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    }
    fetchClients();
  }, []);

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      if (client.city) setLocationCity(client.city);
      if (client.country) setLocationCountry(client.country);
      if (client.website) setWebsiteUrl(client.website);
    }
  };

  const handleApplyTemplate = (tmpl: typeof presetTemplates[0]) => {
    setPrompt(tmpl.prompt);
    setLocationCity(tmpl.city);
    setLocationCountry(tmpl.country);
  };

  const handleAnalyzeAndBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStep(1);

    try {
      setTimeout(() => setAnalysisStep(2), 1100);
      setTimeout(() => setAnalysisStep(3), 2200);
      setTimeout(() => setAnalysisStep(4), 3300);

      const isIndia = locationCountry.toLowerCase().includes('india') || locationCity.toLowerCase().includes('delhi');
      const dailyBudget = isIndia ? 500 : 50;
      const totalBudget = isIndia ? 15000 : 1500;
      const currency = isIndia ? 'INR' : 'CAD';

      // 1. Create Campaign Ingestion Record
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId || clients[0]?.id || 'cl_01',
          name: prompt.slice(0, 42) + '...',
          objective: selectedObjective,
          platform: selectedPlatform === 'Multi-Channel' ? 'Google Ads & Meta' : selectedPlatform,
          location: `${locationCity}, ${locationCountry} (${radiusKm}km radius)`,
          dailyBudget,
          totalBudget,
          currency,
          productService: prompt,
          serviceDescription: prompt,
          websiteUrl: websiteUrl || undefined,
          targetCountry: locationCountry,
          targetProvince: isIndia ? 'Delhi NCR' : 'Ontario',
          targetCity: locationCity,
          aiRequirements: ['Health Canada & FTC Compliance', 'Multi-Agent Consensus', 'Vector Visual Generation'],
        }),
      });

      if (!res.ok) throw new Error('Failed to create campaign record');

      const newCampaign = await res.json();

      // 2. Trigger Full 6-Agent AI Pipeline
      await fetch('/api/ai/run-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: newCampaign.id }),
      });

      // 3. Redirect smoothly to the comprehensive proposal workspace
      router.push(`/campaigns/${newCampaign.id}/proposal`);
    } catch (err) {
      console.error('Error launching campaign pipeline:', err);
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Top Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 md:p-10 text-white shadow-xl border border-slate-700/50">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Multi-Agent AI Campaign Synthesizer</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              What would you like to advertise?
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-normal max-w-2xl leading-relaxed">
              Describe your target outcome in natural language. Our autonomous 6-agent engine will perform competitive research, formulate ad strategy, draft compliant copy, generate visual creatives, and configure Google & Meta ad structures.
            </p>

            {/* Active AI Agent Pipeline Pill Indicators */}
            <div className="pt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-300 font-medium">
              <span className="text-slate-400">Autonomous Orchestration:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-blue-300 font-semibold flex items-center gap-1.5">
                <Search className="w-3 h-3" /> Research Agent
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-purple-300 font-semibold flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Strategy Agent
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-emerald-300 font-semibold flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Copy Agent
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-pink-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Creative Studio
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-amber-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Quality Auditor
              </span>
            </div>
          </div>
        </div>

        {/* Primary Generator Workspace Form */}
        <form onSubmit={handleAnalyzeAndBuild} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6 transition-all focus-within:shadow-md focus-within:border-blue-500/50">
            {/* Prompt Command Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Campaign Prompt & Objectives *</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">Natural Language AI Input</span>
              </div>

              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-4 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Run a high-intent Google Search ad in Toronto for eye specialist / LASIK consultation leads with a conservative daily budget. Highlight quick appointments and experienced specialists..."
                  className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:ring-0 resize-none outline-none leading-relaxed"
                  required
                />

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 mt-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span>Tokens: {prompt.length > 0 ? Math.ceil(prompt.length / 4) : 0}</span>
                    <span>•</span>
                    <span>Multi-Model AI Active</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrompt('')}
                    disabled={!prompt}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-0 transition-opacity"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* 1-Click Industry Templates */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick Industry Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {presetTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="p-3 text-left rounded-2xl border border-slate-200/80 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all group shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800">
                        {tmpl.category}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{tmpl.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{tmpl.location}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
              {/* Client Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned Client Account</span>
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.industry} — {c.city}, {c.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Geo Location & Radius */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Target Geo Location & Proximity</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    placeholder="City (e.g. Toronto / Delhi)"
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value={5}>5 km Radius (Hyper-Local)</option>
                    <option value={15}>15 km Radius (Metro)</option>
                    <option value={30}>30 km Radius (Greater Area)</option>
                    <option value={50}>50 km Radius (Regional)</option>
                  </select>
                </div>
              </div>

              {/* Landing Page */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Website / Landing Page URL</span>
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://icare-eyeconsultation.ca"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Target Platform Adapter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Advertising Platform</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'Google Ads', label: 'Google Ads', sub: 'Search & Maps' },
                    { key: 'Meta Ads', label: 'Meta Ads', sub: 'Instagram & FB' },
                    { key: 'Multi-Channel', label: 'Multi-Channel', sub: 'Google + Meta' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSelectedPlatform(p.key as any)}
                      className={`p-2.5 text-left rounded-xl border text-xs font-bold transition-all ${
                        selectedPlatform === p.key
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-2xs'
                          : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{p.label}</span>
                        {selectedPlatform === p.key && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Creative Deliverables Selection */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Generated Creative Deliverable Types</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'ALL', title: 'Full Asset Suite', desc: 'Images, Videos & Copy', icon: '🚀' },
                  { key: 'IMAGE', title: 'AI Visuals & Banners', desc: 'Photorealistic AI images', icon: '🖼️' },
                  { key: 'VIDEO', title: 'Video Storyboards', desc: 'Scene scripts & voiceover', icon: '🎬' },
                  { key: 'COPY', title: 'Ad Copy & Text', desc: 'Headlines & descriptions', icon: '📝' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-2xl border border-blue-200/60 bg-blue-50/40 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <label className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition-colors shadow-2xs">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>{file ? file.name : 'Attach Brand PDF / Guidelines'}</span>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !prompt.trim()}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none tracking-wide uppercase"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Multi-Agent Campaign...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize & Build Campaign</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Multi-Model Processing State Modal */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl max-w-xl w-full space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white">
                    Multi-Agent AI Pipeline In Progress
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Executing 6 specialized AI agents across Google Gemini & OpenAI GPT-4o
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  analysisStep >= 1 ? 'bg-slate-800/90 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4" />
                    <span>Research Agent: Scraping Competitors & Healthcare Geo Demand</span>
                  </div>
                  {analysisStep >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>

                <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  analysisStep >= 2 ? 'bg-slate-800/90 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4" />
                    <span>Strategy Agent: Formulating Search Keywords & Negative Lists</span>
                  </div>
                  {analysisStep >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>

                <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  analysisStep >= 3 ? 'bg-slate-800/90 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" />
                    <span>Copy Agent & Creative Studio: Generating Ad Variations & Visuals</span>
                  </div>
                  {analysisStep >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>

                <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  analysisStep >= 4 ? 'bg-slate-800/90 border-blue-500/30 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Quality Auditor: Finalizing Compliance & Packaging Proposal</span>
                  </div>
                  {analysisStep >= 4 ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                  ) : null}
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 text-center font-mono">
                Persisting structured JSON proposal to SQLite database dev.db...
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
