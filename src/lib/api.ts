import axios from 'axios';

/**
 * Centralized API configuration and Zero-Latency Guard for KODEXIS
 * Handles local development, custom hostnames, and Render production deployments seamlessly.
 * Includes intelligent zero-latency circuit breakers, fast timeouts, and instant fallback helpers.
 */

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || '';

export const API_BASE_URL: string = (() => {
  if (rawApiUrl && rawApiUrl.trim() !== '') {
    const clean = rawApiUrl.trim().replace(/\/+$/, '');
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }
    return `https://${clean}`;
  }

  // If in browser and running on HTTPS / remote cloud domain (e.g. Vercel)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Default to the secure Render production backend endpoint rather than dead insecure localhost
    return 'https://kodexis-backend.onrender.com';
  }

  return 'http://localhost:8080';
})();

export const LEARNING_API_BASE = `${API_BASE_URL}/api/learning`;
export const PROGRESS_API_BASE = `${API_BASE_URL}/api/progress`;
export const INTERVIEW_API_BASE = `${API_BASE_URL}/api/interviews`;
export const AUTH_API_BASE = `${API_BASE_URL}/api/auth`;

// Configure global Axios defaults for rapid response
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 3500; // 3.5 seconds maximum network wait time

// Circuit Breaker State
let backendOnline = true;
let lastFailureTimestamp = 0;
const COOLDOWN_WINDOW_MS = 25000; // 25s cooldown before probing an unresponsive/sleeping backend

export function isBackendHealthy(): boolean {
  if (backendOnline) return true;
  if (Date.now() - lastFailureTimestamp > COOLDOWN_WINDOW_MS) {
    return true; // Cooldown expired, permit a probe request
  }
  return false;
}

export function markBackendFailure() {
  backendOnline = false;
  lastFailureTimestamp = Date.now();
}

export function markBackendSuccess() {
  backendOnline = true;
  lastFailureTimestamp = 0;
}

// Global Axios Interceptors to track latency and automatically trigger fail-fast
axios.interceptors.response.use(
  (response) => {
    markBackendSuccess();
    return response;
  },
  (error) => {
    // If request timed out, connection refused, or network dropped
    if (
      error.code === 'ECONNABORTED' ||
      !error.response ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error')
    ) {
      markBackendFailure();
    }
    return Promise.reject(error);
  }
);

/**
 * Executes a Promise with a strict fast timeout and circuit-breaker guard.
 * If backend has recently failed or is cold-sleeping, it rejects instantly (0ms) so local fallback runs immediately.
 */
export async function withFastTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 2500,
  fallbackLabel: string = 'Network operation'
): Promise<T> {
  // If backend is known to be offline or sleeping within cooldown window, skip network wait
  if (!isBackendHealthy()) {
    throw new Error(`[Zero-Latency Guard] Backend sleeping/unreachable. Instant local fallback triggered for ${fallbackLabel}.`);
  }

  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      markBackendFailure();
      reject(new Error(`[Zero-Latency Guard] ${fallbackLabel} exceeded ${timeoutMs}ms limit.`));
    }, timeoutMs);
  });

  try {
    const res = await Promise.race([promise, timeoutPromise]);
    markBackendSuccess();
    return res;
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Background silent ping to wake up free-tier cloud backends (e.g. Render) without blocking the UI
 */
export function pingBackendSilent(): void {
  if (typeof window === 'undefined') return;
  try {
    fetch(`${API_BASE_URL}/api/auth/ping`, { method: 'GET', mode: 'cors' })
      .then((res) => {
        if (res.ok) markBackendSuccess();
      })
      .catch(() => {
        // Silent catch
      });
  } catch {
    // Silent
  }
}

// Trigger initial background wake-up ping
pingBackendSilent();

export default API_BASE_URL;
