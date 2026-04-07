import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

// Token getter is registered by <ClerkTokenProvider> (a React component with
// access to useAuth). This avoids the unreliable window.Clerk hack.
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await _getToken?.();
    console.log('[interceptor] token:', token ? 'present' : 'NULL');
    if (!token) {
      // Abort the request rather than sending without auth — an unauthenticated
      // request guarantees a 401 and would get stuck in React Query's error cache.
      const controller = new AbortController();
      controller.abort();
      return { ...config, signal: controller.signal };
    }
    config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // no active session
  }
  return config;
});
