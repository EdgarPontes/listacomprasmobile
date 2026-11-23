import { api } from './client';
import type { CreateListItem, ShoppingList } from '@/types/api';

export async function getLists(): Promise<ShoppingList[]> {
  const { data } = await api.get<ShoppingList[]>('/api/lists');
  return data;
}

export async function getList(id: string): Promise<ShoppingList> {
  const { data } = await api.get<ShoppingList>(`/api/lists/${id}`);
  return data;
}

export async function createList(title: string, items: CreateListItem[]): Promise<ShoppingList> {
  const { data } = await api.post<ShoppingList>('/api/lists', { title, items });
  return data;
}

export async function deleteList(id: string): Promise<void> {
  await api.delete(`/api/lists/${id}`);
}
