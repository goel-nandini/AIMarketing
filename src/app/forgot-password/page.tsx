'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/auth-context';
import { ArrowLeft, Send, CheckCircle2, Lock, RefreshCw } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await resetPassword(email.trim());
    setLoading(false);
    setSubmitted(true);
  };

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
            <p className="text-blue-100 text-xs font-medium mt-1">Reset Password</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check Your Email</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account exists for <strong className="text-slate-900">{email}</strong>, we have sent a secure password reset link. Please check your inbox.
              </p>
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h3 className="text-lg font-bold text-slate-900">Forgot Password?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@codekap.com"
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
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <Link href="/signin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Firebase Password Recovery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
