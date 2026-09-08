import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors & format API responses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend wraps success payload in APIResponse { success, message, data }
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (expired or invalid token)
    if (error.response?.status === 401 && originalRequest) {
      const refreshToken = tokenStorage.getRefreshToken();
      
      // If refreshToken exists and not retrying yet, try refreshing
      if (refreshToken && !(originalRequest as any)._retry) {
        (originalRequest as any)._retry = true;
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = res.data?.data?.access_token || res.data?.access_token;
          if (newToken) {
            tokenStorage.setTokens(newToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          }
        } catch {
          tokenStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        tokenStorage.clear();
      }
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.error?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(errorMessage));
  }
);
