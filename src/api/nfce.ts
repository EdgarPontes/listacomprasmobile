import { api } from './client';
import type { NfceParseResult } from '@/types/api';

export async function parseNfceFromUrl(url: string): Promise<NfceParseResult> {
  const { data } = await api.post<NfceParseResult>('/api/nfce/parse-nfce', { url });
  return data;
}
