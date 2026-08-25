'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import {
  ArrowRight,
  Lock,
  AlertCircle,
  RefreshCw,
  Shield,
  KeyRound,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';
  const urlMessage = searchParams?.get('message');

  const { signIn, signInAsSuperAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Super Admin 6-Digit PIN Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [showInvalidPopup, setShowInvalidPopup] = useState(false);

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [authLoading, isAuthenticated, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your email address or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await signIn(identifier.trim(), password);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.error || 'Failed to sign in.');
      setLoading(false);
    }
  };

  const handleVerifySuperAdminPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinValue.trim();

    if (cleanPin !== '090807') {
      setShowInvalidPopup(true);
      return;
    }

    setPinLoading(true);
    const result = await signInAsSuperAdmin(cleanPin);

    if (result.success) {
      setIsPinModalOpen(false);
      router.push(redirectUrl);
    } else {
      setShowInvalidPopup(true);
    }
    setPinLoading(false);
  };

  return (
    <div className="p-8">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-bold text-slate-900">Sign In to Your Account</h3>
        <p className="text-xs text-slate-500 mt-1">Access campaign automation, creative engine, and team controls</p>
      </div>

      {/* 1-Click Super Admin Access with 6-Digit Verification */}
      <div className="mb-5 p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-purple-950">Super Admin Access</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 font-bold uppercase">PIN Protected</span>
            </div>
            <p className="text-[10px] text-purple-700">No password required • 6-digit verification</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setPinValue('');
            setShowInvalidPopup(false);
            setIsPinModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-all shadow-sm hover:scale-[1.02] shrink-0"
        >
          Super Admin Sign In →
        </button>
      </div>

      {urlMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium text-center">
          {urlMessage}
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Email or Username
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. harshit or harshitsingh19622@gmail.com"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Team Member Join with Passcode CTA */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
        <span className="text-[11px] text-slate-500 font-medium block">Have an invite passcode from your Super Admin?</span>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Join Team with Passcode →</span>
        </Link>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500 font-medium">
          Need a workspace account?{' '}
          <Link href="/signup" className="text-blue-600 font-bold hover:underline">
            Register / Join
          </Link>
        </p>
      </div>

      {/* Modal: 6-Digit Super Admin PIN Verification */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 md:p-8 border border-slate-200 shadow-2xl space-y-5 text-center relative overflow-hidden">
            <button
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Super Admin Verification</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit verification code to unlock root Super Admin privileges.
              </p>
            </div>

            <form onSubmit={handleVerifySuperAdminPin} className="space-y-4 pt-2">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={pinValue}
                  onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[12px] font-mono text-2xl font-black py-3 px-4 rounded-2xl border-2 border-purple-300 focus:border-purple-600 focus:outline-none bg-purple-50/50 text-purple-950 shadow-inner"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">6-digit numeric verification code</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pinLoading || pinValue.length < 6}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all"
                >
                  {pinLoading ? 'Verifying...' : 'Unlock & Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invalid Code Alert Popup Modal */}
      {showInvalidPopup && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 md:p-7 border border-rose-200 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-rose-950">Invalid Verification Code</h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                Access Denied. The 6-digit Super Admin verification code you entered is invalid.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowInvalidPopup(false);
                  setPinValue('');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md">
              A
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AGENT AI</h2>
            <p className="text-blue-100 text-xs font-medium mt-1">Super Admin & Team Access Portal</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading...</span>
          </div>
        }>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
