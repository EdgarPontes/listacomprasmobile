import { useQuery } from '@tanstack/react-query';

import { getList } from '@/api/lists';

export function useList(id: string | undefined) {
  return useQuery({
    queryKey: ['list', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Lista inválida.');
      }

      return getList(id);
    },
    enabled: Boolean(id),
  });
}
