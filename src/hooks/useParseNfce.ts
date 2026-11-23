import { useMutation } from '@tanstack/react-query';

import { parseNfceFromUrl } from '@/api/nfce';

export function useParseNfce() {
  return useMutation({
    mutationFn: (url: string) => parseNfceFromUrl(url),
  });
}
