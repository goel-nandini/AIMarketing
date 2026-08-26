'use client';

import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Client, SocialPlatform } from '@/lib/types';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSuccess: () => void;
}

export function ConnectAccountModal({
  isOpen,
  onClose,
  client,
  onSuccess,
}: ConnectAccountModalProps) {
  const [platform, setPlatform] = useState<SocialPlatform>('INSTAGRAM');
  const [connectMethod, setConnectMethod] = useState<'OAUTH' | 'TOKEN'>('OAUTH');
  const [username, setUsername] = useState('');
  const [pageName, setPageName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleOAuthConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/social/accounts/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          platform,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize OAuth');

      if (data.configured && data.oauthUrl) {
        window.location.href = data.oauthUrl;
      } else {
        // Not configured yet on domain, switch to direct configuration with clear guidance
        setConnectMethod('TOKEN');
        setError(data.message || 'Meta OAuth App ID not configured in .env. Enter account credentials or access token below.');
      }
    } catch (err: any) {
      setError(err.message || 'Error initializing connection');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide an account username / handle.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          platform,
          username: username.startsWith('@') ? username : `@${username}`,
          pageName: pageName || client.businessName || client.name,
          accountId: accountId.trim() || undefined,
          accessToken: accessToken.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect account.');
      }

      setSuccessMessage(`${platform === 'INSTAGRAM' ? 'Instagram Professional' : 'Facebook Page'} account connected successfully for ${client.name}!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Connect Social Account</h2>
              <p className="text-xs text-slate-500 font-medium">Link client: <strong className="text-slate-800">{client.businessName || client.name}</strong></p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Platform Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Select Platform *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlatform('INSTAGRAM')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  platform === 'INSTAGRAM'
                    ? 'border-purple-600 bg-purple-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  IG
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Instagram</div>
                  <div className="text-[10px] text-slate-500 font-medium">Professional Account</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('FACEBOOK')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  platform === 'FACEBOOK'
                    ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  FB
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Facebook</div>
                  <div className="text-[10px] text-slate-500 font-medium">Business Page</div>
                </div>
              </button>
            </div>
          </div>

          {/* Connect Method Tabs */}
          <div className="flex border-b border-slate-100 pb-2 gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setConnectMethod('OAUTH')}
              className={`pb-1 transition-all ${
                connectMethod === 'OAUTH'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Meta OAuth 2.0 (One-Click)
            </button>
            <button
              type="button"
              onClick={() => setConnectMethod('TOKEN')}
              className={`pb-1 transition-all ${
                connectMethod === 'TOKEN'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Direct Token / Account Config
            </button>
          </div>

          {connectMethod === 'OAUTH' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Official Meta Graph API Permissions</span>
                </div>
                <p>
                  You will be securely redirected to Meta Facebook Login to grant posting permissions for <strong>{client.name}</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 pt-1">
                  <li><code>instagram_content_publish</code> & <code>instagram_basic</code></li>
                  <li><code>pages_manage_posts</code> & <code>pages_read_engagement</code></li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleOAuthConnect}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting with Meta...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Connect with Facebook / Meta</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleDirectConnect} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {platform === 'INSTAGRAM' ? 'Instagram Handle / Username *' : 'Facebook Page Username / Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={platform === 'INSTAGRAM' ? '@auravitalstar' : 'Aura Vital Star Brampton'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Display / Business Name
                </label>
                <input
                  type="text"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  placeholder={client.businessName || client.name}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Meta Page ID / IG Account ID (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Auto-generated if empty</span>
                </label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="e.g. 1048291049102"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Meta Graph API Access Token (Optional)</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Encrypted Server-Side</span>
                  </span>
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAG... (Long-Lived Page Access Token)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Link Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
