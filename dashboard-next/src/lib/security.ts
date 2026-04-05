/**
 * Security Utilities
 * Enterprise-grade security helpers for input sanitization,
 * account lockout, and request validation.
 */

// ─── Account Lockout (In-Memory) ─────────────────────────────────────
interface LockoutEntry {
  failedAttempts: number;
  lockedUntil: number | null;
  lastFailedAt: number;
}

const lockoutStore = new Map<string, LockoutEntry>();

const LOCKOUT_CONFIG = {
  maxAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  attemptWindowMs: 30 * 60 * 1000,   // 30-minute sliding window
};

export function checkAccountLockout(identifier: string): {
  locked: boolean;
  remainingAttempts: number;
  lockedUntil?: Date;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const entry = lockoutStore.get(identifier);

  if (!entry) {
    return { locked: false, remainingAttempts: LOCKOUT_CONFIG.maxAttempts };
  }

  // Check if lockout expired
  if (entry.lockedUntil && now > entry.lockedUntil) {
    lockoutStore.delete(identifier);
    return { locked: false, remainingAttempts: LOCKOUT_CONFIG.maxAttempts };
  }

  // Check if currently locked
  if (entry.lockedUntil && now <= entry.lockedUntil) {
    const retryAfterSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return {
      locked: true,
      remainingAttempts: 0,
      lockedUntil: new Date(entry.lockedUntil),
      retryAfterSeconds,
    };
  }

  // Check if attempt window expired
  if (now - entry.lastFailedAt > LOCKOUT_CONFIG.attemptWindowMs) {
    lockoutStore.delete(identifier);
    return { locked: false, remainingAttempts: LOCKOUT_CONFIG.maxAttempts };
  }

  return {
    locked: false,
    remainingAttempts: Math.max(0, LOCKOUT_CONFIG.maxAttempts - entry.failedAttempts),
  };
}

export function recordFailedAttempt(identifier: string): {
  locked: boolean;
  remainingAttempts: number;
  lockedUntil?: Date;
} {
  const now = Date.now();
  const entry = lockoutStore.get(identifier) || {
    failedAttempts: 0,
    lockedUntil: null,
    lastFailedAt: now,
  };

  // Reset if outside window
  if (now - entry.lastFailedAt > LOCKOUT_CONFIG.attemptWindowMs) {
    entry.failedAttempts = 0;
  }

  entry.failedAttempts++;
  entry.lastFailedAt = now;

  if (entry.failedAttempts >= LOCKOUT_CONFIG.maxAttempts) {
    entry.lockedUntil = now + LOCKOUT_CONFIG.lockoutDurationMs;
    lockoutStore.set(identifier, entry);
    return {
      locked: true,
      remainingAttempts: 0,
      lockedUntil: new Date(entry.lockedUntil),
    };
  }

  lockoutStore.set(identifier, entry);
  return {
    locked: false,
    remainingAttempts: LOCKOUT_CONFIG.maxAttempts - entry.failedAttempts,
  };
}

export function clearLockout(identifier: string): void {
  lockoutStore.delete(identifier);
}

// ─── Input Sanitization ──────────────────────────────────────────────

/**
 * Sanitize string input — strip HTML tags, trim whitespace
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')     // Strip HTML tags
    .replace(/[<>]/g, '')         // Remove remaining angle brackets
    .trim();
}

/**
 * Sanitize an entire object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone (Indian 10-digit)
 */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password must be less than 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least one number');

  return { valid: errors.length === 0, errors };
}

// ─── Periodic Cleanup ────────────────────────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of lockoutStore) {
    if (entry.lockedUntil && now > entry.lockedUntil + LOCKOUT_CONFIG.attemptWindowMs) {
      lockoutStore.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();
