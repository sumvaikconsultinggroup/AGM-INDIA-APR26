import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const DEFAULT_DEV_API = 'http://localhost:3000';
const FALLBACK_API_HOSTS = [
  DEFAULT_DEV_API,
  'https://swami-g-dashboard.vercel.app',
];

let activeBaseUrl: string | null = null;

function normalizeBaseUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed || null;
}

function isHtmlPayload(data: unknown): boolean {
  return typeof data === 'string' && /<!doctype html|<html/i.test(data);
}

function getCurrentOrigin(): string | null {
  if (typeof window === 'undefined') return null;
  return normalizeBaseUrl(window.location.origin);
}

function getCandidateBaseUrls(): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];

  const add = (value?: string | null) => {
    const normalized = normalizeBaseUrl(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    candidates.push(normalized);
  };

  add(activeBaseUrl);
  add(process.env.NEXT_PUBLIC_API_URL);
  add(getCurrentOrigin());

  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    add(`${window.location.protocol}//${window.location.hostname}:3000`);
  }

  FALLBACK_API_HOSTS.forEach(add);

  return candidates;
}

function shouldRetry(error: unknown): boolean {
  const axiosError = error as AxiosError | undefined;
  const status = axiosError?.response?.status;

  if (!status) return true;
  if (status >= 500) return true;
  if (status === 404 || status === 408 || status === 429) return true;
  return false;
}

async function request<T = any>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  endpoint: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const bases = getCandidateBaseUrls();
  let lastError: unknown = null;

  for (const baseUrl of bases) {
    try {
      const response = await axios.request<T>({
        ...config,
        method,
        url: endpoint,
        data,
        baseURL: `${baseUrl}/api`,
        timeout: config?.timeout ?? 12000,
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers || {}),
        },
      });

      if (isHtmlPayload(response.data)) {
        throw new Error(`API returned HTML instead of JSON from ${baseUrl}`);
      }

      activeBaseUrl = baseUrl;
      return response;
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error)) {
        throw error;
      }
    }
  }

  throw lastError || new Error(`API request failed for ${endpoint}`);
}

const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => request<T>('get', url, undefined, config),
  post: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>('post', url, data, config),
  put: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>('put', url, data, config),
  patch: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>('patch', url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => request<T>('delete', url, undefined, config),
  getActiveBaseUrl: () => activeBaseUrl,
};

export default api;

export async function fetchData<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await api.get<T>(endpoint);
    return (response.data as any)?.data || response.data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

export async function postData<T>(
  endpoint: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await api.post<T>(endpoint, data);
    return { success: true, data: (response.data as any)?.data || response.data };
  } catch (error) {
    console.error(`Failed to post to ${endpoint}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
    return { success: false, error: errorMessage };
  }
}
