import { api } from './client';
import type { User } from '@/types/api';

export type SharePermission = 'view' | 'edit';

export interface SharedList {
  id: string;
  listId: string;
  sharedWithUserId: string;
  permissions: SharePermission;
}

export async function findUserByEmail(email: string): Promise<User> {
  const { data } = await api.get<User>('/api/auth/users', { params: { email } });
  return data;
}

export async function shareList(
  listId: string,
  sharedWithUserId: string,
  permissions: SharePermission
): Promise<SharedList> {
  const { data } = await api.post<SharedList>('/api/share', {
    listId,
    sharedWithUserId,
    permissions,
  });
  return data;
}
