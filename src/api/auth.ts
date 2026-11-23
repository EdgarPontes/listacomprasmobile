import { api } from './client';
import type { LoginResponse, User } from '@/types/api';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', { email, password });
  return data;
}

export async function register(email: string, password: string): Promise<User> {
  const { data } = await api.post<User>('/api/auth/register', { email, password });
  return data;
}
