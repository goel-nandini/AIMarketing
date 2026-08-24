'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { validateUsernameFormat } from '../../lib/firebase/client-firestore';
import { ArrowRight, Lock, AlertCircle, CheckCircle2, RefreshCw, KeyRound, Shield } from 'lucide-react';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPasscode = searchParams?.get('passcode') || searchParams?.get('code') || '';

  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passcode, setPasscode] = useState(initialPasscode);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [passcodeStatus, setPasscodeStatus] = useState<{ checked: boolean; valid?: boolean; role?: string; error?: string }>({ checked: false });
  const [validatingPasscode, setValidatingPasscode] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; available?: boolean; error?: string }>({ checked: false });
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSuperAdminEmail = email.toLowerCase().trim() === 'aman@codekap.com' || email.toLowerCase().trim().includes('admin');

  // Auto-validate initial passcode if present in URL
  useEffect(() => {
    if (initialPasscode) {
      handleValidatePasscode(initialPasscode);
    }
  }, [initialPasscode]);

  const handleValidatePasscode = async (codeToTest: string) => {
    if (!codeToTest.trim()) {
      setPasscodeStatus({ checked: false });
      return;
    }

    try {
      setValidatingPasscode(true);
      const res = await fetch('/api/invitations/validate-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: codeToTest.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPasscodeStatus({ checked: true, valid: true, role: data.role });
        if (data.email && !email) setEmail(data.email);
        if (data.name && !name) setName(data.name);
      } else {
        setPasscodeStatus({ checked: true, valid: false, error: data.error || 'Invalid passcode' });
      }
    } catch {
      setPasscodeStatus({ checked: true, valid: false, error: 'Network error validating passcode' });
    } finally {
      setValidatingPasscode(false);
    }
  };

  const checkUsernameAvailability = async (val: string) => {
    if (!val.trim()) {
      setUsernameStatus({ checked: false });
      return;
    }

    const valResult = validateUsernameFormat(val);
    if (!valResult.valid) {
      setUsernameStatus({ checked: true, available: false, error: valResult.error });
      return;
    }

    try {
      setCheckingUsername(true);
      const res = await fetch(`/api/usernames/check?username=${encodeURIComponent(val.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setUsernameStatus({ checked: true, available: data.available, error: data.available ? undefined : 'Username is already taken.' });
      } else {
        setUsernameStatus({ checked: true, available: false, error: data.error || 'Invalid username' });
      }
    } catch {
      setUsernameStatus({ checked: false });
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your full name.');
    if (!username.trim()) return setError('Please enter a username.');
    if (!email.trim()) return setError('Please enter a valid email address.');
    if (!password) return setError('Please enter a password.');
    if (password.length < 6) return setError('Password must be at least 6 characters long.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    // If not super admin email, enforce passcode
    if (!isSuperAdminEmail) {
      if (!passcode.trim()) {
        return setError('Team Invite Passcode is required to join. Please ask your Super Admin for a passcode.');
      }
      if (passcodeStatus.checked && !passcodeStatus.valid) {
        return setError(passcodeStatus.error || 'Invalid team passcode.');
      }
    }

    if (usernameStatus.checked && !usernameStatus.available) {
      return setError(usernameStatus.error || 'Username is not available.');
    }

    if (!acceptedTerms) {
      return setError('You must accept the Terms and Internal Platform Policy to continue.');
    }

    setLoading(true);

    try {
      // 1. If passcode is provided, accept it via API
      let assignedRole = isSuperAdminEmail ? 'ADMIN' : 'TEAM_MEMBER';
      if (passcode.trim()) {
        const acceptRes = await fetch('/api/invitations/accept-passcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passcode: passcode.trim(),
            name: name.trim(),
            email: email.trim(),
          }),
        });
        const acceptData = await acceptRes.json();
        if (!acceptRes.ok && !isSuperAdminEmail) {
          throw new Error(acceptData.error || 'Failed to accept invitation passcode');
        }
        if (acceptData.user?.role) {
          assignedRole = acceptData.user.role;
        }
      }

      // 2. Perform authentication sign-up
      const result = await signUp({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setError(err.message || 'Error completing account setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-bold text-slate-900">Create Team Account</h3>
        <p className="text-xs text-slate-500 mt-1">Enter your details and team passcode to join</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team Passcode Input */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Team Invite Passcode</span>
            </label>
            {validatingPasscode && (
              <span className="text-[11px] text-blue-600 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
              </span>
            )}
            {passcodeStatus.checked && !validatingPasscode && (
              <span className={`text-[11px] font-bold flex items-center gap-1 ${passcodeStatus.valid ? 'text-emerald-600' : 'text-rose-600'}`}>
                {passcodeStatus.valid ? (
                  <><CheckCircle2 className="w-3 h-3" /> Valid ({passcodeStatus.role})</>
                ) : (
                  <><AlertCircle className="w-3 h-3" /> Invalid</>
                )}
              </span>
            )}
          </div>
          <input
            type="text"
            value={passcode}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setPasscode(val);
              if (val.length >= 6) handleValidatePasscode(val);
            }}
            onBlur={() => handleValidatePasscode(passcode)}
            placeholder="e.g. AGENT-4819"
            className="w-full px-3.5 py-2 bg-white border border-blue-200 rounded-lg text-sm font-mono font-bold text-blue-900 placeholder:text-blue-300 uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <p className="text-[10px] text-blue-700">
            Provided by Super Admin. (Super Admin email <strong>aman@codekap.com</strong> does not require a passcode).
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Harshit Singh"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 block">Username *</label>
            {checkingUsername && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> Checking...
              </span>
            )}
            {usernameStatus.checked && !checkingUsername && (
              <span className={`text-[11px] font-semibold flex items-center gap-1 ${usernameStatus.available ? 'text-emerald-600' : 'text-rose-600'}`}>
                {usernameStatus.available ? (
                  <><CheckCircle2 className="w-3 h-3" /> Available</>
                ) : (
                  <><AlertCircle className="w-3 h-3" /> Taken</>
                )}
              </span>
            )}
          </div>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              checkUsernameAvailability(e.target.value);
            }}
            onBlur={() => checkUsernameAvailability(username)}
            placeholder="e.g. harshit"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="harshit@codekap.com"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
          {isSuperAdminEmail && (
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-purple-700">
              <Shield className="w-3 h-3" /> Designated Super Admin
            </span>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Password *</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm Password *</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
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
                <span>Verifying & Creating Account...</span>
              </>
            ) : (
              <>
                <span>Join Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
        <p className="text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link href="/signin" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-md">
              A
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AGENT AI</h2>
            <p className="text-blue-100 text-xs font-medium mt-1">Super Admin & Team Workspace Access</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading...</span>
          </div>
        }>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
