import { api } from './client';
import type { ProductLookup } from '@/types/api';

export async function getProductByBarcode(barcode: string): Promise<ProductLookup> {
  const { data } = await api.get<ProductLookup>(
    `/api/products/barcode/${encodeURIComponent(barcode)}`
  );
  return data;
}
