import { useMutation } from '@tanstack/react-query';

import { getProductByBarcode } from '@/api/products';

export function useProductByBarcode() {
  return useMutation({
    mutationFn: (barcode: string) => getProductByBarcode(barcode),
  });
}
