import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateListItem } from '@/api/lists';
import type { UpdateListItemInput } from '@/types/api';

interface UpdateListItemVariables {
  listId: string;
  itemId: string;
  input: UpdateListItemInput;
}

export function useUpdateListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, itemId, input }: UpdateListItemVariables) =>
      updateListItem(listId, itemId, input),
    onSuccess: (_item, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: ['list', listId] });
      void queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
