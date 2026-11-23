import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createList } from '@/api/lists';
import type { CreateListItem } from '@/types/api';

interface CreateListVariables {
  title: string;
  items: CreateListItem[];
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, items }: CreateListVariables) => createList(title, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
