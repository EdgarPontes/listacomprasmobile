import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteListItem } from '@/api/lists';

interface DeleteListItemVariables {
  listId: string;
  itemId: string;
}

export function useDeleteListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, itemId }: DeleteListItemVariables) =>
      deleteListItem(listId, itemId),
    onSuccess: (_data, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: ['list', listId] });
      void queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
