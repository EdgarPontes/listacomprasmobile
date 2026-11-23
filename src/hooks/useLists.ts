import { useQuery } from '@tanstack/react-query';

import { getLists } from '@/api/lists';

export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: getLists,
  });
}
