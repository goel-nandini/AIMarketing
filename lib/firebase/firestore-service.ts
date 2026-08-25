import { adminFirestore } from './admin';
import { db as clientDb } from './config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { UserProfile, UserRole, UserStatus, Invitation, InvitationStatus, AuditLog } from '../types';
import { INITIAL_USERS, INITIAL_AUDIT_LOGS } from '../db';
import crypto from 'crypto';

// Local Memory Fallback Cache for local dev without Firebase Admin Credentials
const memoryUserMap = new Map<string, UserProfile>();
const memoryUsernameMap = new Map<string, { userId: string; username: string }>();
const memoryInvitationMap = new Map<string, Invitation>();
const memoryAuditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

// Seed initial users into local memory cache
INITIAL_USERS.forEach((u) => {
  const prof: UserProfile = {
    uid: u.id,
    name: u.name,
    email: u.email,
    username: u.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, ''),
    role: u.role as UserRole,
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    avatar: u.avatar,
    title: u.title,
  };
  memoryUserMap.set(u.id, prof);
  memoryUsernameMap.set(prof.username.toLowerCase(), { userId: u.id, username: prof.username });
});

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

export function hashInvitationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalized = normalizeUsername(username);
  if (!normalized) return false;

  if (adminFirestore) {
    try {
      const snap = await adminFirestore.collection('usernames').doc(normalized).get();
      return !snap.exists;
    } catch {
      return !memoryUsernameMap.has(normalized);
    }
  }
  return !memoryUsernameMap.has(normalized);
}

export async function claimUsername(userId: string, username: string): Promise<void> {
  const normalized = normalizeUsername(username);
  const data = { userId, username, createdAt: new Date().toISOString() };

  memoryUsernameMap.set(normalized, data);

  if (adminFirestore) {
    try {
      await adminFirestore.collection('usernames').doc(normalized).set(data);
    } catch {}
  }
}

export async function releaseUsername(username: string): Promise<void> {
  const normalized = normalizeUsername(username);
  memoryUsernameMap.delete(normalized);

  if (adminFirestore) {
    try {
      await adminFirestore.collection('usernames').doc(normalized).delete();
    } catch {}
  }
}

export async function resolveUsername(username: string): Promise<{ userId: string; username: string } | null> {
  const normalized = normalizeUsername(username);
  if (adminFirestore) {
    try {
      const snap = await adminFirestore.collection('usernames').doc(normalized).get();
      if (snap.exists) return snap.data() as { userId: string; username: string };
    } catch {}
  }
  return memoryUsernameMap.get(normalized) || null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  memoryUserMap.set(profile.uid, profile);

  if (adminFirestore) {
    try {
      await adminFirestore.collection('users').doc(profile.uid).set(profile, { merge: true });
    } catch {}
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (adminFirestore) {
    try {
      const snap = await adminFirestore.collection('users').doc(uid).get();
      if (snap.exists) return snap.data() as UserProfile;
    } catch {}
  }
  return memoryUserMap.get(uid) || null;
}

export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const lowerEmail = email.toLowerCase().trim();

  if (adminFirestore) {
    try {
      const snap = await adminFirestore.collection('users').where('email', '==', lowerEmail).get();
      if (!snap.empty) return snap.docs[0].data() as UserProfile;
    } catch {}
  }

  for (const prof of memoryUserMap.values()) {
    if (prof.email.toLowerCase().trim() === lowerEmail) return prof;
  }
  return null;
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  if (adminFirestore) {
    try {
      const snap = await adminFirestore.collection('users').orderBy('createdAt', 'desc').get();
      if (!snap.empty) return snap.docs.map(doc => doc.data() as UserProfile);
    } catch {}
  }
  return Array.from(memoryUserMap.values());
}

export async function updateUserStatus(uid: string, status: UserStatus): Promise<void> {
  const existing = memoryUserMap.get(uid);
  if (existing) {
    existing.status = status;
    existing.updatedAt = new Date().toISOString();
  }

  if (adminFirestore) {
    try {
      await adminFirestore.collection('users').doc(uid).update({ status, updatedAt: new Date().toISOString() });
    } catch {}
  }
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const existing = memoryUserMap.get(uid);
  if (existing) {
    existing.role = role;
    existing.updatedAt = new Date().toISOString();
  }

  if (adminFirestore) {
    try {
      await adminFirestore.collection('users').doc(uid).update({ role, updatedAt: new Date().toISOString() });
    } catch {}
  }
}

export async function createInvitation(invitation: Invitation): Promise<void> {
  memoryInvitationMap.set(invitation.id, invitation);

  if (adminFirestore) {
    try {
      await adminFirestore.collection('invitations').doc(invitation.id).set(invitation);
    } catch {}
  }
}

export async function getInvitationById(id: string): Promise<Invitation | null> {
  if (adminFirestore) {
    try {
      const snap = await adminFirestore.collection('invitations').doc(id).get();
      if (snap.exists) return snap.data() as Invitation;
    } catch {}
  }
  return memoryInvitationMap.get(id) || null;
}

export async function getInvitationByTokenHash(tokenHash: string): Promise<Invitation | null> {
  if (adminFirestore) {
    try {
      const snap = await adminFirestore.collection('invitations').where('tokenHash', '==', tokenHash).get();
      if (!snap.empty) return snap.docs[0].data() as Invitation;
    } catch {}
  }

  for (const inv of memoryInvitationMap.values()) {
    if (inv.tokenHash === tokenHash) return inv;
  }
  return null;
}

export async function getAllInvitations(): Promise<Invitation[]> {
  if (adminFirestore) {
    try {
      const snap = await adminFirestore.collection('invitations').orderBy('createdAt', 'desc').get();
      if (!snap.empty) return snap.docs.map(doc => doc.data() as Invitation);
    } catch {}
  }
  return Array.from(memoryInvitationMap.values());
}

export async function updateInvitationStatus(
  id: string,
  status: InvitationStatus,
  acceptedAt?: string
): Promise<void> {
  const inv = memoryInvitationMap.get(id);
  if (inv) {
    inv.status = status;
    if (acceptedAt) inv.acceptedAt = acceptedAt;
  }

  if (adminFirestore) {
    try {
      const updateData: Partial<Invitation> = { status };
      if (acceptedAt) updateData.acceptedAt = acceptedAt;
      await adminFirestore.collection('invitations').doc(id).update(updateData);
    } catch {}
  }
}

export async function recordAuditLog(event: {
  userId?: string;
  userName?: string;
  actorId?: string;
  action: string;
  campaignId?: string;
  campaignName?: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  details: string;
}): Promise<AuditLog> {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userId: event.userId || event.actorId || 'system',
    userName: event.userName || 'System',
    action: event.action,
    campaignId: event.campaignId,
    campaignName: event.campaignName,
    status: event.status,
    details: event.details,
  };

  memoryAuditLogs.unshift(log);

  if (adminFirestore) {
    try {
      await adminFirestore.collection('audit_logs').doc(log.id).set(log);
    } catch {}
  }

  return log;
}

// Memory and Firestore Task Store
const memoryTaskMap = new Map<string, any>();

export async function createTaskInFirestore(taskData: any): Promise<any> {
  const taskId = taskData.id || `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const task = {
    ...taskData,
    id: taskId,
    createdAt: taskData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryTaskMap.set(taskId, task);

  if (adminFirestore) {
    try {
      await adminFirestore.collection('tasks').doc(taskId).set(task);
    } catch (err: any) {
      console.warn('[Firestore createTask Warning]:', err?.message);
    }
  }

  return task;
}

export async function getTasksFromFirestore(filterUserId?: string, filterEmail?: string): Promise<any[]> {
  let results: any[] = [];

  if (adminFirestore) {
    try {
      let taskQuery: any = adminFirestore.collection('tasks').orderBy('createdAt', 'desc');
      if (filterUserId) {
        taskQuery = taskQuery.where('assignedToId', '==', filterUserId);
      }
      const snap = await taskQuery.get();
      if (!snap.empty) {
        results = snap.docs.map((d: any) => d.data());
      }
    } catch {}
  }

  if (results.length === 0) {
    results = Array.from(memoryTaskMap.values());
    if (filterUserId || filterEmail) {
      results = results.filter((t) => 
        (filterUserId && (t.assignedToId === filterUserId || t.assignedToEmail === filterUserId)) ||
        (filterEmail && t.assignedToEmail?.toLowerCase() === filterEmail.toLowerCase())
      );
    }
  }

  return results;
}

export async function updateTaskInFirestore(taskId: string, updates: any): Promise<void> {
  const existing = memoryTaskMap.get(taskId);
  if (existing) {
    memoryTaskMap.set(taskId, { ...existing, ...updates, updatedAt: new Date().toISOString() });
  }

  if (adminFirestore) {
    try {
      await adminFirestore.collection('tasks').doc(taskId).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch {}
  }
}

export async function deleteTaskInFirestore(taskId: string): Promise<void> {
  memoryTaskMap.delete(taskId);

  if (adminFirestore) {
    try {
      await adminFirestore.collection('tasks').doc(taskId).delete();
    } catch {}
  }
}

