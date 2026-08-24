import { db as clientDb } from './config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { UserProfile, UserStatus, UserRole, Invitation, AuditLog } from '../types';

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  const norm = normalizeUsername(username);
  if (norm.length < 3 || norm.length > 30) {
    return { valid: false, error: 'Username must be between 3 and 30 characters long.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(norm)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  return { valid: true };
}

async function withTimeout<T>(promise: Promise<T>, ms: number = 600, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]).catch(() => fallback);
}

export async function isUsernameAvailableClient(username: string): Promise<boolean> {
  const normalized = normalizeUsername(username);
  if (!normalized) return false;

  if (typeof window !== 'undefined') {
    try {
      const storedUsersRaw = localStorage.getItem('agent_ai_registered_users');
      if (storedUsersRaw) {
        const storedUsers = JSON.parse(storedUsersRaw);
        if (storedUsers.some((u: any) => u.username?.toLowerCase() === normalized)) {
          return false;
        }
      }
    } catch {}
  }

  try {
    const docRef = doc(clientDb, 'usernames', normalized);
    const snap = await withTimeout(getDoc(docRef), 500, null);
    if (!snap) return true;
    return !snap.exists();
  } catch {
    return true;
  }
}

export async function claimUsernameClient(userId: string, username: string): Promise<void> {
  const normalized = normalizeUsername(username);
  const data = {
    userId,
    username,
    createdAt: new Date().toISOString(),
  };
  try {
    await withTimeout(setDoc(doc(clientDb, 'usernames', normalized), data), 500, undefined);
  } catch {}
}

export async function getUserProfileClient(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await withTimeout(getDoc(doc(clientDb, 'users', uid)), 500, null);
    if (!snap || !snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch {
    return null;
  }
}

export async function saveUserProfileClient(profile: UserProfile): Promise<void> {
  try {
    await withTimeout(setDoc(doc(clientDb, 'users', profile.uid), profile, { merge: true }), 500, undefined);
  } catch {}
}

export async function recordAuditLogClient(event: {
  userId?: string;
  userName?: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  details: string;
}): Promise<void> {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userId: event.userId || 'system',
    userName: event.userName || 'System',
    action: event.action,
    status: event.status,
    details: event.details,
  };
  try {
    await withTimeout(setDoc(doc(clientDb, 'audit_logs', log.id), log), 500, undefined);
  } catch (err) {
    console.warn('Audit log client warning:', err);
  }
}
