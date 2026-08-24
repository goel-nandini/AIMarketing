import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const apps = getApps();

if (!apps.length) {
  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    const isRealPrivateKey = privateKey && !privateKey.includes('your_private_key') && privateKey.includes('BEGIN PRIVATE KEY') && privateKey.length > 100;
    const isRealEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL && !process.env.FIREBASE_ADMIN_CLIENT_EMAIL.includes('your_project');

    if (process.env.FIREBASE_ADMIN_PROJECT_ID && isRealPrivateKey && isRealEmail) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
  } catch (error) {
    console.warn('[Firebase Admin Init Warning]: Operating in local fallback mode.');
  }
}

export const adminAuth = getApps().length ? getAuth() : null;
export const adminFirestore = getApps().length ? getFirestore() : null;
