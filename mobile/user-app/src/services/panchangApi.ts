import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';

type Primitive = string | number | boolean | null | undefined;
type QueryParams = Record<string, Primitive>;

const KNOWN_NON_API_BASE_URLS = new Set([
  'https://swami-g-dashboard.vercel.app',
  'https://www.avdheshanandg.org',
]);

let cachedWorkingBaseUrl: string | null = null;
const invalidBaseUrls = new Set<string>();

function normalizeBaseUrl(url?: string): string {
  return (url || '').trim().replace(/\/+$/, '');
}

function getExpoHostIp(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;
  if (!hostUri) return null;
  const host = String(hostUri).split(':')[0];
  return host || null;
}

function getCandidateBaseUrls(): string[] {
  const fromEnv = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  const expoHost = getExpoHostIp();
  const shouldPreferLocalDev =
    __DEV__ && (!fromEnv || KNOWN_NON_API_BASE_URLS.has(fromEnv));

  const candidates: string[] = [];
  if (shouldPreferLocalDev && expoHost) {
    candidates.push(`http://${expoHost}:3000`);
    candidates.push(`http://${expoHost}:4010`);
  }
  if (shouldPreferLocalDev) {
    candidates.push('http://localhost:3000');
    candidates.push('http://localhost:4010');
    candidates.push('http://127.0.0.1:3000');
    candidates.push('http://127.0.0.1:4010');
  }
  if (fromEnv && !KNOWN_NON_API_BASE_URLS.has(fromEnv)) {
    candidates.push(fromEnv);
  }
  if (!shouldPreferLocalDev && __DEV__ && expoHost) {
    candidates.push(`http://${expoHost}:3000`);
    candidates.push(`http://${expoHost}:4010`);
  }
  if (!shouldPreferLocalDev && __DEV__) {
    candidates.push('http://localhost:3000');
    candidates.push('http://localhost:4010');
    candidates.push('http://127.0.0.1:3000');
    candidates.push('http://127.0.0.1:4010');
  }

  return Array.from(
    new Set(candidates.map((u) => normalizeBaseUrl(u)).filter(Boolean))
  ).filter((url) => !invalidBaseUrls.has(url));
}

function isHtmlResponse(data: unknown): boolean {
  return typeof data === 'string' && data.toLowerCase().includes('<!doctype html');
}

function getStatusCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  const axiosError = error as AxiosError;
  return axiosError.response?.status ?? null;
}

function isRetriableStatus(status: number | null): boolean {
  return status === null || [404, 405, 500, 501, 502, 503, 504].includes(status);
}

async function requestPanchangApi<T>(
  path: string,
  params?: QueryParams,
): Promise<T> {
  const candidates = getCandidateBaseUrls();
  const ordered = cachedWorkingBaseUrl
    ? [cachedWorkingBaseUrl, ...candidates.filter((url) => url !== cachedWorkingBaseUrl)]
    : candidates;

  let lastError: unknown = null;

  for (const baseUrl of ordered) {
    try {
      const response = await axios.get<T>(`${baseUrl}/api${path}`, {
        params,
        timeout: 15000,
        headers: {
          Accept: 'application/json',
        },
      });

      if (isHtmlResponse(response.data)) {
        throw new Error(`Non-JSON response from ${baseUrl}`);
      }

      cachedWorkingBaseUrl = baseUrl;
      return response.data;
    } catch (error) {
      lastError = error;
      const status = getStatusCode(error);
      if (status === 401 || status === 403) {
        throw error;
      }
      if (isRetriableStatus(status)) {
        invalidBaseUrls.add(baseUrl);
      }
      continue;
    }
  }

  throw new Error('Panchang API unavailable. Start the dashboard backend or set a working EXPO_PUBLIC_API_URL.');
}

function formatDateParam(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

async function fetchMonthFromDailyFallback(params: {
  month: number;
  year: number;
  lat: number;
  lng: number;
  city?: string;
  timezone?: string;
}) {
  const daysInMonth = new Date(params.year, params.month, 0).getDate();
  const dailyCalls: Promise<unknown>[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    dailyCalls.push(
      requestPanchangApi('/panchang/today', {
        lat: params.lat,
        lng: params.lng,
        city: params.city,
        timezone: params.timezone,
        date: formatDateParam(params.year, params.month, day),
      }).catch(() => null)
    );
  }

  const days = await Promise.all(dailyCalls);
  return days.filter(Boolean);
}

export async function getPanchangToday(params: {
  lat: number;
  lng: number;
  city?: string;
  timezone?: string;
  date?: string;
}) {
  return requestPanchangApi('/panchang/today', params);
}

export async function getPanchangFestivals(params?: {
  upcoming?: boolean;
  limit?: number;
}) {
  return requestPanchangApi('/panchang/festivals', params as QueryParams | undefined);
}

export async function getPanchangCities() {
  return requestPanchangApi('/panchang/cities');
}

export async function getPanchangMonth(params: {
  month: number;
  year: number;
  lat: number;
  lng: number;
  city?: string;
  timezone?: string;
}) {
  try {
    return await requestPanchangApi('/panchang/month', params);
  } catch (error) {
    const status = getStatusCode(error);
    // If month endpoint is unavailable, synthesize the month from daily endpoint.
    if (status === 404 || status === 405 || status === 501 || status === 502 || status === 503 || status === 504) {
      return fetchMonthFromDailyFallback(params);
    }
    throw error;
  }
}
