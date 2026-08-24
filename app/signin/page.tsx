'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { ArrowRight, Lock, AlertCircle, RefreshCw, Shield, KeyRound, Sparkles } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';
  const urlMessage = searchParams?.get('message');

  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSuperAdminAutoFill = async () => {
    setIdentifier('aman@codekap.com');
    setPassword('password123');
    setLoading(true);
    const result = await signIn('aman@codekap.com', 'password123');
    if (result.success) {
      router.push(redirectUrl);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-bold text-slate-900">Sign In to Your Account</h3>
        <p className="text-xs text-slate-500 mt-1">Access campaign automation, creative engine, and approvals</p>
      </div>

      {/* 1-Click Super Admin Quick Access */}
      <div className="mb-5 p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-purple-950">Super Admin Mode</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 font-bold uppercase">Aman Sir</span>
            </div>
            <p className="text-[10px] text-purple-700">Full platform controls & team invite passcodes</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSuperAdminAutoFill}
          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-all shadow-xs shrink-0"
        >
          Quick Sign In →
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
            placeholder="e.g. harshit or harshit@codekap.com"
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
