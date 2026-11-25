import { api } from './client';
import type { CreateListItem, ListItem, ShoppingList, UpdateListItemInput } from '@/types/api';

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

export async function updateList(id: string, title: string): Promise<ShoppingList> {
  const { data } = await api.put<ShoppingList>(`/api/lists/${id}`, { title });
  return data;
}

export async function deleteList(id: string): Promise<void> {
  await api.delete(`/api/lists/${id}`);
}

export async function createListItem(
  listId: string,
  input: CreateListItem
): Promise<ListItem> {
  const { data } = await api.post<ListItem>(`/api/lists/${listId}/items`, input);
  return data;
}

export async function updateListItem(
  listId: string,
  itemId: string,
  input: UpdateListItemInput
): Promise<ListItem> {
  const { data } = await api.put<ListItem>(`/api/lists/${listId}/items/${itemId}`, input);
  return data;
}

export async function deleteListItem(listId: string, itemId: string): Promise<void> {
  await api.delete(`/api/lists/${listId}/items/${itemId}`);
}
