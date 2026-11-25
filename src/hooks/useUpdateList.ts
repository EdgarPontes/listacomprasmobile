import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateList } from '@/api/lists';

interface UpdateListVariables {
  listId: string;
  title: string;
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, title }: UpdateListVariables) => updateList(listId, title),
    onSuccess: (_list, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: ['list', listId] });
      void queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
