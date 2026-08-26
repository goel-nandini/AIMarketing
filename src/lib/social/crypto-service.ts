import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.SOCIAL_TOKEN_SECRET || process.env.AUTH_SECRET || 'kairo-social-secure-encryption-key-32b';
// Ensure 32 bytes key
const KEY_BUFFER = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

/**
 * Encrypts a sensitive string (e.g. Meta OAuth Access Token) before persisting to database.
 */
export function encryptToken(text: string): string {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('[CryptoService] Encryption error:', err);
    // Fallback base64 obfuscation if native crypto fails
    return `b64:${Buffer.from(text).toString('base64')}`;
  }
}

/**
 * Decrypts an encrypted token for server-side API execution only.
 * NEVER return decrypted token to frontend client responses.
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) return '';
  try {
    if (encryptedToken.startsWith('b64:')) {
      return Buffer.from(encryptedToken.replace('b64:', ''), 'base64').toString('utf8');
    }
    const parts = encryptedToken.split(':');
    if (parts.length !== 3) return '';
    const [ivHex, authTagHex, cipherText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUFFER, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[CryptoService] Decryption error:', err);
    return '';
  }
}

/**
 * Mask token for safe diagnostic display e.g. "EAAG...3kF9"
 */
export function maskToken(token: string): string {
  if (!token || token.length < 8) return '••••••••';
  return `${token.slice(0, 4)}••••••••${token.slice(-4)}`;
}
