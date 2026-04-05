import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

export default api;

// Helper function for fetching data
export async function fetchData<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await api.get(endpoint);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

// Helper function for posting data
export async function postData<T>(endpoint: string, data: Record<string, unknown>): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await api.post(endpoint, data);
    return { success: true, data: response.data?.data || response.data };
  } catch (error) {
    console.error(`Failed to post to ${endpoint}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
    return { success: false, error: errorMessage };
  }
}
