'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { Mail, RefreshCw, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, profile, isEmailVerified, resendVerification, refreshProfile, signOut } = useAuth();
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const targetEmail = user?.email || profile?.email || 'your email';

  const handleResend = async () => {
    setMessage('');
    setError('');
    setResending(true);
    const res = await resendVerification();
    setResending(false);

    if (res.success) {
      setMessage('A new verification email has been sent to your inbox.');
    } else {
      setError(res.error || 'Failed to resend email.');
    }
  };

  const handleRefreshStatus = async () => {
    setMessage('');
    setError('');
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);

    if (isEmailVerified) {
      router.push('/dashboard');
    } else {
      setMessage('Status checked. Email is not yet verified.');
    }
  };

  if (isEmailVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Email Verified!</h2>
          <p className="text-sm text-slate-600">Your email has been successfully verified. You now have access to Agent AI.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="py-3 px-6 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AGENT AI</h2>
            <p className="text-blue-100 text-xs font-medium mt-1">Email Verification Required</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <h3 className="text-lg font-bold text-slate-900">Verify Your Email Address</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Please verify your email before continuing to the Agent AI dashboard. We sent a verification link to:
          </p>
          <div className="my-4 py-2.5 px-4 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-900 text-sm">
            {targetEmail}
          </div>

          {message && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleRefreshStatus}
              disabled={refreshing}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking status...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Verification Status</span>
                </>
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {resending ? 'Sending Email...' : 'Resend Verification Email'}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out and use a different account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
