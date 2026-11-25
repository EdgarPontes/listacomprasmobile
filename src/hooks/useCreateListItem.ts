import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createListItem } from '@/api/lists';
import type { CreateListItem } from '@/types/api';

interface CreateListItemVariables {
  listId: string;
  input: CreateListItem;
}

export function useCreateListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, input }: CreateListItemVariables) => createListItem(listId, input),
    onSuccess: (_item, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: ['list', listId] });
      void queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
