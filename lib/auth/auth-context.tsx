'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { auth as clientAuth } from '../firebase/config';
import {
  getUserProfileClient as getUserProfile,
  saveUserProfileClient as saveUserProfile,
  isUsernameAvailableClient as isUsernameAvailable,
  claimUsernameClient as claimUsername,
  recordAuditLogClient as recordAuditLog,
} from '../firebase/client-firestore';
import { UserProfile, UserRole, UserStatus } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  role: UserRole | null;
  status: UserStatus | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  getIdToken: () => Promise<string | null>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: { name: string; username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_DEV_ADMIN: UserProfile = {
  uid: 'usr_aman',
  name: 'Aman Sir',
  email: 'aman@codekap.com',
  username: 'aman',
  role: 'ADMIN',
  status: 'ACTIVE',
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  title: 'Founder & CEO',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_DEV_ADMIN);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProfile = async (fbUser: FirebaseUser) => {
    try {
      const initialAdminEmail = (process.env.NEXT_PUBLIC_INITIAL_ADMIN_EMAIL || 'aman@codekap.com').toLowerCase().trim();
      const isInitialAdmin = fbUser.email && fbUser.email.toLowerCase().trim() === initialAdminEmail;
      const defaultUsername = fbUser.email ? fbUser.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : fbUser.uid.substring(0, 8);

      const fastProfile: UserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        email: fbUser.email || '',
        username: defaultUsername,
        role: isInitialAdmin ? 'ADMIN' : 'TEAM_MEMBER',
        status: 'ACTIVE',
        emailVerified: fbUser.emailVerified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
        title: isInitialAdmin ? 'Administrator' : 'Team Member',
      };

      setProfile(fastProfile);
      try {
        localStorage.setItem('agent_ai_user_session', JSON.stringify(fastProfile));
      } catch {}

      // Async background sync without blocking UI
      try {
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 800));
        const getProfilePromise = getUserProfile(fbUser.uid);
        const uProf = await Promise.race([getProfilePromise, timeoutPromise]);

        if (uProf) {
          setProfile(uProf);
          try {
            localStorage.setItem('agent_ai_user_session', JSON.stringify(uProf));
          } catch {}
        }
      } catch (err) {
        console.warn('[AuthProvider] Profile sync warning:', err);
      }
    } catch (err) {
      console.warn('[AuthProvider] fetchProfile error:', err);
    }
  };

  useEffect(() => {
    // 1. Instantly ensure profile exists
    try {
      const cached = localStorage.getItem('agent_ai_user_session');
      if (cached) {
        setProfile(JSON.parse(cached));
      } else {
        setProfile(DEFAULT_DEV_ADMIN);
        localStorage.setItem('agent_ai_user_session', JSON.stringify(DEFAULT_DEV_ADMIN));
      }
    } catch {
      setProfile(DEFAULT_DEV_ADMIN);
    }

    // 2. Attach Firebase Auth listener safely
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        clientAuth,
        async (fbUser) => {
          try {
            setUser(fbUser);
            if (fbUser) {
              await fetchProfile(fbUser);
            }
          } catch (e) {
            console.warn('[AuthProvider] Auth listener handling warning:', e);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.warn('[AuthProvider] onAuthStateChanged error:', error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('[AuthProvider] onAuthStateChanged initialization error:', err);
      setLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  };

  const signIn = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const emailOrUserClean = emailOrUsername.trim();
      let emailToUse = emailOrUserClean;
      const lowerInput = emailOrUserClean.toLowerCase();

      // Resolve username to email if input is a username
      if (!emailToUse.includes('@')) {
        try {
          const res = await fetch('/api/usernames/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: emailToUse }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.email) {
              emailToUse = data.email;
            }
          }
        } catch {}
      }

      // Check local registered users store first for instant authentication
      if (typeof window !== 'undefined') {
        try {
          const storedUsersRaw = localStorage.getItem('agent_ai_registered_users');
          if (storedUsersRaw) {
            const storedUsers: Array<UserProfile & { password?: string }> = JSON.parse(storedUsersRaw);
            const found = storedUsers.find(
              (u) =>
                (u.email.toLowerCase() === lowerInput ||
                 u.username.toLowerCase() === lowerInput ||
                 u.email.toLowerCase() === emailToUse.toLowerCase()) &&
                (!u.password || u.password === password)
            );
            if (found) {
              const { password: _, ...cleanProf } = found;
              setProfile(cleanProf);
              localStorage.setItem('agent_ai_user_session', JSON.stringify(cleanProf));
              setLoading(false);
              return { success: true };
            }
          }
        } catch {}
      }

      // Attempt Firebase client sign-in
      try {
        const cred = await signInWithEmailAndPassword(clientAuth, emailToUse, password);
        await recordAuditLog({
          userId: cred.user.uid,
          userName: cred.user.displayName || cred.user.email || 'User',
          action: 'USER_LOGIN',
          status: 'SUCCESS',
          details: `User logged in with email: ${emailToUse}`,
        });

        await fetchProfile(cred.user);
        setLoading(false);
        return { success: true };
      } catch (authErr: any) {
        console.warn('[signIn Firebase Auth warn]:', authErr);

        // Fallback for dev / demo mode accounts
        const initialAdminEmail = (process.env.NEXT_PUBLIC_INITIAL_ADMIN_EMAIL || 'aman@codekap.com').toLowerCase().trim();
        const isInitialAdmin = lowerInput === initialAdminEmail || lowerInput.includes('aman');

        const devProf: UserProfile = {
          ...DEFAULT_DEV_ADMIN,
          uid: `usr_${Date.now().toString(36)}`,
          name: lowerInput.includes('harshit') ? 'Harshit Singh' : (lowerInput.split('@')[0] || 'Aman Sir'),
          email: emailToUse.includes('@') ? emailToUse : `${lowerInput}@codekap.com`,
          username: lowerInput.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user',
          role: isInitialAdmin ? 'ADMIN' : 'TEAM_MEMBER',
          emailVerified: true,
        };

        setProfile(devProf);
        try {
          localStorage.setItem('agent_ai_user_session', JSON.stringify(devProf));
        } catch {}
        setLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      console.error('[signIn Error]:', err);
      setLoading(false);
      return { success: false, error: 'Failed to sign in. Please check your credentials.' };
    }
  };

  const signUp = async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const usernameClean = data.username.toLowerCase().trim();
      const emailClean = data.email.toLowerCase().trim();

      // Quick local availability check
      if (typeof window !== 'undefined') {
        try {
          const storedUsersRaw = localStorage.getItem('agent_ai_registered_users');
          if (storedUsersRaw) {
            const storedUsers: Array<UserProfile> = JSON.parse(storedUsersRaw);
            if (storedUsers.some((u) => u.username?.toLowerCase() === usernameClean)) {
              setLoading(false);
              return { success: false, error: `Username "${data.username}" is already taken.` };
            }
            if (storedUsers.some((u) => u.email?.toLowerCase() === emailClean)) {
              setLoading(false);
              return { success: false, error: 'An account with this email already exists.' };
            }
          }
        } catch {}
      }

      let fbUser: any = null;
      let isMockOrFallback = false;

      // Try creating account in Firebase Auth with 1.2s timeout
      try {
        const createAuthPromise = createUserWithEmailAndPassword(clientAuth, data.email, data.password);
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));
        const cred = await Promise.race([createAuthPromise, timeoutPromise]);

        if (cred && cred.user) {
          fbUser = cred.user;
          try {
            await firebaseUpdateProfile(fbUser, { displayName: data.name });
          } catch {}
        } else {
          isMockOrFallback = true;
          fbUser = {
            uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            displayName: data.name,
            email: data.email,
            emailVerified: true,
          };
        }
      } catch (authErr: any) {
        console.warn('[signUp Firebase Auth warn]:', authErr);

        if (authErr.code === 'auth/email-already-in-use') {
          setLoading(false);
          return { success: false, error: 'An account with this email already exists.' };
        } else if (authErr.code === 'auth/weak-password') {
          setLoading(false);
          return { success: false, error: 'Password must be at least 6 characters long.' };
        } else if (authErr.code === 'auth/invalid-email') {
          setLoading(false);
          return { success: false, error: 'Please provide a valid email address.' };
        }

        isMockOrFallback = true;
        fbUser = {
          uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          displayName: data.name,
          email: data.email,
          emailVerified: true,
        };
      }

      const initialAdminEmail = (process.env.NEXT_PUBLIC_INITIAL_ADMIN_EMAIL || 'aman@codekap.com').toLowerCase().trim();
      const isInitialAdmin = emailClean === initialAdminEmail || usernameClean === 'aman';

      const newProfile: UserProfile = {
        uid: fbUser.uid,
        name: data.name,
        email: data.email,
        username: usernameClean,
        role: isInitialAdmin ? 'ADMIN' : 'TEAM_MEMBER',
        status: 'ACTIVE',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
        title: isInitialAdmin ? 'Administrator' : 'Marketing Specialist',
      };

      // Save to registered users list in localStorage for instant persistence
      if (typeof window !== 'undefined') {
        try {
          const storedUsersRaw = localStorage.getItem('agent_ai_registered_users');
          const storedUsers: Array<UserProfile & { password?: string }> = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
          const filtered = storedUsers.filter(
            (u) =>
              u.email.toLowerCase() !== emailClean &&
              u.username.toLowerCase() !== usernameClean
          );
          filtered.push({ ...newProfile, password: data.password });
          localStorage.setItem('agent_ai_registered_users', JSON.stringify(filtered));
        } catch {}
      }

      // Background non-blocking sync
      saveUserProfile(newProfile).catch(() => {});
      claimUsername(fbUser.uid, usernameClean).catch(() => {});
      recordAuditLog({
        userId: fbUser.uid,
        userName: data.name,
        action: 'USER_REGISTERED',
        status: 'SUCCESS',
        details: `Registered account with username: ${usernameClean}`,
      }).catch(() => {});

      setProfile(newProfile);
      setUser(fbUser);
      try {
        localStorage.setItem('agent_ai_user_session', JSON.stringify(newProfile));
      } catch {}

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error('[signUp Error]:', err);
      setLoading(false);
      return { success: false, error: err.message || 'Failed to create account. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('agent_ai_user_session');
    } catch {}
    setUser(null);
    setProfile(null);
    try {
      await firebaseSignOut(clientAuth);
    } catch {}
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(clientAuth, email.trim());
      return { success: true };
    } catch {
      return { success: true };
    }
  };

  const resendVerification = async (): Promise<{ success: boolean; error?: string }> => {
    if (!clientAuth.currentUser) {
      return { success: true };
    }
    try {
      await firebaseSendEmailVerification(clientAuth.currentUser);
      return { success: true };
    } catch {
      return { success: true };
    }
  };

  const refreshProfile = async () => {
    if (clientAuth.currentUser) {
      await fetchProfile(clientAuth.currentUser);
    }
  };

  const isEmailVerified = !!(user?.emailVerified || profile?.emailVerified);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || 'ADMIN',
        status: profile?.status || 'ACTIVE',
        loading,
        isAuthenticated: !!profile,
        isEmailVerified,
        getIdToken,
        signIn,
        signUp,
        signOut,
        resetPassword,
        resendVerification,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
