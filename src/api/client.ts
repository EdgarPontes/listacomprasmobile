import { create, isAxiosError } from 'axios';

import { clearToken, getToken } from '@/auth/storage';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3001';

export const api = create({
  baseURL,
  timeout: 15000,
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

api.interceptors.request.use(async config => {
  const token = await getToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 401) {
      await clearToken();
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;

    if (data?.error) {
      return data.error;
    }

    if (error.code === 'ECONNABORTED') {
      return 'O servidor demorou demais para responder.';
    }

    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}
