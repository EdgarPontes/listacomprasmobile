export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export type ListPermission = 'owner' | 'view' | 'edit';

export interface ListItem {
  id: string;
  product_name: string;
  barcode: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  title: string;
  total_value: number;
  permission: ListPermission;
  items?: ListItem[];
}

export interface CreateListItem {
  productName: string;
  barcode?: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateListItemInput {
  productName?: string;
  barcode?: string | null;
  quantity?: number;
  unitPrice?: number;
  checked?: boolean;
}

export interface NfceProduto {
  descricao: string;
  codigo: string | null;
  quantidade: number | null;
  unidade: string | null;
  valor_unitario: number | null;
  valor_total: number | null;
  validation_ok?: boolean;
}

export interface NfceParseResult {
  emitente: { nome?: string | null; cnpj?: string | null };
  produtos: NfceProduto[];
  totais: Record<string, unknown>;
  nfe: Record<string, unknown>;
}

export interface ProductLookup {
  Status?: string;
  Nome?: string;
  [key: string]: unknown;
}
