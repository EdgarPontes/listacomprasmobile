import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteList } from '@/api/lists';

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) => deleteList(listId),
    onSuccess: (_data, listId) => {
      queryClient.removeQueries({ queryKey: ['list', listId] });
      void queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
