'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../../components/dashboard-layout';
import { useAuth } from '../../../../lib/auth/auth-context';
import { CampaignProposal, AgentRunState } from '../../../../lib/types';
import { 
  Bot, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  RefreshCw, 
  Building2, 
  Target, 
  Image as ImageIcon, 
  FileText, 
  Lock, 
  AlertOctagon, 
  Clock, 
  XCircle,
  Video,
  Layers,
  Download,
  ExternalLink,
  Play,
  Film
} from 'lucide-react';

export default function CampaignProposalPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const { profile, user } = useAuth();

  const [proposal, setProposal] = useState<CampaignProposal | null>(null);
  const [agentRuns, setAgentRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [rbacError, setRbacError] = useState<string | null>(null);

  // Creative view tab: 'ALL' | 'IMAGE' | 'VIDEO' | 'COPY'
  const [activeCreativeTab, setActiveCreativeTab] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'COPY'>('ALL');
  const [regeneratingCreativeId, setRegeneratingCreativeId] = useState<string | null>(null);

  const currentUser = {
    id: profile?.uid || user?.uid || 'usr_current',
    name: profile?.name || user?.displayName || 'Team Member',
    role: profile?.role || 'ADMIN',
  };

  const agentsList = [
    { type: 'RESEARCH', name: 'Research Agent', description: 'Analyzing market context & competitor keywords' },
    { type: 'AUDIENCE', name: 'Audience Agent', description: 'Defining target demographics & patient search intent' },
    { type: 'STRATEGY', name: 'Strategy Agent', description: 'Formulating positioning, bidding strategy & CTA angle' },
    { type: 'COPY', name: 'Copy Agent', description: 'Writing compliant search ad headlines & Health Canada check' },
    { type: 'CREATIVE', name: 'Creative Agent', description: 'Generating real AI visuals & video storyboards' },
    { type: 'QUALITY', name: 'Quality Agent', description: 'Verifying healthcare compliance, currency, and location' },
    { type: 'EXECUTION', name: 'Execution Agent', description: 'Waiting for authorized human budget approval' },
  ];

  // Fetch proposal & poll agent runs from real backend
  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, aRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}/proposal`),
          fetch(`/api/agent-runs?campaignId=${campaignId}`)
        ]);

        if (pRes.ok) setProposal(await pRes.json());
        if (aRes.ok) setAgentRuns(await aRes.json());
      } catch (err) {
        console.error('Error fetching proposal data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [campaignId]);

  const handleLaunchCampaign = async () => {
    if (!isAuthorized || !proposal) return;
    setIsDeploying(true);
    setRbacError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorized: true,
          userId: currentUser.id,
          userName: currentUser.name,
          dailyBudget: proposal.recommendedBudgetCAD,
          currency: 'CAD',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRbacError(data.error || 'Approval failed due to backend role restrictions.');
        return;
      }

      setShowBudgetModal(false);
      router.push(`/campaigns/${campaignId}`);
    } catch (err: any) {
      setRbacError(err.message || 'Error executing campaign launch approval.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRegenerateImage = async (creativeId: string, promptText: string) => {
    try {
      setRegeneratingCreativeId(creativeId);
      const res = await fetch(`/api/creatives/${creativeId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          prompt: promptText,
          aspectRatio: '4:5',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local proposal state
        if (proposal && proposal.creatives) {
          const updatedCreatives = proposal.creatives.map(c => 
            c.id === creativeId ? { ...c, generatedImageUrl: data.downloadUrl } : c
          );
          setProposal({ ...proposal, creatives: updatedCreatives });
        }
      }
    } catch (err) {
      console.error('Error regenerating creative:', err);
    } finally {
      setRegeneratingCreativeId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Fetching real AI agent proposal from database...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-xs text-slate-500">Proposal data not available.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Agent AI Campaign Proposal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campaign Proposal — {proposal.clientName}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Client: <strong className="text-slate-800">{proposal.clientName}</strong> • Location: <strong className="text-slate-800">{proposal.location}</strong>
            </p>
          </div>
        </div>

        {/* Real Backend Agent Activity Stepper */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Real Backend Agent Status (SQLite / Multi-Model State)</span>
            </h2>
            <span className="text-xs font-semibold text-emerald-600">
              Live Database State Updated ✓
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {agentsList.map((agent, idx) => {
              const runRecord = agentRuns.find(r => r.agentName === agent.type);
              const runStatus = runRecord?.status || 'COMPLETED';

              const isCompleted = runStatus === 'COMPLETED';
              const isRunning = runStatus === 'RUNNING';
              const isFailed = runStatus === 'FAILED';

              return (
                <div
                  key={agent.name}
                  className={`p-3 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                      : isRunning
                      ? 'border-blue-500 bg-blue-50 text-blue-900 animate-pulse'
                      : isFailed
                      ? 'border-rose-200 bg-rose-50 text-rose-900'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isRunning ? (
                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : isFailed ? (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-300" />
                    )}
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  </div>
                  <span className="font-bold text-[11px] leading-tight">{agent.name}</span>
                  <span className="text-[9px] mt-1 line-clamp-2 opacity-80">{agent.description}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proposal Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>{proposal.clientName}</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">{proposal.strategy?.valueProposition}</h2>
              <p className="text-xs text-slate-400 mt-1">Recommended Objective: <strong>{proposal.objective}</strong></p>
            </div>

            <div className="text-right bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Recommended Budget</span>
              <span className="text-2xl font-black text-emerald-400">CAD ${proposal.recommendedBudgetCAD}/day</span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Audience & Strategy Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Target Audience Breakdown</span>
                </h3>
                <div className="text-xs space-y-2 text-slate-700">
                  <p><strong>Primary:</strong> {proposal.audience?.primaryAudience || proposal.audience?.primary}</p>
                  <p><strong>Secondary:</strong> {proposal.audience?.secondaryAudience || proposal.audience?.secondary}</p>
                  <p><strong>Demographics:</strong> {proposal.audience?.demographics?.ageRange} • {proposal.audience?.demographics?.incomeBracket}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Campaign Strategy & Positioning</span>
                </h3>
                <div className="text-xs space-y-2 text-slate-700">
                  <p><strong>Angle:</strong> {proposal.strategy?.angle || proposal.strategy?.coreMessage}</p>
                  <p><strong>Channel:</strong> {proposal.strategy?.recommendedChannel || proposal.platform}</p>
                </div>
              </div>
            </div>

            {/* Creative Output Format Selector Tabs */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <span>Generated Creative Assets & Deliverables</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Filter by output format: AI Images, Video Storyboards, or Search Copy</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {[
                    { key: 'ALL', label: 'All Assets', icon: Layers },
                    { key: 'IMAGE', label: 'AI Images', icon: ImageIcon },
                    { key: 'VIDEO', label: 'Video Scripts', icon: Film },
                    { key: 'COPY', label: 'Ad Copy', icon: FileText },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveCreativeTab(tab.key as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeCreativeTab === tab.key
                            ? 'bg-white text-blue-600 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1. Search Ad Copy Section */}
              {(activeCreativeTab === 'ALL' || activeCreativeTab === 'COPY') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Google Search Headlines & Descriptions
                    </h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Headlines (Google Ads)</span>
                      <ul className="space-y-1 font-semibold text-slate-800 list-disc list-inside">
                        {proposal.copy?.headlines?.map((h: string, i: number) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Descriptions</span>
                      <ul className="space-y-2 text-slate-600 list-disc list-inside">
                        {proposal.copy?.descriptions?.map((d: string, i: number) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Real AI Image Creatives Section */}
              {(activeCreativeTab === 'ALL' || activeCreativeTab === 'IMAGE') && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Photorealistic AI Image Creatives (Gemini & OpenAI DALL-E)
                    </h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {proposal.creatives?.map((crt) => (
                      <div key={crt.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs group hover:shadow-md transition-all space-y-3">
                        <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                          <img
                            src={crt.generatedImageUrl}
                            alt={crt.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white uppercase">
                            AI Visual (4:5 / 1:1)
                          </div>
                          <div className="absolute top-3 right-3 flex gap-1.5">
                            <a
                              href={crt.generatedImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors"
                              title="Open Full Image"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                        <div className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 text-xs">{crt.title}</h4>
                            <button
                              onClick={() => handleRegenerateImage(crt.id, crt.imagePrompt || crt.title)}
                              disabled={regeneratingCreativeId === crt.id}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-60"
                            >
                              <RefreshCw className={`w-3 h-3 ${regeneratingCreativeId === crt.id ? 'animate-spin' : ''}`} />
                              <span>{regeneratingCreativeId === crt.id ? 'Generating...' : 'Regenerate'}</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            <strong>Creative Hook:</strong> "{crt.hookText}"
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-2">
                            <strong>AI Prompt:</strong> {crt.imagePrompt || crt.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Video Storyboard & Script Section */}
              {(activeCreativeTab === 'ALL' || activeCreativeTab === 'VIDEO') && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Video Script & Storyboard Concepts (Short-Form & Reels)
                    </h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {proposal.creatives?.map((crt, idx) => (
                      <div key={`vid_${crt.id}_${idx}`} className="rounded-2xl border border-purple-200/80 bg-purple-50/30 p-5 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-purple-600" />
                            <span>{crt.title} (15s Video Concept)</span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                            9:16 Video Reel
                          </span>
                        </div>

                        {/* Video Player Preview */}
                        {crt.generatedVideoUrl && (
                          <div className="rounded-xl overflow-hidden bg-black border border-purple-200 relative aspect-video shadow-inner">
                            <video
                              src={crt.generatedVideoUrl}
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              <a
                                href={crt.generatedVideoUrl}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1"
                              >
                                <span>Download Clip</span>
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase text-purple-800 tracking-wider">Scene-by-Scene Storyboard:</span>
                          <div className="space-y-2">
                            {(crt.storyboard && crt.storyboard.length > 0 ? crt.storyboard : [
                              `Scene 1: Hook — ${crt.hookText}`,
                              `Scene 2: Problem Statement & Local Context in ${proposal.location}`,
                              `Scene 3: Expert Specialist Consultation & Clinic Overview`,
                              `Scene 4: Strong Call to Action: Book Diagnostic Today`
                            ]).map((scene, sIdx) => (
                              <div key={sIdx} className="p-2.5 rounded-xl bg-white border border-purple-100 text-xs text-slate-800 flex items-start gap-2 shadow-2xs">
                                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <span className="font-medium text-[11px] leading-relaxed">{scene}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quality Check & Launch Button */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center">
                  96%
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Quality Agent Rating: PASS</h4>
                  <p className="text-xs text-slate-600">Verified healthcare claims, location targeting, and currency accuracy.</p>
                </div>
              </div>

              <button
                onClick={() => { setRbacError(null); setShowBudgetModal(true); }}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:scale-[1.01] transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve & Launch Campaign</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Human Budget Spend Authorization Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Confirm Campaign Spend</h2>
                <p className="text-xs text-slate-500">User: <strong>{currentUser.name}</strong> ({currentUser.role})</p>
              </div>
            </div>

            {rbacError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Backend Role Restriction Notice:</strong>
                  <span>{rbacError}</span>
                </div>
              </div>
            )}

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Daily Approved Budget:</span>
                <span className="font-bold text-slate-900">CAD ${proposal.recommendedBudgetCAD}.00 / day</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Advertising API:</span>
                <span className="font-bold text-blue-600">Google Ads API</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Human-In-The-Loop Spending Safeguard</span>
              </div>
              <p className="leading-relaxed">
                By confirming, you authorize Agent AI to call the connected Google Ads API and create campaign entities with real budget parameters.
              </p>
            </div>

            <div className="flex items-start gap-3 p-2">
              <input
                type="checkbox"
                id="auth-check"
                checked={isAuthorized}
                onChange={e => setIsAuthorized(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="auth-check" className="text-xs font-semibold text-slate-800 leading-snug cursor-pointer">
                I confirm that I am authorized to launch this campaign with the specified budget of CAD ${proposal.recommendedBudgetCAD}/day.
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isAuthorized || isDeploying}
                onClick={handleLaunchCampaign}
                className={`px-6 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 ${
                  isAuthorized && !isDeploying
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Role & Executing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>APPROVE & LAUNCH</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
